// modules/hectis-spv-accounts.js — HECTIS and Single Patient Viewer redirect modules

// ── HECTIS MODULE ──
(function () {
  ChecklistCore.register({
    id:            'hectis',
    title:         'HECTIS Access',
    shortTitle:    'HECTIS',
    description:   'Hospital Emergency Care Tracking Information System — user registration via the WCG portal',
    icon:          '🏥',
    isRedirect:    true,
    redirectUrl:   'https://hectis-user-reg.westerncape.gov.za/ords/r/user_reg/a123/31',
    redirectLabel: 'Open HECTIS Registration Portal →',
    redirectNote:  'HECTIS account registration is handled via the WCG online portal. Click the button to open it in a new tab.',
    generatePDF:        null,
    renderExtraFields:  null,
    getEmailLink:       null,
  });
})();

// ── SINGLE PATIENT VIEWER MODULE ──
(function () {
  ChecklistCore.register({
    id:            'spv',
    title:         'Single Patient Viewer',
    shortTitle:    'SPV',
    description:   'Single Patient Viewer — access to integrated patient records across facilities',
    icon:          '👁️',
    isRedirect:    true,
    redirectUrl:   'https://departmentofhealthandwellness.jotform.com/form/232204405258044',
    redirectLabel: 'Open SPV Access Request Form →',
    redirectWarning: '⚠️ SPV requires a WCG email address! Register for WCG IT Network Access first before applying for SPV access.',
    redirectNote:  'SPV access is requested via an online form. Click the button to open it in a new tab.',
    generatePDF:        null,
    renderExtraFields:  null,
    getEmailLink:       null,
  });
})();
