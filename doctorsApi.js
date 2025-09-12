import { auth, db, serverTimestamp } from './firebaseInit.js';
import { collection, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where, arrayUnion } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const doctorsCol = collection(db, 'doctors');

export async function createDoctor(doctorUid, data){
  const ref = doc(db, 'doctors', doctorUid);
  const payload = {
    uid: doctorUid,
    name: data?.name || '',
    email: data?.email || '',
    phone: data?.phone || '',
    specialization: data?.specialization || '',
    clinicId: data?.clinicId || '',
    active: data?.active !== false,
    patients: [],
    appointments: [],
    prescriptions: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(ref, payload, { merge: true });
  if (payload.clinicId) {
    try { await updateDoc(doc(db,'clinics', payload.clinicId), { doctors: arrayUnion(doctorUid) }); } catch(_){ /* clinic may not exist yet */ }
  }
  return doctorUid;
}

export function listenActiveDoctors(callback){
  const qRef = query(doctorsCol, where('active','==', true));
  return onSnapshot(qRef, snap => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

export async function getDoctor(doctorUid){
  const s = await getDoc(doc(db, 'doctors', doctorUid));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}


