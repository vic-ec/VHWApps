// core/checklist-core.js — Module registry and checklist renderer
// Supports both PDF-generating modules and redirect-only modules

window.ChecklistCore = (() => {
  const modules = [];

  return {
    register(moduleConfig) {
      modules.push(moduleConfig);
    },

    getModules() {
      return modules;
    },

    render(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      modules.forEach(mod => {
        const item = document.createElement('div');
        item.className = 'checklist-item';
        item.id = `checklist-item-${mod.id}`;

        // Build badges based on module capabilities
        let badges = '';
        if (mod.isRedirect) {
          badges = `<span class="redirect-badge">↗ External Portal</span>`;
        } else {
          if (mod.generatePDF) badges += `<span class="pdf-badge">⬇ Generates PDF</span>`;
          if (mod.getEmailLink) badges += `<span class="email-badge">✉ Opens Email</span>`;
        }

        // Support either a Unicode emoji (icon) or a custom image (iconImg base64)
        const iconHtml = mod.iconImg
          ? `<img src="data:image/png;base64,${mod.iconImg}" class="checklist-item-icon-img" alt="${mod.title}" />`
          : `<div class="checklist-item-icon">${mod.icon}</div>`;

        item.innerHTML = `
          <div class="checklist-item-header">
            <div class="checklist-item-info">
              ${iconHtml}
              <div class="checklist-item-text">
                <div class="checklist-item-title">${mod.title} ${badges}</div>
                <div class="checklist-item-desc">${mod.description}</div>
              </div>
            </div>
            <div class="checklist-item-controls">
              <label class="radio-option has-account">
                <input type="radio" name="account-${mod.id}" value="yes" />
                <span class="radio-label"><span class="radio-check">✓</span> I have an account</span>
              </label>
              <label class="radio-option no-account">
                <input type="radio" name="account-${mod.id}" value="no" />
                <span class="radio-label"><span class="radio-x">✗</span> I don't have one</span>
              </label>
            </div>
          </div>
          <div class="checklist-item-status" id="status-${mod.id}"></div>
        `;
        container.appendChild(item);

        item.querySelectorAll('input[type=radio]').forEach(radio => {
          radio.addEventListener('change', (e) => {
            this.handleSelection(mod.id, e.target.value);
          });
        });
      });
    },

    handleSelection(moduleId, value) {
      const item = document.getElementById(`checklist-item-${moduleId}`);
      const status = document.getElementById(`status-${moduleId}`);
      const mod = modules.find(m => m.id === moduleId);

      item.classList.remove('status-yes', 'status-no');

      if (value === 'yes') {
        item.classList.add('status-yes');
        status.innerHTML = `<div class="status-badge ok">Account confirmed ✓</div>`;
      } else {
        item.classList.add('status-no');
        if (mod.isRedirect) {
          status.innerHTML = `
            <div class="redirect-inline">
              ${mod.redirectWarning ? `<p class="redirect-warning">${mod.redirectWarning}</p>` : ''}
              <p class="redirect-note">${mod.redirectNote}</p>
              <a href="${mod.redirectUrl}" target="_blank" rel="noopener" class="btn-redirect">
                ${mod.redirectLabel}
              </a>
            </div>`;
        } else {
          status.innerHTML = `<div class="status-badge needed">Account required — go to Step 2 below</div>`;
        }
      }

      this.updateActionPanel();
      this.updateCaptureButton();
    },

    getSelections() {
      return modules.map(mod => {
        const selected = document.querySelector(`input[name="account-${mod.id}"]:checked`);
        return {
          module: mod,
          answered: !!selected,
          needsAccount: selected && selected.value === 'no',
        };
      });
    },

    // Only PDF modules (non-redirect) that need accounts
    getPDFModulesNeeded() {
      return this.getSelections().filter(s => s.needsAccount && !s.module.isRedirect);
    },

    // Save all current form field values before a re-render
    _saveFormState() {
      const state = {};
      document.querySelectorAll('#action-panel input, #action-panel select, #action-panel textarea')
        .forEach(el => { if (el.id) state[el.id] = el.value; });
      return state;
    },

    // Restore saved field values after a re-render
    _restoreFormState(state) {
      Object.entries(state).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) {
          el.value = value;
          // Re-trigger supervisor autocomplete if the supervisor field was saved
        if (id === 'f-supervisor' && value) this.onSupervisorChange(value);
        }
      });
    },

    updateActionPanel() {
      // Snapshot existing field values before wiping the panel
      const savedState = this._saveFormState();

      const selections     = this.getSelections();
      const allAnswered    = selections.every(s => s.answered);
      const pdfNeeded      = selections.filter(s => s.needsAccount && !s.module.isRedirect);
      const redirectNeeded = selections.filter(s => s.needsAccount && s.module.isRedirect);
      const panel          = document.getElementById('action-panel');
      if (!panel) return;

      if (!allAnswered) {
        panel.innerHTML = `<div class="panel-hint">Please answer all items above to continue.</div>`;
        return;
      }

      if (pdfNeeded.length === 0 && redirectNeeded.length === 0) {
        panel.innerHTML = `
          <div class="panel-all-good">
            <div class="all-good-icon">✓</div>
            <div class="all-good-text">
              <strong>All accounts confirmed.</strong>
              <p>No action required. You're fully set up for the Emergency Centre.</p>
            </div>
          </div>`;
        return;
      }

      if (pdfNeeded.length === 0 && redirectNeeded.length > 0) {
        panel.innerHTML = `
          <div class="panel-redirect-only">
            <div class="redirect-only-icon">↗</div>
            <div class="redirect-only-text">
              <strong>External portals opened above.</strong>
              <p>Complete your ${redirectNeeded.map(s => s.module.shortTitle).join(' and ')} request(s) using the links shown under each item above.</p>
            </div>
          </div>`;
        return;
      }

      // PDF modules needed — show full form
      const pdfList = pdfNeeded.map(s =>
        `<span class="needed-tag">${s.module.icon} ${s.module.shortTitle}</span>`
      ).join('');

      const redirectReminder = redirectNeeded.length > 0
        ? `<div class="redirect-reminder">
            <span>↗</span>
            <span>Also complete your <strong>${redirectNeeded.map(s => s.module.shortTitle).join(', ')}</strong> request(s) via the external links above.</span>
           </div>`
        : '';

      panel.innerHTML = `
        <div class="panel-action">
          <div class="panel-action-header">
            <strong>${pdfNeeded.length} item${pdfNeeded.length > 1 ? 's' : ''} to generate: </strong>${pdfList}
            ${redirectReminder}
          </div>
          <div class="panel-form-wrapper">
            <div class="form-section-header">Essential Details — All Items</div>
            <div class="shared-form" id="shared-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Title</label>
                  <select id="f-title">
                    <option value="">— Select —</option>
                    <option>Dr</option><option>Prof</option><option>Sr</option>
                    <option>Mr</option><option>Ms</option><option>Mrs</option>
                  </select>
                </div>
                <div class="form-group"></div>
              </div>
              <div class="form-row">
                <div class="form-group full-width">
                  <label>First Name *</label>
                  <input type="text" id="f-name" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group full-width">
                  <label>Surname *</label>
                  <input type="text" id="f-surname" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>PERSAL Number *</label>
                  <input type="text" id="f-persal" inputmode="numeric" pattern="[0-9]*" oninput="this.value=this.value.replace(/[^0-9]/g,'')" />
                </div>
                <div class="form-group">
                  <label>Registration Number (HPCSA / SANC / MP)</label>
                  <input type="text" id="f-mp" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Mobile Number *</label>
                  <input type="text" id="f-mobile" inputmode="numeric" maxlength="10" placeholder="0831234567" oninput="this.value=this.value.replace(/[^0-9]/g,'')" />
                </div>
                <div class="form-group">
                  <label>Email Address *</label>
                  <input type="email" id="f-email" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Job Title / Designation *</label>
                  <select id="f-jobtitle">
                    <option value="">— Select —</option>
                    <option value="Intern">Intern</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Medical Officer">Medical Officer</option>
                    <option value="Registrar">Registrar</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Hospital Department *</label>
                  <input type="text" id="f-department" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Line Supervisor *</label>
                  <select id="f-supervisor" onchange="ChecklistCore.onSupervisorChange(this.value)">
                    <option value="">— Select —</option>
                    <option value="Flip Cloete">Flip Cloete</option>
                    <option value="Sebastian De Haan">Sebastian De Haan</option>
                    <option value="Paul Xafis">Paul Xafis</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Supervisor Email *</label>
                  <input type="email" id="f-supervisor-email" />
                </div>
              </div>
              <div class="form-row" id="supervisor-other-fields" style="display:none;">
                <div class="form-group">
                  <label>Supervisor First Name *</label>
                  <input type="text" id="f-supervisor-first" />
                </div>
                <div class="form-group">
                  <label>Supervisor Surname *</label>
                  <input type="text" id="f-supervisor-surname" />
                </div>
              </div>
            </div>

            <div id="module-extra-fields"></div>
          </div>
        </div>`;

      // Render module-specific extra fields
      const extraContainer = document.getElementById('module-extra-fields');
      pdfNeeded.forEach(s => {
        if (s.module.renderExtraFields) {
          const wrapper = document.createElement('div');
          wrapper.className = 'module-extra-section';
          wrapper.innerHTML = `<div class="form-section-header" style="margin-top:18px;">${s.module.icon} ${s.module.title} — Additional Details Required</div>`;
          const fields = s.module.renderExtraFields();
          if (fields) wrapper.appendChild(fields);
          extraContainer.appendChild(wrapper);
        }
      });

      // Restore any previously entered field values
      this._restoreFormState(savedState);
    },

    collectUserData() {
      return {
        title:           document.getElementById('f-title')?.value?.trim() || '',
        name:            document.getElementById('f-name')?.value?.trim() || '',
        secondName:      '',
        surname:         document.getElementById('f-surname')?.value?.trim() || '',
        persal:          document.getElementById('f-persal')?.value?.trim() || '',
        mpNumber:        document.getElementById('f-mp')?.value?.trim() || '',
        mobile:          document.getElementById('f-mobile')?.value?.trim() || '',
        email:           document.getElementById('f-email')?.value?.trim() || '',
        supervisor:      (() => {
          const val = document.getElementById('f-supervisor')?.value?.trim() || '';
          if (val === 'Other') {
            const first   = document.getElementById('f-supervisor-first')?.value?.trim() || '';
            const surname = document.getElementById('f-supervisor-surname')?.value?.trim() || '';
            return [first, surname].filter(Boolean).join(' ') || 'Other';
          }
          return val;
        })(),
        supervisorEmail: document.getElementById('f-supervisor-email')?.value?.trim() || '',
        jobTitle:        document.getElementById('f-jobtitle')?.value?.trim() || '',
        department:      document.getElementById('f-department')?.value?.trim() || '',
      };
    },

    validateForm() {
      const d = this.collectUserData();
      const labelMap = {
        name: 'First Name', surname: 'Surname', persal: 'PERSAL Number',
        mobile: 'Mobile Number', email: 'Email Address',
        supervisor: 'Line Supervisor', supervisorEmail: 'Supervisor Email',
        jobTitle: 'Job Title', department: 'Hospital Department'
      };
      const missing = Object.keys(labelMap).filter(k => !d[k]);
      if (missing.length > 0) {
        alert(`Please fill in all required fields:\n• ${missing.map(k => labelMap[k]).join('\n• ')}`);
        return null;
      }
      // Mobile: exactly 10 digits
      if (!/^\d{10}$/.test(d.mobile)) {
        alert('Mobile Number must be exactly 10 digits (numbers only).');
        return null;
      }
      // Email: must contain @ and .
      if (!d.email.includes('@') || !d.email.includes('.')) {
        alert('Please enter a valid Email Address (must include @ and .).');
        return null;
      }
      // Supervisor email: must contain @ and .
      if (!d.supervisorEmail.includes('@') || !d.supervisorEmail.includes('.')) {
        alert('Please enter a valid Supervisor Email (must include @ and .).');
        return null;
      }
      // If Other selected, also check first/surname fields directly
      const supVal = document.getElementById('f-supervisor')?.value;
      if (supVal === 'Other') {
        const first   = document.getElementById('f-supervisor-first')?.value?.trim();
        const surname = document.getElementById('f-supervisor-surname')?.value?.trim();
        if (!first || !surname) {
          alert('Please fill in the supervisor first name and surname.');
          return null;
        }
      }
      return d;
    },

    // Download PDF for a specific module by id
    downloadPDF(moduleId) {
      const userData = this.validateForm();
      if (!userData) return;
      const s = this.getPDFModulesNeeded().find(s => s.module.id === moduleId);
      if (s && s.module.generatePDF) s.module.generatePDF(userData);
    },

    // Open the mailto draft for a specific module
    openModuleEmail(moduleId) {
      const userData = this.validateForm();
      if (!userData) return;
      const s = this.getPDFModulesNeeded().find(s => s.module.id === moduleId);
      if (!s || !s.module.getEmailLink) return;
      const link = s.module.getEmailLink(userData);
      const a = document.createElement('a');
      a.href = link;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },

    onSupervisorChange(value) {
      const emailMap = {
        'Flip Cloete':       'philip.cloete@westerncape.gov.za',
        'Sebastian De Haan': 'sebastian.dehaan@westerncape.gov.za',
        'Paul Xafis':        'paul.xafis@westerncape.gov.za',
      };
      const emailField  = document.getElementById('f-supervisor-email');
      const otherFields = document.getElementById('supervisor-other-fields');
      if (!emailField) return;
      if (emailMap[value]) {
        emailField.value = emailMap[value];
        emailField.readOnly = true;
        emailField.style.background = 'var(--surface-2)';
        emailField.style.color = 'var(--text-muted)';
        if (otherFields) otherFields.style.display = 'none';
      } else if (value === 'Other') {
        emailField.value = '';
        emailField.readOnly = false;
        emailField.style.background = '';
        emailField.style.color = '';
        if (otherFields) otherFields.style.display = '';
      } else {
        emailField.value = '';
        emailField.readOnly = false;
        emailField.style.background = '';
        emailField.style.color = '';
        if (otherFields) otherFields.style.display = 'none';
      }
    },

    updateCaptureButton() {
      const btn = document.getElementById('btn-capture-step2');
      const allGoodBox = document.getElementById('all-good-checklist');
      if (!btn) return;
      const selections = this.getSelections();
      const allAnswered  = selections.every(s => s.answered);
      const allGood      = allAnswered && selections.every(s => !s.needsAccount);
      // Only non-redirect modules that need action (PDF or email)
      const actionNeeded = allAnswered && selections.some(s => s.needsAccount && !s.module.isRedirect);

      if (allGood) {
        btn.style.display = 'none';
        if (allGoodBox) allGoodBox.style.display = '';
      } else if (allAnswered) {
        btn.style.display = '';
        if (allGoodBox) allGoodBox.style.display = 'none';
      } else {
        btn.style.display = 'none';
        if (allGoodBox) allGoodBox.style.display = 'none';
      }

      // Step 3 button: controlled by revealStep2 — never show it here
      // (it only appears after Step 2 is opened AND fields are completed)
    },

    revealStep2() {
      const selections = this.getSelections();
      const unanswered = selections.filter(s => !s.answered);
      if (unanswered.length > 0) {
        alert(`Please answer all checklist items before continuing.\n\n${unanswered.length} item${unanswered.length > 1 ? 's' : ''} still need${unanswered.length === 1 ? 's' : ''} a response.`);
        return;
      }
      const card = document.getElementById('step2-card');
      if (card) {
        card.style.display = 'block';
        setTimeout(() => { const top = card.getBoundingClientRect().top + window.scrollY - 72; window.scrollTo({ top, behavior: 'smooth' }); }, 50);
      }
      // Show Step 3 button only if there are PDF/email modules needing action
      const actionNeeded = selections.some(s => s.needsAccount && !s.module.isRedirect);
      const btnStep3 = document.getElementById('btn-step3');
      if (btnStep3) btnStep3.style.display = actionNeeded ? '' : 'none';
      // Hide step3 card in case user went back
      const step3card = document.getElementById('step3-card');
      if (step3card) step3card.style.display = 'none';
    },

    revealStep3() {
      // Validate all required fields before revealing step 3
      const userData = this.validateForm();
      if (!userData) return;
      // Render action buttons into step 3 now that we have valid data
      const actionContainer = document.getElementById('step3-action-buttons');
      if (actionContainer) {
        const pdfNeeded = this.getPDFModulesNeeded();
        actionContainer.innerHTML = '';
        pdfNeeded.forEach(s => {
          const iconLabel = s.module.iconImg
            ? `<img src="data:image/png;base64,${s.module.iconImg}" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;border-radius:3px;" /> ${s.module.shortTitle}`
            : `${s.module.icon} ${s.module.shortTitle}`;
          const rowDiv = document.createElement('div');
          rowDiv.className = 'module-action-row';
          rowDiv.style.flexDirection = 'column';
          rowDiv.style.alignItems = 'flex-start';

          const topRow = document.createElement('div');
          topRow.style.cssText = 'display:flex;gap:8px;width:100%;align-items:center;';
          topRow.innerHTML = `
            <span class="module-action-label">${iconLabel}</span>
            <div class="module-action-btns" id="btns-${s.module.id}" style="flex:1;">
              ${s.module.generatePDF ? `<button class="btn-generate" onclick="ChecklistCore.downloadPDF('${s.module.id}')">⬇ Download PDF</button>` : ''}
              ${s.module.getEmailLink ? `<button class="btn-email" onclick="ChecklistCore.openModuleEmail('${s.module.id}')">✉ Open Email</button>` : ''}
            </div>`;
          rowDiv.appendChild(topRow);

          // Post-email actions: render in a second row with same label spacer + btns container
          if (s.module.renderPostEmailActions) {
            const extraRow = document.createElement('div');
            extraRow.style.cssText = 'display:flex;gap:8px;width:100%;align-items:center;margin-top:8px;';
            const spacer = document.createElement('span');
            spacer.className = 'module-action-label';
            spacer.style.visibility = 'hidden';
            spacer.textContent = '\u00a0';
            const btnsWrap = document.createElement('div');
            btnsWrap.style.cssText = 'flex:1;display:flex;';
            btnsWrap.appendChild(s.module.renderPostEmailActions());
            extraRow.appendChild(spacer);
            extraRow.appendChild(btnsWrap);
            rowDiv.appendChild(extraRow);
          }
          actionContainer.appendChild(rowDiv);
        });
      }
      const card = document.getElementById('step3-card');
      if (card) {
        card.style.display = 'block';
        setTimeout(() => { const top = card.getBoundingClientRect().top + window.scrollY - 72; window.scrollTo({ top, behavior: 'smooth' }); }, 50);
      }
    },

    openEmailLinks() {}, // kept for compatibility

    clearForm() {
      if (!confirm('Clear all selections and form data?')) return;
      document.querySelectorAll('input[type=radio]').forEach(r => r.checked = false);
      document.querySelectorAll('.checklist-item').forEach(el => {
        el.classList.remove('status-yes', 'status-no');
      });
      document.querySelectorAll('[id^="status-"]').forEach(el => el.innerHTML = '');
      const panel = document.getElementById('action-panel');
      if (panel) panel.innerHTML = `<div class="panel-hint">Please answer all items above to continue.</div>`;
      // Hide Steps 2 and 3, capture button, and all-good box
      const step2 = document.getElementById('step2-card');
      if (step2) step2.style.display = 'none';
      const step3 = document.getElementById('step3-card');
      if (step3) step3.style.display = 'none';
      const btn = document.getElementById('btn-capture-step2');
      if (btn) btn.style.display = 'none';
      const allGood = document.getElementById('all-good-checklist');
      if (allGood) allGood.style.display = 'none';
      const btnStep3 = document.getElementById('btn-step3');
      if (btnStep3) btnStep3.style.display = 'none';
    }
  };
})();
