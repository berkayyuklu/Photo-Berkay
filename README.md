# 📸 Photo Berkay — Kurulum Rehberi

## Proje Yapısı

```
photo-berkay/
├── index.html          ← Ana sayfa
├── css/
│   └── style.css       ← Tüm stiller
├── js/
│   └── app.js          ← Firebase + uygulama mantığı
└── README.md
```

---

## 🔥 Firebase Kurulumu (Zorunlu)

### 1. Firebase Projesi Oluştur
1. [console.firebase.google.com](https://console.firebase.google.com) adresine git
2. **"Add project"** → Proje adını gir (örn: `photo-berkay`)
3. Google Analytics eklemek ister misiniz? → İsteğe bağlı, "Continue"

### 2. Web Uygulaması Ekle
1. Firebase konsolunda `</>` (Web) ikonuna tıkla
2. App nickname: `photo-berkay-web`
3. **"Register app"** → Sana bir `firebaseConfig` objesi verecek

### 3. `index.html` dosyasını güncelle
`index.html` içindeki şu kısmı bul ve kendi değerlerinle değiştir:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // ← Buraya yapıştır
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Authentication Ayarları
Firebase Konsol → **Authentication** → **Sign-in method**:
- ✅ **Email/Password** → Enable
- ✅ **Google** → Enable → Support email: `yukluberkay@gmail.com` → Save

### 5. Firestore Database Oluştur
Firebase Konsol → **Firestore Database** → **Create database**
- Production mode seç → Next
- Bölge: `europe-west1` (Avrupa) → Enable

### 6. Firestore Güvenlik Kuralları
Firestore → **Rules** sekmesine git ve şunu yapıştır:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Planlar, ekstralar, hakkında, iletişim → Herkes okuyabilir, sadece admin yazabilir
    match /plans/{id} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == "yukluberkay@gmail.com";
    }
    match /extras/{id} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == "yukluberkay@gmail.com";
    }
    match /settings/{id} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == "yukluberkay@gmail.com";
    }
    // Yorumlar → Herkes okuyabilir ve yazabilir, silme sadece admin
    match /reviews/{id} {
      allow read: if true;
      allow create: if true;
      allow delete: if request.auth != null && request.auth.token.email == "yukluberkay@gmail.com";
    }
  }
}
```

**Publish** butonuna bas.

### 7. Admin Hesabı Oluştur
Firebase Konsol → Authentication → **Users** → **Add user**:
- Email: `yukluberkay@gmail.com`
- Password: `admin2008`

---

## 🚀 GitHub Pages ile Yayınlama

### 1. GitHub'a Yükle
```bash
git init
git add .
git commit -m "Initial commit - Photo Berkay"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/photo-berkay.git
git push -u origin main
```

### 2. GitHub Pages Aktifleştir
1. GitHub → Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `/ (root)`
4. **Save**

Birkaç dakika içinde `https://KULLANICI_ADIN.github.io/photo-berkay/` adresinde yayında olur!

### 3. Firebase'e Domain Ekle (Google Login için)
Firebase Konsol → Authentication → **Settings** → **Authorized domains**:
- `KULLANICI_ADIN.github.io` → **Add domain**

---

## 📝 Kullanım Kılavuzu

### Admin Girişi
- Sağ üstte **"Giriş Yap"** butonuna tıkla
- E-posta: `yukluberkay@gmail.com` | Şifre: `admin2008`
- Veya **Google ile Giriş Yap**

### Plan Yönetimi
- Giriş yaptıktan sonra **"Planlar"** bölümünde **"Yeni Plan Ekle"** butonu görünür
- Her planın altındaki **"Düzenle"** butonuyla mevcut planları güncelleyebilirsin

### Ekstra Hizmet Yönetimi
- **"Ekstra Hizmetler"** bölümünde **"Yeni Ekstra Ekle"** butonu

### Hakkımda & İletişim
- İlgili bölümlerin altındaki **"Düzenle"** butonlarıyla güncelleyebilirsin

---

## 🎨 Özellikler

- ✅ Lacivert & Teal renk teması
- ✅ Koyu / Açık tema geçişi
- ✅ Parçacık animasyonu (arka plan)
- ✅ Baloncuk animasyonuyla plan detay sayfası
- ✅ Firebase Auth (E-posta + Google)
- ✅ Firestore gerçek zamanlı veritabanı
- ✅ Admin paneli (yalnızca yukluberkay@gmail.com)
- ✅ Plan / Ekstra / Hakkında / İletişim yönetimi
- ✅ Müşteri yorumları (herkese açık)
- ✅ Tam responsive tasarım
- ✅ GitHub Pages uyumlu (statik dosya)

---

## ⚠️ Notlar

- Satın al / Sipariş et butonu **yoktur** (bilgi amaçlı site)
- Tüm içerik Firebase Firestore'da saklanır
- Site ilk açıldığında Firestore'dan veri çeker; internet bağlantısı gereklidir
