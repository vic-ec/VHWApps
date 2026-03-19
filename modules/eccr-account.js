// modules/eccr-account.js — eCCR Access Form (jsPDF version)
// Generates a PDF replicating the eCCR Access Change Control Form layout.

(function () {
  const MODULE_ID = 'eccr';

  function generatePDF(userData) {
    const doc = PDFEngine.newDoc();
    const W = 210;
    const M = 20;
    const usableW = W - M * 2;

    const eccrRole  = document.getElementById('eccr-role')?.value || '';
    const reqType   = document.getElementById('eccr-req-type')?.value || 'Register';
    const startRaw  = document.getElementById('eccr-start-date')?.value;
    const todayD    = new Date();
    const today     = `${String(todayD.getDate()).padStart(2,'0')}/${String(todayD.getMonth()+1).padStart(2,'0')}/${todayD.getFullYear()}`;
    const startDate = startRaw
      ? (([y,mo,d]) => `${d}/${mo}/${y}`)(startRaw.split('-'))
      : today;
    const fullName  = [userData.title, userData.name, userData.secondName, userData.surname].filter(Boolean).join(' ');
    const fName     = [userData.title, userData.name, userData.secondName].filter(Boolean).join(' ');
    const reason    = 'Require access to electronic clinical records for patient processing.';

    const GRN       = [31, 107, 58];
    const GRN_LIGHT = [214, 234, 214];
    const WHITE     = [255, 255, 255];

    // ── cell helpers ──
    const cell = (text, x, y, w, h, opts = {}) => {
      const { bg, bold, fontSize = 8, align = 'left', color = [0,0,0] } = opts;
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      if (bg) { doc.setFillColor(...bg); doc.rect(x, y, w, h, 'FD'); }
      else     { doc.rect(x, y, w, h, 'D'); }
      if (text) {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(...color);
        const tx = align === 'center' ? x + w / 2 : x + 2;
        const ty = y + h / 2 + fontSize * 0.35;
        doc.text(String(text), tx, ty, { align });
        doc.setTextColor(0, 0, 0);
      }
    };

    const hdr  = (t, x, y, w, h) => cell(t, x, y, w, h, { bg: GRN, bold: true, color: WHITE, align: 'center' });
    const lbl  = (t, x, y, w, h) => cell(t, x, y, w, h, { bg: GRN_LIGHT, bold: true, fontSize: 7.5 });
    const val  = (t, x, y, w, h) => cell(t, x, y, w, h, { fontSize: 8.5 });

    const drawCb = (label, checked, cx, cy) => {
      doc.setDrawColor(80, 80, 80); doc.setLineWidth(0.45);
      doc.rect(cx, cy, 4.5, 4.5, 'D');
      if (checked) {
        doc.setDrawColor(0, 110, 0); doc.setLineWidth(0.9);
        doc.line(cx+0.7, cy+2.2, cx+2, cy+3.8);
        doc.line(cx+2,   cy+3.8, cx+4, cy+0.7);
      }
      doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0);
      doc.text(label, cx+7, cy+3.5);
    };

    let y = 0;

    // ── HEADER ──
    doc.setFillColor(...GRN);
    doc.rect(0, 10, W, 22, 'F');

    // WCG logo — left-aligned
    if (window.LOGO_WCG) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(M, 12, 52, 18, 2, 2, 'F');
        doc.addImage(window.LOGO_WCG, 'PNG', M + 1, 13, 50, 16);
      } catch(e) {
        doc.setTextColor(...WHITE);
        doc.setFontSize(9); doc.setFont('helvetica','bold');
        doc.text('Western Cape Government', M, 13);
      }
    }

    // Centre text
    doc.setTextColor(...WHITE);
    doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text('Department of Health', W / 2, 20, { align: 'center' });
    doc.setFontSize(7.5); doc.setFont('helvetica','normal');
    doc.text('Departement van Gesondheid  |  iSebe lezeMoilo', W / 2, 26, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // Title bar
    doc.setFillColor(...GRN);
    doc.rect(M, 35, usableW, 8, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('eCCR ACCESS CHANGE CONTROL FORM — INITIAL ACCESS REQUEST', W/2, 40.5, { align:'center' });
    doc.setTextColor(0, 0, 0);

    y = 47;

    // ── REQUEST TYPE ──
    lbl('Request Type', M, y, 36, 8);
    const reqTypes = ['Register','Revise','Disable'];
    let rx = M + 38;
    reqTypes.forEach(rt => {
      drawCb(rt, rt === reqType, rx, y + 2);
      rx += 40;
    });
    y += 10;

    // ── SECTION: USER DETAILS ──
    hdr('USER DETAILS', M, y, usableW, 7); y += 7;

    const LW = 42, VW = (usableW - LW*2) / 2;
    const twoRow = (l1, v1, l2, v2) => {
      lbl(l1, M,        y, LW, 8); val(v1, M+LW,        y, VW, 8);
      lbl(l2, M+LW+VW,  y, LW, 8); val(v2, M+LW+VW+LW,  y, VW, 8);
      y += 8;
    };

    twoRow('Persal / ID Number', userData.persal,   'Occupation', userData.jobTitle);
    twoRow('Surname',            userData.surname,  'Cell No.',   userData.mobile);
    twoRow('Name(s)',            fName,             'WCG Email',  userData.email);
    twoRow('Hospital',           'Victoria Hospital','E-mail',    userData.email);

    doc.setFontSize(7); doc.setFont('helvetica','italic'); doc.setTextColor(100,100,100);
    doc.text('(complete a separate form for each hospital)', M+2, y+3);
    doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0);
    y += 6;

    // ── REASON FOR ACCESS ──
    hdr('REASON FOR ACCESS / REMOVAL OF ACCESS', M, y, usableW, 7); y += 7;
    doc.setDrawColor(160,160,160); doc.setLineWidth(0.3);
    doc.rect(M, y, usableW, 12, 'D');
    doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text(reason, M+2, y+5, { maxWidth: usableW-4 });
    y += 14;

    // ── DATES ──
    twoRow('Start Date', startDate, 'End Date', '');

    // ── eCCR ROLE ──
    hdr('eCCR ROLE', M, y, usableW, 7); y += 7;
    const roles = [
      ['Junior Clinician','Case Manager','Senior Clinician','Ward Clerk'],
      ['Allied Health Worker','Clinical Nurse Pract.','External User','Internal Auditor'],
      ['Administrator','','',''],
    ];
    roles.forEach(row => {
      const colW = usableW / 4;
      row.forEach((role, i) => {
        doc.setDrawColor(160,160,160); doc.setLineWidth(0.3);
        if (role === eccrRole && role) {
          doc.setFillColor(...GRN_LIGHT); doc.rect(M + i*colW, y, colW, 8, 'FD');
        } else {
          doc.rect(M + i*colW, y, colW, 8, 'D');
        }
        if (role) drawCb(role, role === eccrRole, M + i*colW + 2, y + 2);
      });
      y += 8;
    });
    y += 2;

    // ── DECLARATION ──
    hdr('DECLARATION', M, y, usableW, 7); y += 7;
    doc.setDrawColor(160,160,160); doc.setLineWidth(0.3);
    doc.rect(M, y, usableW, 14, 'D');
    doc.setFontSize(7.5); doc.setFont('helvetica','normal');
    doc.text(
      `I, ${fullName}, declare that I have been made aware of the above and will abide by it at all times.`,
      M+2, y+5, { maxWidth: usableW-4 }
    );
    doc.setFontSize(7); doc.setFont('helvetica','italic'); doc.setTextColor(140,0,0);
    doc.text('Abuse of this access form can lead to disciplinary action.', M+2, y+11);
    doc.setTextColor(0,0,0); doc.setFont('helvetica','normal');
    y += 16;

    // ── USER SIGNATURE ──
    hdr('USER SIGNATURE', M, y, usableW, 7); y += 7;
    twoRow('User Name', fullName, 'Date', today);
    lbl('User Signature', M, y, LW, 14);
    doc.setDrawColor(160,160,160); doc.setLineWidth(0.3);
    doc.rect(M+LW, y, usableW-LW, 14, 'D');
    y += 16;

    // ── MANAGER ──
    hdr('AUTHORISING MANAGER (Hospital Delegated Official)', M, y, usableW, 7); y += 7;
    twoRow('Manager Name', userData.supervisor, 'Persal', '');
    lbl('Manager Signature', M, y, LW, 14);
    doc.rect(M+LW, y, usableW-LW, 14, 'D');
    y += 16;

    // ── OFFICE USE ──
    doc.setFillColor(50,50,50); doc.rect(M, y, usableW, 7, 'F');
    doc.setTextColor(...WHITE); doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.text('FOR OFFICE USE ONLY', W/2, y+5, { align:'center' });
    doc.setTextColor(0,0,0); y += 7;
    twoRow('Name','','Persal','');
    lbl('Sign Off / Date', M, y, LW, 12);
    doc.rect(M+LW, y, usableW-LW, 12, 'D');
    y += 14;

    // Footer
    doc.setFontSize(7); doc.setTextColor(150,150,150);
    doc.text('eCCR Access Change Control Form  |  Version 5  |  Victoria Hospital EC', W/2, y+4, { align:'center' });

    PDFEngine.save(doc, `eCCR_Access_Request_${userData.surname}_${userData.name}.pdf`);
  }

  function renderExtraFields() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label>Request Type</label>
          <select id="eccr-req-type">
            <option value="Register">Register (new access)</option>
            <option value="Revise">Revise (change access)</option>
            <option value="Disable">Disable (remove access)</option>
          </select>
        </div>
        <div class="form-group">
          <label>eCCR Role</label>
          <select id="eccr-role">
            <option value="">— Select —</option>
            <option>Junior Clinician</option>
            <option>Senior Clinician</option>
            <option>Case Manager</option>
            <option>Ward Clerk</option>
            <option>Allied Health Worker</option>
            <option>Clinical Nurse Pract.</option>
            <option>External User</option>
            <option>Internal Auditor</option>
            <option>Administrator</option>
          </select>
        </div>
        <div class="form-group">
          <label>Start Date</label>
          <input type="date" id="eccr-start-date" />
        </div>
      </div>
    `;
    return div;
  }

  function getEmailLink(userData) {
    return EmailEngine.generateSupervisorMailtoLink({
      module:     'eccr',
      userData,
      itemLabel:  'eCCR',
      adminEmail: 'donovan.walker@westerncape.gov.za',
    });
  }

  ChecklistCore.register({
    id:          MODULE_ID,
    title:       'eCCR Access',
    shortTitle:  'eCCR',
    description: 'Electronic Clinical Care Records — access to patient clinical records at Victoria Hospital',
    icon:        '📋',
    generatePDF,
    renderExtraFields,
    getEmailLink,
  });
})();
