import { auth, db, serverTimestamp } from './firebaseInit.js';
import { collection, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where, arrayUnion } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

export async function createPatient(patientUid, data){
  const ref = doc(db, 'patients', patientUid);
  await setDoc(ref, {
    uid: patientUid,
    name: data?.name || '',
    email: data?.email || '',
    phone: data?.phone || '',
    clinicId: data?.clinicId || '',
    appointments: [],
    prescriptions: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  return patientUid;
}

export function listenPatientByUid(patientUid, callback){
  return onSnapshot(doc(db,'patients', patientUid), (s) => {
    callback(s.exists() ? { id: s.id, ...s.data() } : null);
  });
}


