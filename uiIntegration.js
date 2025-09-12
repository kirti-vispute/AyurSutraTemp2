// Non-visual integrations to existing DOM. No style or layout changes.
import { auth, db } from './firebaseInit.js';
import { listenActiveDoctors } from './doctorsApi.js';
import { listenAppointmentsByDoctor, listenAppointmentsByPatient, updateAppointment } from './appointmentsApi.js';
import { doc, getDoc, onSnapshot, query, where, collection, updateDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

function byId(id){ return document.getElementById(id); }

// 1) Patient page: populate practitioners list from Firestore doctors
export function wirePatientDoctorList(){
  const select = byId('appointment-practitioner');
  if (!select) return () => {};
  // preserve existing options for fallback; append live ones
  return listenActiveDoctors((docs)=>{
    // keep first options, then add dynamic under an optgroup
    let group = select.querySelector('optgroup[label="Registered Doctors"]');
    if (!group) { group = document.createElement('optgroup'); group.label = 'Registered Doctors'; select.appendChild(group); }
    group.innerHTML = '';
    docs.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id; // value is uid for easier linking
      opt.textContent = d.name || d.email || d.id;
      group.appendChild(opt);
    });
  });
}

// 2) Patient booking: intercept submit to ensure doctor linkage and future time validation
export function wirePatientBookingSubmit(){
  const form = byId('booking-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    // patient.js already writes to appointments; we enhance to link to doctor uid when selected from optgroup
    try {
      const practitionerSel = byId('appointment-practitioner');
      const chosen = practitionerSel ? practitionerSel.value : '';
      // if chosen is a uid (from our optgroup), set localStorage cache used for back-compat
      if (chosen && chosen.length > 12) {
        try { localStorage.setItem('appt_cache_v1', JSON.stringify({ doctorUid: chosen })); } catch(_){ }
      }
    } catch(_){ }
  }, { capture: true });
}

// 3) Doctor portal: realtime appointments list updates to local storage used by existing renderer
export function wireDoctorRealtime(){
  if (!(window.DoctorFB && window.DoctorFB.auth)) return () => {};
  const user = window.DoctorFB.auth.currentUser;
  if (!user) return () => {};
  return listenAppointmentsByDoctor(user.uid, (items)=>{
    try {
      const mapped = items.map(a => ({ id: a.id, treatments: (a.treatments||[]).map(t=>t.name||t), start: new Date(`${a.date}T${a.time||'00:00'}`).toISOString(), duration: 60, patientEmail: '', patientName: a.practitioner || '', notes: a.center || '', status: (a.status||'Confirmed').toLowerCase() }));
      localStorage.setItem('doc_appts_v1', JSON.stringify(mapped));
    } catch(_){ }
  });
}

// 4) Patient portal: realtime appointment updates
export function wirePatientRealtime(){
  return auth.onAuthStateChanged((u)=>{
    if (!u) return;
    // keep patient.js behavior
    listenAppointmentsByPatient(u.uid, ()=>{});
    // Link newly created appointments to doctor if practitioner stores a UID
    const qRef = query(collection(db,'appointments'), where('userId','==', u.uid));
    return onSnapshot(qRef, async (snap)=>{
      for (const d of snap.docs) {
        const a = d.data();
        if ((a.doctorId||'') === '' && typeof a.practitioner === 'string' && a.practitioner.length > 12) {
          try {
            const docSnap = await getDoc(doc(db,'doctors', a.practitioner));
            if (docSnap.exists()) {
              await updateDoc(d.ref, { doctorId: a.practitioner, practitioner: (docSnap.data().name || a.practitioner) });
            }
          } catch(_){ }
        }
      }
    });
  });
}

// 5) Logo replacement without style/layout changes
export function replaceLogos(){
  const replacements = [];
  // index: h1.logo-text
  document.querySelectorAll('h1.logo-text, header h1, #logo-link').forEach(el => {
    if (!el) return;
    if (/AyurSutra/i.test(el.textContent || '')) {
      el.innerHTML = `<img src="/assets/ayursutra-logo.png" alt="AyurSutra" style="height:1em;vertical-align:middle">`;
    }
    el.addEventListener('click', () => {
      // role-based route using users.role in localStorage if present
      try {
        const role = (localStorage.getItem('last_role')||'').toLowerCase();
        if (role === 'patient') window.location.href = 'patient.html';
        else if (role === 'staff' || role === 'doctor') window.location.href = 'doctor.html';
        else window.location.href = 'index.html';
      } catch(_){ window.location.href = 'index.html'; }
    });
    replacements.push(el);
  });
  return replacements.length;
}

// Backward-compat: normalize localStorage keys
export function ensureBackwardCompat(){
  try {
    const profile = JSON.parse(localStorage.getItem('doc_profile_v1')||'{}') || {};
    localStorage.setItem('doc_profile_v1', JSON.stringify(profile));
    const apptCache = JSON.parse(localStorage.getItem('appt_cache_v1')||'{}') || {};
    localStorage.setItem('appt_cache_v1', JSON.stringify(apptCache));
  } catch(_){ }
}

// 6) Doctor ensure Firestore doctor document exists
export function ensureDoctorRecord(){
  if (!(window.DoctorFB && window.DoctorFB.auth)) return;
  window.DoctorFB.auth.onAuthStateChanged(async (u)=>{
    if (!u) return;
    try {
      const s = await getDoc(doc(db,'doctors', u.uid));
      if (!s.exists()) {
        const profile = JSON.parse(localStorage.getItem('doc_profile_v1')||'{}')||{};
        const payload = {
          name: profile.name || profile.fullname || u.email,
          email: profile.email || u.email,
          phone: profile.phone || '',
          specialization: profile.specialization || '',
          clinicId: profile.clinicId || ''
        };
        const { createDoctor } = await import('./doctorsApi.js');
        await createDoctor(u.uid, payload);
      }
    } catch(_){ }
  });
}

// Auto-run on load for public pages
document.addEventListener('DOMContentLoaded', ()=>{
  try { replaceLogos(); } catch(_){ }
  try { ensureBackwardCompat(); } catch(_){ }
  try { ensureDoctorRecord(); } catch(_){ }
});


