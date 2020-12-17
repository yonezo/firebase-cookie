import { https } from "firebase-functions";
import admin from "firebase-admin";
import express, { CookieOptions } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

admin.initializeApp();

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());

const router = express.Router();

router.post("/signin", (req, res) => {
  // Get ID token
  const idToken = req.body.idToken.toString();
  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  // We could also choose to enforce that the ID token auth_time is recent.
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedClaims) => {
      // In this case, we are enforcing that the user signed in in the last 5 minutes.
      if (new Date().getTime() / 1000 - decodedClaims.auth_time < 5 * 60) {
        return admin
          .auth()
          .createSessionCookie(idToken, { expiresIn: expiresIn });
      }
      throw new Error("UNAUTHORIZED REQUEST!");
    })
    .then((sessionCookie) => {
      // Note httpOnly cookie will not be accessible from javascript.
      // secure flag should be set to true in production.
      const options: CookieOptions = {
        domain: "ploxy.dev",
        maxAge: expiresIn,
        sameSite: "strict",
        httpOnly: true,
        secure: true,
      };
      res.cookie("__session", sessionCookie, options);
      res.end(JSON.stringify({ status: "success" }));
    })
    .catch(function (error) {
      console.error(error);
      res.status(401).send("UNAUTHORIZED REQUEST!");
    });
});

/** Create customtoken endpoint. */
router.get("/token", async (req, res) => {
  const sessionCookie = req.cookies.__session;
  try {
    const decodedClaims = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    const token = await admin.auth().createCustomToken(uid);
    res.end(JSON.stringify({ token }));
  } catch (error) {
    console.error(error);
    res.status(401).send("UNAUTHORIZED REQUEST!");
  }
});

/** User signout endpoint. */
router.post("/signout", (req, res) => {
  // Clear cookie.
  const sessionCookie = req.cookies.__session || "";
  res.clearCookie("__session");
  // Revoke session too. Note this will revoke all user sessions.
  if (sessionCookie) {
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true)
      .then((decodedClaims) => {
        return admin.auth().revokeRefreshTokens(decodedClaims.sub);
      })
      .then(() => {
        res.end(JSON.stringify({ message: "success" }));
      })
      .catch((error) => {
        console.error(error);
        res.status(400).send("CANNNOT REVOKE REFRESH TOKEN");
      });
  } else {
    res.status(400).send("ALREADY LOGGED OUT");
  }
});

app.use("/api", router);

export const api = https.onRequest(app);
