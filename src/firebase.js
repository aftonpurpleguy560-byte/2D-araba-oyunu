import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SENİN_API_KEY",
  authDomain: "SENİN_PROJECT.firebaseapp.com",
  projectId: "SENİN_PROJECT_ID",
  storageBucket: "SENİN_PROJECT.appspot.com",
  messagingSenderId: "SENİN_ID",
  appId: "SENİN_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

