import { db, serverTimestamp } from './firebaseInit.js';
import { arrayUnion, collection, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

export async function upsertClinic(clinicId, data){
  const ref = doc(db, 'clinics', clinicId);
  await setDoc(ref, {
    name: data?.name || '',
    address: data?.address || '',
    doctors: data?.doctors || [],
    staff: data?.staff || [],
    updatedAt: serverTimestamp()
  }, { merge: true });
  return clinicId;
}

export async function addDoctorToClinic(clinicId, doctorUid){
  await updateDoc(doc(db,'clinics', clinicId), { doctors: arrayUnion(doctorUid) });
}

export function listenDoctorsByClinic(clinicId, cb){
  const qRef = query(collection(db,'doctors'), where('clinicId','==', clinicId));
  return onSnapshot(qRef, (snap)=> cb(snap.docs.map(d=> ({ id:d.id, ...d.data()}))));
}

export function listenStaffByClinic(clinicId, cb){
  const qRef = query(collection(db,'staff'), where('clinicId','==', clinicId));
  return onSnapshot(qRef, (snap)=> cb(snap.docs.map(d=> ({ id:d.id, ...d.data()}))));
}
