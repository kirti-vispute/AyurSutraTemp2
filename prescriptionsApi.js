import { storage, db } from "./firebaseInit.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

export async function uploadPrescription({ patientUid = "", patientEmail = "", doctorUid, file, notes = "" }) {
  const path = `prescriptions/${doctorUid}/${Date.now()}_${file.name}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  await addDoc(collection(db, "prescriptions"), {
    patientId: patientUid,
    patientEmail,
    doctorId: doctorUid,
    fileName: file.name,
    fileUrl: url,
    notes,
    createdAt: serverTimestamp()
  });
  return { url };
}


