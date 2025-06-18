// firebase-config.js'den hazır instance'ları import edin
import { app, auth, db } from './firebase-config.js';

// Sadece ihtiyacınız olan Firestore fonksiyonlarını import edin
import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp,
    setDoc,
    limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Auth fonksiyonlarını import edin
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// DOM elementleri
const loginFormContainer = document.getElementById('loginFormContainer');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const userInfoNav = document.getElementById('userInfoNav');
const userEmail = document.getElementById('userEmail');
const reportNav = document.getElementById('reportNav');
const downloadReportBtn = document.getElementById('downloadReportBtn');
const adminPanel = document.getElementById('adminPanel');
const userPanel = document.getElementById('userPanel');
const adminTaskList = document.getElementById('adminTaskList');
const userTaskList = document.getElementById('userTaskList');
const addTaskForm = document.getElementById('addTaskForm');
const updateTaskForm = document.getElementById('updateTaskForm');
const taskAssignedTo = document.getElementById('taskAssignedTo');
const updateTaskAssignedTo = document.getElementById('updateTaskAssignedTo');
const userManagementNav = document.getElementById('userManagementNav');
const userManagementBtn = document.getElementById('userManagementBtn');
const userManagementPanel = document.getElementById('userManagementPanel');
const backToAdminBtn = document.getElementById('backToAdminBtn');
const usersList = document.getElementById('usersList');
const updateRoleForm = document.getElementById('updateRoleForm');
const filterDateInput = document.getElementById('filterDate');
const filterTypeSelect = document.getElementById('filterType');
const applyFilterBtn = document.getElementById('applyFilterBtn');
const resetFilterBtn = document.getElementById('resetFilterBtn');
const reportDateInput = document.getElementById('reportDate');
const reportFilterTypeSelect = document.getElementById('reportFilterType');
const taskDescription = document.getElementById('taskDescription');
const updateTaskDescription = document.getElementById('updateTaskDescription');

// Bootstrap modals
const addTaskModal = new bootstrap.Modal(document.getElementById('addTaskModal'));
const updateTaskModal = new bootstrap.Modal(document.getElementById('updateTaskModal'));
const updateRoleModal = new bootstrap.Modal(document.getElementById('updateRoleModal'));

// Backend API URL (Flask)
const API_URL = 'http://localhost:5001';

// Kullanıcı rolünü kontrol et
async function checkUserRole(user) {
    try {
        console.log('Rol kontrolü başlatıldı:', user.email);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', user.email), limit(1));
        const userSnapshot = await getDocs(q);
        
        if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            console.log("Kullanıcı verileri:", userData);
            const role = userData.role;
            console.log("Belirlenen rol:", role);
            return role;
        } else {
            console.log("Kullanıcı belgesi bulunamadı");
            return null; // Kullanıcı bulunamazsa null döndür
        }
    } catch (error) {
        console.error('Rol kontrolü hatası:', error);
        return null; // Hata durumunda null döndür
    }
}

// Tüm kullanıcıları getir
async function getUsers() {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            users.push({
                id: doc.id,
                email: userData.email,
                role: userData.role
            });
        });
        return users;
    } catch (error) {
        console.error('Kullanıcılar getirilemedi:', error);
        return [];
    }
}

// Kullanıcı seçim kutusunu doldur
async function populateUserSelect() {
    try {
        const users = await getUsers();
        taskAssignedTo.innerHTML = '<option value="">Kullanıcı Seçin</option>';
        updateTaskAssignedTo.innerHTML = '<option value="">Kullanıcı Seçin</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.email;
            option.textContent = user.email;
            
            const option2 = document.createElement('option');
            option2.value = user.email;
            option2.textContent = user.email;
            
            taskAssignedTo.appendChild(option);
            updateTaskAssignedTo.appendChild(option2);
        });
    } catch (error) {
        console.error('Kullanıcı seçim kutusu doldurulurken hata:', error);
    }
}

// Görevleri yükle (Admin için)
async function loadAdminTasks() {
    try {
        // Filtreleme parametrelerini hazırla
        let url = `${API_URL}/gorevler`;
        const filterDate = filterDateInput.value;
        const filterType = filterTypeSelect.value;
        
        if (filterDate) {
            url = `${url}?date=${filterDate}&filter_type=${filterType}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Görevler getirilemedi');
        }
        
        const tasks = await response.json();
        adminTaskList.innerHTML = '';
        
        // Kullanıcı rolünü kontrol et
        const user = auth.currentUser;
        const role = await checkUserRole(user);
        
        // "New Task" butonunu göster/gizle
        const newTaskBtn = document.querySelector('[data-bs-target="#addTaskModal"]');
        if (newTaskBtn) {
            newTaskBtn.style.display = role === 'superAdmin' ? 'block' : 'none';
        }
        
        tasks.forEach(task => {
            const statusText = task.durum_tr || getStatusText(task.status);
            const statusClass = getStatusClass(task.status);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${task.title}</td>
                <td>${task.description || '(Açıklama yok)'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${task.assigned_to}</td>
                <td>${task.assigned_date || '-'}</td>
                <td>${task.due_date}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-success me-1" onclick="updateTaskStatus('${task.id}', 'completed')">
                        <i class="fas fa-check"></i> Tamamla
                    </button>
                    <button class="btn btn-sm btn-warning me-1" onclick="handleInProgressStatus('${task.id}')">
                        <i class="fas fa-play"></i> Devam Ediyor
                    </button>
                    <button class="btn btn-sm btn-info me-1" onclick="viewSteps('${task.id}')" title="Adımları Görüntüle">
                        <i class="fas fa-list"></i>
                    </button>
                    ${role === 'superAdmin' ? `
                    <button class="btn btn-sm btn-danger me-1" onclick="deleteTask('${task.id}')" title="Görevi Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </td>
            `;
            adminTaskList.appendChild(tr);
        });
    } catch (error) {
        console.error('Admin görevleri yüklenirken hata:', error);
        alert('Görevler yüklenemedi: ' + error.message);
    }
}

// Filtreleri sıfırla
document.getElementById('resetFilterBtn').addEventListener('click', function() {
    filterDateInput.value = '';
    filterTypeSelect.value = 'due_date';
    loadAdminTasks();
});

// Görevleri yükle (Kullanıcı için)
async function loadUserTasks(userEmail) {
    try {
        // Filtreleme parametrelerini hazırla
        let url = `${API_URL}/gorevler/${userEmail}`;
        const filterDate = document.getElementById('userFilterDate').value;
        const filterType = document.getElementById('userFilterType').value;
        
        if (filterDate) {
            url = `${url}?date=${filterDate}&filter_type=${filterType}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Görevler getirilemedi');
        }
        
        const tasks = await response.json();
        userTaskList.innerHTML = '';
        
        tasks.forEach(task => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            
            const statusText = task.durum_tr || getStatusText(task.status);
            const statusClass = getStatusClass(task.status);
            
            col.innerHTML = `
                <div class="card task-card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${task.title}</h5>
                        <p class="card-text">${task.description || '(Açıklama yok)'}</p>
                        <p class="card-text"><small class="text-muted">Atanma: ${task.assigned_date || '-'}</small></p>
                        <p class="card-text"><small class="text-muted">Bitiş: ${task.due_date}</small></p>
                        <div class="mb-3">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="updateTaskStatus('${task.id}', 'in-progress')">
                                Devam Ediyor
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="updateTaskStatus('${task.id}', 'completed')">
                                Tamamlandı
                            </button>
                        </div>
                    </div>
                </div>
            `;
            userTaskList.appendChild(col);
        });
    } catch (error) {
        console.error('Kullanıcı görevleri yüklenirken hata:', error);
        alert('Görevler yüklenemedi: ' + error.message);
    }
}

// Kullanıcı filtresini sıfırla
document.getElementById('userResetFilterBtn').addEventListener('click', function() {
    document.getElementById('userFilterDate').value = '';
    document.getElementById('userFilterType').value = 'due_date';
    loadUserTasks(userEmail.textContent);
});

// Kullanıcıları yükle (Admin için)
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/kullanicilar`);
        if (!response.ok) {
            throw new Error('Kullanıcılar getirilemedi');
        }
        
        const users = await response.json();
        usersList.innerHTML = '';
        
        users.forEach(user => {
            let roleText = 'Kullanıcı';
            let roleBadgeClass = 'bg-info';
            
            if (user.role === 'superAdmin') {
                roleText = 'SuperAdmin';
                roleBadgeClass = 'bg-dark';
            } else if (user.role === 'admin') {
                roleText = 'Admin';
                roleBadgeClass = 'bg-danger';
            }
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.email}</td>
                <td><span class="badge ${roleBadgeClass}">${roleText}</span></td>
                <td class="action-buttons">
                    ${user.role !== 'superAdmin' ? `
                    <button class="btn btn-sm btn-outline-primary" onclick="editUserRole('${user.id}', '${user.email}', '${user.role}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    ` : ''}
                </td>
            `;
            usersList.appendChild(tr);
        });
    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        alert('Kullanıcılar yüklenemedi: ' + error.message);
    }
}

// Durum metnini al
function getStatusText(status) {
    switch (status) {
        case 'pending':
            return 'Beklemede';
        case 'in-progress':
            return 'Devam Ediyor';
        case 'completed':
            return 'Tamamlandı';
        default:
            return 'Bilinmiyor';
    }
}

// Durum sınıfını al
function getStatusClass(status) {
    switch (status) {
        case 'pending':
            return 'status-pending';
        case 'in-progress':
            return 'status-in-progress';
        case 'completed':
            return 'status-completed';
        default:
            return '';
    }
}

// Görev düzenleme modalını aç
window.editTask = async function(taskId) {
    try {
        const response = await fetch(`${API_URL}/gorev/${taskId}`);
        if (!response.ok) {
            throw new Error('Görev bilgileri getirilemedi');
        }
        
        const task = await response.json();
        
        document.getElementById('updateTaskId').value = task.id;
        document.getElementById('updateTaskTitle').value = task.title;
        document.getElementById('updateTaskDescription').value = task.description || '';
        document.getElementById('updateTaskDate').value = task.due_date;
        document.getElementById('updateTaskAssignedTo').value = task.assigned_to;
        document.getElementById('updateTaskStatus').value = task.status;
        
        updateTaskModal.show();
    } catch (error) {
        console.error('Görev düzenleme hatası:', error);
        alert('Görev bilgileri yüklenemedi: ' + error.message);
    }
};

// Görev silme
window.deleteTask = async function(taskId) {
    try {
        // Önce görev bilgilerini al
        const taskResponse = await fetch(`${API_URL}/gorev/${taskId}`);
        if (!taskResponse.ok) {
            throw new Error('Görev bilgileri alınamadı');
        }
        const task = await taskResponse.json();
        
        if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
            const response = await fetch(`${API_URL}/gorev/${taskId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Görev silinemedi');
            }
            
            // Bildirim oluştur
            const message = `"${task.title}" görevi silindi.`;
            await createNotification(task.title, message, task.assigned_to);
            
            alert('Görev başarıyla silindi');
            loadAdminTasks();
        }
    } catch (error) {
        console.error('Görev silme hatası:', error);
        alert('Görev silinemedi: ' + error.message);
    }
};

// Görev durumunu güncelle (kullanıcı tarafından)
window.updateTaskStatus = async function(taskId, status) {
    try {
        const response = await fetch(`${API_URL}/gorev-durum/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw new Error('Görev durumu güncellenemedi');
        }
        
        // Görev bilgilerini al
        const taskResponse = await fetch(`${API_URL}/gorev/${taskId}`);
        if (taskResponse.ok) {
            const task = await taskResponse.json();
            
            // Bildirim oluştur
            const statusText = getStatusText(status);
            const message = `"${task.title}" görevi "${statusText}" durumuna güncellendi.`;
            await createNotification(task.title, message, task.assigned_to);
        }
        
        alert('Görev durumu güncellendi');
        loadUserTasks(userEmail.textContent);
    } catch (error) {
        console.error('Görev durumu güncelleme hatası:', error);
        alert('Görev durumu güncellenemedi: ' + error.message);
    }
};

// Kullanıcı rolü düzenleme modalını aç
window.editUserRole = async function(userId, userMail, userRole) {
    const currentUser = auth.currentUser;
    const currentUserRole = await checkUserRole(currentUser);
    
    // Rol seçim kutusunu al
    const roleSelect = document.getElementById('updateRoleUserRole');
    
    // Mevcut seçenekleri temizle
    roleSelect.innerHTML = '';
    
    // SuperAdmin için tüm roller
    if (currentUserRole === 'superAdmin') {
        roleSelect.innerHTML = `
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin</option>
            <option value="superAdmin">SuperAdmin</option>
        `;
    } 
    // Admin için sadece user ve admin rolleri
    else if (currentUserRole === 'admin') {
        roleSelect.innerHTML = `
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin</option>
        `;
    }
    
    // Mevcut rolü seç
    roleSelect.value = userRole;
    
    // Modal'ı göster
    const updateRoleModal = new bootstrap.Modal(document.getElementById('updateRoleModal'));
    updateRoleModal.show();
    
    // Güncelleme butonuna tıklama olayını ekle
    document.getElementById('updateRoleBtn').onclick = async () => {
        const newRole = roleSelect.value;
        
        try {
            const response = await fetch(`${API_URL}/kullanici-rol/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': currentUser.email
                },
                body: JSON.stringify({ role: newRole })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Rol güncellenemedi');
            }
            
            alert('Kullanıcı rolü güncellendi');
            updateRoleModal.hide();
            loadUsers(); // Kullanıcı listesini yenile
        } catch (error) {
            console.error('Rol güncelleme hatası:', error);
            alert('Rol güncellenemedi: ' + error.message);
        }
    };
};

// Giriş işlemi
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Giriş yapılıyor...';
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Giriş başarılı:', userCredential.user);
    } catch (error) {
        console.error('Giriş hatası:', error);
        alert('Giriş yapılamadı: ' + error.message);
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Giriş Yap';
    }
});

// Çıkış işlemi
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log('Çıkış başarılı');
    } catch (error) {
        console.error('Çıkış hatası:', error);
        alert('Çıkış yapılamadı: ' + error.message);
    }
});

// Rol güncelleme formu
updateRoleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('updateRoleUserId').value;
    const role = document.getElementById('updateRoleUserRole').value;
    const currentUser = auth.currentUser;
    const currentUserRole = await checkUserRole(currentUser);
    
    // Admin için SuperAdmin rolü atama kontrolü
    if (currentUserRole === 'admin' && role === 'superAdmin') {
        alert('Admin kullanıcıları SuperAdmin rolü atayamaz!');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/kullanici-rol/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role })
        });
        
        if (!response.ok) {
            throw new Error('Kullanıcı rolü güncellenemedi');
        }
        
        alert('Kullanıcı rolü güncellendi');
        updateRoleModal.hide();
        loadUsers();
    } catch (error) {
        console.error('Rol güncelleme hatası:', error);
        alert('Kullanıcı rolü güncellenemedi: ' + error.message);
    }
});

// Görev ekleme formu
addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const assigned_to = taskAssignedTo.value;
    const due_date = document.getElementById('taskDate').value;
    
    if (!title || !assigned_to || !due_date) {
        alert('Lütfen gerekli alanları doldurun');
        return;
    }
    
    try {
        const adminEmail = userEmail.textContent; // Admin email'i
        
        const response = await fetch(`${API_URL}/gorev`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description,
                assigned_to,
                due_date,
                user_email: adminEmail,
                status: 'pending'  // Varsayılan durum olarak 'pending' ekliyoruz
            })
        });
        
        if (!response.ok) {
            throw new Error('Görev eklenemedi');
        }
        
        alert('Görev başarıyla eklendi ve kullanıcıya mail ile bildirildi');
        addTaskForm.reset();
        addTaskModal.hide();
        loadAdminTasks();
    } catch (error) {
        console.error('Görev ekleme hatası:', error);
        alert('Görev eklenemedi: ' + error.message);
    }
});

// Görev güncelleme formu
updateTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('updateTaskId').value;
    const title = document.getElementById('updateTaskTitle').value;
    const description = document.getElementById('updateTaskDescription').value;
    const assigned_to = updateTaskAssignedTo.value;
    const due_date = document.getElementById('updateTaskDate').value;
    const status = document.getElementById('updateTaskStatus').value;
    
    if (!title || !assigned_to || !due_date) {
        alert('Lütfen gerekli alanları doldurun');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/gorev/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description,
                assigned_to,
                due_date,
                status
            })
        });
        
        if (!response.ok) {
            throw new Error('Görev güncellenemedi');
        }
        
        alert('Görev başarıyla güncellendi');
        updateTaskModal.hide();
        loadAdminTasks();
    } catch (error) {
        console.error('Görev güncelleme hatası:', error);
        alert('Görev güncellenemedi: ' + error.message);
    }
});

// Filtre uygulama
applyFilterBtn.addEventListener('click', () => {
    loadAdminTasks();
});

// Kullanıcı filtresi uygulama
document.getElementById('userApplyFilterBtn').addEventListener('click', () => {
    loadUserTasks(userEmail.textContent);
});

// Kullanıcı yönetimi paneline git
userManagementBtn.addEventListener('click', () => {
    adminPanel.classList.add('d-none');
    userManagementPanel.classList.remove('d-none');
    loadUsers();
});

// Admin paneline dön
backToAdminBtn.addEventListener('click', () => {
    userManagementPanel.classList.add('d-none');
    adminPanel.classList.remove('d-none');
});

// Rapor indirme
downloadReportBtn.addEventListener('click', async () => {
    try {
        const reportDate = reportDateInput.value;
        const reportFilterType = reportFilterTypeSelect.value;
        
        if (!reportDate) {
            alert('Lütfen rapor için bir tarih seçin');
            return;
        }
        
        const url = `${API_URL}/rapor?date=${reportDate}&filter_type=${reportFilterType}`;
        
        // Kullanıcı e-postasını header olarak ekle
        const response = await fetch(url, {
            headers: {
                'X-User-Email': auth.currentUser.email
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Rapor indirilemedi');
        }
        
        // Dosyayı indir
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `gorev_raporu_${reportDate}_${reportFilterType}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Rapor indirme hatası:', error);
        alert('Rapor indirilemedi: ' + error.message);
    }
});

// Auth durumu değişikliklerini dinle
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Kullanıcı giriş yaptı
        console.log('Kullanıcı giriş yaptı:', user.email);
        
        // Kullanıcı rolünü kontrol et
        const role = await checkUserRole(user);
        console.log('Kullanıcı rolü:', role);
        
        if (role === null) {
            alert('Bu kullanıcı sisteme kayıtlı değil. Lütfen yönetici ile iletişime geçin.');
            await signOut(auth);
            return;
        }
        
        // UI güncellemeleri
        loginFormContainer.classList.add('d-none');
        userInfoNav.classList.remove('d-none');
        userEmail.textContent = user.email;
        
        if (role === 'superAdmin' || role === 'admin') {
            // Admin panelini göster
            adminPanel.classList.remove('d-none');
            userPanel.classList.add('d-none');
            userManagementNav.classList.remove('d-none');
            reportNav.classList.remove('d-none');
            
            // Admin görevlerini yükle
            loadAdminTasks();
            
            // Kullanıcı seçim kutusunu doldur
            populateUserSelect();

            // SuperAdmin ve Admin yetki farklılıkları
            if (role === 'superAdmin') {
                // SuperAdmin için tüm yetkiler aktif
                document.getElementById('deleteTaskBtn').style.display = 'inline-block';
                document.getElementById('downloadReportBtn').style.display = 'inline-block';
                document.getElementById('userManagementBtn').style.display = 'inline-block';
                userManagementNav.classList.remove('d-none');
                reportNav.classList.remove('d-none');
            } else {
                // Admin için sınırlı yetkiler
                document.getElementById('deleteTaskBtn').style.display = 'none';
                document.getElementById('downloadReportBtn').style.display = 'none';
                document.getElementById('userManagementBtn').style.display = 'none';
                userManagementNav.classList.add('d-none');
                reportNav.classList.add('d-none');
            }
        } else {
            // Normal kullanıcı panelini göster
            adminPanel.classList.add('d-none');
            userPanel.classList.remove('d-none');
            userManagementNav.classList.add('d-none');
            reportNav.classList.add('d-none');
            
            // Kullanıcının görevlerini yükle
            loadUserTasks(user.email);
        }
    } else {
        // Kullanıcı çıkış yaptı
        console.log('Kullanıcı çıkış yaptı');
        
        // UI güncellemeleri
        loginFormContainer.classList.remove('d-none');
        userInfoNav.classList.add('d-none');
        adminPanel.classList.add('d-none');
        userPanel.classList.add('d-none');
        userManagementNav.classList.add('d-none');
        reportNav.classList.add('d-none');
        userManagementPanel.classList.add('d-none');
    }
});

// Tarihe Göre Filtreleme için datepicker'ı etkinleştir
$(document).ready(function() {
    // Filtreleme tarih seçicileri
    $('#filterDate').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true,
        language: 'tr'
    });
    
    $('#userFilterDate').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true,
        language: 'tr'
    });
    
    $('#reportDate').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true,
        language: 'tr'
    });
    
    // Görev ekleme ve düzenleme tarih seçicileri
    $('#taskDate').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true,
        language: 'tr',
        startDate: new Date()
    });
    
    $('#updateTaskDate').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true,
        language: 'tr',
        startDate: new Date()
    });
});

// Tarih formatını düzenle (yyyy-mm-dd)
function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    
    return [year, month, day].join('-');
}

// Sayfa yüklendiğinde bugünün tarihini tarih alanlarına yerleştir
document.addEventListener('DOMContentLoaded', function() {
    const today = formatDate(new Date());
    
    if (document.getElementById('taskDate')) {
        document.getElementById('taskDate').value = today;
    }
    
    if (document.getElementById('reportDate')) {
        document.getElementById('reportDate').value = today;
    }
});

// Takvim işlemleri
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Takvim butonuna tıklama
document.getElementById('calendarBtn').addEventListener('click', function(e) {
    e.preventDefault();
    showCalendar();
});

// Takvim panelini göster
function showCalendar() {
    document.getElementById('adminPanel').classList.add('d-none');
    document.getElementById('userPanel').classList.add('d-none');
    document.getElementById('userManagementPanel').classList.add('d-none');
    document.getElementById('calendarPanel').classList.remove('d-none');
    
    updateCalendar();
}

// Takvimi güncelle
function updateCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDay = firstDay.getDay() || 7; // Pazartesi = 1, Pazar = 7
    const monthLength = lastDay.getDate();
    
    // Ay ve yıl başlığını güncelle
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    document.getElementById('currentMonthYear').textContent = 
        `${monthNames[currentMonth]} ${currentYear}`;
    
    // Takvim gridini temizle
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Önceki ayın günlerini ekle
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDay - 1; i > 0; i--) {
        const dayDiv = createDayElement(prevMonthLastDay - i + 1, 'other-month');
        calendarGrid.appendChild(dayDiv);
    }
    
    // Mevcut ayın günlerini ekle
    for (let i = 1; i <= monthLength; i++) {
        const isToday = i === new Date().getDate() && 
                       currentMonth === new Date().getMonth() && 
                       currentYear === new Date().getFullYear();
        const dayDiv = createDayElement(i, isToday ? 'today' : '');
        calendarGrid.appendChild(dayDiv);
    }
    
    // Sonraki ayın günlerini ekle
    const remainingDays = 42 - (startingDay - 1 + monthLength); // 6 satır x 7 gün
    for (let i = 1; i <= remainingDays; i++) {
        const dayDiv = createDayElement(i, 'other-month');
        calendarGrid.appendChild(dayDiv);
    }
    
    // Görevleri yükle
    loadTasksForCalendar();
}

// Gün elementi oluştur
function createDayElement(day, className) {
    const dayDiv = document.createElement('div');
    dayDiv.className = `calendar-day ${className}`;
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayDiv.appendChild(dayNumber);
    
    return dayDiv;
}

// Takvim için görevleri yükle
async function loadTasksForCalendar() {
    try {
        const response = await fetch(`${API_URL}/takvim-gorevler?year=${currentYear}&month=${currentMonth + 1}`);
        if (!response.ok) {
            throw new Error('Görevler getirilemedi');
        }
        const tasks = await response.json();
        console.log('Takvim görevleri:', tasks);

        // Her gün için görevleri ekle
        const days = document.querySelectorAll('.calendar-day');
        days.forEach(day => {
            const dayNumber = parseInt(day.querySelector('.day-number').textContent);
            const isOtherMonth = day.classList.contains('other-month');
            
            // O güne ait görevleri filtrele
            const dayTasks = tasks.filter(task => {
                const taskStartDate = new Date(task.assigned_date || task.due_date);
                const taskEndDate = new Date(task.due_date);
                const currentDate = new Date(currentYear, currentMonth, dayNumber);
                
                // Tarihleri karşılaştırırken saat bilgisini sıfırla
                taskStartDate.setHours(0, 0, 0, 0);
                taskEndDate.setHours(0, 0, 0, 0);
                currentDate.setHours(0, 0, 0, 0);
                
                return !isOtherMonth && currentDate >= taskStartDate && currentDate <= taskEndDate;
            });
            
            // Görevleri ekle
            dayTasks.forEach(task => {
                const taskElement = document.createElement('div');
                // Durum sınıfını belirle
                let statusClass = 'pending';
                if (task.status === 'completed') {
                    statusClass = 'completed';
                } else if (task.status === 'in-progress') {
                    statusClass = 'in-progress';
                }
                
                taskElement.className = `calendar-task ${statusClass}`;
                taskElement.textContent = task.title;
                taskElement.title = `${task.title} - ${task.durum_tr || getStatusText(task.status)}`;
                taskElement.addEventListener('click', () => showTaskDetails(task));
                day.appendChild(taskElement);
            });
        });
    } catch (error) {
        console.error('Takvim görevleri yüklenirken hata:', error);
    }
}

// Durum rengini al
function getStatusColor(status) {
    switch (status) {
        case 'pending':
            return '#ffc107'; // Sarı
        case 'in-progress':
            return '#17a2b8'; // Mavi
        case 'completed':
            return '#28a745'; // Yeşil
        default:
            return '#6c757d'; // Gri
    }
}

// Görev detaylarını göster
function showTaskDetails(task) {
    const modal = new bootstrap.Modal(document.getElementById('taskDetailModal'));
    const content = document.getElementById('taskDetailContent');
    
    // Tarih formatını düzenle
    const formatDateForGoogleCalendar = (dateStr) => {
        if (!dateStr) return '';
        // Tarihi YYYY-MM-DD formatından parse et
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        // Saat bilgisini ekle (09:00)
        date.setHours(9, 0, 0, 0);
        
        // Google Calendar için tarih formatı: YYYYMMDDTHHMMSSZ
        const formattedYear = date.getFullYear();
        const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
        const formattedDay = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${formattedYear}${formattedMonth}${formattedDay}T${hours}${minutes}${seconds}Z`;
    };

    // Google Calendar linki oluştur
    const createGoogleCalendarLink = (task) => {
        // Başlangıç tarihi olarak atanma tarihini, yoksa bitiş tarihini kullan
        const startDate = formatDateForGoogleCalendar(task.assigned_date || task.due_date);
        // Bitiş tarihi olarak bitiş tarihini kullan
        const endDate = formatDateForGoogleCalendar(task.due_date);
        
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: task.title,
            details: task.description || 'Açıklama yok',
            dates: `${startDate}/${endDate}`,
            ctz: 'Europe/Istanbul',
            trp: 'true' // Görev olarak ekle
        });

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };
    
    content.innerHTML = `
        <div class="mb-3">
            <h6>Başlık</h6>
            <p>${task.title}</p>
        </div>
        <div class="mb-3">
            <h6>Açıklama</h6>
            <p>${task.description || 'Açıklama yok'}</p>
        </div>
        <div class="mb-3">
            <h6>Durum</h6>
            <p><span class="status-badge ${getStatusClass(task.status)}">${task.durum_tr}</span></p>
        </div>
        <div class="mb-3">
            <h6>Atanan</h6>
            <p>${task.assigned_to}</p>
        </div>
        <div class="mb-3">
            <h6>Atanma Tarihi</h6>
            <p>${task.assigned_date || 'Belirtilmemiş'}</p>
        </div>
        <div class="mb-3">
            <h6>Bitiş Tarihi</h6>
            <p>${task.due_date || 'Belirtilmemiş'}</p>
        </div>
        <a href="${createGoogleCalendarLink(task)}" target="_blank" class="add-to-calendar-btn">
            <i class="fas fa-calendar-plus"></i> Google Takvime Görev Olarak Ekle
        </a>
    `;
    
    modal.show();
}

// Önceki ay butonu
document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateCalendar();
});

// Sonraki ay butonu
document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateCalendar();
});

// Takvimden geri dön
document.getElementById('backFromCalendar').addEventListener('click', () => {
    document.getElementById('calendarPanel').classList.add('d-none');
    const user = auth.currentUser;
    if (user) {
        checkUserRole(user).then(role => {
            if (role === 'admin' || role === 'superAdmin') {
                document.getElementById('adminPanel').classList.remove('d-none');
            } else {
                document.getElementById('userPanel').classList.remove('d-none');
            }
        });
    }
});

// Bildirimleri yükle
async function loadNotifications() {
    const user = auth.currentUser;
    if (!user) {
        return;
    }
    
    try {
        const role = await checkUserRole(user);
        if (role !== 'admin' && role !== 'superAdmin') {
            return;
        }
        
        const response = await fetch(`${API_URL}/bildirimler/${user.email}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const notifications = await response.json();
        
        const content = document.getElementById('notificationsContent');
        const badge = document.getElementById('notificationBadge');
        
        if (!Array.isArray(notifications)) {
            console.error('Bildirimler bir dizi değil:', notifications);
            content.innerHTML = '<div class="text-center p-3">Bildirimler yüklenirken bir hata oluştu</div>';
            badge.style.display = 'none';
            return;
        }
        
        if (notifications.length === 0) {
            content.innerHTML = '<div class="text-center p-3">Bildirim yok</div>';
            badge.style.display = 'none';
            return;
        }
        
        const unreadCount = notifications.filter(n => !n.is_read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'inline' : 'none';
        
        content.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.is_read ? '' : 'unread'}" 
                 data-notification-id="${notification.id}">
                <div class="notification-task">${notification.title}</div>
                <div class="notification-content">${notification.message}</div>
                <div class="notification-time">${notification.created_at}</div>
            </div>
        `).join('');

        // Her bildirim öğesine tıklama olayı ekle
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function() {
                const notificationId = this.getAttribute('data-notification-id');
                markNotificationAsRead(notificationId);
            });
        });
    } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
        const content = document.getElementById('notificationsContent');
        content.innerHTML = '<div class="text-center p-3">Bildirimler yüklenirken bir hata oluştu</div>';
        const badge = document.getElementById('notificationBadge');
        badge.style.display = 'none';
    }
}

// Bildirimi okundu olarak işaretle
async function markNotificationAsRead(notificationId) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const response = await fetch(`${API_URL}/bildirim-okundu/${notificationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await user.getIdToken()}`
            }
        });

        if (response.ok) {
            // Bildirimi UI'dan kaldır
            const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
            if (notificationElement) {
                notificationElement.remove();
            }

            // Okunmamış bildirim sayısını güncelle
            const unreadCount = parseInt(document.getElementById('notificationBadge').textContent) - 1;
            document.getElementById('notificationBadge').textContent = Math.max(0, unreadCount);

            // Eğer okunmamış bildirim kalmadıysa badge'i gizle
            if (unreadCount <= 0) {
                document.getElementById('notificationBadge').style.display = 'none';
            }
        } else {
            console.error('Bildirim okundu olarak işaretlenemedi');
        }
    } catch (error) {
        console.error('Bildirim işaretleme hatası:', error);
    }
}

// Bildirimleri periyodik olarak güncelle
setInterval(loadNotifications, 30000); // Her 30 saniyede bir 

function renderCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();
    
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
                       "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';
    
    let date = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < startingDay) {
                const cell = document.createElement('td');
                row.appendChild(cell);
            } else if (date > monthLength) {
                break;
            } else {
                const cell = document.createElement('td');
                cell.textContent = date;
                
                // Tarih formatını oluştur
                const currentDate = new Date(year, month, date);
                const dateStr = currentDate.toISOString().split('T')[0];
                
                // Bu güne ait görevleri bul
                const dayTasks = calendarTasks.filter(task => {
                    const taskStart = new Date(task.start_date);
                    const taskEnd = new Date(task.end_date);
                    return currentDate >= taskStart && currentDate <= taskEnd;
                });
                
                // Görevleri hücreye ekle
                dayTasks.forEach(task => {
                    const taskDiv = document.createElement('div');
                    taskDiv.className = 'calendar-task';
                    taskDiv.style.backgroundColor = task.color;
                    taskDiv.textContent = task.title;
                    cell.appendChild(taskDiv);
                });
                
                row.appendChild(cell);
                date++;
            }
        }
        calendarBody.appendChild(row);
    }
}

// Adım görüntüleme fonksiyonu
window.viewSteps = async function(taskId) {
    try {
        const response = await fetch(`${API_URL}/gorev/${taskId}/adimlar`, {
            headers: {
                'X-User-Email': auth.currentUser.email
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displaySteps(data);
        } else {
            const error = await response.json();
            alert('Hata: ' + error.error);
        }
    } catch (error) {
        alert('Bir hata oluştu: ' + error.message);
    }
};

// Adım ekleme modalını aç
window.addStep = function(taskId) {
    document.getElementById('stepTaskId').value = taskId;
    new bootstrap.Modal(document.getElementById('addStepModal')).show();
};

// Adımları görüntüleme
window.displaySteps = function(data) {
    const stepsContent = document.getElementById('stepsContent');
    let html = `<h6>Görev: ${data.task.title}</h6><hr>`;
    
    if (data.steps.length === 0) {
        html += '<p class="text-muted">Bu görev için henüz adım eklenmemiş.</p>';
    } else {
        data.steps.forEach(step => {
            html += `
                <div class="card mb-2">
                    <div class="card-body">
                        <h6 class="card-title">${step.title}</h6>
                        <p class="card-text">${step.description || 'Açıklama yok'}</p>
                        <small class="text-muted">
                            Durum: <span class="badge bg-${getStatusColor(step.status)}">${step.status_tr}</span>
                            - Oluşturan: ${step.created_by}
                            - Tarih: ${step.created_at}
                        </small>
                    </div>
                </div>
            `;
        });
    }
    
    stepsContent.innerHTML = html;
    new bootstrap.Modal(document.getElementById('stepsModal')).show();
};

// Admin için tüm adımları yükleme
window.loadAllSteps = async function() {
    try {
        const response = await fetch(`${API_URL}/admin/tum-adimlar`, {
            headers: {
                'X-User-Email': auth.currentUser.email
            }
        });
        
        if (response.ok) {
            const steps = await response.json();
            displayAdminSteps(steps);
        } else {
            const error = await response.json();
            alert('Hata: ' + error.error);
        }
    } catch (error) {
        alert('Bir hata oluştu: ' + error.message);
    }
};

// Admin adımları görüntüleme
window.displayAdminSteps = function(steps) {
    const tbody = document.getElementById('adminStepsList');
    tbody.innerHTML = '';
    
    steps.forEach(step => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${step.task_info ? step.task_info.title : 'Görev Bulunamadı'}</td>
            <td>${step.title}</td>
            <td>${step.description || 'Açıklama yok'}</td>
            <td><span class="badge bg-${getStatusColor(step.status)}">${step.status_tr}</span></td>
            <td>${step.created_by}</td>
            <td>${step.created_at}</td>
        `;
        tbody.appendChild(row);
    });
};

// Adım form submit
document.getElementById('addStepForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('stepTaskId').value;
    const stepData = {
        title: document.getElementById('stepTitle').value,
        description: document.getElementById('stepDescription').value,
        status: 'pending'
    };
    
    try {
        const response = await fetch(`${API_URL}/gorev/${taskId}/adim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Email': auth.currentUser.email
            },
            body: JSON.stringify(stepData)
        });
        
        if (response.ok) {
            // Görev bilgilerini al
            const taskResponse = await fetch(`${API_URL}/gorev/${taskId}`);
            if (taskResponse.ok) {
                const task = await taskResponse.json();
                
                // Bildirim oluştur
                const message = `"${task.title}" görevine yeni bir adım eklendi: "${stepData.title}"`;
                await createNotification(task.title, message, task.assigned_to);
            }
            
            alert('Adım başarıyla eklendi!');
            bootstrap.Modal.getInstance(document.getElementById('addStepModal')).hide();
            document.getElementById('addStepForm').reset();
            
            // Görev durumunu güncelle
            await updateTaskStatus(taskId, 'in-progress');
            
            // Görevleri yenile
            if (auth.currentUser) {
                const role = await checkUserRole(auth.currentUser);
                if (role === 'admin' || role === 'superAdmin') {
                    loadAdminTasks();
                    loadAllSteps(); // Admin adımlarını yenile
                } else {
                    loadUserTasks(auth.currentUser.email);
                }
            }
        } else {
            const error = await response.json();
            alert('Hata: ' + error.error);
        }
    } catch (error) {
        alert('Bir hata oluştu: ' + error.message);
    }
});

// Devam ediyor butonuna tıklandığında
window.handleInProgressStatus = function(taskId) {
    // Adım ekleme modalını aç
    addStep(taskId);
};

// Bildirim oluştur
async function createNotification(title, message, userEmail) {
    try {
        const response = await fetch(`${API_URL}/bildirim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                message,
                user_email: userEmail,
                is_read: false,
                created_at: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Bildirim oluşturulamadı');
        }
    } catch (error) {
        console.error('Bildirim oluşturma hatası:', error);
    }
}

// Tüm adımları yükle
document.getElementById('loadAllStepsBtn').addEventListener('click', function() {
    loadAllSteps();
});

// Eksik fonksiyonlar
function resetFilter() {
    filterDateInput.value = '';
    filterTypeSelect.value = 'due_date';
    loadAdminTasks(); // Admin görevlerini yeniden yükle
}

function resetUserFilter() {
    const userFilterDate = document.getElementById('userFilterDate');
    const userFilterType = document.getElementById('userFilterType');
    if (userFilterDate) userFilterDate.value = '';
    if (userFilterType) userFilterType.value = 'due_date';
    loadUserTasks(userEmail.textContent); // Kullanıcı görevlerini yeniden yükle
}

// Event listener'lar ekleyin (DOM yüklendikten sonra)
document.addEventListener('DOMContentLoaded', function() {
    // Reset filter button
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', resetFilter);
    }
    
    // User reset filter button
    const userResetFilterBtn = document.getElementById('userResetFilterBtn');
    if (userResetFilterBtn) {
        userResetFilterBtn.addEventListener('click', resetUserFilter);
    }
    
    // Load all steps button
    const loadAllStepsBtn = document.getElementById('loadAllStepsBtn');
    if (loadAllStepsBtn) {
        loadAllStepsBtn.addEventListener('click', loadAllSteps);
    }
});

// Global scope'a ekle
window.resetFilter = resetFilter;
window.resetUserFilter = resetUserFilter;
window.loadAllSteps = loadAllSteps;
window.viewSteps = viewSteps; 