// core/email-engine.js — mailto: link generator

window.EmailEngine = {

  adminEmails: {
    it:       'it-helpdesk@westerncape.gov.za',
    nhls:     'nhls-admin@nhls.ac.za',
    emsIft:   'EMS.Evolution@westerncape.gov.za',
    eccr:     'donovan.walker@westerncape.gov.za',
    parking:  'Janine.Theunissen@westerncape.gov.za',
  },

  // Supervisor-directed email for NHLS, EMS, eCCR
  generateSupervisorMailtoLink(config) {
    const { module, userData, itemLabel, adminEmail } = config;

    const fullName     = [userData.title, userData.name, userData.secondName, userData.surname].filter(Boolean).join(' ');
    const firstName    = userData.name || '';
    const lastName     = userData.surname || '';
    const supervisorName = userData.supervisor || 'Supervisor';
    const toEmail      = userData.supervisorEmail || '';
    const ccEmail      = userData.email || '';

    const subject = encodeURIComponent(
      `New Request - ${itemLabel} Application - ${fullName}`
    );

    const disclaimer = `\n\n---\nThis email has been auto-generated and may contain errors. Please confirm that the information is correct before proceeding. Please ignore and delete this email if you are not the intended recipient or have received this email in error.`;

    const body = encodeURIComponent(
`Dear ${supervisorName}

I have applied for ${itemLabel} access. As my line supervisor, I need your final approval before submitting this application.

Please assist with document signatures should you approve my request.

Please email ${adminEmail} with the signed application once completed. I would appreciate being CC'd in this communication loop.

Thank you for your assistance. The document for signature is attached to this email.

Kind regards,
${firstName} ${lastName}${disclaimer}`
    );

    return `mailto:${toEmail}?cc=${encodeURIComponent(ccEmail)}&subject=${subject}&body=${body}`;
  },

  generateMailtoLink(config) {
    const { module, userData, formTitle, subjectTitle, bodyFormName, subjectPrefix } = config;
    const adminEmail      = this.adminEmails[module] || 'admin@westerncape.gov.za';
    const userEmail       = userData.email || '';
    const supervisorEmail = userData.supervisorEmail || '';

    const cc = [userEmail, supervisorEmail].filter(Boolean).join('; ');

    const prefix = subjectPrefix || 'New User Request -';
    const subject = encodeURIComponent(
      `${prefix} ${subjectTitle || formTitle} - ${userData.name} ${userData.surname}`
    );

    const fullName = [userData.name, userData.secondName, userData.surname]
      .filter(Boolean).join(' ');

    const formDesc = bodyFormName || formTitle;

    const supervisorLine = userData.supervisorEmail
      ? `- Line Supervisor: ${userData.supervisor || 'N/A'} (${userData.supervisorEmail})`
      : `- Line Supervisor: ${userData.supervisor || 'N/A'}`;

    const body = encodeURIComponent(
`Dear Administrator

Please find attached the completed ${formDesc} form for:

- Name: ${fullName}
- PERSAL Number: ${userData.persal || 'N/A'}
- Designation: ${userData.jobTitle || 'N/A'}
- MP Number: ${userData.mpNumber || 'N/A'}
- Mobile: ${userData.mobile || 'N/A'}
- Email: ${userData.email || 'N/A'}
${supervisorLine}

I would appreciate your assistance with creating this account.
The completed PDF form is attached to this email.

Kind regards,
${fullName}`
    );

    return `mailto:${adminEmail}?cc=${cc}&subject=${subject}&body=${body}`;
  },

  openMailtoLinks(links) {
    links.forEach(link => {
      const a = document.createElement('a');
      a.href = link;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  },

};
