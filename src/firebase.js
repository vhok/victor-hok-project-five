// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyB0mLgkPeevqQwvfRbkQ2SRjZIuoS4h3BI",
    authDomain: "mydebugpal.firebaseapp.com",
    databaseURL: "https://mydebugpal.firebaseio.com",
    projectId: "mydebugpal",
    storageBucket: "mydebugpal.appspot.com",
    messagingSenderId: "753090722490",
    appId: "1:753090722490:web:f6b299ae1570a9f313a083"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;