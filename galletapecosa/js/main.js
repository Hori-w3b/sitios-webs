// ============================================================
// DOLCE INCONTRO — main.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      navToggle.classList.toggle('active');
    });
    mainNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mainNav.classList.remove('open'));
    });
  }

  /* ---------- Header shadow on scroll (subtle) ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 20 ? '0 8px 24px rgba(0,0,0,.35)' : 'none';
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Page transition (fade on internal link click) ---------- */
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (link.target === '_blank' || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      document.body.classList.add('page-out');
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });

  /* ---------- MENU: category tab filter ---------- */
  const tabs = document.querySelectorAll('.menu-tab');
  const cards = document.querySelectorAll('.menu-card');
  if (tabs.length && cards.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.cat;
        cards.forEach(card => {
          const match = cat === 'todos' || card.dataset.cat === cat;
          if (match) {
            card.classList.remove('hide');
          } else {
            card.classList.add('hide');
          }
        });
      });
    });
  }

  /* ---------- UBICACIONES: click a card, switch detail panel ---------- */
  const locCards = document.querySelectorAll('.loc-card');
  const detailPanel = document.getElementById('locDetail');
  if (locCards.length && detailPanel) {
    const setDetail = (card) => {
      locCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const { name, address, hours, phone, img } = card.dataset;
      detailPanel.style.opacity = 0;
      setTimeout(() => {
        detailPanel.querySelector('.loc-detail-name').textContent = name;
        detailPanel.querySelector('.loc-detail-address').textContent = address;
        detailPanel.querySelector('.loc-detail-hours').textContent = hours;
        detailPanel.querySelector('.loc-detail-phone').textContent = phone;
        detailPanel.querySelector('img').src = img;
        detailPanel.style.opacity = 1;
      }, 220);
    };
    locCards.forEach(card => card.addEventListener('click', () => setDetail(card)));
  }

  /* ---------- RESEÑAS: coverflow carousel ---------- */
  const cfTrack = document.querySelector('.coverflow-track');
  if (cfTrack) {
    const items = Array.from(cfTrack.querySelectorAll('.cf-item'));
    const dots = document.querySelectorAll('.cf-dots span');
    let current = 0;

    function render() {
      items.forEach((item, i) => {
        const offset = i - current;
        let translateX = offset * 190;
        let scale = 1;
        let z = 10 - Math.abs(offset);
        let opacity = 1;
        let rotate = offset * -18;

        if (Math.abs(offset) > 2) opacity = 0;
        if (offset === 0) { scale = 1.15; rotate = 0; z = 20; }
        else { scale = 0.82; }

        item.style.transform = `translateX(${translateX}px) scale(${scale}) rotateY(${rotate}deg)`;
        item.style.zIndex = z;
        item.style.opacity = opacity;
        item.style.filter = offset === 0 ? 'none' : 'brightness(.55)';
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function go(dir) {
      current = (current + dir + items.length) % items.length;
      render();
    }

    document.querySelector('.cf-next')?.addEventListener('click', () => go(1));
    document.querySelector('.cf-prev')?.addEventListener('click', () => go(-1));
    items.forEach((item, i) => {
      item.addEventListener('click', () => {
        if (i === current) return;
        current = i;
        render();
      });
    });
    dots.forEach((d, i) => d.addEventListener('click', () => { current = i; render(); }));

    // swipe support
    let startX = 0;
    cfTrack.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    cfTrack.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > 40) go(-1);
      else if (diff < -40) go(1);
    });

    render();

    // autoplay
    let auto = setInterval(() => go(1), 5000);
    cfTrack.addEventListener('mouseenter', () => clearInterval(auto));
    cfTrack.addEventListener('mouseleave', () => auto = setInterval(() => go(1), 5000));
  }

  /* ---------- RESEÑAS: reviews carousel (drag + swipe + arrows) ---------- */
  const reviewsTrack = document.getElementById('reviewsTrack');
  if (reviewsTrack) {
    const scrollStep = () => {
      const card = reviewsTrack.querySelector('.review-card');
      if (!card) return 300;
      const style = getComputedStyle(reviewsTrack);
      return card.getBoundingClientRect().width + parseFloat(style.gap || 22);
    };

    document.querySelector('.rv-next')?.addEventListener('click', () => {
      reviewsTrack.scrollBy({ left: scrollStep(), behavior: 'smooth' });
    });
    document.querySelector('.rv-prev')?.addEventListener('click', () => {
      reviewsTrack.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
    });

    // Pointer drag-to-scroll for mouse/trackpad users
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let dragged = false;

    reviewsTrack.addEventListener('pointerdown', (e) => {
      isDown = true;
      dragged = false;
      reviewsTrack.classList.add('dragging');
      startX = e.clientX;
      startScroll = reviewsTrack.scrollLeft;
      reviewsTrack.setPointerCapture(e.pointerId);
    });
    reviewsTrack.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const diff = e.clientX - startX;
      if (Math.abs(diff) > 4) dragged = true;
      reviewsTrack.scrollLeft = startScroll - diff;
    });
    const endDrag = () => {
      isDown = false;
      reviewsTrack.classList.remove('dragging');
    };
    reviewsTrack.addEventListener('pointerup', endDrag);
    reviewsTrack.addEventListener('pointerleave', endDrag);
    reviewsTrack.addEventListener('pointercancel', endDrag);

    // Prevent a stray click (e.g. on links inside a card) right after a drag
    reviewsTrack.addEventListener('click', (e) => {
      if (dragged) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* ---------- CONTACTO: form submit feedback ---------- */
  const contactForm = document.querySelector('.contact-form');
  const toast = document.querySelector('.toast');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (toast) {
        toast.textContent = '¡Gracias! Tu mensaje ha sido enviado.';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
      }
      contactForm.reset();
    });
  }

});
