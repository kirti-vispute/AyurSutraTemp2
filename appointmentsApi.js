import { auth, db, serverTimestamp } from './firebaseInit.js';
import { addDoc, arrayUnion, collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const col = collection(db, 'appointments');

export async function createAppointment({ patientUid, doctorUid, date, time, center, practitioner, treatments, totalPrice }){
  const now = new Date(`${date}T${time || '00:00'}`);
  if (isNaN(now.getTime()) || now.getTime() <= Date.now()) {
    throw new Error('Appointment must be scheduled in the future');
  }
  const docRef = await addDoc(col, {
    userId: patientUid,
    doctorId: doctorUid || '',
    date, time, center, practitioner,
    treatments: Array.isArray(treatments) ? treatments : [],
    totalPrice: Number(totalPrice) || 0,
    status: 'Confirmed',
    createdAt: serverTimestamp()
  });
  const apptId = docRef.id;
  if (doctorUid) {
    try { await updateDoc(doc(db,'doctors', doctorUid), { appointments: arrayUnion(apptId) }); } catch(_){ }
  }
  try { await updateDoc(doc(db,'patients', patientUid), { appointments: arrayUnion(apptId) }); } catch(_){ }
  return apptId;
}

export function listenAppointmentsByDoctor(doctorUid, cb){
  const qRef = query(col, where('doctorId','==', doctorUid), orderBy('date','desc'));
  return onSnapshot(qRef, (snap)=> cb(snap.docs.map(d=> ({ id:d.id, ...d.data()}))));
}

export function listenAppointmentsByPatient(patientUid, cb){
  const qRef = query(col, where('userId','==', patientUid), orderBy('date','desc'));
  return onSnapshot(qRef, (snap)=> cb(snap.docs.map(d=> ({ id:d.id, ...d.data()}))));
}

export async function updateAppointment(apptId, patch){
  await updateDoc(doc(db,'appointments', apptId), { ...patch, updatedAt: serverTimestamp() });
}


