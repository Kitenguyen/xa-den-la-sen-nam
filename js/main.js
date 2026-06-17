// SADU MATE - Landing Page JavaScript
// Vanilla JS - No frameworks

document.addEventListener('DOMContentLoaded', function () {
  initComboSelection();
  initFormSubmission();
  initScrollAnimations();
  initSmoothScroll();
});


// ============ Combo Selection ============
function initComboSelection() {
  const comboCards = document.querySelectorAll('.combo-card');
  const selectedComboInput = document.getElementById('selected-combo');
  const comboCheckboxes = document.querySelectorAll('.combo-checkbox');

  const comboMap = {
    '1': '1 Hộp 150G - 149.000đ (+30.000đ ship)',
    '3': 'COMBO 3 HỘP + TẶNG 1 HỘP - 447.000đ',
    '5': 'COMBO 5 HỘP + TẶNG 2 HỘP - 745.000đ'
  };

  const updateCheckboxUI = function () {
    comboCheckboxes.forEach(input => {
      const item = input.closest('.combo-checkbox-item');
      if (item) {
        item.classList.toggle('selected', input.checked);
      }
    });
  };

  const updateSelectedCombos = function () {
    const selectedValues = Array.from(comboCheckboxes)
      .filter(input => input.checked)
      .map(input => input.value);

    if (selectedComboInput) {
      selectedComboInput.value = selectedValues.join(',');
    }

    updateComboInfo(selectedValues, comboMap);
    updateCheckboxUI();
  };

  const setComboSelection = function (comboValue, checked) {
    comboCheckboxes.forEach(input => {
      if (input.value === comboValue) {
        input.checked = checked;
      }
    });

    comboCards.forEach(card => {
      if (card.getAttribute('data-combo') === comboValue) {
        card.classList.toggle('active', checked);
      }
    });

    updateSelectedCombos();
  };

  comboCards.forEach(card => {
    card.addEventListener('click', function () {
      const comboValue = this.getAttribute('data-combo');
      const checkbox = document.querySelector(`.combo-checkbox[value="${comboValue}"]`);
      const newState = checkbox ? !checkbox.checked : true;
      setComboSelection(comboValue, newState);
    });
  });

  comboCheckboxes.forEach(input => {
    input.addEventListener('change', function () {
      const comboValue = this.value;
      setComboSelection(comboValue, this.checked);
    });
  });

  document.querySelectorAll('.buy-combo-btn').forEach(button => {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const comboValue = this.getAttribute('data-combo');
      setComboSelection(comboValue, true);
      const orderForm = document.getElementById('order-form');
      if (orderForm) {
        orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Set default selection to combo 5
  setComboSelection('5', true);
}

function updateComboInfo(selectedValues, comboMap) {
  const infoText = document.getElementById('combo-info-text');
  if (!infoText) return;

  if (!selectedValues || selectedValues.length === 0) {
    infoText.textContent = 'Chưa chọn combo nào. Vui lòng chọn ít nhất 1 combo.';
    return;
  }

  const selectedLabels = selectedValues.map(value => comboMap[value]).filter(Boolean);
  infoText.textContent = 'Combo đã chọn: ' + selectedLabels.join(' · ');
}

// ============ Form Submission ============
function initFormSubmission() {
  const form = document.getElementById('order-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const phone = document.getElementById('form-phone').value.trim();
      const address = document.getElementById('form-address').value.trim();
      const selectedCombos = Array.from(document.querySelectorAll('.combo-checkbox:checked')).map(input => input.value);

      // Validation
      if (!name || !phone || !address) {
        alert('Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng!');
        return;
      }

      if (selectedCombos.length === 0) {
        alert('Vui lòng chọn ít nhất một combo để đặt hàng!');
        return;
      }

      const comboMap = {
        '1': { label: '1 Hộp 150g (149.000đ + 30.000đ ship)', total: 229000 },
        '3': { label: 'Combo 3 Hộp + Tặng 1', total: 447000 },
        '5': { label: 'Combo 5 Hộp + Tặng 2', total: 745000 }
      };

      const comboText = selectedCombos.map(value => comboMap[value]?.label).filter(Boolean).join(' · ');
      const totalValue = selectedCombos.reduce((sum, value) => sum + (comboMap[value]?.total || 0), 0);
      const total = totalValue.toLocaleString('vi-VN') + 'đ';

      // Show loading/pending state on submit button
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonHTML = submitButton ? submitButton.innerHTML : 'Đang gửi đơn...';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('btn-loading');
        submitButton.innerHTML = 'Đang gửi đơn...';
      }

      fetch(
        'https://script.google.com/macros/s/AKfycbyaRZG7hV2p2Qme3qo0GjyGh0ba-2Dhn5qM1dlp8vWRVQtcfwZzULg__eZPIsNGvvmv/exec',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify({

            name: name,

            phone: phone,

            address: address,

            product: comboText,

            total: total

          })

        })

        .then(response => response.text())

        .then(data => {

          alert(
            `🎉 ĐẶT HÀNG THÀNH CÔNG

Họ tên: ${name}

SĐT: ${phone}

Địa chỉ: ${address}

Sản phẩm: ${comboText}

Tổng thanh toán: ${total}

Chúng tôi sẽ liên hệ xác nhận đơn hàng trong ít phút.`
          );

          form.reset();

        })

        .catch(error => {

          alert(
            'Có lỗi gửi đơn hàng. Vui lòng thử lại.'
          );

          console.error(error);

        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('btn-loading');
            submitButton.innerHTML = originalButtonHTML;
          }
        });


      // Reset combo selection to default
      const defaultCombo = document.querySelector('[data-combo="5"]');
      if (defaultCombo) {
        defaultCombo.click();
      }
    });
  }
}

// ============ Scroll Animations ============
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add animation class
        entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with data-animate attribute
  document.querySelectorAll('[data-animate]').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ============ Smooth Scroll ============
function initSmoothScroll() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Skip if href is just "#"
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ============ Parallax Effect ============
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (parallaxElements.length === 0) return;

  window.addEventListener('scroll', function () {
    parallaxElements.forEach(el => {
      const scrollPosition = window.pageYOffset;
      const elementOffset = el.offsetTop;
      const distance = scrollPosition - elementOffset;
      const parallaxSpeed = el.getAttribute('data-parallax') || 0.5;

      el.style.transform = `translateY(${distance * parallaxSpeed}px)`;
    });
  });
}

// ============ Lazy Load Images ============
function initLazyLoad() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// ============ Mobile Menu (if needed) ============
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('active');
    });

    // Close menu when link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('active');
      });
    });
  }
}

// Initialize all on page load
window.addEventListener('load', function () {
  initParallax();
  initLazyLoad();
  initMobileMenu();
});
function countdown() {

  let end = new Date();

  end.setHours(23, 59, 59);

  setInterval(() => {

    let now = new Date();

    let distance = end - now;

    let h = Math.floor(distance / (1000 * 60 * 60));

    let m = Math.floor(
      (distance % (1000 * 60 * 60)) / (1000 * 60)
    );

    let s = Math.floor(
      (distance % (1000 * 60)) / 1000
    );

    let timer =
      document.getElementById("countdown");

    if (timer) {

      timer.innerHTML =
        h + "h " + m + "m " + s + "s";

    }

  }, 1000);

}

countdown();
function initFakeOrders() {

  const customers = [
    "Hương Nguyễn",
    "Minh Anh",
    "Lan Phương",
    "Đức Thành",
    "Quỳnh Chi",
    "Ngọc Mai",
    "Thu Trang",
    "Hoàng Nam",
    "Thanh Tùng",
    "Kim Oanh",
    "Tuấn Anh",
    "Hà Linh"
  ];

  const products = [
    "1 Hộp 250g",
    "Combo 3 Hộp + Tặng 1",
    "Combo 5 Hộp + Tặng 2"
  ];

  const popup =
    document.getElementById("order-notification");

  const message =
    document.getElementById("order-message");

  function showNotification() {

    const customer =
      customers[Math.floor(Math.random() * customers.length)];

    const product =
      products[Math.floor(Math.random() * products.length)];

    message.innerHTML =
      `🛒 <strong>${customer}</strong><br>vừa đặt <strong>${product}</strong>`;

    popup.classList.add("show");

    setTimeout(() => {
      popup.classList.remove("show");
    }, 5000);
  }

  setTimeout(showNotification, 3000);

  setInterval(showNotification, 12000);
}

initFakeOrders();
function initFeedbackSlider(){

  const slides =
  document.querySelectorAll('.feedback-slide');

  const prev =
  document.querySelector('.feedback-prev');

  const next =
  document.querySelector('.feedback-next');

  if(!slides.length) return;

  let current = 0;

  function showSlide(index){

    slides.forEach(slide =>
      slide.classList.remove('active')
    );

    slides[index].classList.add('active');
  }

  next.addEventListener('click',()=>{

    current++;

    if(current >= slides.length){
      current = 0;
    }

    showSlide(current);

  });

  prev.addEventListener('click',()=>{

    current--;

    if(current < 0){
      current = slides.length - 1;
    }

    showSlide(current);

  });

  setInterval(()=>{

    current++;

    if(current >= slides.length){
      current = 0;
    }

    showSlide(current);

  },3000);

}

window.addEventListener('load',function(){

  initFeedbackSlider();

});