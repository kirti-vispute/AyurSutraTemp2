import { auth, db } from './firebaseInit.js';
import { uploadPrescription } from './prescriptionsApi.js';

function byId(id){ return document.getElementById(id); }

document.addEventListener('DOMContentLoaded', ()=>{
  const filesInput = byId('case-files');
  if (filesInput) {
    filesInput.addEventListener('change', async (e)=>{
      const user = auth.currentUser;
      if (!user) return;
      const sel = byId('case-patient');
      const patientUidOrEmail = sel ? sel.value : '';
      if (!patientUidOrEmail) return;
      const files = Array.from(e.target.files || []);
      for (const f of files) {
        try {
          const isEmail = /@/.test(patientUidOrEmail);
          await uploadPrescription({
            patientUid: isEmail ? '' : patientUidOrEmail,
            patientEmail: isEmail ? patientUidOrEmail : '',
            doctorUid: user.uid,
            file: f,
            notes: ''
          });
        } catch(_){ }
      }
      // Clear input to avoid re-uploads on same selection
      try { e.target.value = ''; } catch(_){ }
    });
  }
});


