import React, { useState, useEffect } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import axios from "axios";

const env = process.env;

// Initialize Firebase
firebase.initializeApp({
  apiKey: env.APP_API_KEY,
  authDomain: env.APP_AUTH_DOMAIN,
  projectId: env.APP_PROJECT_ID,
  storageBucket: env.APP_STORAGE_BUCKET,
  messagingSenderId: env.APP_MESSAGING_SENDER_ID,
  appId: env.APP_APP_ID,
});

axios.defaults.baseURL = env.APP_BASE_API_URL;

export const App = () => {
  const [user, setUser] = useState<firebase.User | null>(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const handleGetToken = async () => {
    const json = await axios({
      method: "GET",
      url: "/token",
      withCredentials: true,
      responseType: "json",
    });
    const token = json.data.token;
    await firebase
      .auth()
      .signInWithCustomToken(token)
      .then((cred) => {
        setUser(cred.user);
      });
  };

  return (
    <div>
      {user ? (
        <div>{user.displayName}</div>
      ) : (
        <div>
          <h1>Not found</h1>
          <button onClick={handleGetToken}>GetToken</button>
        </div>
      )}
    </div>
  );
};
