import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCJlOukCtePo8olMqiOsRL0yr7tw6by4uo",
  authDomain: "tweeshirt-app.firebaseapp.com",
  projectId: "tweeshirt-app",
  storageBucket: "tweeshirt-app.firebasestorage.app",
  messagingSenderId: "500583570654",
  appId: "1:500583570654:web:c8292d6f69ee14e51c364f",
  measurementId: "G-CTCM014H6B"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
