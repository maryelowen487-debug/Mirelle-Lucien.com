/**
 * ============================================================================
 * MIRELLE LUCIEN — STRATEGIC GRANT CONSULTING
 * Client-side interactive script (Navigation, Accordion, Animated Counters, Form)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. MOBILE DRAWER NAVIGATION
  // --------------------------------------------------------------------------
  const mobileMenuOpenBtn = document.getElementById('mobileMenuOpen');
  const mobileMenuCloseBtn = document.getElementById('mobileMenuClose');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileOverlay = document.getElementById('mobileDrawerOverlay');

  function openMobileMenu() {
    if (mobileDrawer && mobileOverlay) {
      mobileDrawer.classList.add('active');
      mobileOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (mobileMenuOpenBtn) {
        mobileMenuOpenBtn.setAttribute('aria-expanded', 'true');
      }
    }
  }

  function closeMobileMenu() {
    if (mobileDrawer && mobileOverlay) {
      mobileDrawer.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
      if (mobileMenuOpenBtn) {
        mobileMenuOpenBtn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  if (mobileMenuOpenBtn) {
    mobileMenuOpenBtn.addEventListener('click', openMobileMenu);
  }

  if (mobileMenuCloseBtn) {
    mobileMenuCloseBtn.addEventListener('click', closeMobileMenu);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close drawer on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // --------------------------------------------------------------------------
  // 2. STICKY HEADER SHADOW ON SCROLL
  // --------------------------------------------------------------------------
  const siteHeader = document.getElementById('siteHeader');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 3. STATS NUMBER COUNTER (Intersection Observer)
  // --------------------------------------------------------------------------
  const statNumbers = document.querySelectorAll('.stat-big-number');
  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetValue = parseFloat(el.getAttribute('data-target'));
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const isDecimal = String(targetValue).includes('.');
          const duration = 1600; // ms
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = targetValue * easeProgress;

            if (isDecimal) {
              el.textContent = `${prefix}${current.toFixed(1)}${suffix}`;
            } else {
              el.textContent = `${prefix}${Math.floor(current)}${suffix}`;
            }

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = `${prefix}${targetValue}${suffix}`;
            }
          }

          requestAnimationFrame(updateCounter);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    statNumbers.forEach((el) => statObserver.observe(el));
  }

  // --------------------------------------------------------------------------
  // 4. FAQ ACCORDION INTERACTIVITY (Services Page)
  // --------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const btn = item.querySelector('.faq-question-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          // Close other open items
          faqItems.forEach((sibling) => {
            sibling.classList.remove('active');
          });
          // Toggle clicked item
          if (!isActive) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. CONSULTATION FORM & PRE-FILL HANDLING (Contact Page)
  // --------------------------------------------------------------------------
  const consultationForm = document.getElementById('consultationForm');
  const serviceSelect = document.getElementById('serviceSelect');
  const formAlertSuccess = document.getElementById('formAlertSuccess');
  const submitBtn = document.getElementById('submitBtn');

  // Pre-fill service dropdown if query parameter is present (e.g. ?service=writing)
  if (serviceSelect) {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
      const matchingOption = serviceSelect.querySelector(`option[value="${CSS.escape(serviceParam)}"]`);
      if (matchingOption) {
        serviceSelect.value = serviceParam;
      }
    }
  }

  if (consultationForm) {
    consultationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Processing Request...</span>';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          if (formAlertSuccess) {
            formAlertSuccess.classList.add('active');
            formAlertSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          consultationForm.reset();
        }, 800);
      }
    });
  }
});
