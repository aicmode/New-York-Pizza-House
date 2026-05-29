/* =========================================
   NEW YORK PIZZA HOUSE — script.js
   ========================================= */

'use strict';

// ─── Cart State ───────────────────────────
const cart = [];

// Pizza image map (emoji fallback for cart)
const PIZZA_EMOJIS = {
  1: '🍕', 2: '🍕', 3: '🍗', 4: '🧀', 5: '🥩', 6: '🍍',
};

// ─── DOM References ───────────────────────
const cartBtn        = document.getElementById('cartBtn');
const cartBadge      = document.getElementById('cartBadge');
const cartPanel      = document.getElementById('cartPanel');
const cartBackdrop   = document.getElementById('cartBackdrop');
const cartClose      = document.getElementById('cartClose');
const cartEmpty      = document.getElementById('cartEmpty');
const cartItemsList  = document.getElementById('cartItems');
const cartFooter     = document.getElementById('cartFooter');
const cartSubtotal   = document.getElementById('cartSubtotal');
const cartTotal      = document.getElementById('cartTotal');
const checkoutBtn    = document.getElementById('checkoutBtn');
const continueShopping = document.getElementById('continueShopping');

const modalBackdrop  = document.getElementById('modalBackdrop');
const checkoutModal  = document.getElementById('checkoutModal');
const modalClose     = document.getElementById('modalClose');
const checkoutForm   = document.getElementById('checkoutForm');
const modalInner     = document.getElementById('modalInner');
const orderConfirm   = document.getElementById('orderConfirm');
const formOrderItems = document.getElementById('formOrderItems');
const formOrderTotal = document.getElementById('formOrderTotal');
const confirmOrderId = document.getElementById('confirmOrderId');
const confirmClose   = document.getElementById('confirmClose');

const toast          = document.getElementById('toast');
const hamburger      = document.getElementById('hamburger');
const nav            = document.getElementById('nav');
const header         = document.getElementById('header');

// ─── Cart: Open / Close ───────────────────
function openCart() {
  cartPanel.classList.add('open');
  cartBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartPanel.classList.remove('open');
  cartBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);
continueShopping.addEventListener('click', closeCart);

// ─── Add To Cart ──────────────────────────
function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  renderCart();
  bumpBadge();
  showToast(`🍕 ${name} をカートに追加しました`);
  openCart();
}

// ─── Qty Controls ─────────────────────────
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeItem(id);
  else renderCart();
}

function removeItem(id) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx !== -1) cart.splice(idx, 1);
  renderCart();
}

// ─── Render Cart ──────────────────────────
function renderCart() {
  // Badge
  const total = cart.reduce((s, i) => s + i.qty, 0);
  cartBadge.textContent = total;

  // Empty state
  if (cart.length === 0) {
    cartEmpty.style.display = 'block';
    cartItemsList.style.display = 'none';
    cartFooter.style.display = 'none';
    cartSubtotal.textContent = '¥0';
    cartTotal.textContent = '¥0';
    return;
  }

  cartEmpty.style.display = 'none';
  cartItemsList.style.display = 'flex';
  cartFooter.style.display = 'block';

  // Items
  cartItemsList.innerHTML = cart.map(item => `
    <li class="cart-item">
      <div class="cart-item-img">${PIZZA_EMOJIS[item.id] || '🍕'}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">¥${item.price.toLocaleString()}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)" aria-label="数量を減らす">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)" aria-label="数量を増やす">＋</button>
          <span style="flex:1"></span>
          <span class="cart-item-subtotal" style="font-size:0.88rem;color:rgba(255,255,255,0.5)">
            ¥${(item.price * item.qty).toLocaleString()}
          </span>
        </div>
      </div>
      <button class="cart-item-del" onclick="removeItem(${item.id})" aria-label="削除">✕</button>
    </li>
  `).join('');

  // Totals
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping  = 300;
  cartSubtotal.textContent = `¥${subtotal.toLocaleString()}`;
  cartTotal.textContent    = `¥${(subtotal + shipping).toLocaleString()}`;
}

// ─── Badge Bump Animation ─────────────────
function bumpBadge() {
  cartBadge.classList.remove('bump');
  void cartBadge.offsetWidth;
  cartBadge.classList.add('bump');
  setTimeout(() => cartBadge.classList.remove('bump'), 400);
}

// ─── Toast ────────────────────────────────
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// ─── Checkout: Open ───────────────────────
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) return;
  populateOrderSummary();
  closeCart();
  setTimeout(openCheckout, 350);
});

function openCheckout() {
  modalBackdrop.classList.add('open');
  checkoutModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Reset to form view
  modalInner.style.display = 'block';
  orderConfirm.style.display = 'none';
}

function closeCheckout() {
  modalBackdrop.classList.remove('open');
  checkoutModal.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeCheckout);
modalBackdrop.addEventListener('click', closeCheckout);

confirmClose.addEventListener('click', () => {
  closeCheckout();
  // Clear cart after order
  cart.length = 0;
  renderCart();
});

// ─── Populate form order summary ──────────
function populateOrderSummary() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping  = 300;
  formOrderItems.innerHTML = cart.map(item => `
    <div class="fos-item">
      <span>${item.name} × ${item.qty}</span>
      <span>¥${(item.price * item.qty).toLocaleString()}</span>
    </div>
  `).join('') + `
    <div class="fos-item">
      <span>配送料</span>
      <span>¥300</span>
    </div>
  `;
  formOrderTotal.textContent = `¥${(subtotal + shipping).toLocaleString()}`;
}

// ─── Checkout Form Submit ─────────────────
checkoutForm.addEventListener('submit', e => {
  e.preventDefault();

  if (!validateForm()) return;

  // Simulate processing
  const submitBtn = checkoutForm.querySelector('.submit-order-btn');
  submitBtn.textContent = '処理中…';
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.textContent = '注文を確定する';
    submitBtn.disabled = false;

    // Generate order ID
    const orderId = 'NYP-' + Date.now().toString(36).toUpperCase();
    confirmOrderId.textContent = orderId;

    // Show confirmation
    modalInner.style.display = 'none';
    orderConfirm.style.display = 'block';

    // Reset form
    checkoutForm.reset();
  }, 1200);
});

function validateForm() {
  const fname   = document.getElementById('fname').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const email   = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();

  if (!fname)   { focusError('fname',   'お名前を入力してください。');    return false; }
  if (!phone)   { focusError('phone',   '電話番号を入力してください。');   return false; }
  if (!email || !email.includes('@')) {
                  focusError('email',   '正しいメールアドレスを入力してください。'); return false;
  }
  if (!address) { focusError('address', '配送先住所を入力してください。'); return false; }
  return true;
}

function focusError(fieldId, msg) {
  const el = document.getElementById(fieldId);
  el.focus();
  el.style.borderColor = '#c0392b';
  el.style.boxShadow = '0 0 0 3px rgba(192,57,43,0.25)';
  showToast('⚠️ ' + msg);
  el.addEventListener('input', () => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  }, { once: true });
}

// ─── Header scroll effect ─────────────────
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── Hamburger ────────────────────────────
hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
});

// Close nav when a link is clicked
nav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ─── Scroll Reveal ────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function addRevealClasses() {
  // Section headers
  document.querySelectorAll('.section-header').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // Pizza cards
  document.querySelectorAll('.pizza-card').forEach((el, i) => {
    el.classList.add('reveal', `reveal-delay-${(i % 3) + 1}`);
    revealObserver.observe(el);
  });

  // Why cards
  document.querySelectorAll('.why-card').forEach((el, i) => {
    el.classList.add('reveal', `reveal-delay-${i + 1}`);
    revealObserver.observe(el);
  });

  // Review cards
  document.querySelectorAll('.review-card').forEach((el, i) => {
    el.classList.add('reveal', `reveal-delay-${i + 1}`);
    revealObserver.observe(el);
  });

  // Gallery items
  document.querySelectorAll('.gallery-item').forEach((el, i) => {
    el.classList.add('reveal', `reveal-delay-${(i % 3) + 1}`);
    revealObserver.observe(el);
  });

  // Offer content
  const offerContent = document.querySelector('.offer-content');
  if (offerContent) {
    offerContent.classList.add('reveal');
    revealObserver.observe(offerContent);
  }

  // Rating bars
  const rbarObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.rbar-fill').forEach(bar => {
          bar.classList.add('visible');
        });
        rbarObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const ratingsEl = document.querySelector('.reviews-rating-bar');
  if (ratingsEl) rbarObserver.observe(ratingsEl);
}

// ─── Smooth scroll for anchor links ───────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── Init ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  addRevealClasses();

  // Keyboard accessibility: close modals with Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (checkoutModal.classList.contains('open')) closeCheckout();
      else if (cartPanel.classList.contains('open'))  closeCart();
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
      }
    }
  });
});
