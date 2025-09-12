// Firebase modular v9+ initializer shared across portals
// Exports: app, auth, db, storage, serverTimestamp
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, serverTimestamp as fsServerTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6gvn7RRTxlFLN9kqMzrn3hS26b9vCMYM",
  authDomain: "ayursutra-f90d2.firebaseapp.com",
  projectId: "ayursutra-f90d2",
  storageBucket: "ayursutra-f90d2.appspot.com",
  messagingSenderId: "1014791978312",
  appId: "1:1014791978312:web:938b6861c94f0a3a81477d",
  measurementId: "G-Y0CDSS5NWD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export const serverTimestamp = fsServerTimestamp;


