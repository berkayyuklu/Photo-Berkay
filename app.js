/* ═══════════════════════════════════════════════
   Photo Berkay — app.js
   Firebase Firestore + Auth logic
═══════════════════════════════════════════════ */

// ── Wait for Firebase to initialise ─────────────
let _selectedRating = 5;
let _contactFields = [];

function waitFb(cb) {
  if (window._fb) cb();
  else setTimeout(() => waitFb(cb), 80);
}

// ── Particles Canvas ─────────────────────────────
(function initParticles() {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let W, H, pts = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function mkPt() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + .4,
      vx: (Math.random() - .5) * .3,
      vy: (Math.random() - .5) * .3,
      a: Math.random() * .6 + .1
    };
  }

  for (let i = 0; i < 80; i++) pts.push(mkPt());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const teal = "rgba(0,201,167,";
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = teal + p.a + ")";
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    // lines
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = teal + ((1 - d / 120) * .15) + ")";
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Counter Animation ────────────────────────────
function animateCounters() {
  document.querySelectorAll(".stat-num").forEach(el => {
    const target = +el.dataset.target;
    let cur = 0;
    const step = Math.ceil(target / 40);
    const iv = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(iv);
    }, 40);
  });
}
setTimeout(animateCounters, 600);

// ── Theme Toggle ─────────────────────────────────
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
let dark = true;

themeToggle.addEventListener("click", () => {
  dark = !dark;
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  themeIcon.className = dark ? "fa-solid fa-moon" : "fa-solid fa-sun";
});

// ── Mobile Menu ──────────────────────────────────
function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("open");
}
document.querySelectorAll(".nav-link").forEach(l => l.addEventListener("click", () => {
  document.getElementById("navLinks").classList.remove("open");
}));

// ── Navbar scroll ────────────────────────────────
window.addEventListener("scroll", () => {
  document.getElementById("navbar").style.boxShadow =
    window.scrollY > 30 ? "0 2px 30px rgba(0,0,0,.4)" : "";
});

// ── Toast ────────────────────────────────────────
function showToast(msg, duration = 2800) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), duration);
}

// ── Modal helpers ────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }
window.openModal = openModal;
window.closeModal = closeModal;

// ── Auth Modal ───────────────────────────────────
window.openAuthModal = function () {
  if (window._currentUser) {
    window._fb.signOut(window._fb.auth).then(() => showToast("Çıkış yapıldı."));
  } else {
    openModal("authModal");
  }
};

window.loginEmail = async function () {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;
  const err = document.getElementById("loginError");
  err.textContent = "";
  try {
    await window._fb.signInWithEmailAndPassword(window._fb.auth, email, pass);
    closeModal("authModal");
    showToast("Giriş başarılı! 👋");
  } catch (e) {
    err.textContent = "E-posta veya şifre hatalı.";
  }
};

window.loginGoogle = async function () {
  try {
    await window._fb.signInWithPopup(window._fb.auth, window._fb.googleProvider);
    closeModal("authModal");
    showToast("Google ile giriş yapıldı!");
  } catch (e) {
    document.getElementById("loginError").textContent = "Google girişi başarısız.";
  }
};

// ── Bubble animation ─────────────────────────────
function launchBubbles(cb) {
  const container = document.createElement("div");
  container.className = "bubble-container";
  document.body.appendChild(container);

  for (let i = 0; i < 18; i++) {
    const b = document.createElement("div");
    b.className = "bubble";
    const size = Math.random() * 60 + 20;
    b.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 1.5 + 1}s;
      animation-delay:${Math.random() * .4}s;
    `;
    container.appendChild(b);
  }

  setTimeout(() => {
    container.remove();
    if (cb) cb();
  }, 700);
}

// ── Plan Detail Modal ────────────────────────────
window.openPlanDetail = function (plan) {
  launchBubbles(() => {
    const cont = document.getElementById("planDetailContent");
    const featuresHtml = (plan.features || [])
      .map(f => `<li>${f}</li>`)
      .join("");
    cont.innerHTML = `
      <button class="modal-close" onclick="closeModal('planDetailModal')"><i class="fa-solid fa-xmark"></i></button>
      <div class="plan-detail-header">
        ${plan.badge ? `<div class="plan-badge">${plan.badge}</div>` : ""}
        <h2>${plan.name}</h2>
        <p style="color:var(--text-2);font-size:.9rem;margin:.5rem 0 1rem;">${plan.desc || ""}</p>
        <div class="plan-detail-price">₺${Number(plan.price).toLocaleString("tr-TR")}<span class="price-label"> ${plan.priceLabel || "/ aylık"}</span></div>
      </div>
      <ul class="plan-detail-features">${featuresHtml}</ul>
      <p style="margin-top:1.5rem;color:var(--text-3);font-size:.82rem;text-align:center;">
        Bu plan hakkında bilgi almak için <a href="#contact" onclick="closeModal('planDetailModal')" style="color:var(--teal);">iletişime geçin</a>.
      </p>
    `;
    openModal("planDetailModal");
  });
};

// ─────────────────────────────────────────────────
// ── FIRESTORE: PLANS ─────────────────────────────
// ─────────────────────────────────────────────────
function renderPlans(plans) {
  const grid = document.getElementById("plansGrid");
  if (!plans.length) {
    grid.innerHTML = `<p style="color:var(--text-3);text-align:center;grid-column:1/-1;">Henüz plan eklenmemiş.</p>`;
    return;
  }
  grid.innerHTML = plans.map(p => {
    const isAdmin = window._currentUser && window._currentUser.email === window._fb.ADMIN_EMAIL;
    return `
    <div class="plan-card color-${p.color || "teal"}" onclick="openPlanDetail(${JSON.stringify(p).replace(/"/g, '&quot;')})">
      ${p.badge ? `<div class="plan-badge">${p.badge}</div>` : ""}
      <div class="plan-name">${p.name}</div>
      <div class="plan-desc">${p.desc || ""}</div>
      <div class="plan-price">₺${Number(p.price).toLocaleString("tr-TR")}<span class="price-label"> ${p.priceLabel || "/ aylık"}</span></div>
      <ul class="plan-features">
        ${(p.features || []).slice(0, 5).map(f => `<li>${f}</li>`).join("")}
        ${(p.features || []).length > 5 ? `<li style="color:var(--teal);">+${(p.features.length - 5)} daha...</li>` : ""}
      </ul>
      <button class="plan-cta-btn" onclick="event.stopPropagation();openPlanDetail(${JSON.stringify(p).replace(/"/g, '&quot;')})">
        Detayları Gör <i class="fa-solid fa-arrow-right"></i>
      </button>
      ${isAdmin ? `<button class="plan-edit-btn admin-only" onclick="event.stopPropagation();openPlanModal('${p.id}')"><i class="fa-solid fa-pen"></i> Düzenle</button>` : ""}
    </div>
  `;
  }).join("");
}

function loadPlans() {
  waitFb(() => {
    const { db, collection, onSnapshot } = window._fb;
    onSnapshot(collection(db, "plans"), snap => {
      const plans = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      renderPlans(plans);
    });
  });
}

window.openPlanModal = function (id = null) {
  document.getElementById("planModalTitle").textContent = id ? "Plan Düzenle" : "Yeni Plan Ekle";
  document.getElementById("planEditId").value = id || "";
  document.getElementById("planDeleteBtn").style.display = id ? "" : "none";
  document.getElementById("planError").textContent = "";

  if (id) {
    waitFb(async () => {
      const { db, doc, getDoc } = window._fb;
      const snap = await getDoc(doc(db, "plans", id));
      if (snap.exists()) {
        const d = snap.data();
        document.getElementById("planName").value = d.name || "";
        document.getElementById("planPrice").value = d.price || "";
        document.getElementById("planPriceLabel").value = d.priceLabel || "";
        document.getElementById("planDesc").value = d.desc || "";
        document.getElementById("planFeatures").value = (d.features || []).join("\n");
        document.getElementById("planColor").value = d.color || "teal";
        document.getElementById("planBadge").value = d.badge || "";
        document.getElementById("planOrder").value = d.order || "";
      }
    });
  } else {
    ["planName","planPrice","planPriceLabel","planDesc","planFeatures","planBadge","planOrder"].forEach(id => {
      document.getElementById(id).value = "";
    });
    document.getElementById("planColor").value = "teal";
  }
  openModal("planModal");
};

window.savePlan = async function () {
  const { db, doc, setDoc, addDoc, collection, serverTimestamp } = window._fb;
  const id = document.getElementById("planEditId").value;
  const data = {
    name: document.getElementById("planName").value.trim(),
    price: +document.getElementById("planPrice").value,
    priceLabel: document.getElementById("planPriceLabel").value.trim(),
    desc: document.getElementById("planDesc").value.trim(),
    features: document.getElementById("planFeatures").value.split("\n").filter(Boolean),
    color: document.getElementById("planColor").value,
    badge: document.getElementById("planBadge").value.trim(),
    order: +document.getElementById("planOrder").value || 0,
    updatedAt: serverTimestamp()
  };
  if (!data.name || !data.price) {
    document.getElementById("planError").textContent = "Plan adı ve fiyat zorunludur.";
    return;
  }
  try {
    if (id) await setDoc(doc(db, "plans", id), data, { merge: true });
    else await addDoc(collection(db, "plans"), { ...data, createdAt: serverTimestamp() });
    closeModal("planModal");
    showToast(id ? "Plan güncellendi ✓" : "Plan eklendi ✓");
  } catch (e) {
    document.getElementById("planError").textContent = "Hata: " + e.message;
  }
};

window.deletePlan = async function () {
  const id = document.getElementById("planEditId").value;
  if (!id || !confirm("Planı silmek istediğinize emin misiniz?")) return;
  await window._fb.deleteDoc(window._fb.doc(window._fb.db, "plans", id));
  closeModal("planModal");
  showToast("Plan silindi.");
};

// ─────────────────────────────────────────────────
// ── FIRESTORE: EXTRAS ────────────────────────────
// ─────────────────────────────────────────────────
function renderExtras(extras) {
  const grid = document.getElementById("extrasGrid");
  if (!extras.length) {
    grid.innerHTML = `<p style="color:var(--text-3);text-align:center;grid-column:1/-1;">Henüz ekstra hizmet eklenmemiş.</p>`;
    return;
  }
  const isAdmin = window._currentUser && window._currentUser.email === window._fb.ADMIN_EMAIL;
  grid.innerHTML = extras.map(e => `
    <div class="extra-card">
      <div class="extra-icon"><i class="fa-solid ${e.icon || "fa-star"}"></i></div>
      <div class="extra-name">${e.name}</div>
      <div class="extra-desc">${e.desc || ""}</div>
      <div class="extra-price">₺${Number(e.price).toLocaleString("tr-TR")}<span class="price-label"> ${e.priceLabel || "/ seans"}</span></div>
      ${isAdmin ? `<button class="extra-edit-btn admin-only" onclick="openExtraModal('${e.id}')"><i class="fa-solid fa-pen"></i> Düzenle</button>` : ""}
    </div>
  `).join("");
}

function loadExtras() {
  waitFb(() => {
    const { db, collection, onSnapshot } = window._fb;
    onSnapshot(collection(db, "extras"), snap => {
      const extras = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      renderExtras(extras);
    });
  });
}

window.openExtraModal = function (id = null) {
  document.getElementById("extraModalTitle").textContent = id ? "Ekstra Düzenle" : "Yeni Ekstra Hizmet Ekle";
  document.getElementById("extraEditId").value = id || "";
  document.getElementById("extraDeleteBtn").style.display = id ? "" : "none";
  document.getElementById("extraError").textContent = "";

  if (id) {
    waitFb(async () => {
      const { db, doc, getDoc } = window._fb;
      const snap = await getDoc(doc(db, "extras", id));
      if (snap.exists()) {
        const d = snap.data();
        document.getElementById("extraName").value = d.name || "";
        document.getElementById("extraPrice").value = d.price || "";
        document.getElementById("extraPriceLabel").value = d.priceLabel || "";
        document.getElementById("extraDesc").value = d.desc || "";
        document.getElementById("extraIcon").value = d.icon || "";
        document.getElementById("extraOrder").value = d.order || "";
      }
    });
  } else {
    ["extraName","extraPrice","extraPriceLabel","extraDesc","extraIcon","extraOrder"].forEach(id => {
      document.getElementById(id).value = "";
    });
  }
  openModal("extraModal");
};

window.saveExtra = async function () {
  const { db, doc, setDoc, addDoc, collection, serverTimestamp } = window._fb;
  const id = document.getElementById("extraEditId").value;
  const data = {
    name: document.getElementById("extraName").value.trim(),
    price: +document.getElementById("extraPrice").value,
    priceLabel: document.getElementById("extraPriceLabel").value.trim(),
    desc: document.getElementById("extraDesc").value.trim(),
    icon: document.getElementById("extraIcon").value.trim(),
    order: +document.getElementById("extraOrder").value || 0,
    updatedAt: serverTimestamp()
  };
  if (!data.name || !data.price) {
    document.getElementById("extraError").textContent = "Ad ve fiyat zorunludur.";
    return;
  }
  try {
    if (id) await setDoc(doc(db, "extras", id), data, { merge: true });
    else await addDoc(collection(db, "extras"), { ...data, createdAt: serverTimestamp() });
    closeModal("extraModal");
    showToast(id ? "Güncellendi ✓" : "Eklendi ✓");
  } catch (e) {
    document.getElementById("extraError").textContent = "Hata: " + e.message;
  }
};

window.deleteExtra = async function () {
  const id = document.getElementById("extraEditId").value;
  if (!id || !confirm("Silmek istediğinize emin misiniz?")) return;
  await window._fb.deleteDoc(window._fb.doc(window._fb.db, "extras", id));
  closeModal("extraModal");
  showToast("Silindi.");
};

// ─────────────────────────────────────────────────
// ── FIRESTORE: ABOUT ─────────────────────────────
// ─────────────────────────────────────────────────
function loadAbout() {
  waitFb(async () => {
    const { db, doc, getDoc } = window._fb;
    const snap = await getDoc(doc(db, "settings", "about"));
    const data = snap.exists() ? snap.data() : {
      bio: "Merhaba, ben Berkay Yüklü. Sosyal medya yönetimi, drone çekimi ve profesyonel içerik üretimi konularında hizmet veriyorum. İşletmenizin dijital dünyada öne çıkması için çalışıyorum.",
      skills: ["Reels Çekimi", "Drone", "Fotoğrafçılık", "Video Kurgu", "Instagram Yönetimi", "İçerik Stratejisi"]
    };
    document.getElementById("aboutBio").textContent = data.bio;
    document.getElementById("aboutSkills").innerHTML = (data.skills || [])
      .map(s => `<span class="skill-tag">${s}</span>`).join("");
  });
}

window.openAboutModal = function () {
  waitFb(async () => {
    const { db, doc, getDoc } = window._fb;
    const snap = await getDoc(doc(db, "settings", "about"));
    const data = snap.exists() ? snap.data() : {};
    document.getElementById("editBio").value = data.bio || "";
    document.getElementById("editSkills").value = (data.skills || []).join(", ");
    openModal("aboutModal");
  });
};

window.saveAbout = async function () {
  const { db, doc, setDoc } = window._fb;
  const bio = document.getElementById("editBio").value.trim();
  const skills = document.getElementById("editSkills").value.split(",").map(s => s.trim()).filter(Boolean);
  await setDoc(doc(db, "settings", "about"), { bio, skills });
  closeModal("aboutModal");
  loadAbout();
  showToast("Hakkında güncellendi ✓");
};

// ─────────────────────────────────────────────────
// ── FIRESTORE: CONTACT ────────────────────────────
// ─────────────────────────────────────────────────
const defaultContact = [
  { icon: "fa-envelope", label: "E-posta", value: "yukluberkay@gmail.com", href: "mailto:yukluberkay@gmail.com" },
  { icon: "fa-phone", label: "Telefon", value: "0551 153 72 13", href: "tel:+905511537213" },
  { icon: "fa-brands fa-instagram", label: "Instagram", value: "@berkay_yuklu", href: "https://instagram.com/berkay_yuklu" }
];

function renderContact(fields) {
  const grid = document.getElementById("contactGrid");
  grid.innerHTML = fields.map(f => `
    <a class="contact-card" href="${f.href || '#'}" target="_blank" rel="noopener">
      <div class="contact-icon"><i class="fa-solid ${f.icon}"></i></div>
      <div>
        <div class="contact-label">${f.label}</div>
        <div class="contact-value">${f.value}</div>
      </div>
    </a>
  `).join("");
}

function loadContact() {
  waitFb(async () => {
    const { db, doc, getDoc } = window._fb;
    const snap = await getDoc(doc(db, "settings", "contact"));
    const data = snap.exists() ? snap.data() : { fields: defaultContact };
    renderContact(data.fields || defaultContact);
  });
}

window.openContactModal = function () {
  waitFb(async () => {
    const { db, doc, getDoc } = window._fb;
    const snap = await getDoc(doc(db, "settings", "contact"));
    _contactFields = snap.exists() ? [...(snap.data().fields || [])] : [...defaultContact];
    renderContactEditFields();
    openModal("contactModal");
  });
};

function renderContactEditFields() {
  const container = document.getElementById("contactEditFields");
  container.innerHTML = _contactFields.map((f, i) => `
    <div class="contact-edit-row" data-index="${i}">
      <input type="text" class="form-input" placeholder="İkon (fa-...)" value="${f.icon || ""}" oninput="updateCF(${i},'icon',this.value)" />
      <input type="text" class="form-input" placeholder="Etiket" value="${f.label || ""}" oninput="updateCF(${i},'label',this.value)" />
      <input type="text" class="form-input" placeholder="Değer" value="${f.value || ""}" oninput="updateCF(${i},'value',this.value)" />
      <input type="text" class="form-input" placeholder="Link (href)" value="${f.href || ""}" oninput="updateCF(${i},'href',this.value)" style="grid-column:1/4;" />
      <button onclick="removeCF(${i})"><i class="fa-solid fa-trash"></i></button>
    </div>
  `).join("");
}

window.updateCF = (i, key, val) => { _contactFields[i][key] = val; };
window.removeCF = (i) => { _contactFields.splice(i, 1); renderContactEditFields(); };
window.addContactField = () => {
  _contactFields.push({ icon: "fa-star", label: "", value: "", href: "#" });
  renderContactEditFields();
};

window.saveContact = async function () {
  const { db, doc, setDoc } = window._fb;
  await setDoc(doc(db, "settings", "contact"), { fields: _contactFields });
  closeModal("contactModal");
  loadContact();
  showToast("İletişim bilgileri güncellendi ✓");
};

// ─────────────────────────────────────────────────
// ── FIRESTORE: REVIEWS ────────────────────────────
// ─────────────────────────────────────────────────
function renderReviews(reviews) {
  const grid = document.getElementById("reviewsGrid");
  const isAdmin = window._currentUser && window._currentUser.email === window._fb.ADMIN_EMAIL;
  if (!reviews.length) {
    grid.innerHTML = `<p style="color:var(--text-3);text-align:center;grid-column:1/-1;">Henüz yorum yok. İlk yorumu siz yapın!</p>`;
    return;
  }
  grid.innerHTML = reviews.map(r => `
    <div class="review-card">
      ${isAdmin ? `<button class="review-delete-btn admin-only" onclick="deleteReview('${r.id}')"><i class="fa-solid fa-trash"></i></button>` : ""}
      <div class="review-stars">${"★".repeat(r.rating || 5)}${"☆".repeat(5 - (r.rating || 5))}</div>
      <div class="review-text">"${r.text}"</div>
      <div class="review-author">
        <div class="review-avatar">${(r.name || "?")[0].toUpperCase()}</div>
        <div class="review-author-info">
          <strong>${r.name || "Anonim"}</strong>
          <span>${r.business || ""}</span>
        </div>
      </div>
    </div>
  `).join("");
}

function loadReviews() {
  waitFb(() => {
    const { db, collection, onSnapshot } = window._fb;
    onSnapshot(collection(db, "reviews"), snap => {
      const reviews = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      renderReviews(reviews);
    });
  });
}

window.setRating = function (n) {
  _selectedRating = n;
  document.querySelectorAll("#starSelect span").forEach((s, i) => {
    s.classList.toggle("active", i < n);
  });
};
// Init stars
document.querySelectorAll("#starSelect span").forEach((s, i) => {
  s.classList.toggle("active", i < _selectedRating);
});

window.submitReview = async function () {
  const name = document.getElementById("reviewName").value.trim();
  const business = document.getElementById("reviewBusiness").value.trim();
  const text = document.getElementById("reviewText").value.trim();
  if (!name || !text) { showToast("Lütfen adınızı ve yorumunuzu yazın."); return; }
  const { db, addDoc, collection, serverTimestamp } = window._fb;
  await addDoc(collection(db, "reviews"), { name, business, text, rating: _selectedRating, createdAt: serverTimestamp() });
  document.getElementById("reviewName").value = "";
  document.getElementById("reviewBusiness").value = "";
  document.getElementById("reviewText").value = "";
  showToast("Yorumunuz eklendi, teşekkürler! 🙏");
};

window.deleteReview = async function (id) {
  if (!confirm("Yorumu silmek istiyor musunuz?")) return;
  await window._fb.deleteDoc(window._fb.doc(window._fb.db, "reviews", id));
  showToast("Yorum silindi.");
};

// ─────────────────────────────────────────────────
// ── Auth ready callback ───────────────────────────
// ─────────────────────────────────────────────────
window._onAuthReady = function (user, isAdmin) {
  // Re-render to show/hide admin buttons on dynamic content
  // (Firestore listeners automatically re-render via onSnapshot)
};

// ─────────────────────────────────────────────────
// ── Init ─────────────────────────────────────────
// ─────────────────────────────────────────────────
loadPlans();
loadExtras();
loadAbout();
loadContact();
loadReviews();

// ── Intersection observer for fade-in ────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("visible");
  });
}, { threshold: .1 });

document.querySelectorAll(".section, .hero-badge, .hero-title, .hero-sub").forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity .6s ease, transform .6s ease";
  observer.observe(el);
});

// Add .visible class logic
const style = document.createElement("style");
style.textContent = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// Trigger hero immediately
setTimeout(() => {
  document.querySelectorAll(".hero-badge, .hero-title, .hero-sub").forEach((el, i) => {
    setTimeout(() => el.classList.add("visible"), i * 150);
  });
}, 100);
