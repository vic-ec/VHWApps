// modules/parking-bloodgas.js — Hospital Parking and Blood Gas Machine modules

const DISCLAIMER = `\n\n---\nThis email has been auto-generated and may contain errors. Please confirm that the information is correct before proceeding. Please ignore and delete this email if you are not the intended recipient or have received this email in error.`;

// ── HOSPITAL PARKING MODULE ──
(function () {
  const MODULE_ID = 'parking';

  function renderExtraFields() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label>Car Make and Model *</label>
          <input type="text" id="parking-car-model" />
        </div>
        <div class="form-group">
          <label>Car Number Plate *</label>
          <input type="text" id="parking-plate" />
        </div>
      </div>
    `;
    return div;
  }

  function getEmailLink(userData) {
    const carModel   = document.getElementById('parking-car-model')?.value?.trim() || 'N/A';
    const plate      = document.getElementById('parking-plate')?.value?.trim() || 'N/A';
    const fullName   = [userData.title, userData.name, userData.secondName, userData.surname].filter(Boolean).join(' ');
    const dept       = userData.department || 'N/A';
    const adminEmail = 'Janine.Theunissen@westerncape.gov.za';
    const cc         = encodeURIComponent(userData.email || '');
    const subject    = encodeURIComponent('New Request - Hospital Parking Disc - ' + fullName);
    const body = encodeURIComponent(
'Dear Administrator\n\nPlease can you assist me with a parking disc:\n\n' +
'- Name: ' + fullName + '\n' +
'- Designation: ' + (userData.jobTitle || 'N/A') + '\n' +
'- Hospital Department: ' + dept + '\n' +
'- Mobile: ' + (userData.mobile || 'N/A') + '\n' +
'- Email: ' + (userData.email || 'N/A') + '\n' +
'- Car make and model: ' + carModel + '\n' +
'- Car number plate: ' + plate + '\n\n' +
'I would appreciate your assistance with this. Please let me know when I can collect it.\n\nKind regards,\n' + fullName +
'\n\n---\nThis email has been auto-generated and may contain errors. Please confirm that the information is correct before proceeding. Please ignore and delete this email if you are not the intended recipient or have received this email in error.'
    );
    return 'mailto:' + adminEmail + '?cc=' + cc + '&subject=' + subject + '&body=' + body;
  }

  ChecklistCore.register({
    id: MODULE_ID, title: 'Hospital Parking', shortTitle: 'Parking',
    description: 'Hospital parking disc request — vehicle registration and department details required',
    icon: '🚗', generatePDF: null, renderExtraFields, getEmailLink,
  });
})();

// ── BLOOD GAS MACHINE MODULE ──
(function () {
  const MODULE_ID = 'bloodgas';

  function renderExtraFields() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label>Username (initials acceptable) *</label>
          <input type="text" id="bg-username" />
        </div>
        <div class="form-group">
          <label>Password *</label>
          <input type="text" id="bg-password" />
        </div>
      </div>
    `;
    return div;
  }

  function getEmailLink(userData) {
    const username  = document.getElementById('bg-username')?.value?.trim() || 'N/A';
    const password  = document.getElementById('bg-password')?.value?.trim() || 'N/A';
    const fullName  = [userData.name, userData.secondName, userData.surname].filter(Boolean).join(' ');
    const dept      = userData.department || 'N/A';
    const to        = 'philip.cloete@westerncape.gov.za; sebastian.dehaan@westerncape.gov.za; paul.xafis@westerncape.gov.za';
    const cc        = encodeURIComponent(userData.email || '');
    const subject   = encodeURIComponent('New Request - Blood Gas Machine Profile - ' + (userData.title ? userData.title + ' ' : '') + (userData.name || '') + ' ' + (userData.surname || ''));
    const body = encodeURIComponent(
'Dear colleagues\n\nPlease can you assist with creating my profile for the EC blood gas machine:\n\n' +
'- Name: ' + fullName + '\n' +
'- Designation: ' + (userData.jobTitle || 'N/A') + '\n' +
'- Hospital Department: ' + dept + '\n' +
'- Username: ' + username + '\n' +
'- Password: ' + password + '\n\n' +
'I appreciate your assistance with this and look forward to working with you soon.\n\nKind regards,\n' + fullName +
'\n\n---\nThis email has been auto-generated and may contain errors. Please confirm that the information is correct before proceeding. Please ignore and delete this email if you are not the intended recipient or have received this email in error.'
    );
    return 'mailto:' + to + '?cc=' + cc + '&subject=' + subject + '&body=' + body;
  }

  function renderPostEmailActions() {
    const a = document.createElement('a');
    a.href = 'https://1drv.ms/v/c/32d264b7daebcc2a/IQCmIsL3_Y4OT584mtgSVg5OAYLv2KSZrXpF6SRZyI1bsqU?e=l5u0T0';
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'btn-email';
    a.style.cssText = 'background:#fef3e2;color:#d4701a;border-color:#d4701a;text-decoration:none;flex:1;justify-content:center;';
    a.textContent = '▶ Watch: How to take the perfect blood gas sample';
    return a;
  }

  ChecklistCore.register({
    id: MODULE_ID, title: 'Blood Gas Machine', shortTitle: 'Blood Gas',
    description: 'EC blood gas machine user profile — username and password setup',
    icon: '💉', generatePDF: null, renderExtraFields, getEmailLink, renderPostEmailActions,
  });
})();
