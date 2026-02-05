import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEAp8QJ99N-S2I74Zd3Gq-I4LcdmqYKX4",
  authDomain: "d-araba-oyunu.firebaseapp.com",
  projectId: "d-araba-oyunu",
  storageBucket: "d-araba-oyunu.firebasestorage.app",
  messagingSenderId: "480244168513",
  appId: "1:480244168513:web:a6415e835fd2b4656f53c0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
