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

  // 5. Booking Form
  const form = document.getElementById('bookingForm');
  const modal = document.getElementById('successModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const participantsSelect = document.getElementById('participants');
  const childrenCountSelect = document.getElementById('children_count');
  const childrenWrapper = document.getElementById('children_wrapper');
  const childrenZeroNote = document.getElementById('childrenZeroNote');

  const RANK_LABELS = ['第1希望', '第2希望', '第3希望'];
  const GRADE_LABELS = {
    '1': '小学1年生', '2': '小学2年生', '3': '小学3年生',
    '4': '小学4年生', '5': '小学5年生', '6': '小学6年生',
    '7': '中学1年生', '8': '中学2年生', '9': '中学3年生'
  };
  // 2人目はGAS側に専用列があるため既存のid（companion_*）を維持している
  const COMPANION_IDS = {
    2: { name: 'companion_name', age: 'companion_age', rel: 'companion_relationship' },
    3: { name: 'companion3_name', age: 'companion3_age', rel: 'companion3_relationship' },
    4: { name: 'companion4_name', age: 'companion4_age', rel: 'companion4_relationship' }
  };

  function participantsCount() {
    return participantsSelect ? parseInt(participantsSelect.value, 10) || 1 : 1;
  }

  // 0 = 講座に参加するお子様なし（未就学児のみのご家庭）。`|| 1` で0が1に化けないよう NaN のときだけ既定値にする
  function childrenCount() {
    if (!childrenCountSelect) return 1;
    const n = parseInt(childrenCountSelect.value, 10);
    return Number.isNaN(n) ? 1 : n;
  }

  // 電話番号の表記ゆれを吸収する（全角数字→半角、ハイフン類・長音・スペース・括弧を除去）
  const PHONE_PATTERN = /^[0-9]{10,13}$/;
  function normalizePhone(value) {
    return value
      .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
      .replace(/[\s　\-‐‑‒–—―−－ーｰ()（）]/g, '');
  }

  // --- 同行者ブロック（2〜4人目）の表示制御 ---
  function updateCompanionBlocks() {
    const n = participantsCount();
    [2, 3, 4].forEach((i) => {
      const block = document.getElementById('companion_block_' + i);
      if (!block) return;
      const show = n >= i;
      block.style.display = show ? 'block' : 'none';
      if (!show) {
        const ids = COMPANION_IDS[i];
        [ids.name, ids.age, ids.rel].forEach((id) => {
          const el = document.getElementById(id);
          if (el) {
            el.value = '';
            clearError(el);
          }
        });
      }
    });
  }
  if (participantsSelect) {
    participantsSelect.addEventListener('change', updateCompanionBlocks);
  }

  // --- お子様ブロック（0〜3人）の表示制御 ---
  function updateChildBlocks() {
    hideCourseNotice();
    const n = childrenCount();
    [1, 2, 3].forEach((i) => {
      const block = document.getElementById('child_block_' + i);
      if (!block) return;
      const show = n >= i;
      block.style.display = show ? 'block' : 'none';
      if (!show) {
        const nameEl = document.getElementById('child' + i + '_name');
        const gradeEl = document.getElementById('child' + i + '_grade');
        if (nameEl) { nameEl.value = ''; clearError(nameEl); }
        if (gradeEl) { gradeEl.value = ''; clearError(gradeEl); }
      }
    });
    // 0人（未就学児のみ）のときは、お子様の入力欄とコース選択をまとめて隠し、選択済みのコースも外す
    const none = n === 0;
    if (childrenWrapper) childrenWrapper.style.display = none ? 'none' : 'block';
    if (courseGroup) courseGroup.style.display = none ? 'none' : 'block';
    if (childrenZeroNote) childrenZeroNote.style.display = none ? 'block' : 'none';
    // コースを選ばないため「第1希望以外のコースになる場合がある」への同意も不要（写真・映像の同意は会場で保護者・乳幼児も写り得るため残す）
    const courseAgree = document.getElementById('course_agree');
    const courseAgreeItem = courseAgree ? courseAgree.closest('.checkbox-item') : null;
    if (courseAgreeItem) courseAgreeItem.style.display = none ? 'none' : 'block';
    if (none && courseAgree) {
      courseAgree.checked = false;
      clearError(courseAgree);
    }
    if (none) {
      courseChecks.forEach((cb) => { cb.checked = false; });
      courseOrder = [];
      setCourseError('');
    }
    const removed = updateCourseEligibility();
    // 2人目・3人目の欄を閉じたことで対象外になったコースがあれば、人数欄の下で知らせる
    if (removed.length > 0 && childrenCountSelect) {
      showCourseNotice(childrenCountSelect.closest('.form-group'), 'beforeend', removedCoursesMessage('お子様の人数を変更したため', removed));
    }
  }
  if (childrenCountSelect) {
    childrenCountSelect.addEventListener('change', updateChildBlocks);
  }

  // --- コース選択（チェック順＝希望順・最大3つ・対象学年フィルタ） ---
  const courseChecks = Array.from(document.querySelectorAll('.course-check'));
  const courseSummary = document.getElementById('courseSummary');
  const courseGroup = document.getElementById('course_group');
  const courseError = document.getElementById('courseError');
  let courseOrder = []; // チェックした順のコース名（先頭が第1希望）

  function selectedGrades() {
    const grades = [];
    const n = childrenCount();
    for (let i = 1; i <= n; i++) {
      const el = document.getElementById('child' + i + '_grade');
      if (el && el.value !== '') grades.push(parseInt(el.value, 10));
    }
    return grades;
  }

  function setCourseError(message) {
    if (!courseGroup || !courseError) return;
    if (message) {
      courseGroup.classList.add('has-error');
      courseError.textContent = message;
    } else {
      courseGroup.classList.remove('has-error');
      courseError.textContent = '';
    }
  }

  /* 学年変更で外れたコース・4つ目の選択の通知は、操作した場所の直下に差し込む
     （courseError はコース欄の端にあり、375px幅ではコース欄が約4,800pxあるため画面外で気づけなかった） */
  const courseNotice = document.createElement('div');
  courseNotice.className = 'course-notice';
  courseNotice.setAttribute('role', 'status');

  function showCourseNotice(anchor, position, message) {
    if (!anchor) return;
    courseNotice.textContent = message;
    anchor.insertAdjacentElement(position, courseNotice);
    courseNotice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideCourseNotice() {
    courseNotice.remove();
  }

  function currentCoursesText() {
    if (courseOrder.length === 0) return '現在選択中のコースはありません。コース一覧から選び直してください。';
    return '現在の選択：' + courseOrder.map((v, i) => RANK_LABELS[i] + ' ' + v).join('／');
  }

  function removedCoursesMessage(reason, removed) {
    return reason + '、対象学年外になった' + removed.join('、') + 'のチェックを外しました。' + currentCoursesText();
  }

  function refreshCourseRanks() {
    courseChecks.forEach((cb) => {
      const option = cb.closest('.course-option');
      if (!option) return;
      const rankEl = option.querySelector('.course-rank');
      const idx = courseOrder.indexOf(cb.value);
      if (rankEl) rankEl.textContent = idx >= 0 ? RANK_LABELS[idx] : '';
      option.classList.toggle('is-selected', idx >= 0);
    });
    if (courseSummary) {
      if (courseOrder.length === 0) {
        courseSummary.classList.remove('active');
        courseSummary.textContent = '';
      } else {
        courseSummary.classList.add('active');
        courseSummary.textContent = 'あなたの選択 ▶ ' + courseOrder.map((v, i) => RANK_LABELS[i] + '：' + v).join(' ／ ');
      }
    }
  }

  // お子様の学年に合わないコースは選択不可にする（学年未選択のうちは全コース選択可）
  // 戻り値：チェックを外したコース（「コース名」（第n希望）の形。通知文に使う）
  function updateCourseEligibility() {
    const grades = selectedGrades();
    const before = courseOrder.slice();
    const removed = [];
    courseChecks.forEach((cb) => {
      const option = cb.closest('.course-option');
      if (!option) return;
      const min = parseInt(option.dataset.min, 10);
      const max = parseInt(option.dataset.max, 10);
      const eligible = grades.length === 0 || grades.some((g) => g >= min && g <= max);
      option.classList.toggle('is-ineligible', !eligible);
      cb.disabled = !eligible;
      if (!eligible && cb.checked) {
        cb.checked = false;
        removed.push('「' + cb.value + '」（' + RANK_LABELS[before.indexOf(cb.value)] + '）');
        courseOrder = courseOrder.filter((v) => v !== cb.value);
      }
    });
    refreshCourseRanks();
    return removed;
  }

  courseChecks.forEach((cb) => {
    cb.addEventListener('change', () => {
      hideCourseNotice();
      if (cb.checked) {
        if (courseOrder.length >= 3) {
          cb.checked = false;
          showCourseNotice(cb.closest('.course-option'), 'afterend',
            '選択できるのは第3希望（3つ）までです。変更する場合は、先にチェックを1つ外してください。' + currentCoursesText());
          return;
        }
        courseOrder.push(cb.value);
        setCourseError('');
      } else {
        courseOrder = courseOrder.filter((v) => v !== cb.value);
        if (courseOrder.length > 0) setCourseError('');
      }
      refreshCourseRanks();
    });
  });

  document.querySelectorAll('.child-grade').forEach((sel) => {
    sel.addEventListener('change', () => {
      hideCourseNotice();
      if (sel.value !== '') clearError(sel);
      const removed = updateCourseEligibility();
      if (removed.length > 0) {
        showCourseNotice(sel.closest('.child-block'), 'afterend', removedCoursesMessage('学年を変更したため', removed));
      }
    });
  });

  // --- 送信処理 ---
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
      phoneInput.value = normalizePhone(phoneInput.value);
      if (phoneInput.value === '') {
        showError(phoneInput, '電話番号を入力してください。');
        isValid = false;
      } else if (!PHONE_PATTERN.test(phoneInput.value)) {
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

      // Validate Companions（表示中のブロックのみ）
      const nParticipants = participantsCount();
      for (let i = 2; i <= 4; i++) {
        if (nParticipants < i) continue;
        const ids = COMPANION_IDS[i];
        const nameEl = document.getElementById(ids.name);
        const ageEl = document.getElementById(ids.age);
        const relEl = document.getElementById(ids.rel);

        if (nameEl) {
          if (nameEl.value.trim() === '') {
            showError(nameEl, '同行者様のお名前を入力してください。');
            isValid = false;
          } else {
            clearError(nameEl);
          }
        }
        if (ageEl) {
          // 未就学児（0歳）も同行できるため0を許容する
          if (ageEl.value.trim() === '') {
            showError(ageEl, '同行者様の年齢を入力してください。');
            isValid = false;
          } else if (isNaN(ageEl.value) || parseInt(ageEl.value) < 0) {
            showError(ageEl, '正しい年齢を入力してください。');
            isValid = false;
          } else {
            clearError(ageEl);
          }
        }
        if (relEl) {
          if (relEl.value === '') {
            showError(relEl, '代表者様との関係を選択してください。');
            isValid = false;
          } else {
            clearError(relEl);
          }
        }
      }

      // Validate Children（表示中のブロックのみ）
      const nChildren = childrenCount();
      for (let i = 1; i <= nChildren; i++) {
        const nameEl = document.getElementById('child' + i + '_name');
        const gradeEl = document.getElementById('child' + i + '_grade');
        if (nameEl) {
          if (nameEl.value.trim() === '') {
            showError(nameEl, 'お子様のお名前を入力してください。');
            isValid = false;
          } else {
            clearError(nameEl);
          }
        }
        if (gradeEl) {
          if (gradeEl.value === '') {
            showError(gradeEl, 'お子様の学年を選択してください。');
            isValid = false;
          } else {
            clearError(gradeEl);
          }
        }
      }

      // Validate Course Wishes（講座に参加するお子様が0人のときは不要）
      if (nChildren > 0 && courseOrder.length === 0) {
        setCourseError('参加を希望するコースを1つ以上選択してください（第3希望までの選択をおすすめします）。');
        isValid = false;
      } else {
        setCourseError('');
      }

      // Validate Tour Selection
      const courseSelect = document.getElementById('tour_course');
      if (courseSelect.value === '') {
        showError(courseSelect, '参加希望ツアーを選択してください。');
        isValid = false;
      } else {
        clearError(courseSelect);
      }

      // Validate Car Count
      const carCountSelect = document.getElementById('car_count');
      if (carCountSelect && carCountSelect.value === '') {
        showError(carCountSelect, '当日お越しになるお車の台数を選択してください。');
        isValid = false;
      } else if (carCountSelect) {
        clearError(carCountSelect);
      }

      // Validate Bento Count
      const bentoCountSelect = document.getElementById('bento_count');
      if (bentoCountSelect && bentoCountSelect.value === '') {
        showError(bentoCountSelect, 'お弁当の注文の有無を選択してください。');
        isValid = false;
      } else if (bentoCountSelect) {
        clearError(bentoCountSelect);
      }

      // Validate Agreements
      const lunchAgree = document.getElementById('lunch_agree');
      const courseAgree = document.getElementById('course_agree');
      const privacyAgree = document.getElementById('privacy_agree');

      if (!lunchAgree.checked) {
        showError(lunchAgree, '昼食・飲み物が各自持参（自己負担）であることへの同意が必要です。');
        isValid = false;
      } else {
        clearError(lunchAgree);
      }

      if (courseAgree && nChildren > 0 && !courseAgree.checked) {
        showError(courseAgree, '第1希望以外のコースになる場合があることへの同意が必要です。');
        isValid = false;
      } else if (courseAgree) {
        clearError(courseAgree);
      }

      if (!privacyAgree.checked) {
        showError(privacyAgree, '個人情報の取扱方針および保険の適用への同意が必要です。');
        isValid = false;
      } else {
        clearError(privacyAgree);
      }

      const kidsUnivMediaAgree = document.getElementById('kids_univ_media_agree');
      if (kidsUnivMediaAgree && !kidsUnivMediaAgree.checked) {
        showError(kidsUnivMediaAgree, 'むなかた子ども大学での写真・映像等の使用と個人情報の取扱いへの同意が必要です。');
        isValid = false;
      } else if (kidsUnivMediaAgree) {
        clearError(kidsUnivMediaAgree);
      }

      if (isValid) {
        const errorSummary = document.getElementById('formErrorSummary');
        if (errorSummary) {
          errorSummary.classList.remove('active');
        }
        const submitButton = form.querySelector('.btn-submit');
        const originalButtonText = submitButton.textContent;

        // 送信中の状態に変更（連打防止）
        submitButton.disabled = true;
        submitButton.textContent = '送信中...';

        /* --- GAS(doPost)への送信データを作成 ---
           2026-08-27 のGAS改修で、コース希望・講座参加のお子様・3人目以降の同行者は
           それぞれ専用パラメータ（専用列 Q〜U）に入る。inquiry は利用者が書いた本文のみを送る。
           今回（11/3開催分）は昼食の事前選択がないため meal_type_* / allergy_* は送らない（GAS側は未送信を空欄として扱う）。 */
        const kidsParts = [];
        for (let i = 1; i <= nChildren; i++) {
          const nameEl = document.getElementById('child' + i + '_name');
          const gradeEl = document.getElementById('child' + i + '_grade');
          if (nameEl && gradeEl && nameEl.value.trim() !== '') {
            kidsParts.push(i + '人目：' + nameEl.value.trim() + '（' + (GRADE_LABELS[gradeEl.value] || '学年未選択') + '）');
          }
        }

        // 3人目以降の同行者（GASの同行者列は2人目までのため専用パラメータで送る）
        const extraCompanions = [];
        for (let i = 3; i <= nParticipants; i++) {
          const ids = COMPANION_IDS[i];
          const nameEl = document.getElementById(ids.name);
          const ageEl = document.getElementById(ids.age);
          const relEl = document.getElementById(ids.rel);
          if (nameEl && nameEl.value.trim() !== '') {
            const relText = (relEl && relEl.selectedIndex >= 0) ? relEl.options[relEl.selectedIndex].text : '';
            extraCompanions.push(i + '人目：' + nameEl.value.trim() + '（' + (ageEl ? ageEl.value : '') + '歳・' + relText + '）');
          }
        }

        const formData = {
          name: nameInput.value.trim(),
          age: ageInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim(),
          address: addressInput.value.trim(),
          participants: participantsSelect ? participantsSelect.value : '1',
          course: courseSelect.options[courseSelect.selectedIndex].text,
          course_wish_1: courseOrder[0] || '',
          course_wish_2: courseOrder[1] || '',
          course_wish_3: courseOrder[2] || '',
          // 0人のときも空欄にせず明示する（シート・通知メールで「未入力」と区別するため）
          children: nChildren === 0 ? '0人（未就学児のみ・講座への参加なし）' : kidsParts.join('／'),
          companions_extra: extraCompanions.join('／'),
          car_count: carCountSelect ? carCountSelect.value : '',
          bento_count: bentoCountSelect ? bentoCountSelect.value : '',
          inquiry: document.getElementById('inquiry').value.trim()
        };

        // 同行者（2人目）はGASの専用列（I〜K列）に格納する
        if (nParticipants >= 2) {
          const nameEl = document.getElementById(COMPANION_IDS[2].name);
          const ageEl = document.getElementById(COMPANION_IDS[2].age);
          const relEl = document.getElementById(COMPANION_IDS[2].rel);
          if (nameEl && ageEl && relEl) {
            formData.companionName = nameEl.value.trim();
            formData.companionAge = ageEl.value.trim();
            formData.companionRelationship = relEl.selectedIndex >= 0 ? relEl.options[relEl.selectedIndex].text : '';
          }
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
            // GA4: 申し込み完了イベントを送信（コンバージョン計測用）
            if (typeof gtag === 'function') {
              gtag('event', 'generate_lead', {
                event_category: 'booking_form',
                event_label: 'tour_application'
              });
            }
            // 成功モーダルの表示
            modal.classList.add('active');
            form.reset();
            courseOrder = [];
            refreshCourseRanks();
            updateCompanionBlocks();
            updateChildBlocks();
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
        // エラーサマリーを表示（未入力箇所が何件あるかを明示し、探す手間をなくす）
        const errorSummary = document.getElementById('formErrorSummary');
        if (errorSummary) {
          const errorCount = document.querySelectorAll('.has-error').length;
          errorSummary.textContent = '入力内容に ' + errorCount + ' 件の未入力・誤りがあります。赤く表示された項目をご確認ください。';
          errorSummary.classList.add('active');
        }
        // Scroll to the first error
        const firstError = document.querySelector('.has-error');
        if (firstError === courseGroup && courseError) {
          // コース欄は縦に長く（375px幅で約4,800px）中央寄せだとエラー文が画面外になるため、
          // 一覧の上にあるエラー文を固定ヘッダーのすぐ下に合わせる
          const top = courseError.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 16;
          window.scrollTo({ top: top, behavior: 'smooth' });
        } else if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

  /* --- リアルタイムバリデーション ---
     入力欄を離れた時点で1項目ずつ検証し、入力を再開したらエラー表示を消す。
     判定ルールは上の submit ハンドラと完全に同一にすること。 */
  if (form) {
    const emailPatternRT = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const blockVisible = (blockId) => {
      const block = document.getElementById(blockId);
      return block && block.style.display !== 'none';
    };

    const validators = {
      name: (el) => el.value.trim() === '' ? 'お名前を入力してください。' : null,
      age: (el) => {
        if (el.value.trim() === '') return '年齢を入力してください。';
        if (isNaN(el.value) || parseInt(el.value) <= 0) return '正しい年齢を入力してください。';
        return null;
      },
      email: (el) => {
        if (el.value.trim() === '') return 'メールアドレスを入力してください。';
        if (!emailPatternRT.test(el.value.trim())) return '有効なメールアドレス形式で入力してください。';
        return null;
      },
      phone: (el) => {
        const v = normalizePhone(el.value);
        if (v === '') return '電話番号を入力してください。';
        if (!PHONE_PATTERN.test(v)) return '有効な電話番号を入力してください。';
        return null;
      },
      address: (el) => el.value.trim() === '' ? 'ご住所を入力してください。' : null
    };

    // 同行者（2〜4人目）：ブロックが表示されているときのみ検証
    [2, 3, 4].forEach((i) => {
      const ids = COMPANION_IDS[i];
      validators[ids.name] = (el) => {
        if (!blockVisible('companion_block_' + i)) return null;
        return el.value.trim() === '' ? '同行者様のお名前を入力してください。' : null;
      };
      validators[ids.age] = (el) => {
        if (!blockVisible('companion_block_' + i)) return null;
        if (el.value.trim() === '') return '同行者様の年齢を入力してください。';
        if (isNaN(el.value) || parseInt(el.value) < 0) return '正しい年齢を入力してください。';
        return null;
      };
    });

    // お子様（1〜3人目）：選択した人数の欄のみ検証（0人のときは全欄対象外）
    [1, 2, 3].forEach((i) => {
      validators['child' + i + '_name'] = (el) => {
        if (childrenCount() < i) return null;
        return el.value.trim() === '' ? 'お子様のお名前を入力してください。' : null;
      };
    });

    // 電話番号は欄を離れた時点で半角数字だけに整えて表示する（下の検証より先に登録すること）
    const phoneEl = document.getElementById('phone');
    if (phoneEl) {
      phoneEl.addEventListener('blur', () => {
        phoneEl.value = normalizePhone(phoneEl.value);
      });
    }

    Object.keys(validators).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      // 入力欄を離れたときに検証（未入力のまま素通りしたことに気づける）
      el.addEventListener('blur', () => {
        const message = validators[id](el);
        if (message) {
          showError(el, message);
        } else {
          clearError(el);
        }
      });
      // 入力を再開したらエラー表示を消す（打ちながら赤いままだと不安になるため）
      el.addEventListener('input', () => {
        if (validators[id](el) === null) {
          clearError(el);
        }
      });
    });

    // セレクトは選択された時点でエラーを解除
    ['tour_course', 'car_count', 'bento_count', 'companion_relationship', 'companion3_relationship', 'companion4_relationship'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => {
        if (el.value !== '') clearError(el);
      });
    });

    // 同意チェックはチェックされた時点でエラーを解除
    ['lunch_agree', 'course_agree', 'privacy_agree', 'kids_univ_media_agree'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => {
        if (el.checked) clearError(el);
      });
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

  // エラーを表示する枠。同意チェックは項目ごとの .checkbox-item に出す
  // （4項目で1つの欄を共有していたため、文言が後の項目で上書きされ、1つ同意しただけで全体の赤表示が消えていた）
  function errorContainer(inputElement) {
    if (inputElement.type === 'checkbox') {
      return inputElement.closest('.checkbox-item') || inputElement.closest('.form-group');
    }
    return inputElement.parentElement;
  }

  function showError(inputElement, message) {
    const formGroup = errorContainer(inputElement);
    formGroup.classList.add('has-error');
    let errorMsg = formGroup.querySelector('.form-error-msg');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'form-error-msg';
      // 補足注記（.form-note）の下に埋もれないよう、入力欄の直下に差し込む。
      // チェックボックスは label に内包されているため、項目の枠の末尾（label の後ろ）に追加する。
      if (inputElement.type === 'checkbox') {
        formGroup.appendChild(errorMsg);
      } else {
        inputElement.insertAdjacentElement('afterend', errorMsg);
      }
    }
    errorMsg.textContent = message;
  }

  function clearError(inputElement) {
    errorContainer(inputElement).classList.remove('has-error');
  }
});
