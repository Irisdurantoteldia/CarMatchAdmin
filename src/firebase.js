import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAKsOnvpuIlQx0yysxTnaI9ywo0lbcvCAk",
  authDomain: "carmatch-c263c.firebaseapp.com",
  projectId: "carmatch-c263c",
  storageBucket: "carmatch-c263c.firebasestorage.app",
  messagingSenderId: "531716217010",
  appId: "1:531716217010:web:136d5de8726c4d7d2291ab"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);