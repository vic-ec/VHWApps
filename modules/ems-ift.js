// modules/ems-ift.js — EMS Business Solution User Access Request Form
// Replicates the exact WC Metro EMS form layout

(function () {
  const MODULE_ID = 'emsIft';

  function generatePDF(userData) {
    const doc = PDFEngine.newDoc();
    const W = 210;
    const M = 14;
    const usableW = W - M * 2;

    // Extra fields
    const serviceType    = document.getElementById('ems-service-type')?.value || 'Access required';
    // IFT Booking is mandatory for EC staff — all other options removed
    const appCallTaking  = false;
    const appDispatching = false;
    const appRMS         = false;
    const appFMS         = false;
    const appHealthNET   = false;
    const appIFT         = true;
    const appMDT         = false;
    const appPDT         = false;
    const appReports     = false;
    const appOther       = '';

    // Computed values used throughout
    const fullFirstName = [userData.name, userData.secondName].filter(Boolean).join(' ');
    const todayD = new Date();
    const today  = `${String(todayD.getDate()).padStart(2,'0')}/${String(todayD.getMonth()+1).padStart(2,'0')}/${todayD.getFullYear()}`;

    // ── HEADER ──
    doc.setFillColor(0, 83, 141);
    doc.rect(0, 0, W, 24, 'F');

    // WCG logo — left-aligned (standardised 50×18 in 52×20 pill)
    if (window.LOGO_WCG) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(M, 2, 52, 20, 2, 2, 'F');
        doc.addImage(window.LOGO_WCG, 'PNG', M + 1, 3, 50, 18);
      } catch(e) {
        doc.setTextColor(255,255,255);
        doc.setFontSize(9); doc.setFont('helvetica','bold');
        doc.text('Western Cape Government', M, 10);
      }
    }

    // Centre text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text('Department of Health and Wellness', W / 2, 10, { align: 'center' });
    doc.text('Emergency Medical Services: EBS', W / 2, 16, { align: 'center' });

    // EMS logo — right-aligned (standardised 20×20 in 22×22 pill)
    if (window.LOGO_EMS) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(W - M - 22, 2, 22, 20, 2, 2, 'F');
        doc.addImage(window.LOGO_EMS, 'PNG', W - M - 21, 3, 20, 18);
      } catch(e) {}
    }

    // Enquiries line
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Enquiries: EMS.Evolution@westerncape.gov.za', M, 29);

    // ── TITLE BAR ──
    doc.setFillColor(0, 83, 141);
    doc.rect(M, 32, usableW, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('EMS BUSINESS SOLUTION USER ACCESS REQUEST FORM', W / 2, 38.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    let y = 48;

    // ── INSTRUCTIONS ──
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTRUCTIONS', M, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('1. Please complete all required fields.', M, y); y += 4;
    doc.text('2. Please email the approved form to EMS.Evolution@westerncape.gov.za', M, y); y += 8;

    // ── SERVICE REQUIRED ──
    doc.setFillColor(0, 83, 141);
    doc.rect(M, y, usableW, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVICE REQUIRED', M + 3, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 10;

    const drawCheckbox = (label, checked, cx, cy) => {
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

    drawCheckbox('Access required',        serviceType === 'Access required',        M,      y);
    drawCheckbox('Deactivate access',      serviceType === 'Deactivate access',      M + 60, y);
    drawCheckbox('Update / Reset profile', serviceType === 'Update / Reset profile', M + 120, y);
    y += 10;

    // ── REQUESTER DETAILS ──
    doc.setFillColor(0, 83, 141);
    doc.rect(M, y, usableW, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('REQUESTER DETAILS', M + 3, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 9;

    // Application/functionality block
    const blockH = 30;
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.rect(M, y, usableW, blockH, 'D');
    doc.setFillColor(235, 239, 245);
    doc.rect(M, y, 38, blockH, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text('Application name /', M + 2, y + 8);
    doc.text('functionality', M + 2, y + 13);

    // Checkbox grid: 4 columns, 2 rows + reports row
    const apps = [
      { label: 'Call taking',       checked: appCallTaking },
      { label: 'Dispatching',       checked: appDispatching },
      { label: 'RMS',               checked: appRMS },
      { label: 'FMS',               checked: appFMS },
      { label: 'HealthNET Booking', checked: appHealthNET },
      { label: 'IFT Booking',       checked: appIFT },
      { label: 'MDT',               checked: appMDT },
      { label: 'PDT',               checked: appPDT },
    ];
    const colW4 = (usableW - 40) / 4;
    apps.forEach((app, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      drawCheckbox(app.label, app.checked, M + 40 + col * colW4, y + 3 + row * 12);
    });
    drawCheckbox('Reports', appReports, M + 40, y + 24);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Other: ${appOther || ''}`, M + 80, y + 27);
    y += blockH + 1;

    // Labeled row helper
    const drawRow = (label, value, ry, rh = 9) => {
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      doc.rect(M, ry, usableW, rh, 'D');
      doc.setFillColor(235, 239, 245);
      doc.rect(M, ry, 50, rh, 'FD');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 20, 20);
      doc.text(label, M + 2, ry + rh / 2 + 1.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      if (value) doc.text(value, M + 53, ry + rh / 2 + 1.5);
    };

    // PERSAL with segmented boxes
    drawRow('PERSAL Number', '', y);
    const digits = (userData.persal || '').replace(/\D/g, '').split('');
    for (let i = 0; i < 8; i++) {
      const bx = M + 52 + i * 9;
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.3);
      doc.rect(bx, y + 1.5, 8, 6, 'D');
      if (digits[i]) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(digits[i], bx + 4, y + 6.5, { align: 'center' });
      }
    }
    y += 9;

    drawRow('Name and Surname', `${fullFirstName} ${userData.surname}`, y); y += 9;
    drawRow('Telephone Number', userData.mobile, y); y += 9;
    drawRow('Email Address', userData.email, y); y += 9;
    drawRow('Chief Directorate', 'Health & Wellness', y); y += 9;
    drawRow('Directorate/Facility', 'Victoria Hospital — Emergency Centre', y); y += 12;

    // ── Confidentiality notice ──
    doc.setFillColor(255, 253, 220);
    doc.setDrawColor(160, 140, 0);
    doc.setLineWidth(0.4);
    doc.rect(M, y, usableW, 14, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 50, 0);
    const notice = [
      "The patients' charter states that privacy and confidentiality are basic rights. Infringements of these rights",
      'are very serious. Personal information is to be used only for appropriate purposes and may not be divulged',
      'to others without permission from the patient and the head of the institution.'
    ];
    notice.forEach((line, i) => doc.text(line, W / 2, y + 4 + i * 4, { align: 'center' }));
    doc.setTextColor(0, 0, 0);
    y += 18;

    // ── Signature table ──
    const sigCols = [34, 52, 62, 34];
    const sigLabels = ['', 'Print Name', 'Signature', 'Date'];

    // Header row
    let sx = M;
    sigLabels.forEach((h, i) => {
      doc.setFillColor(225, 230, 242);
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      doc.rect(sx, y, sigCols[i], 7, 'FD');
      if (h) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 80);
        doc.text(h, sx + sigCols[i] / 2, y + 4.8, { align: 'center' });
      }
      sx += sigCols[i];
    });
    y += 7;

    const sigRows = [
      { role: 'User', name: `${fullFirstName} ${userData.surname}` },
      { role: 'Authorising Manager', name: userData.supervisor },
    ];
    sigRows.forEach(row => {
      sx = M;
      [row.role, row.name, '', today].forEach((val, i) => {
        doc.setDrawColor(160, 160, 160);
        doc.setLineWidth(0.3);
        doc.rect(sx, y, sigCols[i], 11, 'D');
        doc.setFontSize(i === 3 ? 7.5 : 8);
        doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
        doc.setTextColor(0, 0, 0);
        if (val) doc.text(val, sx + 2, y + 7);
        sx += sigCols[i];
      });
      y += 11;
    });
    y += 6;

    // ── FOR OFFICIAL USE ONLY ──
    doc.setFillColor(0, 83, 141);
    doc.rect(M, y, usableW, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('FOR OFFICIAL USE ONLY', W / 2, y + 5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 7;

    sx = M;
    sigLabels.forEach((h, i) => {
      doc.setFillColor(250, 240, 210);
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      doc.rect(sx, y, sigCols[i], 7, 'FD');
      if (h) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 60, 0);
        doc.text(h, sx + sigCols[i] / 2, y + 4.8, { align: 'center' });
      }
      sx += sigCols[i];
    });
    y += 7;

    sx = M;
    ['System Access Granted', '', '', ''].forEach((val, i) => {
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      doc.rect(sx, y, sigCols[i], 12, 'D');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      if (val) doc.text(val, sx + 2, y + 7.5);
      sx += sigCols[i];
    });

    // Page number
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text('1', W / 2, 290, { align: 'center' });

    PDFEngine.save(doc, `EMS_IFT_Access_${userData.surname}_${userData.name}.pdf`);
  }

  function renderExtraFields() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label>Service Required</label>
          <select id="ems-service-type">
            <option value="Access required">Access required (new account)</option>
            <option value="Deactivate access">Deactivate access</option>
            <option value="Update / Reset profile">Update / Reset profile</option>
          </select>
        </div>
      </div>
    `;
    return div;
  }

  function getEmailLink(userData) {
    return EmailEngine.generateSupervisorMailtoLink({
      module:     'emsIft',
      userData,
      itemLabel:  'EMS IFT',
      adminEmail: 'EMS.Evolution@westerncape.gov.za',
    });
  }

  ChecklistCore.register({
    id:          MODULE_ID,
    title:       'EMS Inter-Facility Transfer',
    shortTitle:  'EMS IFT',
    description: 'WC EMS Business Solution — IFT Booking, HealthNET, and related EMS system access',
    icon:        '🚑',
    generatePDF,
    renderExtraFields,
    getEmailLink
  });
})();
