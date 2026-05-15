/* ══════════════════════════════════════
   Photo Berkay — app.js v3
══════════════════════════════════════ */

function waitFb(cb){ if(window._fb) cb(); else setTimeout(()=>waitFb(cb),80); }
function showToast(msg,dur=2800){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),dur); }
function openModal(id){ document.getElementById(id)?.classList.add("open"); }
function closeModal(id){ document.getElementById(id)?.classList.remove("open"); }
window.openModal=openModal; window.closeModal=closeModal;

// ── Particles ────────────────────────
(function(){
  const canvas=document.getElementById("particles"),ctx=canvas.getContext("2d");
  let W,H,pts=[];
  function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
  window.addEventListener("resize",resize); resize();
  function mkPt(){return{x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.3+.3,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,a:Math.random()*.45+.08};}
  for(let i=0;i<65;i++)pts.push(mkPt());
  (function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(0,184,150,${p.a})`;ctx.fill();p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;});
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);if(d<105){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(0,184,150,${(1-d/105)*.1})`;ctx.lineWidth=.4;ctx.stroke();}}
    requestAnimationFrame(draw);
  })();
})();

// ── Counters ────────────────────────
function animateCounters(){
  document.querySelectorAll(".stat-num").forEach(el=>{
    const target=+el.dataset.target;let cur=0;const step=Math.ceil(target/40);
    const iv=setInterval(()=>{cur=Math.min(cur+step,target);el.textContent=cur;if(cur>=target)clearInterval(iv);},40);
  });
}
setTimeout(animateCounters,600);

// ── Theme — default LIGHT ─────────────
let dark=false; // start light
document.documentElement.setAttribute("data-theme","light");
document.getElementById("themeIcon").className="fa-solid fa-sun";

document.getElementById("themeToggle").addEventListener("click",()=>{
  dark=!dark;
  document.documentElement.setAttribute("data-theme",dark?"dark":"light");
  document.getElementById("themeIcon").className=dark?"fa-solid fa-moon":"fa-solid fa-sun";
});

// ── Mobile Menu ──────────────────────
window.toggleMenu=function(){ document.getElementById("navLinks").classList.toggle("open"); };
document.querySelectorAll(".nav-link").forEach(l=>l.addEventListener("click",()=>document.getElementById("navLinks").classList.remove("open")));
window.addEventListener("scroll",()=>{ document.getElementById("navbar").style.boxShadow=window.scrollY>20?"0 2px 28px rgba(0,0,0,.12)":""; });

// ── Track visit ──────────────────────
function trackVisit(){
  waitFb(async()=>{
    try{
      const{db,doc,getDoc,setDoc}=window._fb;
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
window.openAuthModal=function(){ openModal("authModal"); };
window.doSignOut=async function(){ await window._fb.signOut(window._fb.auth); showToast("Çıkış yapıldı."); };
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
  try{ await window._fb.signInWithEmailAndPassword(window._fb.auth,email,pass); closeModal("authModal"); showToast("Giriş başarılı! 👋"); }
  catch(e){ err.textContent="E-posta veya şifre hatalı."; }
};
window.doLoginGoogle=async function(){
  try{ await window._fb.signInWithPopup(window._fb.auth,window._fb.googleProvider); closeModal("authModal"); showToast("Google ile giriş yapıldı!"); }
  catch(e){ document.getElementById("loginError").textContent="Google girişi başarısız."; }
};
window.doRegister=async function(){
  const name=document.getElementById("regName").value.trim();
  const email=document.getElementById("regEmail").value.trim();
  const pass=document.getElementById("regPass").value;
  const pass2=document.getElementById("regPass2").value;
  const err=document.getElementById("regError"); err.textContent="";
  if(!name){err.textContent="İsim zorunludur.";return;}
  if(pass!==pass2){err.textContent="Şifreler eşleşmiyor.";return;}
  if(pass.length<6){err.textContent="Şifre en az 6 karakter.";return;}
  try{
    const cred=await window._fb.createUserWithEmailAndPassword(window._fb.auth,email,pass);
    await window._fb.updateProfile(cred.user,{displayName:name});
    closeModal("authModal"); showToast("Hesap oluşturuldu! 🎉");
  }catch(e){ err.textContent=e.code==="auth/email-already-in-use"?"Bu e-posta zaten kayıtlı.":"Hata: "+e.message; }
};

// ── Profile ──────────────────────────
window.openProfileModal=function(){
  const u=window._currentUser; if(!u) return;
  document.getElementById("profileName").value=u.displayName||"";
  const img=document.getElementById("profileAvatarImg");
  const init=document.getElementById("profileAvatarInit");
  if(u.photoURL&&img){img.src=u.photoURL;img.style.display="block";if(init)init.style.display="none";}
  else{if(img)img.style.display="none";if(init){init.style.display="flex";init.textContent=(u.displayName||u.email||"?")[0].toUpperCase();}}
  openModal("profileModal");
};
window.handleProfilePhotoChange=function(input){
  const file=input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    window._pendingPhotoB64=e.target.result;
    const img=document.getElementById("profileAvatarImg"),init=document.getElementById("profileAvatarInit");
    if(img){img.src=e.target.result;img.style.display="block";}
    if(init)init.style.display="none";
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
    await window._fb.setDoc(window._fb.doc(window._fb.db,"users",u.uid),{name,photoURL:updates.photoURL||u.photoURL||""},{merge:true});
    window._pendingPhotoB64=null;
    closeModal("profileModal"); showToast("Profil güncellendi ✓");
  }catch(e){err.textContent="Hata: "+e.message;}
};

// ── Bubbles ──────────────────────────
function launchBubbles(cb){
  const c=document.createElement("div"); c.className="bubble-container"; document.body.appendChild(c);
  for(let i=0;i<15;i++){const b=document.createElement("div");b.className="bubble";const s=Math.random()*52+16;b.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;animation-duration:${Math.random()*1.3+.8}s;animation-delay:${Math.random()*.3}s;`;c.appendChild(b);}
  setTimeout(()=>{c.remove();if(cb)cb();},600);
}

// ── Plan Detail ──────────────────────
window.openPlanDetail=function(plan){
  launchBubbles(()=>{
    const cont=document.getElementById("planDetailContent");
    const sym={"TRY":"₺","USD":"$","EUR":"€"}[plan.currency||"TRY"]||"₺";
    const priceStr=sym+Number(plan.price).toLocaleString("tr-TR");
    cont.innerHTML=`
      <button class="modal-close" onclick="closeModal('planDetailModal')"><i class="fa-solid fa-xmark"></i></button>
      <div class="plan-detail-header">
        ${plan.badge?`<div class="plan-badge">${plan.badge}</div>`:""}
        <h2>${plan.name}</h2>
        <p style="color:var(--text-2);font-size:.87rem;margin:.4rem 0 1rem">${plan.desc||""}</p>
        <div class="plan-detail-price">${priceStr}<span class="price-label"> ${plan.priceLabel||"/ aylık"}</span></div>
      </div>
      <ul class="plan-detail-features">${(plan.features||[]).map(f=>`<li>${f}</li>`).join("")}</ul>
      <p style="margin-top:1.4rem;color:var(--text-3);font-size:.79rem;text-align:center">
        Bu plan hakkında bilgi almak için <a href="#contact" onclick="closeModal('planDetailModal')" style="color:var(--teal)">iletişime geçin</a>.
      </p>`;
    openModal("planDetailModal");
  });
};

// ── PLANS ────────────────────────────
window._cachedPlans=[];
function renderPlans(plans){
  window._cachedPlans=plans;
  const grid=document.getElementById("plansGrid");
  if(!plans.length){grid.innerHTML=`<p style="color:var(--text-3);text-align:center;grid-column:1/-1">Henüz plan eklenmemiş.</p>`;return;}
  const isAdmin=window._currentUser?.email===window._fb?.ADMIN_EMAIL;
  grid.innerHTML=plans.map(p=>{
    const sym={"TRY":"₺","USD":"$","EUR":"€"}[p.currency||"TRY"]||"₺";
    const priceStr=sym+Number(p.price).toLocaleString("tr-TR");
    const colorClass=`color-${p.color||"gold"}`;
    const styleClass=`style-${p.colorStyle||"fill"}`;
    return`<div class="plan-card ${colorClass} ${styleClass}" onclick="openPlanDetail(${JSON.stringify(p).replace(/"/g,'&quot;')})">
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
  waitFb(()=>window._fb.onSnapshot(window._fb.collection(window._fb.db,"plans"),snap=>{
    renderPlans(snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order||0)-(b.order||0)));
  }));
}
window.openPlanModal=function(id=null){
  document.getElementById("planModalTitle").textContent=id?"Plan Düzenle":"Yeni Plan Ekle";
  document.getElementById("planEditId").value=id||"";
  document.getElementById("planDeleteBtn").style.display=id?"":"none";
  document.getElementById("planError").textContent="";
  if(id){
    waitFb(async()=>{
      const snap=await window._fb.getDoc(window._fb.doc(window._fb.db,"plans",id));
      if(snap.exists()){const d=snap.data();
        document.getElementById("planName").value=d.name||"";
        document.getElementById("planCurrency").value=d.currency||"TRY";
        document.getElementById("planPrice").value=d.price||"";
        document.getElementById("planPriceLabel").value=d.priceLabel||"";
        document.getElementById("planDesc").value=d.desc||"";
        document.getElementById("planFeatures").value=(d.features||[]).join("\n");
        document.getElementById("planColor").value=d.color||"gold";
        document.getElementById("planColorStyle").value=d.colorStyle||"fill";
        document.getElementById("planBadge").value=d.badge||"";
        document.getElementById("planOrder").value=d.order||"";
      }
    });
  } else {
    ["planName","planPrice","planPriceLabel","planDesc","planFeatures","planBadge","planOrder"].forEach(i=>document.getElementById(i).value="");
    document.getElementById("planCurrency").value="TRY";
    document.getElementById("planColor").value="gold";
    document.getElementById("planColorStyle").value="fill";
  }
  openModal("planModal");
};
window.savePlan=async function(){
  const{db,doc,setDoc,addDoc,collection,serverTimestamp}=window._fb;
  const id=document.getElementById("planEditId").value;
  const data={
    name:document.getElementById("planName").value.trim(),
    currency:document.getElementById("planCurrency").value,
    price:+document.getElementById("planPrice").value,
    priceLabel:document.getElementById("planPriceLabel").value.trim(),
    desc:document.getElementById("planDesc").value.trim(),
    features:document.getElementById("planFeatures").value.split("\n").filter(Boolean),
    color:document.getElementById("planColor").value,
    colorStyle:document.getElementById("planColorStyle").value,
    badge:document.getElementById("planBadge").value.trim(),
    order:+document.getElementById("planOrder").value||0,
    updatedAt:serverTimestamp()
  };
  if(!data.name||!data.price){document.getElementById("planError").textContent="Ad ve fiyat zorunludur.";return;}
  try{
    if(id) await setDoc(doc(db,"plans",id),data,{merge:true});
    else await addDoc(collection(db,"plans"),{...data,createdAt:serverTimestamp()});
    closeModal("planModal"); showToast(id?"Plan güncellendi ✓":"Plan eklendi ✓");
  }catch(e){document.getElementById("planError").textContent="Hata: "+e.message;}
};
window.deletePlan=async function(){
  const id=document.getElementById("planEditId").value;
  if(!id||!confirm("Planı silmek istediğinize emin misiniz?"))return;
  await window._fb.deleteDoc(window._fb.doc(window._fb.db,"plans",id));
  closeModal("planModal"); showToast("Plan silindi.");
};

// ── EXTRAS ───────────────────────────
window._cachedExtras=[];
function renderExtras(extras){
  window._cachedExtras=extras;
  const grid=document.getElementById("extrasGrid");
  if(!extras.length){grid.innerHTML=`<p style="color:var(--text-3);text-align:center;grid-column:1/-1">Henüz ekstra hizmet eklenmemiş.</p>`;return;}
  const isAdmin=window._currentUser?.email===window._fb?.ADMIN_EMAIL;
  grid.innerHTML=extras.map(e=>{
    const sym={"TRY":"₺","USD":"$","EUR":"€"}[e.currency||"TRY"]||"₺";
    return`<div class="extra-card">
      <div class="extra-icon"><i class="fa-solid ${e.icon||"fa-star"}"></i></div>
      <div class="extra-name">${e.name}</div>
      <div class="extra-desc">${e.desc||""}</div>
      <div class="extra-price">${sym}${Number(e.price).toLocaleString("tr-TR")}<span class="price-label"> ${e.priceLabel||"/ seans"}</span></div>
      ${isAdmin?`<button class="extra-edit-btn admin-only" onclick="openExtraModal('${e.id}')"><i class="fa-solid fa-pen"></i> Düzenle</button>`:""}
    </div>`;
  }).join("");
}
function loadExtras(){
  waitFb(()=>window._fb.onSnapshot(window._fb.collection(window._fb.db,"extras"),snap=>{
    renderExtras(snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order||0)-(b.order||0)));
  }));
}
window.openExtraModal=function(id=null){
  document.getElementById("extraModalTitle").textContent=id?"Ekstra Düzenle":"Yeni Ekstra Ekle";
  document.getElementById("extraEditId").value=id||"";
  document.getElementById("extraDeleteBtn").style.display=id?"":"none";
  document.getElementById("extraError").textContent="";
  if(id){
    waitFb(async()=>{
      const snap=await window._fb.getDoc(window._fb.doc(window._fb.db,"extras",id));
      if(snap.exists()){const d=snap.data();
        document.getElementById("extraName").value=d.name||"";
        document.getElementById("extraCurrency").value=d.currency||"TRY";
        document.getElementById("extraPrice").value=d.price||"";
        document.getElementById("extraPriceLabel").value=d.priceLabel||"";
        document.getElementById("extraDesc").value=d.desc||"";
        document.getElementById("extraIcon").value=d.icon||"";
        document.getElementById("extraOrder").value=d.order||"";
      }
    });
  } else ["extraName","extraPrice","extraPriceLabel","extraDesc","extraIcon","extraOrder"].forEach(i=>document.getElementById(i).value="");
  openModal("extraModal");
};
window.saveExtra=async function(){
  const{db,doc,setDoc,addDoc,collection,serverTimestamp}=window._fb;
  const id=document.getElementById("extraEditId").value;
  const data={
    name:document.getElementById("extraName").value.trim(),
    currency:document.getElementById("extraCurrency").value,
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
  if(!id||!confirm("Silmek istiyor musunuz?"))return;
  await window._fb.deleteDoc(window._fb.doc(window._fb.db,"extras",id));
  closeModal("extraModal"); showToast("Silindi.");
};

// ── ABOUT ────────────────────────────
function loadAbout(){
  waitFb(async()=>{
    const snap=await window._fb.getDoc(window._fb.doc(window._fb.db,"settings","about"));
    const data=snap.exists()?snap.data():{bio:"Merhaba, ben Berkay Yüklü. Sosyal medya yönetimi ve drone çekimi konularında hizmet veriyorum.",skills:["Reels","Drone","Fotoğrafçılık","Video Kurgu","Instagram"],photoUrl:""};
    document.getElementById("aboutBio").textContent=data.bio;
    document.getElementById("aboutSkills").innerHTML=(data.skills||[]).map(s=>`<span class="skill-tag">${s}</span>`).join("");
    const photo=document.getElementById("aboutPhoto"),icon=document.getElementById("aboutIcon");
    if(data.photoUrl&&photo){photo.src=data.photoUrl;photo.style.display="block";if(icon)icon.style.display="none";}
    else{if(photo)photo.style.display="none";if(icon)icon.style.display="";}
  });
}
window.openAboutModal=function(){
  waitFb(async()=>{
    const snap=await window._fb.getDoc(window._fb.doc(window._fb.db,"settings","about"));
    const data=snap.exists()?snap.data():{};
    document.getElementById("editBio").value=data.bio||"";
    document.getElementById("editSkills").value=(data.skills||[]).join(", ");
    document.getElementById("editPhotoUrl").value=data.photoUrl||"";
    openModal("aboutModal");
  });
};
window.saveAbout=async function(){
  await window._fb.setDoc(window._fb.doc(window._fb.db,"settings","about"),{
    bio:document.getElementById("editBio").value.trim(),
    skills:document.getElementById("editSkills").value.split(",").map(s=>s.trim()).filter(Boolean),
    photoUrl:document.getElementById("editPhotoUrl").value.trim()
  });
  closeModal("aboutModal"); loadAbout(); showToast("Hakkında güncellendi ✓");
};

// ── CONTACT ──────────────────────────
const defaultContact=[
  {icon:"fa-envelope",label:"E-posta",value:"yukluberkay@gmail.com",href:"mailto:yukluberkay@gmail.com"},
  {icon:"fa-phone",label:"Telefon",value:"0551 153 72 13",href:"tel:+905511537213"},
  {icon:"fa-brands fa-instagram",label:"Instagram",value:"@berkay_yuklu",href:"https://instagram.com/berkay_yuklu"}
];
let _contactFields=[];
function renderContact(fields){
  document.getElementById("contactGrid").innerHTML=fields.map(f=>`
    <a class="contact-card" href="${f.href||'#'}" target="_blank" rel="noopener">
      <div class="contact-icon"><i class="${f.icon?.startsWith('fa-brands')?f.icon:'fa-solid '+f.icon}"></i></div>
      <div><div class="contact-label">${f.label}</div><div class="contact-value">${f.value}</div></div>
    </a>`).join("");
}
function loadContact(){
  waitFb(async()=>{
    const snap=await window._fb.getDoc(window._fb.doc(window._fb.db,"settings","contact"));
    renderContact(snap.exists()?(snap.data().fields||defaultContact):defaultContact);
  });
}
window.openContactModal=function(){
  waitFb(async()=>{
    const snap=await window._fb.getDoc(window._fb.doc(window._fb.db,"settings","contact"));
    _contactFields=snap.exists()?JSON.parse(JSON.stringify(snap.data().fields||defaultContact)):JSON.parse(JSON.stringify(defaultContact));
    renderContactEditFields(); openModal("contactModal");
  });
};
function renderContactEditFields(){
  document.getElementById("contactEditFields").innerHTML=_contactFields.map((f,i)=>`
    <div class="contact-edit-row"><input type="text" class="form-input" placeholder="İkon" value="${f.icon||""}" oninput="_contactFields[${i}].icon=this.value"/>
    <input type="text" class="form-input" placeholder="Etiket" value="${f.label||""}" oninput="_contactFields[${i}].label=this.value"/>
    <input type="text" class="form-input" placeholder="Değer" value="${f.value||""}" oninput="_contactFields[${i}].value=this.value"/>
    <button onclick="removeContactField(${i})"><i class="fa-solid fa-trash"></i></button></div>
    <div style="margin-bottom:.8rem"><input type="text" class="form-input" placeholder="Link (href)" value="${f.href||""}" oninput="_contactFields[${i}].href=this.value"/></div>`).join("");
}
window.removeContactField=(i)=>{_contactFields.splice(i,1);renderContactEditFields();};
window.addContactField=()=>{_contactFields.push({icon:"fa-star",label:"",value:"",href:"#"});renderContactEditFields();};
window.saveContact=async function(){
  await window._fb.setDoc(window._fb.doc(window._fb.db,"settings","contact"),{fields:_contactFields});
  closeModal("contactModal"); loadContact(); showToast("İletişim bilgileri güncellendi ✓");
};

// ── STATS ────────────────────────────
const defaultStats=[{num:50,suffix:"+",label:"Müşteri"},{num:200,suffix:"+",label:"İçerik"},{num:3,suffix:"",label:"Yıl Deneyim"}];
let _statFields=[];
function renderHeroStats(stats){
  const c=document.getElementById("heroStats"); if(!c) return;
  c.innerHTML=stats.map((s,i)=>`${i>0?'<div class="stat-divider"></div>':''}<div class="stat"><span class="stat-num" data-target="${s.num}">0</span><span>${s.suffix||""}${s.label}</span></div>`).join("");
  c.querySelectorAll(".stat-num").forEach(el=>{const target=+el.dataset.target;let cur=0;const step=Math.ceil(target/40);const iv=setInterval(()=>{cur=Math.min(cur+step,target);el.textContent=cur;if(cur>=target)clearInterval(iv);},40);});
}
function loadStats(){
  waitFb(async()=>{
    const snap=await window._fb.getDoc(window._fb.doc(window._fb.db,"settings","heroStats"));
    renderHeroStats(snap.exists()?(snap.data().stats||defaultStats):defaultStats);
  });
}
window.openStatsModal=async function(){
  try{
    _statFields=[...defaultStats];
    if(window._fb){const snap=await window._fb.getDoc(window._fb.doc(window._fb.db,"settings","heroStats"));if(snap.exists())_statFields=[...(snap.data().stats||defaultStats)];}
    renderStatEditFields(); openModal("statsModal");
  }catch(e){showToast("Hata: "+e.message);}
};
function renderStatEditFields(){
  const c=document.getElementById("statsEditFields"); if(!c) return;
  c.innerHTML=_statFields.map((s,i)=>`<div class="stat-edit-row" data-index="${i}" style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:.45rem;align-items:end;margin-bottom:.65rem">
    <div><label style="font-size:.72rem;color:var(--text-3);display:block;margin-bottom:.18rem">Sayı</label><input type="number" class="form-input stat-num-input" data-i="${i}" value="${s.num}"/></div>
    <div><label style="font-size:.72rem;color:var(--text-3);display:block;margin-bottom:.18rem">Ek</label><input type="text" class="form-input stat-suffix-input" data-i="${i}" value="${s.suffix||''}"/></div>
    <div><label style="font-size:.72rem;color:var(--text-3);display:block;margin-bottom:.18rem">Etiket</label><input type="text" class="form-input stat-label-input" data-i="${i}" value="${s.label}"/></div>
    <button onclick="removeStatField(${i})" style="height:38px;width:38px;border-radius:9px;background:rgba(220,50,50,.1);border:1px solid rgba(220,50,50,.3);color:#e55;cursor:pointer;font-size:.82rem;display:flex;align-items:center;justify-content:center;margin-top:1.1rem"><i class="fa-solid fa-trash"></i></button></div>`).join("");
}
function readStatFieldsFromDOM(){return Array.from(document.querySelectorAll(".stat-edit-row")).map(r=>({num:+r.querySelector(".stat-num-input").value||0,suffix:r.querySelector(".stat-suffix-input").value,label:r.querySelector(".stat-label-input").value}));}
window.removeStatField=(i)=>{_statFields=readStatFieldsFromDOM();_statFields.splice(i,1);renderStatEditFields();};
window.addStatField=()=>{_statFields=readStatFieldsFromDOM();_statFields.push({num:0,suffix:"+",label:"Yeni"});renderStatEditFields();};
window.saveStats=async function(){
  try{_statFields=readStatFieldsFromDOM();if(window._fb)await window._fb.setDoc(window._fb.doc(window._fb.db,"settings","heroStats"),{stats:_statFields});closeModal("statsModal");renderHeroStats(_statFields);showToast("İstatistikler güncellendi ✓");}catch(e){showToast("Hata: "+e.message);}
};

// ── REVIEWS (with approval) ──────────
let _selectedRating=5;
window.setRating=function(n){_selectedRating=n;document.querySelectorAll("#starSelect span").forEach((s,i)=>s.classList.toggle("active",i<n));};
document.querySelectorAll("#starSelect span").forEach((s,i)=>s.classList.toggle("active",i<_selectedRating));
function loadReviews(){
  waitFb(()=>window._fb.onSnapshot(window._fb.collection(window._fb.db,"reviews"),snap=>{
    const all=snap.docs.map(d=>({id:d.id,...d.data()}));
    const approved=all.filter(r=>r.approved===true).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    const pending=all.filter(r=>!r.approved);
    // Public grid
    const grid=document.getElementById("reviewsGrid");
    if(!approved.length){grid.innerHTML=`<p style="color:var(--text-3);text-align:center;grid-column:1/-1">Henüz onaylı yorum yok.</p>`;}
    else{
      const isAdmin=window._currentUser?.email===window._fb?.ADMIN_EMAIL;
      grid.innerHTML=approved.map(r=>`<div class="review-card">
        ${isAdmin?`<button class="review-delete-btn admin-only" onclick="deleteReview('${r.id}')"><i class="fa-solid fa-trash"></i></button>`:""}
        <div class="review-stars">${"★".repeat(r.rating||5)}${"☆".repeat(5-(r.rating||5))}</div>
        <div class="review-text">"${r.text}"</div>
        <div class="review-author">
          <div class="review-avatar">${r.photoURL?`<img src="${r.photoURL}">`:(r.name||"?")[0].toUpperCase()}</div>
          <div class="review-author-info"><strong>${r.name||"Anonim"}</strong><span>${r.business||""}</span></div>
        </div></div>`).join("");
    }
    // Dashboard pending
    const badge=document.getElementById("dbRevBadge");
    if(badge) badge.textContent=pending.length||"";
    const pendingList=document.getElementById("pendingReviewsList");
    if(pendingList){
      if(!pending.length){pendingList.innerHTML=`<p style="color:var(--text-3);font-size:.85rem">Onay bekleyen yorum yok.</p>`;}
      else{pendingList.innerHTML=pending.map(r=>`<div class="pending-review-item">
        <div style="font-weight:600;font-size:.87rem">${r.name||"Anonim"} ${r.business?`— <span style="color:var(--text-3)">${r.business}</span>`:""}</div>
        <div style="color:#f5c842;font-size:.84rem;margin:.18rem 0">${"★".repeat(r.rating||5)}</div>
        <div style="color:var(--text-2);font-size:.83rem">${r.text}</div>
        <div class="pending-actions">
          <button class="btn-approve" onclick="approveReview('${r.id}')"><i class="fa-solid fa-check"></i> Onayla</button>
          <button class="btn-reject" onclick="deleteReview('${r.id}')"><i class="fa-solid fa-xmark"></i> Reddet</button>
        </div></div>`).join("");}
    }
  }));
}
window.submitReview=async function(){
  const u=window._currentUser; if(!u){showToast("Yorum için giriş yapın.");return;}
  const text=document.getElementById("reviewText").value.trim();
  if(!text){showToast("Yorum metni boş olamaz.");return;}
  await window._fb.addDoc(window._fb.collection(window._fb.db,"reviews"),{
    name:u.displayName||u.email,photoURL:u.photoURL||"",
    business:document.getElementById("reviewBusiness").value.trim(),
    text,rating:_selectedRating,approved:false,
    createdAt:window._fb.serverTimestamp()
  });
  document.getElementById("reviewBusiness").value="";
  document.getElementById("reviewText").value="";
  showToast("Yorumunuz onay bekliyor 🙏");
};
window.approveReview=async function(id){
  try{
    await window._fb.setDoc(window._fb.doc(window._fb.db,"reviews",id),{approved:true},{merge:true});
    showToast("Yorum onaylandı ✓");
  }catch(e){showToast("Hata: "+e.message);}
};
window.deleteReview=async function(id){
  if(!confirm("Yorumu silmek istiyor musunuz?"))return;
  await window._fb.deleteDoc(window._fb.doc(window._fb.db,"reviews",id));
  showToast("Yorum silindi.");
};

// ── LIVE CHAT ────────────────────────
let _chatOpen=false;
let _chatUnsub=null;
window.toggleChat=function(){
  _chatOpen=!_chatOpen;
  document.getElementById("chatPanel").style.display=_chatOpen?"flex":"none";
  if(_chatOpen&&window._currentUser) initChat();
};
function initChat(){
  const u=window._currentUser; if(!u) return;
  const{db,collection,query,orderBy,onSnapshot,serverTimestamp}=window._fb;
  const chatRef=collection(db,"chats",u.uid,"messages");
  const q=query(chatRef,orderBy("createdAt","asc"));
  if(_chatUnsub) _chatUnsub();
  _chatUnsub=onSnapshot(q,snap=>{
    const msgs=document.getElementById("chatMessages"); if(!msgs) return;
    msgs.innerHTML=snap.docs.map(d=>{
      const m=d.data();
      const isAdmin=m.from===window._fb.ADMIN_EMAIL;
      const isMine=m.uid===u.uid&&!isAdmin;
      const cls=isMine?"mine":isAdmin?"theirs admin-msg":"theirs";
      const time=m.createdAt?.toDate?.()?new Date(m.createdAt.toDate()).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}):"";
      if(m.fileUrl){
        const isImg=m.fileType?.startsWith("image");
        return`<div class="chat-msg ${cls}">${isImg?`<img class="chat-msg-img" src="${m.fileUrl}" onclick="window.open('${m.fileUrl}','_blank')" />`:`<div class="chat-msg-file"><i class="fa-solid fa-file"></i><a href="${m.fileUrl}" target="_blank" rel="noopener">${m.fileName||"Dosya"}</a></div>`}<div class="chat-msg-time">${time}</div></div>`;
      }
      return`<div class="chat-msg ${cls}">${m.text}<div class="chat-msg-time">${time}</div></div>`;
    }).join("");
    msgs.scrollTop=msgs.scrollHeight;
    // clear badge
    const badge=document.getElementById("chatBadge");
    if(badge) badge.style.display="none";
  });
}
window.sendChatMsg=async function(){
  const u=window._currentUser; if(!u) return;
  const input=document.getElementById("chatInput");
  const text=input.value.trim(); if(!text) return;
  input.value="";
  await window._fb.addDoc(window._fb.collection(window._fb.db,"chats",u.uid,"messages"),{
    text,uid:u.uid,from:u.email,fromName:u.displayName||u.email,
    createdAt:window._fb.serverTimestamp()
  });
  // Ensure user thread exists
  await window._fb.setDoc(window._fb.doc(window._fb.db,"chatUsers",u.uid),{
    uid:u.uid,email:u.email,name:u.displayName||u.email,
    lastMsg:text,lastTime:window._fb.serverTimestamp(),unread:true
  },{merge:true});
};
window.sendChatFile=async function(input){
  const u=window._currentUser; if(!u) return;
  const file=input.files[0]; if(!file) return;
  // Read as base64 (no Firebase Storage needed — store URL or base64 snippet)
  // For files, we'll store download URL via Firebase Storage if available
  try{
    const{storage,ref,uploadBytes,getDownloadURL,addDoc,collection,doc,setDoc,serverTimestamp}=window._fb;
    const storageRef=ref(storage,`chat/${u.uid}/${Date.now()}_${file.name}`);
    const snap=await uploadBytes(storageRef,file);
    const url=await getDownloadURL(snap.ref);
    await addDoc(collection(window._fb.db,"chats",u.uid,"messages"),{
      fileUrl:url,fileName:file.name,fileType:file.type,
      uid:u.uid,from:u.email,fromName:u.displayName||u.email,
      createdAt:serverTimestamp()
    });
    await setDoc(doc(window._fb.db,"chatUsers",u.uid),{uid:u.uid,email:u.email,name:u.displayName||u.email,lastMsg:"[Dosya]",lastTime:serverTimestamp(),unread:true},{merge:true});
    input.value="";
    showToast("Dosya gönderildi ✓");
  }catch(e){showToast("Dosya gönderilemedi: "+e.message);}
};

// ── DASHBOARD ────────────────────────
let _visitChart=null;
window.openDashboard=function(){
  document.getElementById("dashboard").classList.add("open");
  document.getElementById("dashboard").style.display="flex";
  document.getElementById("dashboardOverlay").classList.add("open");
  loadAnalytics();
  loadDashboardChats();
  loadDashboardPlans();
};
window.closeDashboard=function(){
  document.getElementById("dashboard").classList.remove("open");
  document.getElementById("dashboard").style.display="none";
  document.getElementById("dashboardOverlay").classList.remove("open");
};
window.switchDTab=function(btn,tabId){
  document.querySelectorAll(".dtab").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll(".dtab-content").forEach(c=>{c.classList.remove("active");c.style.display="none";});
  btn.classList.add("active");
  const tab=document.getElementById(tabId);
  if(tab){tab.classList.add("active");tab.style.display="block";}
  if(tabId==="dtab-chat") loadDashboardChats();
};

function loadAnalytics(){
  waitFb(async()=>{
    const{db,doc,getDoc,collection,getDocs}=window._fb;
    try{
      const snap=await getDoc(doc(db,"analytics","visits"));
      const data=snap.exists()?snap.data():{total:0,days:{}};
      const el=document.getElementById("statViews"); if(el) el.textContent=(data.total||0).toLocaleString("tr-TR");
      // Chart
      const labels=[],vals=[];
      for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=d.toISOString().slice(0,10);labels.push(d.toLocaleDateString("tr-TR",{month:"short",day:"numeric"}));vals.push(data.days?.[key]||0);}
      const canvas=document.getElementById("visitChart");
      if(canvas&&window.Chart){if(_visitChart)_visitChart.destroy();
        _visitChart=new Chart(canvas,{type:"line",data:{labels,datasets:[{label:"Ziyaretçi",data:vals,borderColor:"#00b896",backgroundColor:"rgba(0,184,150,.08)",tension:.4,fill:true,pointBackgroundColor:"#00b896"}]},options:{plugins:{legend:{display:false}},scales:{x:{grid:{color:"rgba(128,128,128,.08)"},ticks:{color:"#5a7a94"}},y:{grid:{color:"rgba(128,128,128,.08)"},ticks:{color:"#5a7a94",stepSize:1}}}}});}
    }catch(e){}
    try{const s=await getDocs(window._fb.collection(db,"users"));const el=document.getElementById("statUsers");if(el)el.textContent=s.size;}catch(e){}
    try{
      const cuSnap=await getDocs(window._fb.collection(db,"chatUsers"));
      const el=document.getElementById("statMessages");
      if(el)el.textContent=cuSnap.size;
      const badge=document.getElementById("dbMsgBadge");
      const unread=cuSnap.docs.filter(d=>d.data().unread).length;
      if(badge)badge.textContent=unread||"";
    }catch(e){}
    try{const s=await getDocs(window._fb.collection(db,"reviews"));const pending=s.docs.filter(d=>!d.data().approved).length;const el=document.getElementById("statPending");if(el)el.textContent=pending;}catch(e){}
  });
}

// Dashboard chat — list all users
let _activeAdminChatUid=null;
let _adminChatUnsub=null;
function loadDashboardChats(){
  waitFb(()=>{
    window._fb.onSnapshot(window._fb.collection(window._fb.db,"chatUsers"),snap=>{
      const users=snap.docs.map(d=>({id:d.id,...d.data()}));
      const badge=document.getElementById("dbChatBadge");
      const unread=users.filter(u=>u.unread).length;
      if(badge) badge.textContent=unread||"";
      const list=document.getElementById("dbChatUserList"); if(!list) return;
      if(!users.length){list.innerHTML=`<div style="padding:1rem;color:var(--text-3);font-size:.82rem">Henüz konuşma yok.</div>`;return;}
      list.innerHTML=users.map(u=>`<div class="db-user-item${u.unread?" unread":""}" onclick="openAdminChat('${u.uid||u.id}','${(u.name||u.email||"").replace(/'/g,"&apos;")}')">
        <div style="font-weight:600;font-size:.83rem">${u.name||u.email}</div>
        <div style="font-size:.72rem;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.lastMsg||""}</div>
      </div>`).join("");
    });
  });
}
window.openAdminChat=function(uid,name){
  _activeAdminChatUid=uid;
  // Mark as read
  window._fb.setDoc(window._fb.doc(window._fb.db,"chatUsers",uid),{unread:false},{merge:true});
  const area=document.getElementById("dbAdminChatArea");
  area.innerHTML=`<div style="padding:.7rem 1rem;border-bottom:1px solid var(--card-border);font-weight:600;font-size:.88rem">${name}</div>
    <div class="db-chat-msgs" id="dbAdminMsgs"></div>
    <div class="db-chat-input-row">
      <input type="text" id="dbAdminInput" placeholder="Yanıtla..." onkeydown="if(event.key==='Enter')sendAdminReply('${uid}')"/>
      <button onclick="sendAdminReply('${uid}')">Gönder</button>
    </div>`;
  if(_adminChatUnsub) _adminChatUnsub();
  const q=window._fb.query(window._fb.collection(window._fb.db,"chats",uid,"messages"),window._fb.orderBy("createdAt","asc"));
  _adminChatUnsub=window._fb.onSnapshot(q,snap=>{
    const msgs=document.getElementById("dbAdminMsgs"); if(!msgs) return;
    msgs.innerHTML=snap.docs.map(d=>{
      const m=d.data();
      const isAdmin=m.from===window._fb.ADMIN_EMAIL;
      const cls=isAdmin?"mine":"theirs";
      const time=m.createdAt?.toDate?.()?new Date(m.createdAt.toDate()).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}):"";
      if(m.fileUrl){const isImg=m.fileType?.startsWith("image");return`<div class="chat-msg ${cls}">${isImg?`<img class="chat-msg-img" src="${m.fileUrl}"/>`:`<a href="${m.fileUrl}" target="_blank" style="color:inherit">${m.fileName}</a>`}<div class="chat-msg-time">${time}</div></div>`;}
      return`<div class="chat-msg ${cls}">${m.text}<div class="chat-msg-time">${time}</div></div>`;
    }).join("");
    msgs.scrollTop=msgs.scrollHeight;
  });
};
window.sendAdminReply=async function(uid){
  const input=document.getElementById("dbAdminInput"); if(!input) return;
  const text=input.value.trim(); if(!text) return;
  input.value="";
  const{db,addDoc,collection,doc,setDoc,serverTimestamp}=window._fb;
  await addDoc(collection(db,"chats",uid,"messages"),{
    text,uid:"admin",from:window._fb.ADMIN_EMAIL,fromName:"Berkay",
    createdAt:serverTimestamp()
  });
  await setDoc(doc(db,"chatUsers",uid),{lastMsg:text,lastTime:serverTimestamp(),unread:false},{merge:true});
  // Notify user via badge
  const chatBadge=document.getElementById("chatBadge");
  if(chatBadge&&window._currentUser?.uid===uid){chatBadge.style.display="flex";chatBadge.textContent="!";}
};

function loadDashboardPlans(){
  waitFb(()=>{
    const list=document.getElementById("dbPlansList"); if(!list) return;
    window._fb.onSnapshot(window._fb.collection(window._fb.db,"plans"),snap=>{
      const plans=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order||0)-(b.order||0));
      if(!plans.length){list.innerHTML=`<p style="color:var(--text-3);font-size:.85rem">Plan yok.</p>`;return;}
      list.innerHTML=plans.map(p=>{
        const sym={"TRY":"₺","USD":"$","EUR":"€"}[p.currency||"TRY"]||"₺";
        return`<div style="background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:.9rem 1rem;margin-bottom:.6rem;display:flex;align-items:center;justify-content:space-between;gap:1rem">
          <div><div style="font-weight:700;font-size:.88rem">${p.name}</div><div style="font-size:.78rem;color:var(--text-3)">${sym}${p.price} ${p.priceLabel||""}</div></div>
          <button class="btn-admin" onclick="openPlanModal('${p.id}')"><i class="fa-solid fa-pen"></i></button>
        </div>`;
      }).join("");
    });
  });
}

// ── Auth ready callback ───────────────
window._onAuthReady=function(user,isAdmin){
  if(isAdmin){
    loadReviews(); // re-render with admin controls
  }
  if(_chatOpen&&user) initChat();
};

// ── Fade-in observer ─────────────────
const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible");});},{threshold:.08});
document.querySelectorAll(".section,.hero-badge,.hero-title,.hero-sub,.hero-cta").forEach(el=>{el.classList.add("fade-in");io.observe(el);});
setTimeout(()=>{document.querySelectorAll(".hero-badge,.hero-title,.hero-sub,.hero-cta").forEach((el,i)=>setTimeout(()=>el.classList.add("visible"),i*120));},100);

// ── Init ─────────────────────────────
loadPlans();
loadExtras();
loadAbout();
loadContact();
loadReviews();
loadStats();
