// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCMRUp7OeTLvNj7lLIKDmC5GXwhOROCjQ",
  authDomain: "kitahome-web.firebaseapp.com",
  projectId: "kitahome-web",
  storageBucket: "kitahome-web.firebasestorage.app",
  messagingSenderId: "431028706244",
  appId: "1:431028706244:web:98bd9c3ac0707548a32291",
  measurementId: "G-BS4G9G5VVT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

export { messaging };