// modules/nhls-account.js — NHLS Web Results / Requesting Doctor Application Form v8.4
// Clean rewrite: all dimensions defined as constants, single row() helper draws label+value as one unit

(function () {
  const MODULE_ID = 'nhls';

  function generatePDF(userData) {
    const doc  = PDFEngine.newDoc();
    const W    = 210;
    const M    = 20;
    const UW   = W - M * 2;

    // Dimension constants
    const LH  = 4;        // label header height
    const VH  = 7;        // value row height
    const RH  = LH + VH; // combined = 11mm
    const CBH = 10;       // checkbox row height
    const SH  = 6;        // section header height

    // Colours
    const GRN = [166, 206, 57];
    const LBG = [235, 245, 210];
    const WHT = [255, 255, 255];
    const BLK = [0, 0, 0];

    // Font sizes
    const FS_LBL = 6.5;
    const FS_VAL = 7.5;

    // Data
    const title        = userData.title || '';
    const secondName   = userData.secondName || '';
    const idNumber     = document.getElementById('nhls-id')?.value?.trim() || '';
    const officePhone  = document.getElementById('nhls-office-phone')?.value?.trim() || '';
    const isRegistered = document.getElementById('nhls-registered')?.value || 'Yes';
    const regNumber    = userData.mpNumber || '';
    const employer     = document.getElementById('nhls-employer')?.value || 'Dept of Health';
    const hivAccess    = 'Yes';
    const isRequesting = 'Yes';
    const rankMap      = { Intern:'Intern', Nurse:'Nurse', 'Medical Officer':'Medical Officer', Registrar:'Registrar', Consultant:'Consultant' };
    const rank         = rankMap[userData.jobTitle] || userData.jobTitle || '';
    const todayDate    = new Date();
    const today        = String(todayDate.getDate()).padStart(2,'0') + '/' + String(todayDate.getMonth()+1).padStart(2,'0') + '/' + todayDate.getFullYear();
    const fullFirst    = [userData.name, secondName].filter(Boolean).join(' ');
    const primaryFac   = 'Victoria Hospital — Emergency Centre';
    const supParts     = (userData.supervisor || '').split(' ');
    const supSurname   = supParts.slice(-1)[0] || '';
    const supFirst     = supParts.slice(0, -1).join(' ') || userData.supervisor;

    // Draw helpers
    const box = (x, y, w, h, bg) => {
      doc.setDrawColor(160, 160, 160); doc.setLineWidth(0.3);
      if (bg) { doc.setFillColor(...bg); doc.rect(x, y, w, h, 'FD'); }
      else    { doc.rect(x, y, w, h, 'D'); }
    };

    const txt = (text, x, y, w, h, fs, bold, align, color) => {
      if (!text && text !== 0) return;
      fs    = fs    || FS_VAL;
      bold  = bold  || false;
      align = align || 'left';
      color = color || BLK;
      doc.setFontSize(fs);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const tx = align === 'center' ? x + w / 2 : x + 2;
      const ty = y + h / 2 + fs * 0.18;
      doc.text(String(text), tx, ty, { align: align, maxWidth: w - 4 });
      doc.setTextColor(...BLK);
    };

    const secHdr = (label, y, h, fs) => {
      h = h || SH; fs = fs || 7.5;
      box(M, y, UW, h, GRN);
      txt(label, M, y, UW, h, fs, true, 'center', WHT);
      return y + h;
    };

    // Combined label+value row: cols = [{label, w, value, fs}]
    const dataRow = (cols, y) => {
      let x = M;
      cols.forEach(function(col) {
        box(x, y,      col.w, LH, LBG); txt(col.label, x, y,      col.w, LH, FS_LBL, true);
        box(x, y + LH, col.w, VH);      txt(col.value || '', x, y + LH, col.w, VH, col.fs || FS_VAL);
        x += col.w;
      });
      return y + RH;
    };

    const drawCb = (checked, cx, cy) => {
      doc.setDrawColor(80, 80, 80); doc.setLineWidth(0.45);
      doc.rect(cx, cy, 4.5, 4.5, 'D');
      if (checked) {
        doc.setDrawColor(0, 110, 0); doc.setLineWidth(0.9);
        doc.line(cx+0.7, cy+2.2, cx+2, cy+3.8);
        doc.line(cx+2, cy+3.8, cx+4, cy+0.7);
      }
    };

    const cbLabel = (text, x, y, w) => {
      box(x, y, w, LH, LBG);
      txt(text, x, y, w, LH, FS_LBL, false, 'center');
    };

    const cbBox = (checked, x, y, w) => {
      box(x, y, w, CBH);
      drawCb(checked, x + w/2 - 2.25, y + (CBH - 4.5)/2);
    };

    // PAGE 1 ─────────────────────────────────────────────────────────────

    // Header
    doc.setFillColor(...WHT); doc.rect(0, 10, W, 22, 'F');
    if (window.LOGO_NHLS) { try { doc.addImage(window.LOGO_NHLS,'JPEG',M,13,55,16); } catch(e){} }
    doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(...BLK);
    doc.text('IT Helpdesk: ITHelpdesk1@nhls.ac.za', W/2, 21, {align:'center'});
    doc.text('Tel: 011 386 6125', W/2, 26, {align:'center'});
    if (window.LOGO_WCG) { try { doc.setFillColor(...WHT); doc.roundedRect(W-M-52,12,52,18,2,2,'F'); doc.addImage(window.LOGO_WCG,'PNG',W-M-51,13,50,16); } catch(e){} }

    // Title bar
    doc.setFillColor(...GRN); doc.rect(M, 35, UW, 9, 'F');
    doc.setTextColor(...WHT); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text('Web Results ACCESS / REQUESTING DOCTOR APPLICATION', W/2, 41, {align:'center'});
    doc.setTextColor(100,100,100); doc.setFontSize(6.5); doc.setFont('helvetica','normal');
    doc.text('Form v8.4  |  PLEASE SIGN TERMS AND CONDITIONS ON PAGE 2', W/2, 49, {align:'center'});
    doc.setTextColor(...BLK);

    // PLEASE PRINT CLEARLY
    let y = 52;
    box(M, y, UW, 5.5, LBG);
    doc.setFontSize(7.5); doc.setFont('helvetica','bold');
    doc.text('PLEASE PRINT CLEARLY and provide ALL information requested', W/2, y+3.7, {align:'center'});
    y += 5.5;

    // YOUR DETAILS
    y = secHdr('Your details', y);
    y = dataRow([{label:'Surname',w:UW*0.30,value:userData.surname},{label:'First Name',w:UW*0.47,value:fullFirst},{label:'Title',w:UW*0.23,value:title}], y);
    y = dataRow([{label:'Email Address',w:UW/2,value:userData.email},{label:'ID Number',w:UW/2,value:idNumber}], y);
    y = dataRow([{label:'Staff or Persal Number',w:UW/2,value:userData.persal},{label:'Position / Business Role',w:UW/2,value:userData.jobTitle}], y);
    y = dataRow([{label:'Office Tel Number',w:UW/2,value:officePhone},{label:'Mobile Number',w:UW/2,value:userData.mobile}], y);

    // REGULATORY REGISTRATION
    y = secHdr('Regulatory Professional Registration Information e.g. HPCSA or Nursing Council', y, SH, 6.5);
    box(M, y, UW/3, LH, LBG);      txt('Are you registered?', M, y, UW/3, LH, FS_LBL, true);
    box(M+UW/3, y, UW*2/3, LH, LBG); txt('Registration Number (MANDATORY if you are registered)', M+UW/3, y, UW*2/3, LH, FS_LBL, true);
    y += LH;
    box(M, y, UW/3, CBH);
    drawCb(isRegistered==='Yes', M+2, y+(CBH-4.5)/2);
    doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text('Yes', M+8.5, y+CBH/2+0.8);
    drawCb(isRegistered==='No', M+22, y+(CBH-4.5)/2);
    doc.text('No', M+28.5, y+CBH/2+0.8);
    box(M+UW/3, y, UW*2/3, CBH); txt(regNumber, M+UW/3, y, UW*2/3, CBH);
    y += CBH;

    // WEB RESULTS ACCESS
    y = secHdr('WEB RESULTS ACCESS to WWDISA and TrakCare Lab', y);
    box(M, y, UW, LH, LBG); txt('Who do you work for:', M, y, UW, LH, FS_LBL, true);
    y += LH;
    const employers = ['Dept of Health','NHLS','Correctional Services','SANDF','Private','Clinical Trials','Other'];
    const empW = UW / employers.length;
    let x = M;
    employers.forEach(function(emp) { cbLabel(emp, x, y, empW); x += empW; });
    y += LH; x = M;
    employers.forEach(function(emp) { cbBox(emp===employer, x, y, empW); x += empW; });
    y += CBH;

    // Facility + HIV
    box(M, y, UW-44, LH, LBG); txt('Please list each facility which you need access to', M, y, UW-44, LH, FS_LBL, true);
    box(M+UW-44, y, 44, LH, LBG); txt('Access to Confidential HIV Results', M+UW-44, y, 44, LH, 5.5, true);
    y += LH;
    box(M, y, UW-44, VH);
    txt(employer==='Dept of Health'||employer==='NHLS' ? 'Facility List Not Required for DOH or NHLS — Victoria Hospital EC' : primaryFac, M, y, UW-44, VH, 6.5);
    box(M+UW-44, y, 44, VH);
    drawCb(hivAccess==='Yes', M+UW-42, y+(VH-4.5)/2);
    doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text('Yes', M+UW-35, y+VH/2+0.8);
    drawCb(hivAccess==='No', M+UW-22, y+(VH-4.5)/2);
    doc.text('No', M+UW-15, y+VH/2+0.8);
    y += VH;

    // REQUESTING DOCTORS / SISTERS
    y = secHdr('REQUESTING DOCTORS / SISTERS', y);
    const reqW = UW/3;
    box(M,       y, reqW, LH, LBG); txt('Are you a requesting Doctor or Sister?',     M,       y, reqW, LH, FS_LBL, true);
    box(M+reqW,  y, reqW, LH, LBG); txt('BHF Practice Number (private practice only)', M+reqW,  y, reqW, LH, FS_LBL, true);
    box(M+reqW*2,y, reqW, LH, LBG); txt('Primary Facility Name',                       M+reqW*2,y, reqW, LH, FS_LBL, true);
    y += LH;
    box(M, y, reqW, CBH);
    drawCb(isRequesting==='Yes', M+2, y+(CBH-4.5)/2);
    doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text('Yes', M+8.5, y+CBH/2+0.8);
    drawCb(isRequesting==='No', M+24, y+(CBH-4.5)/2);
    doc.text('No', M+30.5, y+CBH/2+0.8);
    box(M+reqW,   y, reqW, CBH);
    box(M+reqW*2, y, reqW, CBH); txt(primaryFac, M+reqW*2, y, reqW, CBH, 6.5);
    y += CBH;

    box(M, y, UW, LH, LBG); txt('Primary Facility Address (MANDATORY for private practice only)', M, y, UW, LH, FS_LBL, true);
    y += LH;
    box(M, y, UW, VH); txt('171 Victoria Road, Wynberg, Cape Town, 7800 (DoH staff — N/A)', M, y, UW, VH, 6.5);
    y += VH;

    // Rank
    box(M, y, UW, LH, LBG); txt('Specify level or rank (for electronic gate keeping)', M, y, UW, LH, FS_LBL, true);
    y += LH;
    const ranks = ['Intern','Nurse','Medical Officer','Registrar','Consultant'];
    const rankW = UW / ranks.length;
    x = M;
    ranks.forEach(function(r) { cbLabel(r, x, y, rankW); x += rankW; });
    y += LH; x = M;
    ranks.forEach(function(r) { cbBox(r===rank, x, y, rankW); x += rankW; });
    y += CBH;

    // MEDICAL SUPERINTENDENT
    y = secHdr('TO BE COMPLETED BY MEDICAL SUPERINTENDENT OR PERSON GIVING AUTHORITY', y, 7, 7);
    y = dataRow([{label:'Surname',w:UW/3,value:supSurname},{label:'First Name',w:UW/3,value:supFirst},{label:'Business Role / Position',w:UW/3,value:'Authorising Manager'}], y);
    y = dataRow([{label:'Phone Number',w:UW/2,value:''},{label:'Email Address',w:UW/2,value:userData.supervisorEmail}], y);
    box(M, y, UW-40, LH, LBG); txt('Signature', M, y, UW-40, LH, FS_LBL, true);
    box(M+UW-40, y, 40, LH, LBG); txt('Date', M+UW-40, y, 40, LH, FS_LBL, true);
    y += LH;
    box(M, y, UW-40, 12);
    box(M+UW-40, y, 40, 12); txt(today, M+UW-40, y, 40, 12);
    y += 12;

    // NHLS INTERNAL USE ONLY
    y = secHdr('NHLS INTERNAL USE ONLY', y, 7, 8);
    box(M, y, UW/2, LH, LBG);       txt('Loaded By', M, y, UW/2, LH, FS_LBL, true);
    box(M+UW/2, y, UW/4, LH, LBG);  txt('Signature', M+UW/2, y, UW/4, LH, FS_LBL, true);
    box(M+UW*3/4, y, UW/4, LH, LBG);txt('Date', M+UW*3/4, y, UW/4, LH, FS_LBL, true);
    y += LH;
    box(M, y, UW/2, 10); box(M+UW/2, y, UW/4, 10); box(M+UW*3/4, y, UW/4, 10);
    y += 10;

    // PAGE 2 ─────────────────────────────────────────────────────────────
    doc.addPage();
    y = 20;
    y = secHdr('TERMS AND CONDITIONS — WEB RESULTS ACCESS', y, 10, 9);
    y += 5;
    doc.setFontSize(7); doc.setFont('helvetica','italic'); doc.setTextColor(...BLK);
    doc.text('To: All Web View and TrakCare Lab Users    |    13 November 2018', M, y);
    y += 8;

    const terms = [
      'These Terms and Conditions govern your use of the NHLS website (nhls.ac.za). By accessing and using the Website, you agree to be bound by these Terms and Conditions.',
      'The National Health Act requires that health care providers and establishments are responsible for personal information about their Patients and must ensure such information is effectively protected against improper disclosure at all times.',
      'The User who accesses any information on this Website concerning a Patient makes the following undertakings:',
      '• The protection and disclosure of all Personal and Confidential Information of the Patient is governed by the Constitution of the RSA (Act 108 of 1996), the National Health Act, the Promotion of Access to Information Act (Act 2 of 2000) and the Ethical Rules of the HPCSA.',
      '• Personal and Confidential Information of the Patient shall be used only for appropriate purposes for which it is being made available and may not be divulged to others without the prior written consent of the Patient and the head of the institution.',
      '• The User shall ensure that all representatives and employees to whom Personal and Confidential Information is provided shall be bound by these undertakings.',
      '• Personal and Confidential Information may be divulged only with the express written consent of the Patient; pursuant to a legal requirement or court order; where it is lawfully in the public domain; in the public interest; or with consent of a parent or guardian of a minor under the age of 12 years.',
    ];
    doc.setFont('helvetica','normal'); doc.setFontSize(8);
    terms.forEach(function(term) {
      const lines = doc.splitTextToSize(term, UW-4);
      doc.text(lines, M+2, y);
      y += lines.length * 5 + 3;
    });
    y += 8;

    // Acknowledgement box
    const ackText  = 'I acknowledge that I have read and understood the foregoing terms and conditions for access to wwDisa and TrakCare Lab Web Results';
    doc.setFontSize(8); doc.setFont('helvetica','bold');
    const ackLines = doc.splitTextToSize(ackText, UW-14);
    const ackH     = ackLines.length * 5.5 + 8;
    doc.setFillColor(240,245,255); doc.setDrawColor(0,70,130); doc.setLineWidth(0.5);
    doc.rect(M, y, UW, ackH, 'FD');
    doc.setTextColor(0,40,100);
    ackLines.forEach(function(line, i) { doc.text(line, W/2, y+5.5+i*5.5, {align:'center'}); });
    doc.setTextColor(...BLK);
    y += ackH + 10;

    box(M, y, UW, LH, LBG); txt('Applicant Name', M, y, UW, LH, FS_LBL, true);
    y += LH;
    box(M, y, UW, 9); txt(fullFirst+' '+userData.surname, M, y, UW, 9);
    y += 9 + 4;
    box(M, y, UW-40, LH, LBG); txt('Signature', M, y, UW-40, LH, FS_LBL, true);
    box(M+UW-40, y, 40, LH, LBG); txt('Date', M+UW-40, y, 40, LH, FS_LBL, true);
    y += LH;
    box(M, y, UW-40, 16);
    box(M+UW-40, y, 40, 16); txt(today, M+UW-40, y, 40, 16);

    doc.setPage(1); doc.setFontSize(7); doc.setTextColor(160,160,160);
    doc.text('1', W/2, 290, {align:'center'});
    doc.setPage(2); doc.setFontSize(7); doc.setTextColor(160,160,160);
    doc.text('2', W/2, 290, {align:'center'});

    PDFEngine.save(doc, 'NHLS_WebResults_Application_'+userData.surname+'_'+userData.name+'.pdf');
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
      module: 'nhls', userData, itemLabel: 'NHLS Web Results', adminEmail: 'nhls-admin@nhls.ac.za',
    });
  }

  ChecklistCore.register({
    id: MODULE_ID, title: 'NHLS Web Results', shortTitle: 'NHLS',
    description: 'National Health Laboratory Service — WWDISA & TrakCare Lab web results access for requesting clinicians',
    icon: '🔬', generatePDF, renderExtraFields, getEmailLink
  });
})();
