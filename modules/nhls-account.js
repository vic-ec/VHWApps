// modules/nhls-account.js — NHLS Web Results / Requesting Doctor Application Form v8.4
// Replicates exact form structure from Web_Results_Requesting_Doctor_Application_Form_v8_4.docx

(function () {
  const MODULE_ID = 'nhls';

  function generatePDF(userData) {
    const doc = PDFEngine.newDoc();
    const W = 210;
    const M = 20;
    const usableW = W - M * 2;

    // Extra fields
    const title         = userData.title || '';
    const secondName    = userData.secondName || '';
    const idNumber      = document.getElementById('nhls-id')?.value?.trim() || '';
    const officePhone   = document.getElementById('nhls-office-phone')?.value?.trim() || '';
    const isRegistered  = document.getElementById('nhls-registered')?.value || 'Yes';
    const regNumber     = userData.mpNumber || '';
    const employer      = document.getElementById('nhls-employer')?.value || 'Dept of Health';
    const hivAccess     = 'Yes';      // always Yes for EC clinicians
    const isRequesting  = 'Yes';      // EC clinicians are requesting doctors by default

    // Derive NHLS rank from shared job title field
    const rankMap = {
      'Intern':          'Intern',
      'Nurse':           'Nurse',
      'Medical Officer': 'Medical Officer',
      'Registrar':       'Registrar',
      'Consultant':      'Consultant',
    };
    const rank       = rankMap[userData.jobTitle] || userData.jobTitle || '';
    const todayDate  = new Date();
    const today      = `${String(todayDate.getDate()).padStart(2,'0')}/${String(todayDate.getMonth()+1).padStart(2,'0')}/${todayDate.getFullYear()}`;
    const fullFirstName = [userData.name, secondName].filter(Boolean).join(' ');
    const primaryFac = 'Victoria Hospital — Emergency Centre';

    // Helper: draw a table cell
    const cell = (text, x, y, w, h, opts = {}) => {
      const { bg, bold, fontSize = 7.5, align = 'left', color = [0,0,0], wrap = false } = opts;
      doc.setDrawColor(140, 140, 140);
      doc.setLineWidth(0.3);
      if (bg) { doc.setFillColor(...bg); doc.rect(x, y, w, h, 'FD'); }
      else     { doc.rect(x, y, w, h, 'D'); }
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      if (text) {
        const tx = align === 'center' ? x + w / 2 : x + 2;
        const ty = y + h / 2 + fontSize * 0.35;
        if (wrap) {
          doc.text(text, tx, y + 3, { maxWidth: w - 4 });
        } else {
          doc.text(text, tx, ty, { align });
        }
      }
      doc.setTextColor(0, 0, 0);
    };

    // ── HEADER: NHLS branding ──
    doc.setFillColor(166, 206, 57);
    doc.rect(0, 10, W, 22, 'F');

    // NHLS logo — left-aligned, smaller for crispness
    if (window.LOGO_NHLS) {
      try { doc.addImage(window.LOGO_NHLS, 'JPEG', M, 13, 55, 16); } catch(e) {
        doc.setTextColor(255,255,255);
        doc.setFontSize(14); doc.setFont('helvetica','bold');
        doc.text('NHLS', M, 14);
      }
    }

    // Centre contact text
    const centerX = W / 2;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text('IT Helpdesk: ITHelpdesk1@nhls.ac.za', centerX, 21, { align: 'center' });
    doc.text('Tel: 011 386 6125', centerX, 26, { align: 'center' });

    // WCG logo — right-aligned (standardised 50×18 in 52×20 pill)
    if (window.LOGO_WCG) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(W - M - 52, 12, 52, 18, 2, 2, 'F');
        doc.addImage(window.LOGO_WCG, 'PNG', W - M - 51, 13, 50, 16);
      } catch(e) {}
    }
    doc.setTextColor(0, 0, 0);

    // Title bar
    doc.setFillColor(166, 206, 57);
    doc.rect(M, 35, usableW, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Web Results ACCESS / REQUESTING DOCTOR APPLICATION', W / 2, 41, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // Version & instruction
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Form v8.4  |  PLEASE SIGN TERMS AND CONDITIONS ON PAGE 2', W / 2, 49, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    let y = 53;

    // ── PRINT CLEARLY banner ──
    doc.setFillColor(235, 245, 210);
    doc.setDrawColor(140, 140, 140);
    doc.setLineWidth(0.3);
    doc.rect(M, y, usableW, 6, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PLEASE PRINT CLEARLY and provide ALL information requested', W / 2, y + 4.2, { align: 'center' });
    y += 8;

    // ── YOUR DETAILS section header ──
    cell('Your details', M, y, usableW, 6, { bg: [166, 206, 57], bold: true, color: [255,255,255], align: 'center', fontSize: 8 });
    y += 6;

    // Surname | First Name (incl. second name) | Title
    const r1 = [
      { label: 'Surname', w: 50 },
      { label: 'First Name', w: 80 },
      { label: 'Title', w: usableW - 130 },
    ];
    let sx = M;
    r1.forEach(col => { cell(col.label, sx, y, col.w, 6, { bg: [220,230,245], bold: true }); sx += col.w; });
    y += 6;
    sx = M;
    const r1vals = [userData.surname, fullFirstName, title];
    r1.forEach((col, i) => { cell(r1vals[i], sx, y, col.w, 8); sx += col.w; });
    y += 8;

    // Email | ID Number
    const r2 = [
      { label: 'Email Address', w: usableW / 2 },
      { label: 'ID Number', w: usableW / 2 },
    ];
    sx = M;
    r2.forEach(col => { cell(col.label, sx, y, col.w, 6, { bg: [220,230,245], bold: true }); sx += col.w; });
    y += 6;
    sx = M;
    [userData.email, idNumber].forEach((val, i) => { cell(val, sx, y, r2[i].w, 8); sx += r2[i].w; });
    y += 8;

    // Staff/PERSAL | Position/Business Role
    const r3 = [
      { label: 'Staff or Persal Number', w: usableW / 2 },
      { label: 'Position / Business Role', w: usableW / 2 },
    ];
    sx = M;
    r3.forEach(col => { cell(col.label, sx, y, col.w, 6, { bg: [220,230,245], bold: true }); sx += col.w; });
    y += 6;
    sx = M;
    [userData.persal, userData.jobTitle].forEach((val, i) => { cell(val, sx, y, r3[i].w, 8); sx += r3[i].w; });
    y += 8;

    // Office Tel | Mobile
    const r4 = [
      { label: 'Office Tel Number', w: usableW / 2 },
      { label: 'Mobile Number', w: usableW / 2 },
    ];
    sx = M;
    r4.forEach(col => { cell(col.label, sx, y, col.w, 6, { bg: [220,230,245], bold: true }); sx += col.w; });
    y += 6;
    sx = M;
    [officePhone, userData.mobile].forEach((val, i) => { cell(val, sx, y, r4[i].w, 8); sx += r4[i].w; });
    y += 10;

    // ── REGULATORY REGISTRATION ──
    cell('Regulatory Professional Registration Information e.g. HPCSA or Nursing Council',
      M, y, usableW, 6, { bg: [166, 206, 57], bold: true, color: [255,255,255], fontSize: 7 });
    y += 6;

    // Are you registered? | Registration Number
    sx = M;
    cell('Are you registered?', sx, y, usableW / 3, 6, { bg: [220,230,245], bold: true }); sx += usableW / 3;
    cell('Registration Number (MANDATORY if you are registered)', sx, y, usableW * 2 / 3, 6, { bg: [220,230,245], bold: true });
    y += 6;

    // Yes/No checkboxes
    const drawCb = (label, checked, cx, cy) => {
      doc.setDrawColor(80, 80, 80);
      doc.setLineWidth(0.45);
      doc.rect(cx, cy, 4.5, 4.5, 'D');
      if (checked) {
        doc.setDrawColor(0, 110, 0);
        doc.setLineWidth(0.9);
        doc.line(cx + 0.7, cy + 2.2, cx + 2, cy + 3.8);
        doc.line(cx + 2, cy + 3.8, cx + 4, cy + 0.7);
      }
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(label, cx + 7, cy + 3.5);
    };

    sx = M;
    cell('', sx, y, usableW / 3, 8, {});
    drawCb('Yes', isRegistered === 'Yes', sx + 2, y + 2);
    drawCb('No',  isRegistered === 'No',  sx + 22, y + 2);
    cell(regNumber, M + usableW / 3, y, usableW * 2 / 3, 8);
    y += 10;

    // ── WEB RESULTS ACCESS section ──
    cell('WEB RESULTS ACCESS to WWDISA and TrakCare Lab',
      M, y, usableW, 6, { bg: [166, 206, 57], bold: true, color: [255,255,255], align: 'center', fontSize: 8 });
    y += 6;

    // Who do you work for?
    cell('Who do you work for:', M, y, usableW, 6, { bg: [220,230,245], bold: true });
    y += 6;

    const employers = ['Dept of Health', 'NHLS', 'Correctional Services', 'SANDF', 'Private', 'Clinical Trials', 'Other'];
    const empColW = usableW / employers.length;
    sx = M;
    employers.forEach(emp => {
      cell(emp, sx, y, empColW, 6, { bg: [235,240,250], bold: false, fontSize: 6.5, align: 'center' });
      sx += empColW;
    });
    y += 6;
    sx = M;
    employers.forEach(emp => {
      cell('', sx, y, empColW, 7);
      drawCb('', emp === employer, sx + empColW / 2 - 2, y + 1.5);
      sx += empColW;
    });
    y += 9;

    // Facility list
    cell('Please list each facility which you need access to', M, y, usableW - 44, 6, { bg: [220,230,245], bold: true });
    cell('Access to Confidential HIV Results', M + usableW - 44, y, 44, 6, { bg: [220,230,245], bold: true, fontSize: 6.5 });
    y += 6;

    cell(employer === 'Dept of Health' || employer === 'NHLS'
      ? 'Facility List Not Required for DOH or NHLS — Victoria Hospital EC'
      : primaryFac,
      M, y, usableW - 44, 8, { fontSize: 7.5 });

    // HIV access
    cell('', M + usableW - 44, y, 44, 8);
    drawCb('Yes', hivAccess === 'Yes', M + usableW - 42, y + 2);
    drawCb('No',  hivAccess === 'No',  M + usableW - 28, y + 2);
    y += 10;

    // ── REQUESTING DOCTORS / SISTERS ──
    cell('REQUESTING DOCTORS / SISTERS',
      M, y, usableW, 6, { bg: [166, 206, 57], bold: true, color: [255,255,255], align: 'center', fontSize: 8 });
    y += 6;

    // Are you a requesting Doctor or Sister?
    const reqCols = [
      { label: 'Are you a requesting Doctor or Sister?', w: usableW / 3 },
      { label: 'BHF Practice Number (private practice only)', w: usableW / 3 },
      { label: 'Primary Facility Name', w: usableW / 3 },
    ];
    sx = M;
    reqCols.forEach(col => { cell(col.label, sx, y, col.w, 8, { bg: [220,230,245], bold: true, wrap: true, fontSize: 6.5 }); sx += col.w; });
    y += 8;
    sx = M;
    cell('', sx, y, usableW / 3, 8);
    drawCb('Yes', isRequesting === 'Yes', sx + 2, y + 2);
    drawCb('No',  isRequesting === 'No',  sx + 20, y + 2);
    sx += usableW / 3;
    cell('', sx, y, usableW / 3, 8); sx += usableW / 3;
    cell(primaryFac, sx, y, usableW / 3, 8, { fontSize: 7.5 });
    y += 8;

    // Primary Facility Address
    cell('Primary Facility Address (MANDATORY for private practice only)', M, y, usableW, 6, { bg: [220,230,245], bold: true, fontSize: 6.5 });
    y += 6;
    cell('171 Victoria Road, Wynberg, Cape Town, 7800 (DoH staff — N/A)', M, y, usableW, 8, { fontSize: 7.5 });
    y += 10;

    // Rank/level
    cell('Specify level or rank (for electronic gate keeping)', M, y, usableW, 6, { bg: [220,230,245], bold: true, fontSize: 7 });
    y += 6;

    const ranks = ['Intern', 'Nurse', 'Medical Officer', 'Registrar', 'Consultant'];
    const rankColW = usableW / ranks.length;
    sx = M;
    ranks.forEach(r => { cell(r, sx, y, rankColW, 6, { bg: [235,240,250], fontSize: 6.5, align: 'center' }); sx += rankColW; });
    y += 6;
    sx = M;
    ranks.forEach(r => {
      cell('', sx, y, rankColW, 7);
      drawCb('', r === rank, sx + rankColW / 2 - 2, y + 1.5);
      sx += rankColW;
    });
    y += 9;

    // ── COMPLETED BY MEDICAL SUPERINTENDENT ──
    cell('TO BE COMPLETED BY MEDICAL SUPERINTENDENT OR PERSON GIVING AUTHORITY',
      M, y, usableW, 7, { bg: [166, 206, 57], bold: true, color: [255,255,255], align: 'center', fontSize: 7.5 });
    y += 7;

    // Supervisor name fields
    const supCols = [
      { label: 'Surname', w: usableW / 3 },
      { label: 'First Name', w: usableW / 3 },
      { label: 'Business Role / Position', w: usableW / 3 },
    ];
    sx = M;
    supCols.forEach(col => { cell(col.label, sx, y, col.w, 6, { bg: [220,230,245], bold: true }); sx += col.w; });
    y += 6;
    sx = M;
    const supParts = (userData.supervisor || '').split(' ');
    const supSurname = supParts.slice(-1)[0] || '';
    const supFirst   = supParts.slice(0, -1).join(' ') || userData.supervisor;
    [supSurname, supFirst, userData.jobTitle ? 'Authorising Manager' : ''].forEach((val, i) => {
      cell(val, sx, y, supCols[i].w, 8); sx += supCols[i].w;
    });
    y += 8;

    // Phone | Email
    const supContact = [
      { label: 'Phone Number', w: usableW / 2 },
      { label: 'Email Address', w: usableW / 2 },
    ];
    sx = M;
    supContact.forEach(col => { cell(col.label, sx, y, col.w, 6, { bg: [220,230,245], bold: true }); sx += col.w; });
    y += 6;
    sx = M;
    ['', userData.supervisorEmail].forEach((val, i) => { cell(val, sx, y, supContact[i].w, 8); sx += supContact[i].w; });
    y += 8;

    // Signature | Date
    cell('Signature', M, y, usableW - 40, 6, { bg: [220,230,245], bold: true });
    cell('Date', M + usableW - 40, y, 40, 6, { bg: [220,230,245], bold: true });
    y += 6;
    cell('', M, y, usableW - 40, 14);
    cell(today, M + usableW - 40, y, 40, 14, { fontSize: 8 });
    y += 16;

    // ── NHLS INTERNAL USE ONLY ──
    cell('NHLS INTERNAL USE ONLY',
      M, y, usableW, 7, { bg: [166, 206, 57], bold: true, color: [255,255,255], align: 'center', fontSize: 8 });
    y += 7;

    cell('Loaded By', M, y, usableW / 2, 6, { bg: [220,230,245], bold: true });
    cell('Signature', M + usableW / 2, y, usableW / 4, 6, { bg: [220,230,245], bold: true });
    cell('Date', M + usableW * 3 / 4, y, usableW / 4, 6, { bg: [220,230,245], bold: true });
    y += 6;
    cell('', M, y, usableW / 2, 12);
    cell('', M + usableW / 2, y, usableW / 4, 12);
    cell('', M + usableW * 3 / 4, y, usableW / 4, 12);
    y += 14;

    // ── PAGE 2: Terms & Conditions ──
    doc.addPage();
    y = 20;

    doc.setFillColor(166, 206, 57);
    doc.rect(M, y, usableW, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS AND CONDITIONS — WEB RESULTS ACCESS', W / 2, y + 6, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 13;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('To: All Web View and TrakCare Lab Users    |    13 November 2018', M, y);
    y += 7;

    const terms = [
      'These Terms and Conditions govern your use of the NHLS website (nhls.ac.za). By accessing and using the Website, you agree to be bound by these Terms and Conditions.',
      'The National Health Act requires that health care providers and establishments are responsible for personal information about their Patients and must ensure such information is effectively protected against improper disclosure at all times.',
      'The User who accesses any information on this Website concerning a Patient makes the following undertakings:',
      '• The protection and disclosure of all Personal and Confidential Information of the Patient is governed by the Constitution of the RSA (Act 108 of 1996), the National Health Act, the Promotion of Access to Information Act (Act 2 of 2000) and the Ethical Rules of the HPCSA.',
      '• Personal and Confidential Information of the Patient shall be used only for appropriate purposes for which it is being made available and may not be divulged to others without the prior written consent of the Patient and the head of the institution.',
      '• The User shall ensure that all representatives and employees to whom Personal and Confidential Information is provided shall be bound by these undertakings.',
      '• Personal and Confidential Information may be divulged only with the express written consent of the Patient; pursuant to a legal requirement or court order; where it is lawfully in the public domain; in the public interest; or with consent of a parent or guardian of a minor under the age of 12 years.',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    terms.forEach(term => {
      const lines = doc.splitTextToSize(term, usableW - 4);
      doc.text(lines, M + 2, y);
      y += lines.length * 4.5 + 3;
    });

    y += 6;

    // Acknowledgement box
    doc.setFillColor(240, 245, 255);
    doc.setDrawColor(0, 70, 130);
    doc.setLineWidth(0.5);
    doc.rect(M, y, usableW, 8, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 40, 100);
    doc.text(
      'I acknowledge that I have read and understood the foregoing terms and conditions for access to wwDisa and TrakCare Lab Web Results',
      W / 2, y + 5.2, { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
    y += 12;

    // Applicant signature
    cell('Applicant Name', M, y, usableW, 6, { bg: [220,230,245], bold: true });
    y += 6;
    cell(`${fullFirstName} ${userData.surname}`, M, y, usableW, 10);
    y += 12;

    cell('Signature', M, y, usableW - 40, 6, { bg: [220,230,245], bold: true });
    cell('Date', M + usableW - 40, y, 40, 6, { bg: [220,230,245], bold: true });
    y += 6;
    cell('', M, y, usableW - 40, 16);
    cell(today, M + usableW - 40, y, 40, 16, { fontSize: 8 });

    // Page numbers
    [1, 2].forEach((pg, i) => {
      if (i === 0) { /* already on page 1 content, handled inline */ }
    });
    doc.setPage(1);
    doc.setFontSize(7); doc.setTextColor(160,160,160);
    doc.text('1', W / 2, 290, { align: 'center' });
    doc.setPage(2);
    doc.setFontSize(7); doc.setTextColor(160,160,160);
    doc.text('2', W / 2, 290, { align: 'center' });

    PDFEngine.save(doc, `NHLS_WebResults_Application_${userData.surname}_${userData.name}.pdf`);
  }

  function renderExtraFields() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label>ID Number</label>
          <input type="text" id="nhls-id" />
        </div>
        <div class="form-group">
          <label>Office Telephone Number</label>
          <input type="text" id="nhls-office-phone" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>HPCSA / Nursing Council Registered?</label>
          <select id="nhls-registered">
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div class="form-group">
          <label>Employer</label>
          <select id="nhls-employer">
            <option value="Dept of Health">Department of Health (WCG)</option>
            <option value="NHLS">NHLS</option>
            <option value="Correctional Services">Correctional Services</option>
            <option value="SANDF">SANDF</option>
            <option value="Private">Private</option>
            <option value="Clinical Trials">Clinical Trials</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    `;
    return div;
  }

  function getEmailLink(userData) {
    return EmailEngine.generateSupervisorMailtoLink({
      module:     'nhls',
      userData,
      itemLabel:  'NHLS Web Results',
      adminEmail: 'nhls-admin@nhls.ac.za',
    });
  }

  ChecklistCore.register({
    id:          MODULE_ID,
    title:       'NHLS Web Results',
    shortTitle:  'NHLS',
    description: 'National Health Laboratory Service — WWDISA & TrakCare Lab web results access for requesting clinicians',
    icon:        '🔬',
    generatePDF,
    renderExtraFields,
    getEmailLink
  });
})();
