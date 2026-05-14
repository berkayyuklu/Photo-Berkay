/* ══════════════════════════════════════
   Photo Berkay — app.js v2
   Features: Auth+Register, Currency,
   Metallic plans, Messages, Review approval,
   Analytics, Profile photo, Stats editor
══════════════════════════════════════ */

// ── Helpers ──────────────────────────
function waitFb(cb){ if(window._fb) cb(); else setTimeout(()=>waitFb(cb),80); }
function showToast(msg,dur=2800){
  const t=document.getElementById("toast");
  t.textContent=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),dur);
}
function openModal(id){ document.getElementById(id).classList.add("open"); }
function closeModal(id){ document.getElementById(id).classList.remove("open"); }
window.openModal=openModal; window.closeModal=closeModal;

// ── Currency ─────────────────────────
const RATES = { TRY:1, USD:0.031, EUR:0.029 };
const SYMBOLS = { TRY:"₺", USD:"$", EUR:"€" };
let _currency = "TRY";

function formatPrice(tryAmount){
  const amt = Math.round(tryAmount * RATES[_currency]);
  return SYMBOLS[_currency] + amt.toLocaleString("tr-TR");
}

document.querySelectorAll(".cur-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".cur-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    _currency = btn.dataset.cur;
    renderPlans(window._cachedPlans||[]);
    renderExtras(window._cachedExtras||[]);
  });
});

// ── Particles ────────────────────────
(function(){
  const canvas=document.getElementById("particles");
  const ctx=canvas.getContext("2d");
  let W,H,pts=[];
  function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
  window.addEventListener("resize",resize); resize();
  function mkPt(){ return{x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.3,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,a:Math.random()*.5+.1}; }
  for(let i=0;i<70;i++) pts.push(mkPt());
  function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(0,212,170,${p.a})`; ctx.fill();
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
    });
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
      const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
      if(d<110){ ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
        ctx.strokeStyle=`rgba(0,212,170,${(1-d/110)*.12})`; ctx.lineWidth=.4; ctx.stroke(); }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Counters ─────────────────────────
function animateCounters(){
  document.querySelectorAll(".stat-num").forEach(el=>{
    const target=+el.dataset.target; let cur=0;
    const step=Math.ceil(target/40);
    const iv=setInterval(()=>{ cur=Math.min(cur+step,target); el.textContent=cur; if(cur>=target) clearInterval(iv); },40);
  });
}
setTimeout(animateCounters,600);

// ── Theme ────────────────────────────
let dark=true;
document.getElementById("themeToggle").addEventListener("click",()=>{
  dark=!dark;
  document.documentElement.setAttribute("data-theme",dark?"dark":"light");
  document.getElementById("themeIcon").className=dark?"fa-solid fa-moon":"fa-solid fa-sun";
});

// ── Mobile Menu ───────────────────────
window.toggleMenu=function(){ document.getElementById("navLinks").classList.toggle("open"); };
document.querySelectorAll(".nav-link").forEach(l=>l.addEventListener("click",()=>document.getElementById("navLinks").classList.remove("open")));

// ── Navbar shadow ────────────────────
window.addEventListener("scroll",()=>{ document.getElementById("navbar").style.boxShadow=window.scrollY>20?"0 2px 30px rgba(0,0,0,.5)":""; });

// ── Track page view ──────────────────
function trackVisit(){
  waitFb(async()=>{
    try{
      const {db,doc,getDoc,setDoc,serverTimestamp}=window._fb;
      const today=new Date().toISOString().slice(0,10);
      const ref=doc(db,"analytics","visits");
      const snap=await getDoc(ref);
      const data=snap.exists()?snap.data():{total:0,days:{}};
      data.total=(data.total||0)+1;
      data.days[today]=(data.days[today]||0)+1;
      await setDoc(ref,data);
    }catch(e){}
  });
}
trackVisit();

// ── Auth ─────────────────────────────
window.openAuthModal=function(){
  if(window._currentUser){ doSignOut(); return; }
  openModal("authModal");
};
window.doSignOut=async function(){
  await window._fb.signOut(window._fb.auth);
  showToast("Çıkış yapıldı.");
};
window.switchAuthTab=function(tab){
  document.getElementById("loginForm").style.display=tab==="login"?"":"none";
  document.getElementById("registerForm").style.display=tab==="register"?"":"none";
  document.getElementById("tabLogin").classList.toggle("active",tab==="login");
  document.getElementById("tabRegister").classList.toggle("active",tab==="register");
};
window.doLoginEmail=async function(){
  const email=document.getElementById("loginEmail").value.trim();
  const pass=document.getElementById("loginPass").value;
  const err=document.getElementById("loginError"); err.textContent="";
  try{
    await window._fb.signInWithEmailAndPassword(window._fb.auth,email,pass);
    closeModal("authModal"); showToast("Giriş başarılı! 👋");
  }catch(e){ err.textContent="E-posta veya şifre hatalı."; }
};
window.doLoginGoogle=async function(){
  try{
    await window._fb.signInWithPopup(window._fb.auth,window._fb.googleProvider);
    closeModal("authModal"); showToast("Google ile giriş yapıldı!");
  }catch(e){ document.getElementById("loginError").textContent="Google girişi başarısız: "+e.message; }
};
window.doRegister=async function(){
  const name=document.getElementById("regName").value.trim();
  const email=document.getElementById("regEmail").value.trim();
  const pass=document.getElementById("regPass").value;
  const pass2=document.getElementById("regPass2").value;
  const err=document.getElementById("regError"); err.textContent="";
  if(!name){ err.textContent="İsim zorunludur."; return; }
  if(pass!==pass2){ err.textContent="Şifreler eşleşmiyor."; return; }
  if(pass.length<6){ err.textContent="Şifre en az 6 karakter olmalı."; return; }
  try{
    const cred=await window._fb.createUserWithEmailAndPassword(window._fb.auth,email,pass);
    await window._fb.updateProfile(cred.user,{displayName:name});
    closeModal("authModal"); showToast("Hesap oluşturuldu! Hoş geldiniz 🎉");
  }catch(e){
    err.textContent=e.code==="auth/email-already-in-use"?"Bu e-posta zaten kayıtlı.":"Kayıt başarısız: "+e.message;
  }
};

// ── Profile ───────────────────────────
window.openProfileModal=function(){
  const u=window._currentUser; if(!u) return;
  const nameEl=document.getElementById("profileName");
  const imgEl=document.getElementById("profileAvatarImg");
  const initEl=document.getElementById("profileAvatarInit");
  if(nameEl) nameEl.value=u.displayName||"";
  if(u.photoURL&&imgEl){ imgEl.src=u.photoURL; imgEl.style.display="block"; if(initEl) initEl.style.display="none"; }
  else{ if(imgEl) imgEl.style.display="none"; if(initEl){ initEl.style.display="flex"; initEl.textContent=(u.displayName||u.email||"?")[0].toUpperCase(); } }
  openModal("profileModal");
};
window.handleProfilePhotoChange=function(input){
  const file=input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    const b64=e.target.result;
    const imgEl=document.getElementById("profileAvatarImg");
    const initEl=document.getElementById("profileAvatarInit");
    if(imgEl){ imgEl.src=b64; imgEl.style.display="block"; }
    if(initEl) initEl.style.display="none";
    window._pendingPhotoB64=b64;
  };
  reader.readAsDataURL(file);
};
window.saveProfile=async function(){
  const u=window._currentUser; if(!u) return;
  const name=document.getElementById("profileName").value.trim();
  const err=document.getElementById("profileError"); err.textContent="";
  try{
    const updates={displayName:name};
    if(window._pendingPhotoB64) updates.photoURL=window._pendingPhotoB64;
    await window._fb.updateProfile(u,updates);
    // save to Firestore too
    await window._fb.setDoc(window._fb.doc(window._fb.db,"users",u.uid),{name,photoURL:updates.photoURL||u.photoURL||""},{merge:true});
    window._pendingPhotoB64=null;
    closeModal("profileModal");
    showToast("Profil güncellendi ✓");
  }catch(e){ err.textContent="Hata: "+e.message; }
};

// ── Bubble animation ─────────────────
function launchBubbles(cb){
  const c=document.createElement("div"); c.className="bubble-container";
  document.body.appendChild(c);
  for(let i=0;i<16;i++){
    const b=document.createElement("div"); b.className="bubble";
    const s=Math.random()*55+18;
    b.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;animation-duration:${Math.random()*1.4+.9}s;animation-delay:${Math.random()*.35}s;`;
    c.appendChild(b);
  }
  setTimeout(()=>{ c.remove(); if(cb)cb(); },650);
}

// ── Plan detail ───────────────────────
window.openPlanDetail=function(plan){
  launchBubbles(()=>{
    const cont=document.getElementById("planDetailContent");
    const fHtml=(plan.features||[]).map(f=>`<li>${f}</li>`).join("");
    const priceStr=formatPrice(+plan.price);
    cont.innerHTML=`
      <button class="modal-close" onclick="closeModal('planDetailModal')"><i class="fa-solid fa-xmark"></i></button>
      <div class="plan-detail-header">
        ${plan.badge?`<div class="plan-badge">${plan.badge}</div>`:""}
        <h2>${plan.name}</h2>
        <p style="color:var(--text-2);font-size:.88rem;margin:.5rem 0 1rem">${plan.desc||""}</p>
        <div class="plan-detail-price">${priceStr}<span class="price-label"> ${plan.priceLabel||"/ aylık"}</span></div>
      </div>
      <ul class="plan-detail-features">${fHtml}</ul>
      <p style="margin-top:1.5rem;color:var(--text-3);font-size:.8rem;text-align:center">
        Bu plan hakkında bilgi almak için <a href="#contact" onclick="closeModal('planDetailModal')" style="color:var(--teal)">iletişime geçin</a>.
      </p>`;
    openModal("planDetailModal");
  });
};

// ── PLANS ─────────────────────────────
window._cachedPlans=[];
function renderPlans(plans){
  window._cachedPlans=plans;
  const grid=document.getElementById("plansGrid");
  if(!plans.length){ grid.innerHTML=`<p style="color:var(--text-3);text-align:center;grid-column:1/-1">Henüz plan eklenmemiş.</p>`; return; }
  const isAdmin=window._currentUser&&window._currentUser.email===window._fb?.ADMIN_EMAIL;
  grid.innerHTML=plans.map(p=>{
    const priceStr=formatPrice(+p.price);
    return`<div class="plan-card color-${p.color||"gold"}" onclick="openPlanDetail(${JSON.stringify(p).replace(/"/g,'&quot;')})">
      ${p.badge?`<div class="plan-badge">${p.badge}</div>`:""}
      <div class="plan-name">${p.name}</div>
      <div class="plan-desc">${p.desc||""}</div>
      <div class="plan-price">${priceStr}<span class="price-label"> ${p.priceLabel||"/ aylık"}</span></div>
      <ul class="plan-features">${(p.features||[]).slice(0,5).map(f=>`<li>${f}</li>`).join("")}${(p.features||[]).length>5?`<li style="color:var(--teal)">+${p.features.length-5} daha...</li>`:""}</ul>
      <button class="plan-cta-btn" onclick="event.stopPropagation();openPlanDetail(${JSON.stringify(p).replace(/"/g,'&quot;')})">Detayları Gör <i class="fa-solid fa-arrow-right"></i></button>
      ${isAdmin?`<button class="plan-edit-btn admin-only" onclick="event.stopPropagation();openPlanModal('${p.id}')"><i class="fa-solid fa-pen"></i> Düzenle</button>`:""}
    </div>`;
  }).join("");
}
function loadPlans(){
  waitFb(()=>{
    const{db,collection,onSnapshot}=window._fb;
    onSnapshot(collection(db,"plans"),snap=>{
      const plans=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order||0)-(b.order||0));
      renderPlans(plans);
    });
  });
}
window.openPlanModal=function(id=null){
  document.getElementById("planModalTitle").textContent=id?"Plan Düzenle":"Yeni Plan Ekle";
  document.getElementById("planEditId").value=id||"";
  document.getElementById("planDeleteBtn").style.display=id?"":"none";
  document.getElementById("planError").textContent="";
  if(id){
    waitFb(async()=>{
      const{db,doc,getDoc}=window._fb;
      const snap=await getDoc(doc(db,"plans",id));
      if(snap.exists()){const d=snap.data();
        document.getElementById("planName").value=d.name||"";
        document.getElementById("planPrice").value=d.price||"";
        document.getElementById("planPriceLabel").value=d.priceLabel||"";
        document.getElementById("planDesc").value=d.desc||"";
        document.getElementById("planFeatures").value=(d.features||[]).join("\n");
        document.getElementById("planColor").value=d.color||"gold";
        document.getElementById("planBadge").value=d.badge||"";
        document.getElementById("planOrder").value=d.order||"";
      }
    });
  } else{
    ["planName","planPrice","planPriceLabel","planDesc","planFeatures","planBadge","planOrder"].forEach(id=>document.getElementById(id).value="");
    document.getElementById("planColor").value="gold";
  }
  openModal("planModal");
};
window.savePlan=async function(){
  const{db,doc,setDoc,addDoc,collection,serverTimestamp}=window._fb;
  const id=document.getElementById("planEditId").value;
  const data={
    name:document.getElementById("planName").value.trim(),
    price:+document.getElementById("planPrice").value,
    priceLabel:document.getElementById("planPriceLabel").value.trim(),
    desc:document.getElementById("planDesc").value.trim(),
    features:document.getElementById("planFeatures").value.split("\n").filter(Boolean),
    color:document.getElementById("planColor").value,
    badge:document.getElementById("planBadge").value.trim(),
    order:+document.getElementById("planOrder").value||0,
    updatedAt:serverTimestamp()
  };
  if(!data.name||!data.price){document.getElementById("planError").textContent="Plan adı ve fiyat zorunludur.";return;}
  try{
    if(id) await setDoc(doc(db,"plans",id),data,{merge:true});
    else await addDoc(collection(db,"plans"),{...data,createdAt:serverTimestamp()});
    closeModal("planModal"); showToast(id?"Plan güncellendi ✓":"Plan eklendi ✓");
  }catch(e){document.getElementById("planError").textContent="Hata: "+e.message;}
};
window.deletePlan=async function(){
  const id=document.getElementById("planEditId").value;
  if(!id||!confirm("Planı silmek istediğinize emin misiniz?")) return;
  await window._fb.deleteDoc(window._fb.doc(window._fb.db,"plans",id));
  closeModal("planModal"); showToast("Plan silindi.");
};

// ── EXTRAS ────────────────────────────
window._cachedExtras=[];
function renderExtras(extras){
  window._cachedExtras=extras;
  const grid=document.getElementById("extrasGrid");
  if(!extras.length){grid.innerHTML=`<p style="color:var(--text-3);text-align:center;grid-column:1/-1">Henüz ekstra hizmet eklenmemiş.</p>`;return;}
  const isAdmin=window._currentUser&&window._currentUser.email===window._fb?.ADMIN_EMAIL;
  grid.innerHTML=extras.map(e=>`
    <div class="extra-card">
      <div class="extra-icon"><i class="fa-solid ${e.icon||"fa-star"}"></i></div>
      <div class="extra-name">${e.name}</div>
      <div class="extra-desc">${e.desc||""}</div>
      <div class="extra-price">${formatPrice(+e.price)}<span class="price-label"> ${e.priceLabel||"/ seans"}</span></div>
      ${isAdmin?`<button class="extra-edit-btn admin-only" onclick="openExtraModal('${e.id}')"><i class="fa-solid fa-pen"></i> Düzenle</button>`:""}
    </div>`).join("");
}
function loadExtras(){
  waitFb(()=>{
    const{db,collection,onSnapshot}=window._fb;
    onSnapshot(collection(db,"extras"),snap=>{
      const extras=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order||0)-(b.order||0));
      renderExtras(extras);
    });
  });
}
window.openExtraModal=function(id=null){
  document.getElementById("extraModalTitle").textContent=id?"Ekstra Düzenle":"Yeni Ekstra Hizmet Ekle";
  document.getElementById("extraEditId").value=id||"";
  document.getElementById("extraDeleteBtn").style.display=id?"":"none";
  document.getElementById("extraError").textContent="";
  if(id){
    waitFb(async()=>{
      const{db,doc,getDoc}=window._fb;
      const snap=await getDoc(doc(db,"extras",id));
      if(snap.exists()){const d=snap.data();
        document.getElementById("extraName").value=d.name||"";
        document.getElementById("extraPrice").value=d.price||"";
        document.getElementById("extraPriceLabel").value=d.priceLabel||"";
        document.getElementById("extraDesc").value=d.desc||"";
        document.getElementById("extraIcon").value=d.icon||"";
        document.getElementById("extraOrder").value=d.order||"";
      }
    });
  } else ["extraName","extraPrice","extraPriceLabel","extraDesc","extraIcon","extraOrder"].forEach(id=>document.getElementById(id).value="");
  openModal("extraModal");
};
window.saveExtra=async function(){
  const{db,doc,setDoc,addDoc,collection,serverTimestamp}=window._fb;
  const id=document.getElementById("extraEditId").value;
  const data={
    name:document.getElementById("extraName").value.trim(),
    price:+document.getElementById("extraPrice").value,
    priceLabel:document.getElementById("extraPriceLabel").value.trim(),
    desc:document.getElementById("extraDesc").value.trim(),
    icon:document.getElementById("extraIcon").value.trim(),
    order:+document.getElementById("extraOrder").value||0,
    updatedAt:serverTimestamp()
  };
  if(!data.name||!data.price){document.getElementById("extraError").textContent="Ad ve fiyat zorunludur.";return;}
  try{
    if(id) await setDoc(doc(db,"extras",id),data,{merge:true});
    else await addDoc(collection(db,"extras"),{...data,createdAt:serverTimestamp()});
    closeModal("extraModal"); showToast(id?"Güncellendi ✓":"Eklendi ✓");
  }catch(e){document.getElementById("extraError").textContent="Hata: "+e.message;}
};
window.deleteExtra=async function(){
  const id=document.getElementById("extraEditId").value;
  if(!id||!confirm("Silmek istediğinize emin misiniz?")) return;
  await window._fb.deleteDoc(window._fb.doc(window._fb.db,"extras",id));
  closeModal("extraModal"); showToast("Silindi.");
};

// ── ABOUT ─────────────────────────────
function loadAbout(){
  waitFb(async()=>{
    const{db,doc,getDoc}=window._fb;
    const snap=await getDoc(doc(db,"settings","about"));
    const data=snap.exists()?snap.data():{
      bio:"Merhaba, ben Berkay Yüklü. Sosyal medya yönetimi, drone çekimi ve profesyonel içerik üretimi konularında hizmet veriyorum.",
      skills:["Reels Çekimi","Drone","Fotoğrafçılık","Video Kurgu","Instagram Yönetimi","İçerik Stratejisi"],
      photoUrl:""
    };
    document.getElementById("aboutBio").textContent=data.bio;
    document.getElementById("aboutSkills").innerHTML=(data.skills||[]).map(s=>`<span class="skill-tag">${s}</span>`).join("");
    const photo=document.getElementById("aboutPhoto");
    const icon=document.getElementById("aboutIcon");
    if(data.photoUrl&&photo){photo.src=data.photoUrl;photo.style.display="block";if(icon)icon.style.display="none";}
    else{if(photo)photo.style.display="none";if(icon)icon.style.display="";}
  });
}
window.openAboutModal=function(){
  waitFb(async()=>{
    const{db,doc,getDoc}=window._fb;
    const snap=await getDoc(doc(db,"settings","about"));
    const data=snap.exists()?snap.data():{};
    document.getElementById("editBio").value=data.bio||"";
    document.getElementById("editSkills").value=(data.skills||[]).join(", ");
    document.getElementById("editPhotoUrl").value=data.photoUrl||"";
    openModal("aboutModal");
  });
};
window.saveAbout=async function(){
  const{db,doc,setDoc}=window._fb;
  const bio=document.getElementById("editBio").value.trim();
  const skills=document.getElementById("editSkills").value.split(",").map(s=>s.trim()).filter(Boolean);
  const photoUrl=document.getElementById("editPhotoUrl").value.trim();
  await setDoc(doc(db,"settings","about"),{bio,skills,photoUrl});
  closeModal("aboutModal"); loadAbout(); showToast("Hakkında güncellendi ✓");
};

// ── CONTACT ───────────────────────────
const defaultContact=[
  {icon:"fa-envelope",label:"E-posta",value:"yukluberkay@gmail.com",href:"mailto:yukluberkay@gmail.com"},
  {icon:"fa-phone",label:"Telefon",value:"0551 153 72 13",href:"tel:+905511537213"},
  {icon:"fa-brands fa-instagram",label:"Instagram",value:"@berkay_yuklu",href:"https://instagram.com/berkay_yuklu"}
];
let _contactFields=[];
function renderContact(fields){
  document.getElementById("contactGrid").innerHTML=fields.map(f=>`
    <a class="contact-card" href="${f.href||'#'}" target="_blank" rel="noopener">
      <div class="contact-icon"><i class="${f.icon.startsWith('fa-brands')?f.icon:'fa-solid '+f.icon}"></i></div>
      <div><div class="contact-label">${f.label}</div><div class="contact-value">${f.value}</div></div>
    </a>`).join("");
}
function loadContact(){
  waitFb(async()=>{
    const{db,doc,getDoc}=window._fb;
    const snap=await getDoc(doc(db,"settings","contact"));
    renderContact(snap.exists()?(snap.data().fields||defaultContact):defaultContact);
  });
}
window.openContactModal=function(){
  waitFb(async()=>{
    const{db,doc,getDoc}=window._fb;
    const snap=await getDoc(doc(db,"settings","contact"));
    _contactFields=snap.exists()?[...(snap.data().fields||[])]:JSON.parse(JSON.stringify(defaultContact));
    renderContactEditFields(); openModal("contactModal");
  });
};
function renderContactEditFields(){
  document.getElementById("contactEditFields").innerHTML=_contactFields.map((f,i)=>`
    <div class="contact-edit-row" data-index="${i}" style="margin-bottom:.6rem">
      <input type="text" class="form-input" placeholder="İkon" value="${f.icon||""}" oninput="_contactFields[${i}].icon=this.value" />
      <input type="text" class="form-input" placeholder="Etiket" value="${f.label||""}" oninput="_contactFields[${i}].label=this.value" />
      <input type="text" class="form-input" placeholder="Değer" value="${f.value||""}" oninput="_contactFields[${i}].value=this.value" />
      <button onclick="removeContactField(${i})"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div style="margin-bottom:.8rem">
      <input type="text" class="form-input" placeholder="Link (href)" value="${f.href||""}" oninput="_contactFields[${i}].href=this.value" />
    </div>`).join("");
}
window.removeContactField=(i)=>{ _contactFields.splice(i,1); renderContactEditFields(); };
window.addContactField=()=>{ _contactFields.push({icon:"fa-star",label:"",value:"",href:"#"}); renderContactEditFields(); };
window.saveContact=async function(){
  const{db,doc,setDoc}=window._fb;
  await setDoc(doc(db,"settings","contact"),{fields:_contactFields});
  closeModal("contactModal"); loadContact(); showToast("İletişim bilgileri güncellendi ✓");
};

// ── STATS ─────────────────────────────
const defaultStats=[{num:50,suffix:"+",label:"Müşteri"},{num:200,suffix:"+",label:"İçerik"},{num:3,suffix:"",label:"Yıl Deneyim"}];
let _statFields=[];
function renderHeroStats(stats){
  const c=document.getElementById("heroStats"); if(!c) return;
  c.innerHTML=stats.map((s,i)=>`
    ${i>0?'<div class="stat-divider"></div>':''}
    <div class="stat"><span class="stat-num" data-target="${s.num}">0</span><span>${s.suffix||""}${s.label}</span></div>`).join("");
  c.querySelectorAll(".stat-num").forEach(el=>{
    const target=+el.dataset.target; let cur=0; const step=Math.ceil(target/40);
    const iv=setInterval(()=>{ cur=Math.min(cur+step,target); el.textContent=cur; if(cur>=target)clearInterval(iv); },40);
  });
}
function loadStats(){
  waitFb(async()=>{
    const{db,doc,getDoc}=window._fb;
    const snap=await getDoc(doc(db,"settings","heroStats"));
    renderHeroStats(snap.exists()?(snap.data().stats||defaultStats):defaultStats);
  });
}
window.openStatsModal=async function(){
  try{
    _statFields=[...defaultStats];
    if(window._fb){
      const snap=await window._fb.getDoc(window._fb.doc(window._fb.db,"settings","heroStats"));
      if(snap.exists()) _statFields=[...(snap.data().stats||defaultStats)];
    }
    renderStatEditFields(); openModal("statsModal");
  }catch(e){showToast("Hata: "+e.message);}
};
function renderStatEditFields(){
  const c=document.getElementById("statsEditFields"); if(!c) return;
  c.innerHTML=_statFields.map((s,i)=>`
    <div class="stat-edit-row" data-index="${i}" style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:.5rem;align-items:end;margin-bottom:.7rem">
      <div><label style="font-size:.72rem;color:var(--text-3);display:block;margin-bottom:.2rem">Sayı</label>
        <input type="number" class="form-input stat-num-input" data-i="${i}" value="${s.num}" /></div>
      <div><label style="font-size:.72rem;color:var(--text-3);display:block;margin-bottom:.2rem">Ek (+)</label>
        <input type="text" class="form-input stat-suffix-input" data-i="${i}" value="${s.suffix||''}" /></div>
      <div><label style="font-size:.72rem;color:var(--text-3);display:block;margin-bottom:.2rem">Etiket</label>
        <input type="text" class="form-input stat-label-input" data-i="${i}" value="${s.label}" /></div>
      <button onclick="removeStatField(${i})" style="height:40px;width:40px;border-radius:10px;background:rgba(220,50,50,.1);border:1px solid rgba(220,50,50,.3);color:#e55;cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center;margin-top:1.2rem"><i class="fa-solid fa-trash"></i></button>
    </div>`).join("");
}
function readStatFieldsFromDOM(){
  return Array.from(document.querySelectorAll(".stat-edit-row")).map(row=>({
    num:+row.querySelector(".stat-num-input").value||0,
    suffix:row.querySelector(".stat-suffix-input").value,
    label:row.querySelector(".stat-label-input").value
  }));
}
window.removeStatField=(i)=>{ _statFields=readStatFieldsFromDOM(); _statFields.splice(i,1); renderStatEditFields(); };
window.addStatField=()=>{ _statFields=readStatFieldsFromDOM(); _statFields.push({num:0,suffix:"+",label:"Yeni"}); renderStatEditFields(); };
window.saveStats=async function(){
  try{
    _statFields=readStatFieldsFromDOM();
    if(window._fb) await window._fb.setDoc(window._fb.doc(window._fb.db,"settings","heroStats"),{stats:_statFields});
    closeModal("statsModal"); renderHeroStats(_statFields); showToast("İstatistikler güncellendi ✓");
  }catch(e){showToast("Hata: "+e.message);}
};

// ── MESSAGES ──────────────────────────
window.sendMessage=async function(){
  const u=window._currentUser; if(!u){showToast("Mesaj göndermek için giriş yapın.");return;}
  const subject=document.getElementById("msgSubject").value.trim();
  const body=document.getElementById("msgBody").value.trim();
  if(!subject||!body){showToast("Konu ve mesaj zorunludur.");return;}
  const{db,addDoc,collection,serverTimestamp}=window._fb;
  await addDoc(collection(db,"messages"),{
    from:u.email,fromName:u.displayName||u.email,
    subject,body,read:false,
    createdAt:serverTimestamp()
  });
  document.getElementById("msgSubject").value="";
  document.getElementById("msgBody").value="";
  showToast("Mesajınız iletildi! 📬");
};

function loadMessages(){
  waitFb(()=>{
    const{db,collection,onSnapshot,query,orderBy}=window._fb;
    const q=query(collection(db,"messages"),orderBy("createdAt","desc"));
    onSnapshot(q,snap=>{
      const msgs=snap.docs.map(d=>({id:d.id,...d.data()}));
      const countEl=document.getElementById("msgCount");
      if(countEl) countEl.textContent=msgs.length||"";
      const list=document.getElementById("msgList"); if(!list) return;
      if(!msgs.length){list.innerHTML=`<p style="color:var(--text-3);font-size:.85rem">Henüz mesaj yok.</p>`;return;}
      list.innerHTML=msgs.map(m=>`
        <div class="msg-item${m.read?'':' unread'}" onclick="openMessageDetail('${m.id}','${m.from}','${(m.fromName||'').replace(/'/g,'&apos;')}','${(m.subject||'').replace(/'/g,'&apos;')}','${(m.body||'').replace(/'/g,'&apos;')}')">
          <div class="msg-item-header">
            <span class="msg-item-from">${m.fromName||m.from}</span>
            <span class="msg-item-time">${m.createdAt?.toDate?.()?new Date(m.createdAt.toDate()).toLocaleDateString("tr-TR"):""}</span>
          </div>
          <div class="msg-item-subject">${m.subject}</div>
        </div>`).join("");
    });
  });
}
window.openMessageDetail=async function(id,from,fromName,subject,body){
  const cont=document.getElementById("msgDetailContent");
  cont.innerHTML=`
    <button class="modal-close" onclick="closeModal('msgDetailModal')"><i class="fa-solid fa-xmark"></i></button>
    <div style="margin-bottom:1rem">
      <div style="font-size:.75rem;color:var(--text-3);margin-bottom:.3rem">Gönderen</div>
      <div style="font-weight:600">${fromName} — <span style="color:var(--text-2);font-size:.85rem">${from}</span></div>
    </div>
    <h3 style="font-family:var(--font-head);margin-bottom:1rem">${subject}</h3>
    <p style="color:var(--text-2);line-height:1.7;white-space:pre-wrap">${body}</p>
    <button class="btn-danger" style="margin-top:1.5rem" onclick="deleteMessage('${id}')"><i class="fa-solid fa-trash"></i> Sil</button>`;
  // Mark as read
  if(window._fb) await window._fb.setDoc(window._fb.doc(window._fb.db,"messages",id),{read:true},{merge:true});
  openModal("msgDetailModal");
};
window.deleteMessage=async function(id){
  if(!confirm("Mesajı silmek istediğinize emin misiniz?")) return;
  await window._fb.deleteDoc(window._fb.doc(window._fb.db,"messages",id));
  closeModal("msgDetailModal"); showToast("Mesaj silindi.");
};

// ── REVIEWS ───────────────────────────
let _selectedRating=5;
window.setRating=function(n){
  _selectedRating=n;
  document.querySelectorAll("#starSelect span").forEach((s,i)=>s.classList.toggle("active",i<n));
};
document.querySelectorAll("#starSelect span").forEach((s,i)=>s.classList.toggle("active",i<_selectedRating));

function renderApprovedReviews(reviews){
  const grid=document.getElementById("reviewsGrid");
  if(!reviews.length){grid.innerHTML=`<p style="color:var(--text-3);text-align:center;grid-column:1/-1">Henüz onaylı yorum yok.</p>`;return;}
  const isAdmin=window._currentUser&&window._currentUser.email===window._fb?.ADMIN_EMAIL;
  grid.innerHTML=reviews.map(r=>`
    <div class="review-card">
      ${isAdmin?`<button class="review-delete-btn admin-only" onclick="deleteReview('${r.id}')"><i class="fa-solid fa-trash"></i></button>`:""}
      <div class="review-stars">${"★".repeat(r.rating||5)}${"☆".repeat(5-(r.rating||5))}</div>
      <div class="review-text">"${r.text}"</div>
      <div class="review-author">
        <div class="review-avatar">${r.photoURL?`<img src="${r.photoURL}">`:(r.name||"?")[0].toUpperCase()}</div>
        <div class="review-author-info"><strong>${r.name||"Anonim"}</strong><span>${r.business||""}</span></div>
      </div>
    </div>`).join("");
}

function loadReviews(){
  waitFb(()=>{
    const{db,collection,onSnapshot,query,where,orderBy}=window._fb;
    // Only approved reviews shown publicly
    onSnapshot(collection(db,"reviews"),snap=>{
      const all=snap.docs.map(d=>({id:d.id,...d.data()}));
      const approved=all.filter(r=>r.approved===true).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
      renderApprovedReviews(approved);
      // Pending for admin
      const pending=all.filter(r=>!r.approved);
      const pendingCount=document.getElementById("pendingCount");
      if(pendingCount) pendingCount.textContent=pending.length||"";
      const pendingList=document.getElementById("pendingReviewsList"); if(!pendingList) return;
      if(!pending.length){pendingList.innerHTML=`<p style="color:var(--text-3);font-size:.85rem">Onay bekleyen yorum yok.</p>`;return;}
      pendingList.innerHTML=pending.map(r=>`
        <div class="pending-review-item">
          <div style="flex:1">
            <div style="font-weight:600;font-size:.88rem">${r.name||"Anonim"} ${r.business?`— <span style="color:var(--text-3)">${r.business}</span>`:""}</div>
            <div style="color:#f5c842;font-size:.85rem;margin:.2rem 0">${"★".repeat(r.rating||5)}</div>
            <div style="color:var(--text-2);font-size:.84rem">${r.text}</div>
            <div class="pending-actions">
              <button class="btn-approve" onclick="approveReview('${r.id}')"><i class="fa-solid fa-check"></i> Onayla</button>
              <button class="btn-reject" onclick="deleteReview('${r.id}')"><i class="fa-solid fa-xmark"></i> Reddet</button>
            </div>
          </div>
        </div>`).join("");
    });
  });
}
window.submitReview=async function(){
  const u=window._currentUser; if(!u){showToast("Yorum için giriş yapın.");return;}
  const business=document.getElementById("reviewBusiness").value.trim();
  const text=document.getElementById("reviewText").value.trim();
  if(!text){showToast("Yorum metni boş olamaz.");return;}
  const{db,addDoc,collection,serverTimestamp}=window._fb;
  await addDoc(collection(db,"reviews"),{
    name:u.displayName||u.email,photoURL:u.photoURL||"",
    business,text,rating:_selectedRating,
    approved:false, // needs admin approval
    createdAt:serverTimestamp()
  });
  document.getElementById("reviewBusiness").value="";
  document.getElementById("reviewText").value="";
  showToast("Yorumunuz onay bekliyor. Teşekkürler! 🙏");
};
window.approveReview=async function(id){
  await window._fb.setDoc(window._fb.doc(window._fb.db,"reviews",id),{approved:true},{merge:true});
  showToast("Yorum onaylandı ✓");
};
window.deleteReview=async function(id){
  if(!confirm("Yorumu silmek istiyor musunuz?")) return;
  await window._fb.deleteDoc(window._fb.doc(window._fb.db,"reviews",id));
  showToast("Yorum silindi.");
};

// ── ANALYTICS ─────────────────────────
let _visitChart=null;
function loadAnalytics(){
  waitFb(async()=>{
    const{db,doc,getDoc,collection,getDocs}=window._fb;
    // Page views
    try{
      const snap=await getDoc(doc(db,"analytics","visits"));
      const data=snap.exists()?snap.data():{total:0,days:{}};
      const totalEl=document.getElementById("statViews");
      if(totalEl) totalEl.textContent=(data.total||0).toLocaleString("tr-TR");
      // Chart: last 7 days
      const days=[]; const labels=[]; const vals=[];
      for(let i=6;i>=0;i--){
        const d=new Date(); d.setDate(d.getDate()-i);
        const key=d.toISOString().slice(0,10);
        labels.push(d.toLocaleDateString("tr-TR",{month:"short",day:"numeric"}));
        vals.push(data.days?.[key]||0);
      }
      const canvas=document.getElementById("visitChart");
      if(canvas&&window.Chart){
        if(_visitChart) _visitChart.destroy();
        _visitChart=new Chart(canvas,{
          type:"line",
          data:{labels,datasets:[{label:"Ziyaretçi",data:vals,borderColor:"#00d4aa",backgroundColor:"rgba(0,212,170,.08)",tension:.4,fill:true,pointBackgroundColor:"#00d4aa"}]},
          options:{plugins:{legend:{display:false}},scales:{x:{grid:{color:"rgba(255,255,255,.05)"},ticks:{color:"#4a7a96"}},y:{grid:{color:"rgba(255,255,255,.05)"},ticks:{color:"#4a7a96",stepSize:1}}}}
        });
      }
    }catch(e){}
    // Users count
    try{
      const usersSnap=await getDocs(collection(db,"users"));
      const usersEl=document.getElementById("statUsers");
      if(usersEl) usersEl.textContent=usersSnap.size;
    }catch(e){}
    // Messages count
    try{
      const msgsSnap=await getDocs(collection(db,"messages"));
      const msgsEl=document.getElementById("statMessages");
      if(msgsEl) msgsEl.textContent=msgsSnap.size;
    }catch(e){}
    // Pending reviews
    try{
      const revSnap=await getDocs(collection(db,"reviews"));
      const pending=revSnap.docs.filter(d=>!d.data().approved).length;
      const pendEl=document.getElementById("statPending");
      if(pendEl) pendEl.textContent=pending;
    }catch(e){}
  });
}

// ── Auth ready ────────────────────────
window._onAuthReady=function(user,isAdmin){
  if(isAdmin) loadAnalytics();
  // Re-render price displays with current currency
  renderPlans(window._cachedPlans||[]);
  renderExtras(window._cachedExtras||[]);
};

// ── Fade-in observer ─────────────────
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add("visible"); });
},{threshold:.08});
const fadeStyle=document.createElement("style");
fadeStyle.textContent=`.fade-in{opacity:0;transform:translateY(22px);transition:opacity .6s ease,transform .6s ease}.fade-in.visible{opacity:1!important;transform:translateY(0)!important}`;
document.head.appendChild(fadeStyle);
document.querySelectorAll(".section,.hero-badge,.hero-title,.hero-sub,.hero-cta").forEach(el=>{
  el.classList.add("fade-in"); io.observe(el);
});
setTimeout(()=>{
  document.querySelectorAll(".hero-badge,.hero-title,.hero-sub,.hero-cta").forEach((el,i)=>{
    setTimeout(()=>el.classList.add("visible"),i*120);
  });
},100);

// ── Init ─────────────────────────────
loadPlans();
loadExtras();
loadAbout();
loadContact();
loadReviews();
loadStats();
loadMessages();
