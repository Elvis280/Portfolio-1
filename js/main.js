/* =========================================
   MAIN JS (Full-Stack CMS Integration)
   ========================================= */

const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000/api' : '/api';

document.addEventListener('DOMContentLoaded', () => {
  /* --- Mobile Menu Toggle --- */
  const toggleBtn = document.querySelector('.navbar__toggle');
  const menu = document.querySelector('.navbar__menu');

  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('is-active');
      menu.classList.toggle('is-active');
    });

    const links = document.querySelectorAll('.navbar__link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        toggleBtn.classList.remove('is-active');
        menu.classList.remove('is-active');
      });
    });
  }

  /* --- Dynamic Year in Footer --- */
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  /* --- FAQ Accordion --- */
  window.initFaqAccordion = function() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if(question && answer) {
        // Remove existing listener if any to avoid duplicates
        const newQuestion = question.cloneNode(true);
        question.parentNode.replaceChild(newQuestion, question);
        
        newQuestion.addEventListener('click', () => {
          const isActive = item.classList.contains('is-active');
          faqItems.forEach(otherItem => {
            otherItem.classList.remove('is-active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          });
          if (!isActive) {
            item.classList.add('is-active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
          }
        });
      }
    });
  };
  window.initFaqAccordion();

  /* --- Star Rating Logic --- */
  const stars = document.querySelectorAll('#starRating span');
  let currentRating = 0;

  stars.forEach((star, index) => {
    star.addEventListener('mouseover', () => { highlightStars(index + 1); });
    star.addEventListener('mouseout', () => { highlightStars(currentRating); });
    star.addEventListener('click', () => {
      currentRating = parseInt(star.getAttribute('data-value'));
      highlightStars(currentRating);
    });
  });

  function highlightStars(count) {
    stars.forEach((s, i) => {
      s.style.color = (i < count) ? 'var(--clr-accent)' : 'var(--clr-border)';
    });
  }

  /* --- Feedback Form Submission --- */
  const feedbackForm = document.getElementById('feedbackForm');
  const testimonialsGrid = document.getElementById('testimonialsGrid');
  
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (currentRating === 0) return alert("Please select a star rating.");

      const testimonialData = {
        id: 'test_' + new Date().getTime(),
        name: document.getElementById('name').value,
        student: document.getElementById('student').value,
        grade: document.getElementById('grade').value,
        subject: document.getElementById('subject').value,
        feedback: document.getElementById('feedback').value,
        rating: currentRating,
        timestamp: new Date().getTime()
      };

      try {
        await fetch(`${API_BASE}/testimonials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testimonialData)
        });
        injectTestimonial(testimonialData);
        document.getElementById('feedbackSuccess').style.display = 'block';
        feedbackForm.reset();
        currentRating = 0;
        highlightStars(0);
        setTimeout(() => document.getElementById('feedbackSuccess').style.display = 'none', 4000);
      } catch (err) {
        console.error('Failed to submit testimonial', err);
      }
    });
  }

  function injectTestimonial(data) {
    if (!testimonialsGrid) return;
    const starsHtml = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
    const card = document.createElement('div');
    card.className = 'card card--testimonial animate-up';
    card.style.opacity = '1'; 
    card.style.transform = 'translateY(0)';
    
    const studentStr = data.student ? ` (Parent of ${data.student})` : '';
    const detailsStr = (data.grade && data.subject) ? ` · ${data.grade} (${data.subject})` : '';

    card.innerHTML = `
      <div class="stars">${starsHtml}</div>
      <p class="quote">"${data.feedback}"</p>
      <p class="author">— ${data.name}${studentStr}${detailsStr}</p>
    `;
    testimonialsGrid.prepend(card);
    testimonialsGrid.scrollTo({ left: 0, behavior: 'smooth' });
  }

  /* --- Carousel Logic --- */
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');

  if (carouselPrev && carouselNext && testimonialsGrid) {
    const getScrollAmount = () => {
      const firstCard = testimonialsGrid.querySelector('.card');
      if (!firstCard) return 300;
      const gap = parseInt(window.getComputedStyle(testimonialsGrid).gap) || 24;
      return firstCard.offsetWidth + gap;
    };
    carouselNext.addEventListener('click', () => { testimonialsGrid.scrollBy({ left: getScrollAmount(), behavior: 'smooth' }); });
    carouselPrev.addEventListener('click', () => { testimonialsGrid.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' }); });
  }

  /* =========================================
     BACKEND SYNC LOGIC
     ========================================= */
  
  async function loadDataFromBackend() {
    try {
      const res = await fetch(`${API_BASE}/data`);
      if (!res.ok) throw new Error('Backend not reachable');
      const data = await res.json();
      
      // Hydrate Text Content
      if (data.content) {
        for (const [key, val] of Object.entries(data.content)) {
          const textEl = document.querySelector(`[data-editable="${key}"]`);
          if (textEl) textEl.innerHTML = val;
          const linkEl = document.querySelector(`[data-editable-link="${key}"]`);
          if (linkEl) linkEl.href = val;
        }
        
        // Restore custom portrait if exists
        const heroPortrait = document.getElementById('heroPortrait');
        if (data.content['heroPortraitSrc'] && heroPortrait) {
          heroPortrait.src = data.content['heroPortraitSrc'];
        }
      }

      // Hydrate Testimonials
      if (data.testimonials && data.testimonials.length > 0) {
        if(testimonialsGrid) testimonialsGrid.innerHTML = ''; // clear static
        data.testimonials.reverse().forEach(t => injectTestimonial(t));
      }

      // Hydrate Gallery
      if (data.gallery) {
        renderGallery(data.gallery);
      }
      
      // Hydrate Dynamic Sections
      if (data.dynamicSections) {
        renderDynamicSections(data.dynamicSections);
      }
      
    } catch (err) {
      console.log('Running in static mode. Start Node server for CMS features.');
    }
  }

  const galleryGridTarget = document.getElementById('galleryGridTarget');
  const adminGalleryAdd = document.getElementById('adminGalleryAdd');
  const viewMoreBtn = document.getElementById('galleryViewMoreBtn');
  
  function renderGallery(images) {
    if (!galleryGridTarget) return;
    
    // Remove old items except the Add button
    Array.from(galleryGridTarget.children).forEach(child => {
      if (child.id !== 'adminGalleryAdd') child.remove();
    });

    images.forEach((img, index) => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.setAttribute('data-id', img.id);
      
      // Hide images beyond the first 6
      if (index >= 6) {
        div.style.display = 'none';
        div.classList.add('gallery-hidden');
      }

      div.innerHTML = `<img src="${img.src}" alt="Gallery Image" class="gallery-img">`;
      
      if (isAdmin) {
        addAdminGalleryControls(div, img.id);
      }
      
      galleryGridTarget.insertBefore(div, adminGalleryAdd);
    });

    // Handle View More button
    if (images.length > 6) {
      viewMoreBtn.style.display = 'inline-block';
      viewMoreBtn.onclick = () => {
        document.querySelectorAll('.gallery-hidden').forEach(el => {
          el.style.display = 'block';
        });
        viewMoreBtn.style.display = 'none';
      };
    } else {
      if(viewMoreBtn) viewMoreBtn.style.display = 'none';
    }
  }

  function addAdminGalleryControls(itemDiv, id) {
    const controls = document.createElement('div');
    controls.className = 'admin-gallery-controls';
    controls.innerHTML = `
      <label class="admin-replace-btn" title="Replace Photo">🔄
        <input type="file" accept="image/*" style="display:none;" onchange="replaceGalleryImage(event, '${id}')">
      </label>
      <button class="admin-delete-btn" onclick="deleteGalleryImage('${id}')">×</button>
    `;
    itemDiv.appendChild(controls);
  }

  window.replaceGalleryImage = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      try {
        await fetch(`${API_BASE}/gallery`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({ id, src: dataUrl })
        });
        loadDataFromBackend(); // Refresh gallery
      } catch (err) { console.error(err); }
    };
    reader.readAsDataURL(file);
  };

  window.deleteGalleryImage = async (id) => {
    if (confirm('Delete this image?')) {
      try {
        await fetch(`${API_BASE}/gallery/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}` }
        });
        loadDataFromBackend();
      } catch (err) { console.error(err); }
    }
  };

  /* =========================================
     ADMIN MODE LOGIC
     ========================================= */
  let isAdmin = sessionStorage.getItem('isAdminActive') === 'true'; // Using session storage for login state
  let isEditingText = false;

  const adminLoginLink = document.getElementById('adminLoginLink');
  const adminLoginModal = document.getElementById('adminLoginModal');
  const adminPassword = document.getElementById('adminPassword');
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const adminCancelBtn = document.getElementById('adminCancelBtn');
  const adminPanel = document.getElementById('adminPanel');
  const adminExit = document.getElementById('adminExit');
  const adminToggleEdit = document.getElementById('adminToggleEdit');
  const adminSaveContent = document.getElementById('adminSaveContent');
  const heroPortrait = document.getElementById('heroPortrait');
  const adminPhotoEdit = document.getElementById('adminPhotoEdit');
  const galleryUpload = document.getElementById('galleryUpload');

  // Initial Load
  loadDataFromBackend().then(() => {
    if (isAdmin) enableAdminMode();
  });

  if (adminLoginLink) {
    adminLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isAdmin) adminLoginModal.showModal();
    });
  }

  if (adminCancelBtn) {
    adminCancelBtn.addEventListener('click', () => {
      adminLoginModal.close();
      adminPassword.value = '';
    });
  }

  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', async () => {
      const pwd = adminPassword.value;
      if (!pwd) return alert('Enter password');
      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd })
        });
        const data = await res.json();
        if (data.success) {
          isAdmin = true;
          sessionStorage.setItem('isAdminActive', 'true');
          sessionStorage.setItem('adminToken', data.token);
          adminLoginModal.close();
          adminPassword.value = '';
          enableAdminMode();
        } else {
          alert(data.error || 'Incorrect Password');
        }
      } catch (err) {
        alert('Login failed. Server error.');
      }
    });
  }

  if (adminExit) {
    adminExit.addEventListener('click', () => {
      isAdmin = false;
      sessionStorage.setItem('isAdminActive', 'false');
      sessionStorage.removeItem('adminToken');
      disableAdminMode();
      if (isEditingText) toggleTextEditor();
    });
  }

  const adminUpdatePwdBtn = document.getElementById('adminUpdatePwdBtn');
  const updatePasswordModal = document.getElementById('updatePasswordModal');
  const updatePasswordForm = document.getElementById('updatePasswordForm');
  const updatePwdCancel = document.getElementById('updatePwdCancel');

  if (adminUpdatePwdBtn && updatePasswordModal) {
    adminUpdatePwdBtn.addEventListener('click', () => updatePasswordModal.showModal());
  }

  if (updatePwdCancel && updatePasswordModal) {
    updatePwdCancel.addEventListener('click', () => {
      updatePasswordModal.close();
      if (updatePasswordForm) updatePasswordForm.reset();
    });
  }

  if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const oldPassword = document.getElementById('oldPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (newPassword !== confirmPassword) return alert('New passwords do not match!');
      try {
        const token = sessionStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE}/update-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ oldPassword, newPassword })
        });
        const data = await res.json();
        if (data.success) {
          alert('Password updated successfully!');
          updatePasswordModal.close();
          updatePasswordForm.reset();
        } else {
          alert(data.error || 'Failed to update password');
        }
      } catch (err) { alert('Server error'); }
    });
  }

  /* --- Admin Editor UI Logic --- */
  function toggleLinkEditors(show) {
    document.querySelectorAll('.admin-link-edit').forEach(el => el.remove());
    if (show) {
      document.querySelectorAll('[data-editable-link]').forEach(el => {
        const btn = document.createElement('button');
        btn.className = 'admin-link-edit btn btn--primary btn--small';
        btn.innerHTML = '🔗';
        btn.style.position = 'absolute';
        btn.style.top = '-10px';
        btn.style.right = '-20px';
        btn.style.width = '24px';
        btn.style.height = '24px';
        btn.style.padding = '0';
        btn.style.fontSize = '12px';
        btn.style.borderRadius = '50%';
        btn.style.zIndex = '100';
        btn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const newUrl = prompt('Enter new URL for this link:', el.href);
          if (newUrl !== null && newUrl.trim() !== '') {
            el.href = newUrl.trim();
            try {
              await fetch(`${API_BASE}/content`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ [el.dataset.editableLink]: newUrl.trim() })
              });
              alert('Link saved successfully!');
            } catch (err) {
              console.error(err);
              alert('Error saving link.');
            }
          }
        };
        el.appendChild(btn);
      });
    }
  }

  if (adminToggleEdit) adminToggleEdit.addEventListener('click', toggleTextEditor);
  if (adminSaveContent) adminSaveContent.addEventListener('click', saveCustomContent);

  function toggleTextEditor() {
    isEditingText = !isEditingText;
    const editables = document.querySelectorAll('[data-editable]');
    if (isEditingText) {
      adminToggleEdit.textContent = 'Cancel Editing';
      adminSaveContent.style.display = 'inline-block';
      editables.forEach(el => el.setAttribute('contenteditable', 'true'));
      toggleLinkEditors(true);
    } else {
      adminToggleEdit.textContent = 'Enable Text Editor';
      adminSaveContent.style.display = 'none';
      editables.forEach(el => el.removeAttribute('contenteditable'));
      toggleLinkEditors(false);
      loadDataFromBackend(); // Revert unsaved
    }
  }

  async function saveCustomContent() {
    const editables = document.querySelectorAll('[data-editable]');
    const contentData = {};
    
    // Temporarily remove link edit buttons so their HTML isn't saved as text
    document.querySelectorAll('.admin-link-edit').forEach(el => el.remove());

    editables.forEach(el => {
      contentData[el.getAttribute('data-editable')] = el.innerHTML;
    });
    
    try {
      await fetch(`${API_BASE}/content`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(contentData)
      });
      alert('Content saved to database successfully!');
      isEditingText = false;
      adminToggleEdit.textContent = 'Enable Text Editor';
      adminSaveContent.style.display = 'none';
      editables.forEach(el => el.removeAttribute('contenteditable'));
      toggleLinkEditors(false);
    } catch (err) {
      alert('Failed to save to database.');
      toggleLinkEditors(true); // Put them back if save failed
    }
  }

  function enableAdminMode() {
    if (adminPanel) adminPanel.classList.add('is-active');
    if (adminPhotoEdit) adminPhotoEdit.style.display = 'flex';
    if (adminGalleryAdd) adminGalleryAdd.style.display = 'flex';
    
    // Show Dynamic Add buttons
    const adminSubjectAdd = document.getElementById('adminSubjectAdd');
    if (adminSubjectAdd) adminSubjectAdd.style.display = 'block';
    const adminSkillAdd = document.getElementById('adminSkillAdd');
    if (adminSkillAdd) adminSkillAdd.style.display = 'block';
    const adminExpAdd = document.getElementById('adminExpAdd');
    if (adminExpAdd) adminExpAdd.style.display = 'block';
    const adminQualAdd = document.getElementById('adminQualAdd');
    if (adminQualAdd) adminQualAdd.style.display = 'block';
    const adminFaqAdd = document.getElementById('adminFaqAdd');
    if (adminFaqAdd) adminFaqAdd.style.display = 'block';
    
    // Show delete buttons on dynamic cards
    document.querySelectorAll('.admin-card-del').forEach(btn => btn.style.display = 'flex');

    loadDataFromBackend(); // Refresh to inject admin controls in gallery
  }

  function disableAdminMode() {
    if (adminPanel) adminPanel.classList.remove('is-active');
    if (adminPhotoEdit) adminPhotoEdit.style.display = 'none';
    if (adminGalleryAdd) adminGalleryAdd.style.display = 'none';
    
    // Hide Dynamic Add buttons
    const adminSubjectAdd = document.getElementById('adminSubjectAdd');
    if (adminSubjectAdd) adminSubjectAdd.style.display = 'none';
    const adminSkillAdd = document.getElementById('adminSkillAdd');
    if (adminSkillAdd) adminSkillAdd.style.display = 'none';
    const adminExpAdd = document.getElementById('adminExpAdd');
    if (adminExpAdd) adminExpAdd.style.display = 'none';
    const adminQualAdd = document.getElementById('adminQualAdd');
    if (adminQualAdd) adminQualAdd.style.display = 'none';
    const adminFaqAdd = document.getElementById('adminFaqAdd');
    if (adminFaqAdd) adminFaqAdd.style.display = 'none';
    
    // Hide delete buttons on dynamic cards
    document.querySelectorAll('.admin-card-del').forEach(btn => btn.style.display = 'none');

    loadDataFromBackend(); // Refresh to remove admin controls
  }

  // Portrait Upload
  if (photoUpload) {
    photoUpload.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const dataUrl = ev.target.result;
          heroPortrait.src = dataUrl;
          await fetch(`${API_BASE}/content`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ heroPortraitSrc: dataUrl })
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Gallery Add (Multiple)
  if (galleryUpload) {
    galleryUpload.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        const reader = new FileReader();
        // Use a promise to ensure sequential processing if needed, but this is fine for small files
        reader.onload = async (ev) => {
          const dataUrl = ev.target.result;
          const imgId = 'img_' + new Date().getTime() + Math.random().toString(36).substr(2, 5);
          await fetch(`${API_BASE}/gallery`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ id: imgId, src: dataUrl, order_idx: Date.now() })
          });
          loadDataFromBackend();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /* =========================================
     DYNAMIC SECTIONS LOGIC
     ========================================= */
  
  function renderDynamicSections(sections) {
    // Clear previously rendered dynamic cards to avoid duplicates on reload
    document.querySelectorAll('.card--dynamic').forEach(el => el.remove());

    sections.forEach(sec => {
      // Migrate legacy emojis to Lucide icons dynamically
      if (sec.htmlContent) {
        sec.htmlContent = sec.htmlContent
          .replace('🎓', '<i data-lucide="graduation-cap"></i>')
          .replace('📘', '<i data-lucide="book"></i>')
          .replace('📚', '<i data-lucide="library"></i>')
          .replace('🔬', '<i data-lucide="microscope"></i>')
          .replace('🎖', '<i data-lucide="award"></i>')
          .replace('📖', '<i data-lucide="book-open"></i>');
      }
      
      if (sec.category === 'subject') {
        const subjectsGrid = document.getElementById('subjectsGrid');
        if (!subjectsGrid) return;
        
        const div = document.createElement('div');
        div.className = 'card card--subject card--dynamic animate-up';
        div.style.position = 'relative'; // For absolute delete btn
        div.style.opacity = '1'; 
        div.style.transform = 'translateY(0)';
        div.innerHTML = sec.htmlContent;
        
        const delBtn = document.createElement('button');
        delBtn.className = 'admin-delete-btn admin-card-del';
        delBtn.innerHTML = '×';
        delBtn.style.display = isAdmin ? 'flex' : 'none';
        delBtn.style.position = 'absolute';
        delBtn.style.top = '10px';
        delBtn.style.right = '10px';
        delBtn.onclick = () => window.deleteDynamicCard(sec.id);
        
        div.appendChild(delBtn);
        subjectsGrid.appendChild(div);
      } else if (sec.category === 'skill') {
        const skillsSection = document.getElementById('skills');
        if (!skillsSection) return;
        const skillsGrid = skillsSection.querySelector('.grid-2');
        if (!skillsGrid) return;

        const div = document.createElement('div');
        div.className = 'skill card--dynamic animate-up';
        div.style.position = 'relative'; 
        div.style.opacity = '1'; 
        div.style.transform = 'translateY(0)';
        div.innerHTML = sec.htmlContent;
        
        const delBtn = document.createElement('button');
        delBtn.className = 'admin-delete-btn admin-card-del';
        delBtn.innerHTML = '×';
        delBtn.style.display = isAdmin ? 'flex' : 'none';
        delBtn.style.position = 'absolute';
        delBtn.style.top = '0px';
        delBtn.style.right = '0px';
        delBtn.style.width = '24px';
        delBtn.style.height = '24px';
        delBtn.style.fontSize = '0.8rem';
        delBtn.onclick = () => window.deleteDynamicCard(sec.id);
        
        div.appendChild(delBtn);
        skillsGrid.appendChild(div);
      } else if (sec.category === 'experience') {
        const timeline = document.getElementById('experienceTimeline');
        if (!timeline) return;

        const div = document.createElement('div');
        div.className = 'timeline__item card--dynamic animate-up';
        div.style.position = 'relative'; 
        div.style.opacity = '1'; 
        div.style.transform = 'translateY(0)';
        div.innerHTML = sec.htmlContent;
        
        const delBtn = document.createElement('button');
        delBtn.className = 'admin-delete-btn admin-card-del';
        delBtn.innerHTML = '× Delete Experience';
        delBtn.style.display = isAdmin ? 'inline-flex' : 'none';
        delBtn.style.position = 'relative';
        delBtn.style.marginTop = '12px';
        delBtn.style.width = 'auto';
        delBtn.style.padding = '0 16px';
        delBtn.style.height = '32px';
        delBtn.style.borderRadius = '6px';
        delBtn.style.fontSize = '0.85rem';
        delBtn.onclick = () => window.deleteDynamicCard(sec.id);
        
        div.appendChild(delBtn);
        timeline.appendChild(div);
      } else if (sec.category === 'qualification') {
        const grid1 = document.getElementById('qualificationsGrid1');
        const grid2 = document.getElementById('qualificationsGrid2');
        if (!grid1 || !grid2) return;
        
        const div = document.createElement('div');
        div.className = 'card card--minimal card--dynamic animate-up';
        div.style.position = 'relative'; 
        div.style.opacity = '1'; 
        div.style.transform = 'translateY(0)';
        div.innerHTML = sec.htmlContent;
        
        const delBtn = document.createElement('button');
        delBtn.className = 'admin-delete-btn admin-card-del';
        delBtn.innerHTML = '×';
        delBtn.style.display = isAdmin ? 'flex' : 'none';
        delBtn.style.position = 'absolute';
        delBtn.style.top = '10px';
        delBtn.style.right = '10px';
        delBtn.onclick = () => window.deleteDynamicCard(sec.id);
        
        div.appendChild(delBtn);
        
        const currentCount = grid1.querySelectorAll('.card').length + grid2.querySelectorAll('.card').length;
        if (currentCount < 3) {
          grid1.appendChild(div);
        } else {
          grid2.appendChild(div);
        }
      } else if (sec.category === 'faq') {
        const accordion = document.getElementById('faqAccordion');
        if (!accordion) return;
        
        const div = document.createElement('div');
        div.className = 'faq-item card--dynamic animate-up';
        div.style.position = 'relative'; 
        div.style.opacity = '1'; 
        div.style.transform = 'translateY(0)';
        let html = sec.htmlContent;
        div.innerHTML = html;
        
        const delBtn = document.createElement('button');
        delBtn.className = 'admin-delete-btn admin-card-del';
        delBtn.innerHTML = '×';
        delBtn.style.display = isAdmin ? 'flex' : 'none';
        delBtn.style.position = 'absolute';
        delBtn.style.top = '10px';
        delBtn.style.right = '10px';
        delBtn.onclick = () => window.deleteDynamicCard(sec.id);
        
        div.appendChild(delBtn);
        accordion.appendChild(div);
      }
    });
    updateSubjectCarousel();
    updateExperienceVisibility();
    updateQualVisibility();
    updateFaqVisibility();
    if (window.initFaqAccordion) window.initFaqAccordion();
    if (window.lucide) window.lucide.createIcons();
  }

  window.addDynamicCard = async (category, dataObj = null) => {
    const id = 'dyn_' + new Date().getTime();
    let htmlContent = '';
    
    if (category === 'subject') {
      const icon = dataObj ? dataObj.icon : 'book-open';
      const title = dataObj ? dataObj.title : 'New Subject';
      const meta = dataObj ? dataObj.meta : 'Classes X - Y';
      const desc = dataObj ? dataObj.desc : 'Description of the subject.';
      const badge = dataObj ? dataObj.badge : 'Experience';

      htmlContent = `
        <div class="card__icon"><i data-lucide="${icon}"></i></div>
        <h3 class="card__title" data-editable="title_${id}">${title}</h3>
        <p class="card__meta" data-editable="meta_${id}">${meta}</p>
        <p class="card__desc" data-editable="desc_${id}">${desc}</p>
        <span class="badge badge--dark" data-editable="badge_${id}">${badge}</span>
      `;
    } else if (category === 'skill') {
      const title = dataObj ? dataObj.title : 'New Skill';
      const level = dataObj ? dataObj.level : 'Expert';
      const percent = dataObj ? dataObj.percent : '90';

      htmlContent = `
        <div class="skill__header" style="padding-right: 30px;">
          <span class="skill__name" data-editable="title_${id}">${title}</span>
          <span class="skill__level" data-editable="level_${id}">${level}</span>
        </div>
        <div class="skill__bar">
          <div class="skill__fill" style="width: ${percent}%;"></div>
        </div>
      `;
    } else if (category === 'experience') {
      const title = dataObj ? dataObj.title : 'Job Title';
      const meta = dataObj ? dataObj.meta : 'Location & Dates';
      const desc = dataObj ? dataObj.desc : 'Description of your role.';

      htmlContent = `
        <div class="timeline__marker"></div>
        <h4 class="timeline__title" data-editable="title_${id}" style="padding-right: 30px;">${title}</h4>
        <p class="timeline__meta" data-editable="meta_${id}">${meta}</p>
        <p class="timeline__desc" data-editable="desc_${id}">${desc}</p>
      `;
    } else if (category === 'qualification') {
      const icon = dataObj ? dataObj.icon : 'graduation-cap';
      const title = dataObj ? dataObj.title : 'Degree';
      const desc = dataObj ? dataObj.desc : 'Description of degree.';

      htmlContent = `
        <div class="qual-icon"><i data-lucide="${icon}"></i></div>
        <h4 class="card__title" data-editable="title_${id}">${title}</h4>
        <p class="card__desc" data-editable="desc_${id}">${desc}</p>
      `;
    } else if (category === 'faq') {
      const q = dataObj ? dataObj.q : 'Question';
      const a = dataObj ? dataObj.a : 'Answer';

      htmlContent = `
        <button class="faq-question" style="padding-right: 40px;"><span data-editable="q_${id}">${q}</span> <span class="faq-icon">+</span></button>
        <div class="faq-answer"><p data-editable="a_${id}">${a}</p></div>
      `;
    }

    try {
      await fetch(`${API_BASE}/dynamic`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ id, category, htmlContent, order_idx: Date.now() })
      });
      // After adding, fetch latest data and if we are editing, re-trigger editable state
      await loadDataFromBackend();
      if (isEditingText) {
        document.querySelectorAll('[data-editable]').forEach(el => el.setAttribute('contenteditable', 'true'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  window.deleteDynamicCard = async (id) => {
    if (confirm('Delete this card entirely?')) {
      try {
        await fetch(`${API_BASE}/dynamic/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}` }
        });
        loadDataFromBackend();
      } catch (err) {
        console.error(err);
      }
    }
  };

  /* --- Subject Carousel Logic --- */
  const subjectPrev = document.getElementById('subjectPrev');
  const subjectNext = document.getElementById('subjectNext');
  const subjectsGrid = document.getElementById('subjectsGrid');
  const subjectControls = document.getElementById('subjectCarouselControls');

  function updateSubjectCarousel() {
    if (!subjectsGrid || !subjectControls) return;
    const cards = subjectsGrid.querySelectorAll('.card').length;
    if (cards > 3) {
      subjectControls.style.display = 'flex';
      subjectsGrid.style.justifyContent = 'flex-start';
    } else {
      subjectControls.style.display = 'none';
      subjectsGrid.style.justifyContent = 'center';
    }
  }
  
  // Initial check for static cards
  updateSubjectCarousel();

  if (subjectPrev && subjectNext && subjectsGrid) {
    const getSubjectScrollAmount = () => {
      const firstCard = subjectsGrid.querySelector('.card');
      if (!firstCard) return 300;
      const gap = parseInt(window.getComputedStyle(subjectsGrid).gap) || 24;
      return firstCard.offsetWidth + gap;
    };
    subjectNext.addEventListener('click', () => { subjectsGrid.scrollBy({ left: getSubjectScrollAmount(), behavior: 'smooth' }); });
    subjectPrev.addEventListener('click', () => { subjectsGrid.scrollBy({ left: -getSubjectScrollAmount(), behavior: 'smooth' }); });
  }

  /* --- Experience View More Logic --- */
  const expViewMoreBtn = document.getElementById('expViewMoreBtn');
  let isExpExpanded = false;

  function updateExperienceVisibility() {
    const timeline = document.getElementById('experienceTimeline');
    if (!timeline || !expViewMoreBtn) return;
    const items = timeline.querySelectorAll('.timeline__item');
    
    if (items.length > 3) {
      expViewMoreBtn.style.display = 'inline-flex';
      items.forEach((item, index) => {
        if (index >= 3) {
          item.style.display = isExpExpanded ? 'block' : 'none';
        }
      });
      expViewMoreBtn.textContent = isExpExpanded ? 'View Less' : 'View More';
    } else {
      expViewMoreBtn.style.display = 'none';
      items.forEach(item => item.style.display = 'block');
    }
  }

  if (expViewMoreBtn) {
    expViewMoreBtn.addEventListener('click', () => {
      isExpExpanded = !isExpExpanded;
      updateExperienceVisibility();
    });
  }

  /* --- Qual View More Logic --- */
  const qualViewMoreBtn = document.getElementById('qualViewMoreBtn');
  let isQualExpanded = false;

  function updateQualVisibility() {
    const grid1 = document.getElementById('qualificationsGrid1');
    const grid2 = document.getElementById('qualificationsGrid2');
    if (!grid1 || !grid2 || !qualViewMoreBtn) return;
    const items = [...grid1.querySelectorAll('.card'), ...grid2.querySelectorAll('.card')];
    
    if (items.length > 5) {
      qualViewMoreBtn.style.display = 'inline-block';
      items.forEach((item, index) => {
        if (index >= 5) {
          item.style.display = isQualExpanded ? 'block' : 'none';
        }
      });
      qualViewMoreBtn.textContent = isQualExpanded ? 'View Less' : 'View More';
    } else {
      qualViewMoreBtn.style.display = 'none';
      items.forEach(item => item.style.display = 'block');
    }
  }

  if (qualViewMoreBtn) {
    qualViewMoreBtn.addEventListener('click', () => {
      isQualExpanded = !isQualExpanded;
      updateQualVisibility();
    });
  }

  /* --- FAQ View More Logic --- */
  const faqViewMoreBtn = document.getElementById('faqViewMoreBtn');
  let isFaqExpanded = false;

  function updateFaqVisibility() {
    const accordion = document.getElementById('faqAccordion');
    if (!accordion || !faqViewMoreBtn) return;
    const items = accordion.querySelectorAll('.faq-item');
    
    if (items.length > 3) {
      faqViewMoreBtn.style.display = 'inline-block';
      items.forEach((item, index) => {
        if (index >= 3) {
          item.style.display = isFaqExpanded ? 'block' : 'none';
        }
      });
      faqViewMoreBtn.textContent = isFaqExpanded ? 'View Less' : 'View More';
    } else {
      faqViewMoreBtn.style.display = 'none';
      items.forEach(item => item.style.display = 'block');
    }
  }

  if (faqViewMoreBtn) {
    faqViewMoreBtn.addEventListener('click', () => {
      isFaqExpanded = !isFaqExpanded;
      updateFaqVisibility();
    });
  }

  /* --- Dynamic Modals Logic (Refactored) --- */
  function setupDynamicModal(openBtnId, modalId, cancelBtnId, formId, category, getDataFn) {
    const openBtn = document.getElementById(openBtnId);
    const modal = document.getElementById(modalId);
    const cancelBtn = document.getElementById(cancelBtnId);
    const form = document.getElementById(formId);

    if (openBtn && modal) openBtn.addEventListener('click', () => modal.showModal());
    if (cancelBtn && modal) cancelBtn.addEventListener('click', () => modal.close());
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        window.addDynamicCard(category, getDataFn());
        modal.close();
        form.reset();
      });
    }
  }

  setupDynamicModal('openAddSubjectBtn', 'addSubjectModal', 'addSubjectCancel', 'addSubjectForm', 'subject', () => ({
    icon: document.getElementById('subIcon').value,
    title: document.getElementById('subTitle').value,
    meta: document.getElementById('subMeta').value,
    desc: document.getElementById('subDesc').value,
    badge: document.getElementById('subBadge').value
  }));

  setupDynamicModal('openAddSkillBtn', 'addSkillModal', 'addSkillCancel', 'addSkillForm', 'skill', () => ({
    title: document.getElementById('skillTitle').value,
    level: document.getElementById('skillLevel').value,
    percent: document.getElementById('skillPercent').value
  }));

  setupDynamicModal('openAddExpBtn', 'addExpModal', 'addExpCancel', 'addExpForm', 'experience', () => ({
    title: document.getElementById('expTitle').value,
    meta: document.getElementById('expMeta').value,
    desc: document.getElementById('expDesc').value
  }));

  setupDynamicModal('openAddQualBtn', 'addQualModal', 'addQualCancel', 'addQualForm', 'qualification', () => ({
    icon: document.getElementById('qualIcon').value,
    title: document.getElementById('qualTitle').value,
    desc: document.getElementById('qualDesc').value
  }));

  setupDynamicModal('openAddFaqBtn', 'addFaqModal', 'addFaqCancel', 'addFaqForm', 'faq', () => ({
    q: document.getElementById('faqQ').value,
    a: document.getElementById('faqA').value
  }));

});
