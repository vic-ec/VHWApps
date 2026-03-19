// modules/it-account.js — IT Services: redirects to WCG ITSM portal
// modules/pacs-account.js — X-Ray/PACS: redirects to MS Forms link
// Both registered as redirect-only modules (no PDF generation)

// ── IT MODULE ──
(function () {
  ChecklistCore.register({
    id:          'it',
    title:       'WCG IT Network Access',
    shortTitle:  'IT Account',
    description: 'Windows login, WCG email, internet, and network access — managed via the WCG IT Service Portal',
    icon:        '💻',
    isRedirect:  true,
    redirectUrl: 'https://itsm-itsr.westerncape.gov.za',
    redirectLabel: 'Open WCG IT Service Portal →',
    redirectNote:  'Your IT account request is handled directly through the WCG IT Service Request portal. Click the button to open it in a new tab.',
    generatePDF:   null,
    renderExtraFields: null,
    getEmailLink:  null,
  });
})();

// ── X-RAY / PACS MODULE ──
(function () {
  ChecklistCore.register({
    id:          'pacs',
    title:       'X-Ray / PACS',
    shortTitle:  'PACS',
    description: 'Radiological image viewing and PACS system access — apply via the online form',
    icon:        '🩻',
    iconImg:     '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',
    isRedirect:  true,
    redirectUrl: 'https://forms.office.com/r/G51c5syTNz',
    redirectLabel: 'Open PACS Access Request Form →',
    redirectNote:  'Your PACS access request is completed via a Microsoft Form. Click the button to open it in a new tab.',
    generatePDF:   null,
    renderExtraFields: null,
    getEmailLink:  null,
  });
})();
