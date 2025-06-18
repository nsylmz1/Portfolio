# Görev Takip Sistemi

Bu proje, şirketler ve ekipler için geliştirilmiş bir görev takip sistemidir. Kullanıcılar görev oluşturabilir, atayabilir ve takip edebilir.

## Özellikler

- Kullanıcı yönetimi (Admin, SuperAdmin ve normal kullanıcı rolleri)
- Görev oluşturma ve atama
- Görev durumu takibi
- Bildirim sistemi
- E-posta bildirimleri
- Görev raporları
- Görev adımları takibi

## Teknolojiler

- Frontend: HTML, CSS, JavaScript
- Backend: Python (Flask)
- Veritabanı: Firebase Firestore
- Kimlik Doğrulama: Firebase Authentication
- E-posta Servisi: SMTP (Gmail)

## Detaylı Kurulum Adımları

### 1. Gerekli Yazılımların Kurulumu

#### Python Kurulumu
1. [Python'un resmi sitesinden](https://www.python.org/downloads/) en son Python sürümünü indirin
2. Kurulum sırasında "Add Python to PATH" seçeneğini işaretleyin
3. Kurulumu tamamlayın
4. Terminal/Komut İstemcisinde `python --version` komutunu çalıştırarak kurulumu doğrulayın

#### Git Kurulumu
1. [Git'in resmi sitesinden](https://git-scm.com/downloads) işletim sisteminize uygun sürümü indirin
2. Kurulumu tamamlayın
3. Terminal/Komut İstemcisinde `git --version` komutunu çalıştırarak kurulumu doğrulayın

#### Postman Kurulumu
1. [Postman'in resmi sitesinden](https://www.postman.com/downloads/) işletim sisteminize uygun sürümü indirin
2. Kurulumu tamamlayın
3. Postman'i açın ve bir hesap oluşturun (ücretsiz)

### 2. Projeyi Klonlama ve Hazırlık

```bash
# Projeyi klonlayın
git clone https://github.com/nsylmz1/gorev-takip.git

# Proje dizinine gidin
cd gorev-takip

# Python sanal ortamı oluşturun
python3 -m venv venv

# Sanal ortamı aktifleştirin
# Windows için:
venv\Scripts\activate
# Linux/Mac için:
source venv/bin/activate

# Gerekli paketleri yükleyin
pip install -r requirements.txt
```

### 3. Firebase Kurulumu ve Yapılandırması

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. "Yeni Proje Oluştur" butonuna tıklayın
3. Proje adını "gorev-takip" olarak girin ve "Devam" butonuna tıklayın
4. Google Analytics'i etkinleştirin ve "Proje Oluştur" butonuna tıklayın

#### Authentication Yapılandırması
1. Sol menüden "Authentication" seçeneğine tıklayın
2. "Sign-in method" sekmesinde "Email/Password" sağlayıcısını etkinleştirin
3. "Enable" butonuna tıklayın
4. "Save" butonuna tıklayın

#### Firestore Database Yapılandırması
1. Sol menüden "Firestore Database" seçeneğine tıklayın
2. "Create Database" butonuna tıklayın
3. "Start in test mode" seçeneğini seçin
4. Bölge olarak "eur3 (europe-west)" seçin
5. "Enable" butonuna tıklayın

#### Koleksiyonları Oluşturma
Aşağıdaki koleksiyonları oluşturun:

1. `users` koleksiyonu:
   - `email` (string): Kullanıcının e-posta adresi
   - `role` (string): Kullanıcının rolü ("admin", "superadmin", "user")
   - `name` (string): Kullanıcının adı
   - `created_at` (timestamp): Oluşturulma tarihi

2. `tasks` koleksiyonu:
   - `title` (string): Görev başlığı
   - `description` (string): Görev açıklaması
   - `assigned_to` (string): Görevin atandığı kullanıcının e-postası
   - `created_by` (string): Görevi oluşturan kullanıcının e-postası
   - `status` (string): Görev durumu ("pending", "in_progress", "completed")
   - `due_date` (timestamp): Son tarih
   - `created_at` (timestamp): Oluşturulma tarihi
   - `updated_at` (timestamp): Güncellenme tarihi

3. `notifications` koleksiyonu:
   - `user_email` (string): Bildirimin gönderildiği kullanıcının e-postası
   - `message` (string): Bildirim mesajı
   - `task_id` (string): İlgili görevin ID'si
   - `is_read` (boolean): Okunma durumu
   - `created_at` (timestamp): Oluşturulma tarihi

4. `task_steps` koleksiyonu:
   - `task_id` (string): İlgili görevin ID'si
   - `title` (string): Adım başlığı
   - `description` (string): Adım açıklaması
   - `status` (string): Adım durumu ("pending", "completed")
   - `created_at` (timestamp): Oluşturulma tarihi
   - `updated_at` (timestamp): Güncellenme tarihi

#### Güvenlik Kuralları
Firestore güvenlik kurallarını güncelleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar koleksiyonu
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin');
    }
    
    // Görevler koleksiyonu
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin' ||
         resource.data.assigned_to == request.auth.token.email);
    }
    
    // Bildirimler koleksiyonu
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
        resource.data.user_email == request.auth.token.email;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        resource.data.user_email == request.auth.token.email;
    }
    
    // Görev adımları koleksiyonu
    match /task_steps/{stepId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin' ||
         get(/databases/$(database)/documents/tasks/$(resource.data.task_id)).data.assigned_to == request.auth.token.email);
    }
  }
}
```

#### Service Account Oluşturma
1. Sol menüden "Project Settings" (⚙️) seçeneğine tıklayın
2. "Service accounts" sekmesine gidin
3. "Generate New Private Key" butonuna tıklayın
4. İndirilen JSON dosyasını projenin kök dizinine `egorevtakip-firebase-adminsdk-fbsvc-c219d7211d.json` olarak kaydedin

#### Web Uygulaması Yapılandırması
1. Sol menüden "Project Overview" yanındaki "</>" butonuna tıklayın
2. Web uygulaması için bir takma ad girin (örn: "gorev-takip-web")
3. "Register app" butonuna tıklayın
4. Size verilen Firebase yapılandırma kodunu kopyalayın
5. Projenin kök dizininde `firebase-config.js` dosyası oluşturun ve yapılandırma kodunu yapıştırın:

```javascript
const firebaseConfig = {
  // Buraya Firebase'den aldığınız yapılandırma kodunu yapıştırın
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
```

### 4. E-posta Yapılandırması

1. Proje dizininde `.env` dosyası oluşturun:

```env
# .env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

2. Gmail hesabınızda:
   - 2 Adımlı Doğrulama'yı etkinleştirin
   - Uygulama şifresi oluşturun

### 5. Uygulamayı Çalıştırma

```bash
# Backend'i başlatın
python app.py

# Yeni bir terminal açın ve frontend'i başlatın
python -m http.server 8000
```

Tarayıcınızda `http://localhost:8000` adresine gidin.

## API Dokümantasyonu

Postman koleksiyonu `docs/postman_collection.json` dosyasında bulunmaktadır.

## Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

# Portfolio Projesi

Bu proje, Acunmedya Akademi tarafından staj eğitimi kapsamında ödev olarak hazırlanmıştır.

## 🛠 Kullanılan Teknolojiler ve Yapılar

### 💻 Backend:
- 🏗 ASP.NET MVC – Model-View-Controller mimarisi
- 🛢 Entity Framework (DB First) – Veritabanı odaklı modelleme
- 🗄 SQL Server – Veritabanı yönetimi
- 🔍 LINQ – Dinamik sorgulama

### 🎨 Frontend:
- 🅱️ Bootstrap – Responsive ve modern tasarım

## ✨ Özellikler

- ✔ CRUD İşlemleri – Kayıt ekleme, güncelleme, silme ve listeleme
- ✔ LINQ Sorguları – Daha esnek ve optimize edilmiş veritabanı işlemleri
- ✔ DB First Yaklaşımı – Önceden oluşturulmuş SQL Server veritabanı üzerinden modelleme

## 📷 Ekran Görüntüleri

Proje içerisinde WhatsApp Image dosyaları bulunmaktadır.
