import React, { useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";
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

  const handleCreateCookie = async () => {
    if (!user) return;
    const idToken = await user.getIdToken();
    await axios({
      method: "POST",
      url: "/signin",
      data: { idToken },
      withCredentials: true,
      responseType: "json",
    });
  };

  const handleClick = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  };

  const signOut = async () => {
    await axios({
      method: "POST",
      url: "/signout",
      withCredentials: true,
      responseType: "json",
    });
    await firebase.auth().signOut();
  };

  return (
    <div>
      {user ? (
        <>
          <div>{user.displayName}</div>
          <div>Iframe</div>
          <iframe src={env.APP_PREVIEW_URL} title="Iframe" />
          <button onClick={handleCreateCookie}>Create Cookie</button>
          <button onClick={signOut}>Sign out</button>
        </>
      ) : (
        <button onClick={handleClick}>Sign in</button>
      )}
    </div>
  );
};
