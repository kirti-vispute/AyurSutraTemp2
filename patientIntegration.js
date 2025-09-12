import { auth, db } from './firebaseInit.js';
import { listenAppointmentsByPatient } from './appointmentsApi.js';
import { collection, onSnapshot, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { wirePatientDoctorList, wirePatientBookingSubmit, wirePatientRealtime } from './uiIntegration.js';

function byId(id){ return document.getElementById(id); }

// Render prescriptions in "My Case" and build simple "My Plans" from text notes
async function renderMyCaseAndPlans(patientUid){
  const caseContainer = byId('wellness-plan-content');
  if (!caseContainer) return;
  const email = (auth.currentUser && auth.currentUser.email) || '';
  const qByUid = query(collection(db,'prescriptions'), where('patientId','==', patientUid));
  const qByEmail = email ? query(collection(db,'prescriptions'), where('patientEmail','==', email)) : null;
  const snaps = await getDocs(qByUid);
  const snaps2 = qByEmail ? await getDocs(qByEmail) : null;
  const items = [...snaps.docs, ...(snaps2 ? snaps2.docs : [])].map(d=> ({ id:d.id, ...d.data() }));
  if (items.length === 0) return; // keep existing plans rendering when none
  const list = items.map(p => `<li class="mb-2"><a href="${p.fileUrl}" target="_blank" class="underline text-sage-700">${p.fileName}</a> ${p.notes ? '— ' + p.notes : ''}</li>`).join('');
  const advice = items.map(p => p.notes || '').join(' ').slice(0, 400);
  caseContainer.innerHTML = `
    <div class="bg-cream-50 p-8 rounded-2xl shadow-md border border-sage-100">
      <h3 class="text-3xl font-serif font-bold text-sage-900 mb-4">My Case — Prescriptions</h3>
      <ul class="list-disc list-inside">${list}</ul>
      <div class="border-t border-sage-200 mt-6 pt-4">
        <h4 class="text-2xl font-serif text-sage-800 mb-2">Auto Plan</h4>
        <p class="text-sage-800 font-text">${advice || 'Follow doctor guidance as prescribed.'}</p>
      </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', ()=>{
  wirePatientDoctorList();
  wirePatientBookingSubmit();
  wirePatientRealtime();
  auth.onAuthStateChanged((u)=>{ if (u) renderMyCaseAndPlans(u.uid); });
});


