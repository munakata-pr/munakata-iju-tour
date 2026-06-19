const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwRqmI1_GBfy4Nw-hOaZhFP9BHZOw3O5ALvrXNwZNk2BqwZYKZFOPaYYh1qBoAMTgI4/exec';

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
        const submitButton = form.querySelector('.btn-submit');
        const originalButtonText = submitButton.textContent;
        
        // 送信中の状態に変更（連打防止）
        submitButton.disabled = true;
        submitButton.textContent = '送信中...';
        
        // フォームデータの作成
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

        // 同行者の情報を追加
        if (formData.participants === '2' && companionNameInput && companionAgeInput && companionRelSelect) {
          formData.companionName = companionNameInput.value.trim();
          formData.companionAge = companionAgeInput.value.trim();
          formData.companionRelationship = companionRelSelect.options[companionRelSelect.selectedIndex].text;
        }

        // URLSearchParams形式に変換（GASで受け取りやすいように）
        const postData = new URLSearchParams();
        for (const key in formData) {
          postData.append(key, formData[key]);
        }

        // GASへの送信
        fetch(GAS_WEB_APP_URL, {
          method: 'POST',
          body: postData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(result => {
          if (result.result === 'success') {
            // 成功モーダルの表示
            modal.classList.add('active');
            form.reset();
            if (companionWrapper) {
              companionWrapper.style.display = 'none';
            }
          } else {
            console.error('GAS Error:', result.error);
            alert('お申し込みの送信に失敗しました。システムエラーが発生した可能性があります。お手数ですが、少し時間をおいてからやり直すか、お問い合わせ窓口まで直接ご連絡ください。');
          }
        })
        .catch(error => {
          console.error('Submission error:', error);
          alert('通信エラーが発生しました。インターネットの接続状況をご確認の上、再度お試しください。');
        })
        .finally(() => {
          // ボタンの状態を復元
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        });
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
