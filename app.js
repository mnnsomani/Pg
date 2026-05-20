const API = 'http://localhost:3001';

// ---- DATA ----
const pgs = [
  { id:1, name:"Thar Group Boys PG", area:"Jhotwara", type:"boys", ac:true, non_ac: false, seaters:[1, 2], food:true, price:7500, rating:5.0, reviews:145, tags:["WiFi","AC","Caretaker","Pure Veg"], image:"pg1.jpg", phone:"08511388094", desc:"Premium boys PG with Caretaker and Pure Veg food. Near Khatipura Puliya, Jhotwara." },
  { id:2, name:"Mansarovar BOYS PG", area:"Mansarovar", type:"boys", ac:false, non_ac: true, seaters:[2, 3], food:true, price:6500, rating:4.3, reviews:34, tags:["WiFi","Food","Laundry"], image:"pg2.png", phone:"07041490856", desc:"Affordable boys PG at Sipra Path. Rent starts at ₹6,500 per bed." },
  { id:3, name:"Mykah Residency Boys PG", area:"Mahesh Nagar", type:"boys", ac:true, non_ac: true, seaters:[1, 2, 3], food:false, price:5500, rating:4.4, reviews:17, tags:["WiFi","AC","Parking"], image:"pg3.jpg", phone:"09980773689", desc:"Excellent PG opposite MBA Kapde Wala, near Gopalpura Bypass." },
  { id:4, name:"Paarijat Girls Hostel", area:"Pratap Nagar", type:"girls", ac:true, non_ac: false, seaters:[1, 2], food:true, price:9000, rating:4.2, reviews:551, tags:["WiFi","AC","Food","Security"], image:"pg4.jpg", phone:"07041523603", desc:"Highly rated girls hostel in Pratap Nagar Housing Board with excellent safety." },
  { id:5, name:"Bohra Boys Hostel", area:"Sitapura", type:"boys", ac:true, non_ac: false, seaters:[2, 3], food:true, price:8000, rating:4.2, reviews:165, tags:["WiFi","AC","Food","Biometric"], image:"pg5.jpg", phone:"09980686778", desc:"Great boys hostel at Plot No 21 Shatabdi Nagar, Sitapura India Gate." },
  { id:6, name:"Nishant Group PG", area:"Malviya Nagar", type:"girls", ac:false, non_ac: true, seaters:[1, 3], food:true, price:6000, rating:4.0, reviews:109, tags:["WiFi","Food","CCTV"], image:"pg6.jpg", phone:"07411559654", desc:"Comfortable PG at Amit Bhardwaj Marg, Malviya Nagar." },
];

const areas = [
  { name:"Malviya Nagar", emoji:"🏙️", count:87 }, { name:"Vaishali Nagar", emoji:"🌿", count:64 },
  { name:"C-Scheme",      emoji:"💼", count:52 }, { name:"Mansarovar",    emoji:"🏘️", count:71 },
  { name:"Jagatpura",     emoji:"🎓", count:58 }, { name:"Sitapura",      emoji:"🏭", count:39 },
  { name:"Tonk Road",     emoji:"🛣️", count:45 }, { name:"Civil Lines",   emoji:"🌳", count:33 },
  { name:"Bani Park",     emoji:"🌺", count:29 }, { name:"Sanganer",      emoji:"✈️", count:22 },
];

// gradient CSS classes
const gradients = { "pg-gradient-1":"linear-gradient(135deg,#667eea,#764ba2)", "pg-gradient-2":"linear-gradient(135deg,#f093fb,#f5576c)", "pg-gradient-3":"linear-gradient(135deg,#4facfe,#00f2fe)", "pg-gradient-4":"linear-gradient(135deg,#43e97b,#38f9d7)", "pg-gradient-5":"linear-gradient(135deg,#fa709a,#fee140)", "pg-gradient-6":"linear-gradient(135deg,#a18cd1,#fbc2eb)" };

let liked = new Set(), activeTab = 'all';

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  renderNavUser();
  applyFilters();
  renderAreas();
  window.addEventListener('scroll', () => document.getElementById('navbar').classList.toggle('scrolled', scrollY > 50));
  animateCounters();
  scrollReveal();
});

// ---- NAV USER ----
function renderNavUser() {
  const raw = localStorage.getItem('odyssey_user');
  const nav = document.getElementById('nav-actions');
  if (!nav) return;
  if (raw) {
    const user = JSON.parse(raw);
    const initial = (user.name || user.email || '?')[0].toUpperCase();
    nav.innerHTML = `
      <button class="btn btn-ghost btn-sm" onclick="window.location.href='list-pg.html'">List Your PG</button>
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">${initial}</div>
        <span style="font-size:14px;font-weight:500;color:var(--text2)">${user.name || user.email}</span>
        <button class="btn btn-ghost btn-sm" onclick="signOut()">Sign Out</button>
      </div>`;
  } else {
    nav.innerHTML = `
      <button class="btn btn-ghost btn-sm" onclick="window.location.href='list-pg.html'">List Your PG</button>
      <a href="signin.html" class="btn btn-primary btn-sm">Sign In</a>`;
  }
}

function signOut() {
  localStorage.removeItem('odyssey_user');
  window.location.href = 'signin.html';
}

// ---- RENDER PGs ----
let currentGender = 'all';

function setGenderFilter(gender, btn) {
  currentGender = gender;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function applyFilters() {
  const acVal = document.getElementById('ac-filter').value;
  const seaterVal = document.getElementById('seater-filter').value;
  const foodVal = document.getElementById('food-filter').checked;

  const list = pgs.filter(p => {
    if (currentGender !== 'all' && p.type !== currentGender) return false;
    if (acVal === 'ac' && !p.ac) return false;
    if (acVal === 'non_ac' && !p.non_ac) return false;
    if (seaterVal !== 'all' && !p.seaters.includes(parseInt(seaterVal))) return false;
    if (foodVal && !p.food) return false;
    return true;
  });

  renderFilteredPGs(list);
}

function renderFilteredPGs(list) {
  document.getElementById('listing-grid').innerHTML = list.length
    ? list.map((p,i) => `
      <div class="listing-card" style="animation:fadeUp 0.5s ${i*0.07}s both">
        <div class="listing-thumb" style="background-image:url('${p.image}'); background-size:cover; background-position:center;">
          <span class="type-badge ${p.type}-badge">${p.type === 'boys' ? '👦 Boys' : '👧 Girls'}</span>
          <span class="ver-badge">✅ Verified</span>
          <button class="like-btn ${liked.has(p.id)?'liked':''}" onclick="toggleLike(${p.id},this)">${liked.has(p.id)?'❤️':'🤍'}</button>
        </div>
        <div class="listing-body">
          <h3>${p.name}</h3>
          <div class="listing-loc">📍 ${p.area}, Jaipur</div>
          <div class="listing-rating">⭐ ${p.rating} <span>(${p.reviews} reviews)</span></div>
          <div class="amenity-tags">${p.tags.map(t=>`<em>${t}</em>`).join('')}</div>
          <div class="listing-footer">
            <div class="listing-price">₹${p.price.toLocaleString()}<small>/month</small></div>
            <button class="btn-view" onclick="openModal(${p.id})">View Details</button>
          </div>
        </div>
      </div>`).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--dim)"><div style="font-size:40px">🔍</div><p>No PGs found for this filter.</p></div>`;
}

// ---- RENDER AREAS ----
function renderAreas() {
  document.getElementById('area-grid').innerHTML = areas.map(a =>
    `<div class="area-card" onclick="toast('🔍 Showing PGs in ${a.name}')">
      <div class="emoji">${a.emoji}</div>
      <h4>${a.name}</h4>
      <small>${a.count} PGs</small>
    </div>`
  ).join('');
}

// ---- SEARCH TAB ----
function setTab(btn, tab) {
  activeTab = tab;
  document.querySelectorAll('.hero-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ---- SEARCH ----
function doSearch() {
  const area = document.getElementById('sel-area').value;
  const budget = document.getElementById('sel-budget').value;
  if (!area && !budget) { toast('⚠️ Select an area or budget first'); return; }
  document.getElementById('listings')?.scrollIntoView({ behavior:'smooth' });
  toast(`🔍 Searching${area ? ' in '+area : ''}${budget ? ' — '+budget : ''}`);
}

// ---- LIKE ----
function toggleLike(id, btn) {
  if (liked.has(id)) { liked.delete(id); btn.innerHTML = '🤍'; btn.classList.remove('liked'); toast('💔 Removed from wishlist'); }
  else { liked.add(id); btn.innerHTML = '❤️'; btn.classList.add('liked'); toast('❤️ Added to wishlist!'); }
}

// ---- MODAL ----
function openModal(id) {
  const p = pgs.find(x => x.id === id);
  document.getElementById('modal-body').innerHTML = `
    <div style="height:220px;border-radius:10px;margin-bottom:20px;background-image:url('${p.image}');background-size:cover;background-position:center;"></div>
    <h2 style="font-size:20px;margin-bottom:6px;color:var(--text)">${p.name}</h2>
    <div style="font-size:13px;color:var(--muted);margin-bottom:8px">📍 ${p.area}, Jaipur &nbsp;·&nbsp; <span style="color:#059669;font-weight:600">✅ Verified</span></div>
    <div style="margin-bottom:16px;font-size:13px">⭐ ${p.rating} <span style="color:var(--dim)">(${p.reviews} reviews)</span></div>
    <p style="color:var(--text2);line-height:1.75;margin-bottom:20px;font-size:14px">${p.desc}</p>
    <div style="font-size:11px;font-weight:600;letter-spacing:1.5px;color:var(--muted);text-transform:uppercase;margin-bottom:10px">Amenities</div>
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:22px">${p.tags.map(t=>`<em style="background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:4px 11px;font-size:12px;font-style:normal;color:var(--text2)">${t}</em>`).join('')}</div>
    <div style="background:var(--accent-light);border:1px solid rgba(196,146,106,0.25);border-radius:10px;padding:18px;display:flex;align-items:center;justify-content:space-between">
      <div><div style="font-size:24px;font-weight:700;color:var(--text)">₹${p.price.toLocaleString()}<span style="font-size:13px;color:var(--muted);font-weight:400">/month</span></div><div style="font-size:13px;color:var(--muted);margin-top:2px">Phone: +91 ${p.phone}</div></div>
      <button class="btn btn-accent" onclick="closeModal(); alert('📞 Contacting Owner: +91 ${p.phone}');">📞 Call Owner</button>
    </div>`;
  document.getElementById('modal').classList.add('open');
}
function closeModal() { document.getElementById('modal').classList.remove('open'); }
document.addEventListener('keydown', e => e.key === 'Escape' && closeModal());

// ---- CONTACT FORM ----
async function submitForm(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const name    = e.target.querySelector('input[type="text"]').value.trim();
  const email   = e.target.querySelector('input[type="email"]').value.trim();
  const phone   = e.target.querySelector('input[type="tel"]').value.trim();
  const message = e.target.querySelector('textarea').value.trim();

  if (!name || !email) { toast('⚠️ Name and email are required.'); return; }

  btn.textContent = 'Sending...'; btn.disabled = true;

  try {
    const res  = await fetch(`${API}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    toast("✅ Message sent! We'll get back to you soon.");
    e.target.reset();
  } catch (err) {
    toast('❌ Failed to send — please try again.');
  } finally {
    btn.textContent = 'Send Message →'; btn.disabled = false;
  }
}

// ---- TOAST ----
function toast(msg, ms = 3000) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), ms);
}

// ---- COUNTER ANIMATION ----
function animateCounters() {
  const obs = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.target, step = target / 100;
    let n = 0;
    const t = setInterval(() => { n = Math.min(n + step, target); el.textContent = Math.floor(n).toLocaleString(); if (n >= target) clearInterval(t); }, 16);
    obs.unobserve(el);
  }), { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => obs.observe(el));
}

// ---- SCROLL REVEAL ----
function scrollReveal() {
  const obs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'translateY(0)'; }
  }), { threshold: 0.1 });
  document.querySelectorAll('.feat, .t-card, .area-card').forEach(el => {
    el.style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity 0.5s ease,transform 0.5s ease';
    obs.observe(el);
  });
}
