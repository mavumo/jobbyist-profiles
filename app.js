// Jobbyist Profile Builder – app.js
// Global state objects (in-memory)
window.user = window.user || { isPro: false, trialStart: null };
window.resumeData = window.resumeData || {};
window.sites = window.sites || {};

const VIEWS = {
  landing: document.getElementById('landing-page'),
  builder: document.getElementById('builder-page'),
  preview: document.getElementById('preview-page'),
  payment: document.getElementById('payment-page'),
  success: document.getElementById('success-page'),
  profile: document.getElementById('profile-page')
};

// Utility to hide / show views
function showView(key) {
  Object.values(VIEWS).forEach(v => {
    if (v) v.classList.add('hidden');
  });
  if (VIEWS[key]) {
    VIEWS[key].classList.remove('hidden');
  }
}

// Router
function router() {
  const hash = window.location.hash || '#/';

  // Public site route => #/sites/slug
  if (hash.startsWith('#/sites/')) {
    const slug = hash.split('/')[2];
    renderPublicProfile(slug);
    showView('profile');
    return;
  }

  switch (hash) {
    case '#/':
    case '#':
    case '':
      showView('landing');
      break;
    case '#/builder':
      initializeBuilder();
      showView('builder');
      break;
    case '#/preview':
      renderPreview();
      showView('preview');
      break;
    case '#/payment':
      showView('payment');
      break;
    case '#/success':
      showView('success');
      break;
    default:
      // fallback
      showView('landing');
  }
}

function initializeBuilder() {
  currentStep = 0;
  renderStep(currentStep);
  updateSidebarActive(currentStep);
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Set up initial view
  router();
  
  // Set up navigation listeners immediately
  setupNavigationListeners();
  
  // Handle hash changes
  window.addEventListener('hashchange', router);
});

function setupNavigationListeners() {
  // LANDING PAGE BUTTONS
  const getStartedBtn = document.getElementById('get-started-pro');
  const tryFreeBtn = document.getElementById('try-free');

  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Get Started Pro clicked');
      window.user.isPro = true;
      window.location.hash = '#/builder';
    });
  }

  if (tryFreeBtn) {
    tryFreeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Try Free clicked');
      window.user.trialStart = Date.now();
      window.user.isPro = false;
      window.location.hash = '#/builder';
    });
  }

  // NAVIGATION BUTTONS
  const backToLandingBtn = document.getElementById('back-to-landing');
  if (backToLandingBtn) {
    backToLandingBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.hash = '#/';
    });
  }

  const backToBuilderBtn = document.getElementById('back-to-builder');
  if (backToBuilderBtn) {
    backToBuilderBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.hash = '#/builder';
    });
  }

  // PUBLISH BUTTON
  const publishBtn = document.getElementById('publish-profile');
  if (publishBtn) {
    publishBtn.addEventListener('click', publishProfile);
  }

  // SIDEBAR NAVIGATION
  const sidebar = document.querySelector('.builder-steps');
  if (sidebar) {
    sidebar.addEventListener('click', function(e) {
      const stepEl = e.target.closest('.step');
      if (!stepEl) return;
      e.preventDefault();
      const idx = Number(stepEl.getAttribute('data-step'));
      currentStep = idx;
      renderStep(idx);
      updateSidebarActive(idx);
    });
  }

  // SUCCESS PAGE BUTTONS
  const copyBtn = document.getElementById('copy-url');
  if (copyBtn) {
    copyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const url = document.getElementById('profile-url').textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          copyBtn.innerHTML = 'Copied!';
          setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy', 2000);
        });
      } else {
        copyBtn.innerHTML = 'Copied!';
        setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy', 2000);
      }
    });
  }

  const createAnotherBtn = document.getElementById('create-another');
  if (createAnotherBtn) {
    createAnotherBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // reset state
      window.resumeData = {};
      window.user.isPro = false;
      window.user.trialStart = null;
      window.location.hash = '#/';
    });
  }

  // PAYMENT FORM
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const submitBtn = paymentForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
      }
      setTimeout(() => {
        window.user.isPro = true;
        publishProfile();
      }, 1000);
    });
  }
}

// BUILDER STATE & FUNCTIONS
let currentStep = 0;

function updateSidebarActive(idx) {
  document.querySelectorAll('.builder-steps .step').forEach(step => {
    step.classList.toggle('active', Number(step.getAttribute('data-step')) === idx);
  });
}

function saveResume(partial) {
  window.resumeData = {
    ...window.resumeData,
    ...partial
  };
}

function renderStep(idx) {
  const stepContentEl = document.getElementById('step-content');
  if (!stepContentEl) return;
  
  switch (idx) {
    case 0:
      renderUploadStep();
      break;
    case 1:
      renderPersonalInfoStep();
      break;
    case 2:
      renderExperienceStep();
      break;
    case 3:
      renderSkillsStep();
      break;
    case 4:
      renderPreviewStep();
      break;
    default:
      stepContentEl.innerHTML = '<p>Step not found</p>';
  }
}

// STEP 0 – Upload Resume
function renderUploadStep() {
  const stepContentEl = document.getElementById('step-content');
  stepContentEl.innerHTML = `
    <div class="card">
      <div class="card__body">
        <h2>Upload Your Resume</h2>
        <div class="dropzone" id="dropzone">
          <i class="fas fa-file-upload"></i>
          <p>Drag & drop your resume PDF here, or click to select file.</p>
          <input type="file" id="file-input" accept="application/pdf,text/plain" class="hidden" />
        </div>
        <p class="mt-8" id="file-name-display"></p>
        <button class="btn btn--primary mt-8" id="to-personal-info" disabled>Next: Personal Info</button>
      </div>
    </div>`;

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const fileNameDisplay = document.getElementById('file-name-display');
  const nextBtn = document.getElementById('to-personal-info');

  function handleFiles(files) {
    if (!files || !files.length) return;
    const file = files[0];
    fileNameDisplay.textContent = `Uploaded: ${file.name}`;
    nextBtn.disabled = false;

    // Simulate resume parsing using file name:
    const parsed = parseResume(file.name);
    saveResume(parsed);
  }

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  nextBtn.addEventListener('click', () => {
    currentStep = 1;
    renderStep(1);
    updateSidebarActive(1);
  });
}

// STEP 1 – Personal Info
function renderPersonalInfoStep() {
  const data = window.resumeData;
  const stepContentEl = document.getElementById('step-content');
  stepContentEl.innerHTML = `
    <div class="card">
      <div class="card__body">
        <h2>Personal Information</h2>
        <form id="personal-form" class="flex flex-col gap-16">
          <div class="form-group">
            <label class="form-label" for="name">Full Name</label>
            <input id="name" class="form-control" required value="${data.name || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="headline">Headline</label>
            <input id="headline" class="form-control" placeholder="e.g., Full-Stack Developer" value="${data.headline || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="summary">Summary</label>
            <textarea id="summary" class="form-control" rows="4">${data.summary || ''}</textarea>
          </div>
          <div class="flex gap-8">
            <button type="button" class="btn btn--outline" id="back-upload">Back</button>
            <button type="submit" class="btn btn--primary">Next: Experience</button>
          </div>
        </form>
      </div>
    </div>`;

  const form = document.getElementById('personal-form');
  document.getElementById('back-upload').addEventListener('click', () => {
    currentStep = 0;
    renderStep(0);
    updateSidebarActive(0);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#name').value.trim();
    const headline = form.querySelector('#headline').value.trim();
    const summary = form.querySelector('#summary').value.trim();

    saveResume({ name, headline, summary });
    currentStep = 2;
    renderStep(2);
    updateSidebarActive(2);
  });
}

// STEP 2 – Experience
function renderExperienceStep() {
  const data = window.resumeData;
  const expText = (data.experience || []).map(exp => `${exp.role} at ${exp.company} (${exp.start} – ${exp.end}) -> ${exp.desc}`).join('\n');
  const stepContentEl = document.getElementById('step-content');
  stepContentEl.innerHTML = `
    <div class="card">
      <div class="card__body">
        <h2>Work Experience</h2>
        <form id="experience-form" class="flex flex-col gap-16">
          <div class="form-group">
            <label class="form-label" for="experience">Experience (one per line)</label>
            <textarea id="experience" class="form-control" rows="8" placeholder="Senior Developer at FinServe (2022-01 – Present) -> Lead MERN stack projects">${expText}</textarea>
          </div>
          <div class="flex gap-8">
            <button type="button" class="btn btn--outline" id="back-personal">Back</button>
            <button type="submit" class="btn btn--primary">Next: Skills</button>
          </div>
        </form>
      </div>
    </div>`;

  const form = document.getElementById('experience-form');
  document.getElementById('back-personal').addEventListener('click', () => {
    currentStep = 1;
    renderStep(1);
    updateSidebarActive(1);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const lines = form.querySelector('#experience').value.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const experience = lines.map(line => {
      const roleCompanyMatch = line.match(/^(.*?) at (.*?) \((.*?) – (.*?)\) -> (.*)$/);
      if (roleCompanyMatch) {
        const [, role, company, start, end, desc] = roleCompanyMatch;
        return { role, company, start, end, desc };
      }
      return { role: line, company: '', start: '', end: '', desc: '' };
    });
    saveResume({ experience });
    currentStep = 3;
    renderStep(3);
    updateSidebarActive(3);
  });
}

// STEP 3 – Skills
function renderSkillsStep() {
  const data = window.resumeData;
  const stepContentEl = document.getElementById('step-content');
  stepContentEl.innerHTML = `
    <div class="card">
      <div class="card__body">
        <h2>Skills</h2>
        <form id="skills-form" class="flex flex-col gap-16">
          <div class="form-group">
            <label class="form-label" for="skills">Skills (comma separated)</label>
            <input id="skills" class="form-control" placeholder="JavaScript, Node.js, React" value="${(data.skills || []).join(', ')}" />
          </div>
          <div class="flex gap-8">
            <button type="button" class="btn btn--outline" id="back-experience">Back</button>
            <button type="submit" class="btn btn--primary">Next: Preview</button>
          </div>
        </form>
      </div>
    </div>`;

  const form = document.getElementById('skills-form');
  document.getElementById('back-experience').addEventListener('click', () => {
    currentStep = 2;
    renderStep(2);
    updateSidebarActive(2);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const skills = form.querySelector('#skills').value.split(',').map(s => s.trim()).filter(Boolean);
    saveResume({ skills });
    currentStep = 4;
    renderStep(4);
    updateSidebarActive(4);
  });
}

// STEP 4 – Preview inside Builder
function renderPreviewStep() {
  const stepContentEl = document.getElementById('step-content');
  stepContentEl.innerHTML = `
    <div class="card">
      <div class="card__body">
        <h2>Preview</h2>
        <div id="inner-preview"></div>
        <div class="flex gap-8 mt-8">
          <button class="btn btn--outline" id="back-skills">Back</button>
          <button class="btn btn--primary" id="go-preview-page">Full Screen Preview</button>
        </div>
      </div>
    </div>`;

  renderProfileInto('inner-preview', window.resumeData);

  document.getElementById('back-skills').addEventListener('click', () => {
    currentStep = 3;
    renderStep(3);
    updateSidebarActive(3);
  });

  document.getElementById('go-preview-page').addEventListener('click', () => {
    window.location.hash = '#/preview';
  });
}

// PREVIEW PAGE RENDER
function renderPreview() {
  const previewContainer = document.getElementById('profile-preview');
  if (previewContainer) {
    renderProfileInto('profile-preview', window.resumeData);
  }
}

// RENDER PROFILE INTO CONTAINER
function renderProfileInto(containerId, data) {
  const el = document.getElementById(containerId);
  if (!el) return;
  
  if (!data || !data.name) {
    el.innerHTML = '<p>Please complete your information to see a preview.</p>';
    return;
  }
  el.innerHTML = `
    <div class="public-profile-wrapper">
      <div class="profile-header">
        <h1>${data.name}</h1>
        <h2>${data.headline || ''}</h2>
      </div>
      <div class="profile-body">
        <div class="profile-left">
          <h3>Summary</h3>
          <p>${data.summary || ''}</p>
          <h3>Skills</h3>
          <p>${(data.skills || []).join(', ')}</p>
        </div>
        <div class="profile-right">
          <h3>Experience</h3>
          ${(data.experience || []).map(exp => `
            <div class="timeline-item">
              <h3>${exp.role} – ${exp.company}</h3>
              <span>${exp.start} – ${exp.end}</span>
              <p>${exp.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
}

function withinTrial() {
  if (!window.user.trialStart) return false;
  const diff = Date.now() - window.user.trialStart;
  return diff <= 3 * 24 * 60 * 60 * 1000; // 3 days
}

function publishProfile() {
  // Validate minimal data
  if (!window.resumeData.name) {
    alert('Please provide your name before publishing.');
    return;
  }

  // Check payment requirement
  if (!window.user.isPro && !withinTrial()) {
    window.location.hash = '#/payment';
    return;
  }

  // Generate slug and save site
  const slug = slugify(window.resumeData.name);
  window.sites[slug] = JSON.parse(JSON.stringify(window.resumeData));
  window.publishedSlug = slug;

  // Show success page
  const profileUrlEl = document.getElementById('profile-url');
  const viewProfileEl = document.getElementById('view-profile');
  
  if (profileUrlEl) profileUrlEl.textContent = `${slug}.cv`;
  if (viewProfileEl) viewProfileEl.href = `#/sites/${slug}`;
  
  window.location.hash = '#/success';
}

// Helper functions
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseResume(fileName) {
  // Very naive parsing based on sampleResume data
  const sample = {
    name: 'Sample User',
    headline: 'Professional',
    summary: 'This is a simulated summary extracted from your resume.',
    experience: [],
    skills: []
  };

  // If fileName resembles aisha, use provided sample data
  if (/aisha/i.test(fileName)) {
    return {
      name: 'Aisha Khumalo',
      headline: 'Full-Stack Developer',
      summary: 'Software engineer with 5+ years experience building scalable web platforms in fintech and healthtech.',
      experience: [
        {
          role: 'Senior Developer',
          company: 'FinServe',
          start: '2022-01',
          end: 'Present',
          desc: 'Lead MERN stack projects, mentoring 4 junior devs.'
        },
        {
          role: 'Web Developer',
          company: 'MediCare',
          start: '2019-03',
          end: '2021-12',
          desc: 'Developed patient portal used by 50k users.'
        }
      ],
      skills: ['JavaScript','Node.js','React','MongoDB','AWS']
    };
  }
  return sample;
}

// PUBLIC PROFILE RENDER
function renderPublicProfile(slug) {
  const container = document.getElementById('public-profile');
  if (!container) return;
  
  const data = window.sites[slug];
  if (!data) {
    container.innerHTML = `<div class="public-profile-wrapper"><p>Profile not found.</p></div>`;
    return;
  }
  
  renderProfileInto('public-profile', data);
}