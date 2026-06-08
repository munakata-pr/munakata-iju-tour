document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Header Scroll Effect
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = nav.classList.contains('active') ? 'rotate(45deg) translate(6px, 6px)' : 'none';
      spans[1].style.opacity = nav.classList.contains('active') ? '0' : '1';
      spans[2].style.transform = nav.classList.contains('active') ? 'rotate(-45deg) translate(5px, -5px)' : 'none';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // 3. Itinerary Accordion Logic
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach(item => {
    const card = item.querySelector('.timeline-content-card');
    card.addEventListener('click', () => {
      // Toggle current item
      const isActive = item.classList.contains('active');
      
      // Close all items
      timelineItems.forEach(i => i.classList.remove('active'));
      
      // Open current if it wasn't active
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 4. Accordion (Terms & Privacy Policies)
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all accordion items
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 5. Booking Form Validation & Submission
  const form = document.getElementById('bookingForm');
  const modal = document.getElementById('successModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const participantsSelect = document.getElementById('participants');
  const companionWrapper = document.getElementById('companion_info_wrapper');

  // Toggle Companion Info wrapper based on number of participants
  if (participantsSelect && companionWrapper) {
    participantsSelect.addEventListener('change', () => {
      if (participantsSelect.value === '2') {
        companionWrapper.style.display = 'block';
      } else {
        companionWrapper.style.display = 'none';
        // Clear companion inputs when switching back to 1 participant
        const companionName = document.getElementById('companion_name');
        const companionAge = document.getElementById('companion_age');
        const companionRel = document.getElementById('companion_relationship');
        if (companionName) {
          companionName.value = '';
          clearError(companionName);
        }
        if (companionAge) {
          companionAge.value = '';
          clearError(companionAge);
        }
        if (companionRel) {
          companionRel.value = '';
          clearError(companionRel);
        }
      }
    });
  }
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      
      // Validate Name
      const nameInput = document.getElementById('name');
      if (nameInput.value.trim() === '') {
        showError(nameInput, 'お名前を入力してください。');
        isValid = false;
      } else {
        clearError(nameInput);
      }
      
      // Validate Age
      const ageInput = document.getElementById('age');
      if (ageInput.value.trim() === '') {
        showError(ageInput, '年齢を入力してください。');
        isValid = false;
      } else if (isNaN(ageInput.value) || parseInt(ageInput.value) <= 0) {
        showError(ageInput, '正しい年齢を入力してください。');
        isValid = false;
      } else {
        clearError(ageInput);
      }
      
      // Validate Email
      const emailInput = document.getElementById('email');
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailInput.value.trim() === '') {
        showError(emailInput, 'メールアドレスを入力してください。');
        isValid = false;
      } else if (!emailPattern.test(emailInput.value.trim())) {
        showError(emailInput, '有効なメールアドレス形式で入力してください。');
        isValid = false;
      } else {
        clearError(emailInput);
      }
      
      // Validate Phone
      const phoneInput = document.getElementById('phone');
      const phonePattern = /^[0-9-]{10,13}$/;
      if (phoneInput.value.trim() === '') {
        showError(phoneInput, '電話番号を入力してください。');
        isValid = false;
      } else if (!phonePattern.test(phoneInput.value.replace(/-/g, ''))) {
        showError(phoneInput, '有効な電話番号を入力してください。');
        isValid = false;
      } else {
        clearError(phoneInput);
      }
      
      // Validate Address
      const addressInput = document.getElementById('address');
      if (addressInput.value.trim() === '') {
        showError(addressInput, 'ご住所を入力してください。');
        isValid = false;
      } else {
        clearError(addressInput);
      }
      
      // Validate Companion Info (Only when 2 participants are selected)
      const companionNameInput = document.getElementById('companion_name');
      const companionAgeInput = document.getElementById('companion_age');
      const companionRelSelect = document.getElementById('companion_relationship');

      if (participantsSelect && participantsSelect.value === '2') {
        if (companionNameInput && companionNameInput.value.trim() === '') {
          showError(companionNameInput, '同行者様のお名前を入力してください。');
          isValid = false;
        } else if (companionNameInput) {
          clearError(companionNameInput);
        }

        if (companionAgeInput) {
          if (companionAgeInput.value.trim() === '') {
            showError(companionAgeInput, '同行者様の年齢を入力してください。');
            isValid = false;
          } else if (isNaN(companionAgeInput.value) || parseInt(companionAgeInput.value) <= 0) {
            showError(companionAgeInput, '正しい年齢を入力してください。');
            isValid = false;
          } else {
            clearError(companionAgeInput);
          }
        }

        if (companionRelSelect && companionRelSelect.value === '') {
          showError(companionRelSelect, '代表者様との関係を選択してください。');
          isValid = false;
        } else if (companionRelSelect) {
          clearError(companionRelSelect);
        }
      }
      
      // Validate Course Selection
      const courseSelect = document.getElementById('tour_course');
      if (courseSelect.value === '') {
        showError(courseSelect, '参加希望ツアーを選択してください。');
        isValid = false;
      } else {
        clearError(courseSelect);
      }
      
      // Validate Agreements
      const lunchAgree = document.getElementById('lunch_agree');
      const privacyAgree = document.getElementById('privacy_agree');
      
      if (!lunchAgree.checked) {
        showError(lunchAgree, '飲食費が自己負担であることへの同意が必要です。');
        isValid = false;
      } else {
        clearError(lunchAgree);
      }

      if (!privacyAgree.checked) {
        showError(privacyAgree, '個人情報の取扱方針および保険の適用への同意が必要です。');
        isValid = false;
      } else {
        clearError(privacyAgree);
      }
      
      if (isValid) {
        // Collect form data for representation
        const formData = {
          name: nameInput.value.trim(),
          age: ageInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          address: addressInput.value.trim(),
          participants: participantsSelect ? participantsSelect.value : '1',
          course: courseSelect.options[courseSelect.selectedIndex].text,
          inquiry: document.getElementById('inquiry').value.trim()
        };

        // Add companion details if 2 participants are selected
        if (formData.participants === '2' && companionNameInput && companionAgeInput && companionRelSelect) {
          formData.companionName = companionNameInput.value.trim();
          formData.companionAge = companionAgeInput.value.trim();
          formData.companionRelationship = companionRelSelect.options[companionRelSelect.selectedIndex].text;
        }
        
        console.log('Application submitted successfully:', JSON.stringify(formData));
        
        // Show success modal
        modal.classList.add('active');
        
        // Reset form
        form.reset();

        // Hide companion wrapper on reset
        if (companionWrapper) {
          companionWrapper.style.display = 'none';
        }
      } else {
        // Scroll to the first error
        const firstError = document.querySelector('.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }
  
  if (modalClose && modal) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    // Close modal when clicking outside content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
  
  function showError(inputElement, message) {
    // Check if checkbox
    let formGroup;
    if (inputElement.type === 'checkbox') {
      formGroup = inputElement.closest('.form-group');
    } else {
      formGroup = inputElement.parentElement;
    }
    
    formGroup.classList.add('has-error');
    let errorMsg = formGroup.querySelector('.form-error-msg');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'form-error-msg';
      formGroup.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
  }
  
  function clearError(inputElement) {
    let formGroup;
    if (inputElement.type === 'checkbox') {
      formGroup = inputElement.closest('.form-group');
    } else {
      formGroup = inputElement.parentElement;
    }
    formGroup.classList.remove('has-error');
  }
});
