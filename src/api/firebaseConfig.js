// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
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

// Request permission and get token
const requestPermissionAndGetToken = async () => {
  console.log('Requesting permission...');
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      try {
        const currentToken = await getToken(messaging, {
          vapidKey: "BPM_NWcyNXTknIqbDxz1toX7YX36lhyo1sGAFqrwCvHchi26kyLNA4eXEih_vohMGqTAFPaEx4ZRvJ-jK2zNwYQ"
        });
        
        if (currentToken) {
          console.log('Current token:', currentToken);
          // Send the token to your server
          // saveTokenToServer(currentToken);
          return currentToken;
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      } catch (err) {
        console.log('An error occurred while retrieving token.', err);
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (err) {
    console.log('An error occurred while requesting permission', err);
  }
};

// Handle foreground messages
const setupForegroundMessaging = () => {
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    
    // Display a notification for foreground messages
    if (payload.notification) {
      const { title, body } = payload.notification;
      
      // Show a browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { 
          body, 
          icon: '/favicon.ico' 
        });
      }
    }
  });
};

export { messaging, requestPermissionAndGetToken, setupForegroundMessaging };