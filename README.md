# 📸 Photo Berkay — Sosyal Medya Yönetimi Sitesi

Profesyonel sosyal medya yönetimi hizmetleri için tasarlanmış, Firebase destekli modern bir web sitesi.

---

## 📁 Dosya Yapısı

```
photo-berkay/
├── index.html        ← Ana sayfa (tek HTML dosyası)
├── css/
│   └── style.css     ← Tüm stiller
├── js/
│   └── app.js        ← Firebase + uygulama mantığı
└── README.md
```

---

## ✨ Özellikler

### Genel
- 🌗 Açık / Koyu tema geçişi (varsayılan: açık mod)
- 📱 Tam responsive tasarım (mobil uyumlu)
- ✨ Parçacık animasyonlu arka plan
- 🎨 **Pinyon Script** logo fontu (elegant görünüm)
- 🔤 **Plus Jakarta Sans + Space Grotesk** yazı tipleri

### Hizmet Planları
- Metalik plan kartları: Altın, Gümüş, Bronz, Zümrüt, Safir, Rose Gold
- 5 farklı renk stili: Dolgu, Çerçeve, Üst Şerit, Soluk Parıltı, Boyasız
- Para birimi seçimi: ₺ TL / $ USD / € EUR (plan eklerken seçilir, sabit kur yok)
- Plana tıklayınca baloncuk animasyonuyla detay modalı

### Yönetim (Admin Paneli)
- 🔐 Sadece admin hesabı düzenleme yetkisine sahip
- Kontrol Paneli (sağ üst köşe → **Panel** butonu):
  - **Analiz** — Toplam görüntülenme, kullanıcı sayısı, mesaj sayısı, bekleyen yorum; Son 7 gün ziyaretçi grafiği
  - **Sohbetler** — Tüm kullanıcı konuşmaları, yanıt gönderme, dosya/fotoğraf paylaşımı
  - **Yorumlar** — Onay bekleyen yorumları onayla veya reddet
  - **Planlar** — Plan ve ekstra hizmetleri hızlıca düzenle
- Hero istatistiklerini düzenleme (50+ Müşteri vb.)
- Hakkında bölümünü düzenleme
- İletişim bilgilerini düzenleme (sosyal medya ekle/çıkar)

### Kullanıcı Sistemi
- Kayıt Ol / Giriş Yap (e-posta + şifre veya Google)
- Profil fotoğrafı yükleme (base64)
- Yorum yapabilme (admin onayı gerekli, onaylanmadan sitede görünmez)

### Canlı Sohbet
- Sağ alt köşede sabit **💬 Canlı Destek** butonu
- Giriş yapan kullanıcılar admin ile anlık mesajlaşabilir
- Dosya ve fotoğraf gönderimi (base64, maks. 2MB)
- Admin konuşmalara kontrol panelinden yanıt verir
- Okunmamış mesaj bildirimi (kırmızı rozet)

---

## 🔥 Firebase Kurulumu

### 1. Firebase Projesi
[console.firebase.google.com](https://console.firebase.google.com) → Proje oluştur → Web uygulaması ekle → Config'i kopyala.

### 2. `index.html` İçindeki Config'i Güncelle
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### 3. Authentication
Firebase Console → Authentication → Sign-in method:
- ✅ **Email/Password** → Enable
- ✅ **Google** → Enable → Support email ekle → Save


### 4. Firestore Database
Firebase Console → Firestore Database → Create database → Production mode → Bölge: `europe-west1`

### 5. Firestore Güvenlik Kuralları
Firestore → **Rules** sekmesi → aşağıdakini yapıştır → **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

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
    match /analytics/{id} {
      allow read, write: if request.auth != null && request.auth.token.email == "yukluberkay@gmail.com";
    }
    match /reviews/{id} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.token.email == "yukluberkay@gmail.com";
      allow delete: if request.auth != null && request.auth.token.email == "yukluberkay@gmail.com";
    }
    match /chats/{uid}/messages/{msgId} {
      allow read: if request.auth != null && (request.auth.uid == uid || request.auth.token.email == "yukluberkay@gmail.com");
      allow create: if request.auth != null && (request.auth.uid == uid || request.auth.token.email == "yukluberkay@gmail.com");
      allow delete: if request.auth != null && request.auth.token.email == "yukluberkay@gmail.com";
    }
    match /chatUsers/{uid} {
      allow read: if request.auth != null && request.auth.token.email == "yukluberkay@gmail.com";
      allow write: if request.auth != null && (request.auth.uid == uid || request.auth.token.email == "yukluberkay@gmail.com");
    }
    match /users/{uid} {
      allow read: if request.auth != null && (request.auth.uid == uid || request.auth.token.email == "yukluberkay@gmail.com");
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## 🚀 GitHub Pages ile Yayınlama

```bash
git init
git add .
git commit -m "Photo Berkay v1.0"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/photo-berkay.git
git push -u origin main
```

GitHub → Repository → **Settings** → **Pages** → Branch: `main` / `/ (root)` → **Save**

Site birkaç dakika içinde `https://berkayyuklu.github.io/Photo-Berkay/` adresinde yayında olur.

### Google Login için Domain Ekle
Firebase Console → Authentication → **Settings** → **Authorized domains** → `berkayyuklu.github.io` → **Add domain**

---

## 🛠️ Admin Kullanım Kılavuzu

| İşlem | Nasıl Yapılır |
|---|---|
| Giriş | Sağ üst → Giriş Yap → admin hesabı
| Kontrol Paneli | Giriş sonrası sağ üstte **Panel** butonu |
| Plan Ekle/Düzenle | Panel → Planlar sekmesi veya ana sayfada plan altındaki Düzenle butonu |
| Yorum Onayla | Panel → Yorumlar sekmesi → Onayla / Reddet |
| Müşteri Mesajı | Panel → Sohbetler sekmesi → kullanıcıyı seç → yanıtla |
| Dosya Gönder | Sohbet içinde 📎 ikonu (maks. 2MB, drive linki öneri) |
| Hakkında Düzenle | Hakkımda bölümü altındaki Düzenle butonu |
| İletişim Düzenle | İletişim bölümü altındaki Düzenle butonu |
| İstatistik Düzenle | Hero bölümündeki İstatistikleri Düzenle butonu |

---

## 📝 Notlar

- Site tamamen **bilgi amaçlıdır** — satın al / sipariş et butonu yoktur
- Fiyatlar **sabit kur olmadan** girilir (TL, USD veya EUR seçilir, dönüşüm yoktur)
- Yorumlar admin onayı olmadan sitede **görünmez**
- Dosya gönderimi base64 ile çalışır, Firebase Storage gerektirmez (2MB sınırı)
- Büyük dosyalar için Google Drive linki paylaşılabilir

---

© 2025 Photo Berkay — Berkay Yüklü
