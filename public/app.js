let currentUser = null;
let currentUserNama = null;
let currentUserStatus = null;
let currentUserRumah = null;
let currentUserHp = null;
let isRegisterMode = false;

// cek login dari localStorage saat reload
window.onload = () => {
  const saved = localStorage.getItem('user');
  const savedNama = localStorage.getItem('userNama');
  const savedStatus = localStorage.getItem('userStatus');
  const savedRumah = localStorage.getItem('userRumah');
  const savedHp = localStorage.getItem('userHp');
  if (saved && savedNama) {
    currentUser = saved;
    currentUserNama = savedNama;
    currentUserStatus = savedStatus;
    currentUserRumah = savedRumah;
    currentUserHp = savedHp;
    userportal();
  }
};

function showUserUI() {
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('portalSection').classList.remove('hidden');
  document.getElementById('welcome').innerText = `Halo, ${currentUserNama}!`;

  const panicBtn = document.getElementById('panicBtn');
  const statusEl = document.getElementById('status');

  if (currentUserStatus === 'suspended') {
    panicBtn.disabled = true;
    panicBtn.classList.add('opacity-50', 'cursor-not-allowed');
    statusEl.innerText = 'Akun Anda di-suspend. Hubungi admin untuk informasi lebih lanjut.';
    statusEl.className = 'mt-4 text-center text-sm text-red-400';
  } else if (currentUserStatus === 'pending') {
    panicBtn.disabled = true;
    panicBtn.classList.add('opacity-50', 'cursor-not-allowed');
    statusEl.innerText = 'Akun Anda sedang menunggu verifikasi admin.';
    statusEl.className = 'mt-4 text-center text-sm text-yellow-400';
  } else {
    panicBtn.disabled = false;
    panicBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    statusEl.innerText = '';
  }
}

function showAuthUI() {
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('portalSection').classList.add('hidden');
}

function hideAllPortalSections() {
  const sections = ['homeSection', 'notifSection', 'profileSection'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

function showSection(sectionId) {
  hideAllPortalSections();
  const el = document.getElementById(sectionId);
  if (el) el.classList.remove('hidden');
}

function toggleRegister() {
  isRegisterMode = true;

  document.getElementById('registerFields').classList.remove('hidden');

  // ubah tombol login jadi back
  document.getElementById('btnLogin').innerText = 'Back';
}

function handleLoginClick() {
  if (isRegisterMode) {
    // balik ke mode login
    isRegisterMode = false;

    document.getElementById('registerFields').classList.add('hidden');
    document.getElementById('btnLogin').innerText = 'Login';

  } else {
    // login normal
    login();
  }
}

async function register() {
  if (!isRegisterMode) {
    toggleRegister();
    return;
  }

  const confirmRegister = confirm('Yakin data sudah benar?');
  if (!confirmRegister) return;

  let no_hp = document.getElementById('no_hp').value;
  
  // Transform 0 menjadi +62 di frontend untuk feedback langsung
  if (no_hp.startsWith('0')) {
    no_hp = '+62' + no_hp.slice(1);
  }
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const nama = document.getElementById('nama').value;
  const no_rumah = document.getElementById('no_rumah').value;

  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password, nama, no_rumah, no_hp })
  });

  const data = await res.json();
  const statusEl = document.getElementById('status');

  // tampilkan status
  statusEl.innerText = data.error || data.message;
  statusEl.className = 'mt-4 text-center text-sm ' + (data.error ? 'text-red-400' : 'text-yellow-400');

  // 🔴 kalau ada error → tetap di register mode
  if (data.error) {
    return;
  }

  // ✅ kalau sukses → balik ke login
  isRegisterMode = false;
  document.getElementById('registerFields').classList.add('hidden');
  document.getElementById('btnLogin').innerText = 'Login';
}

// ===== DEV DUMMY LOGIN =====
async function loginDev() {
  // Cek jika DEV_MODE diaktifkan via API
  const devCheckRes = await fetch('/auth/dev-check');
  const { devMode } = await devCheckRes.json();
  
  if (!devMode) {
    alert('Dev mode disabled!');
    return;
  }
  
  // Set dummy user langsung
  const dummyUser = {
    username: 'dev_user',
    nama: 'Developer Test',
    no_rumah: '01/A',
    no_hp: '+6281234567890',
    status: 'active'
  };
  
  currentUser = dummyUser.username;
  currentUserNama = dummyUser.nama;
  currentUserStatus = dummyUser.status;
  currentUserRumah = dummyUser.no_rumah;
  currentUserHp = dummyUser.no_hp;
  
  localStorage.setItem('user', dummyUser.username);
  localStorage.setItem('userNama', dummyUser.nama);
  localStorage.setItem('userStatus', dummyUser.status);
  localStorage.setItem('userRumah', dummyUser.no_rumah);
  localStorage.setItem('userHp', dummyUser.no_hp);
  localStorage.setItem('token', '');
  
  console.log('✅ Dev login berhasil');
  userportal();
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const statusEl = document.getElementById('status');
  if (!username || !password) {
    statusEl.innerText = 'Username dan password harus diisi';
    statusEl.className = 'mt-4 text-center text-sm text-red-400';
    return;
  }

  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.error) {
    statusEl.innerText = data.error;
    statusEl.className = 'mt-4 text-center text-sm text-red-400';
  } else if (data.token) {
    currentUser = username;
    currentUserNama = data.nama;
    currentUserStatus = data.status;
    currentUserRumah = data.no_rumah || null;
    currentUserHp = data.no_hp || null;
    localStorage.setItem('user', currentUser);
    localStorage.setItem('userNama', currentUserNama);
    localStorage.setItem('userStatus', currentUserStatus);
    localStorage.setItem('userRumah', currentUserRumah || '');
    localStorage.setItem('userHp', currentUserHp || '');
    localStorage.setItem('token', data.token);

    statusEl.innerText = '';
    statusEl.className = 'mt-4 text-center text-sm text-yellow-400';
    userportal();
  } else {
    statusEl.innerText = 'Login failed';
    statusEl.className = 'mt-4 text-center text-sm text-red-400';
  }
}

async function loadAnnouncement() {
  try {
    const res = await fetch('/announcement', { 
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
    });
    if (!res.ok) throw new Error('Failed to load announcement');
    const data = await res.json();
    document.getElementById('announcementText').innerText = data.content || 'Belum ada pengumuman';
  } catch (err) {
    document.getElementById('announcementText').innerText = 'Belum ada pengumuman';
  }
}

function userportal() {
  showUserUI();
  showSection('homeSection');
  highlightNav('btnHome');
  updateProfileInfo();
  fetchNotificationCount();
  loadAnnouncement();
}

function showPortal() {
  if (!currentUser) {
    alert('Login dulu!');
    return;
  }

  showUserUI();
  showSection('homeSection');
  highlightNav('btnHome');
  fetchNotificationCount();
}

function showProfile() {
  if (!currentUser) {
    alert('Login dulu!');
    return;
  }

  showUserUI();
  showSection('profileSection');
  highlightNav('btnProfile');
  updateProfileInfo();
}

function updateProfileInfo() {
  document.getElementById('profileNama').innerText = currentUserNama || 'Tidak tersedia';
  document.getElementById('profileRumah').innerText = currentUserRumah || 'Tidak tersedia';
  document.getElementById('profileHp').innerText = currentUserHp || 'Tidak tersedia';
  document.getElementById('profileStatus').innerText = currentUserStatus || 'Tidak tersedia';
}

function editProfile() {
  // Buka modal atau form edit (implementasi sederhana: prompt)
  const newNama = prompt('Nama baru:', currentUserNama);
  if (newNama) {
    // Kirim ke API untuk update
    fetch('/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ nama: newNama })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        currentUserNama = newNama;
        localStorage.setItem('userNama', newNama);
        showProfile(); // Refresh
      }
    });
  }
}

function highlightNav(buttonId) {
  resetNav();
  const el = document.getElementById(buttonId);
  if (el) {
    el.classList.add("bg-blue-600", "text-white");
  }
}

function resetNav() {
  const buttons = ["btnHome", "btnNotif", "btnProfile"];

  buttons.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("bg-blue-600", "text-white");
    }
  });
}

function updateNotifBadge(count) {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;

  if (count > 0) {
    badge.innerText = count > 9 ? '9+' : count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

async function fetchNotificationCount() {
  const token = localStorage.getItem('token');
  if (!token) {
    updateNotifBadge(0);
    return;
  }

  try {
    const res = await fetch('/notif', { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) {
      updateNotifBadge(0);
      return;
    }

    const data = await res.json();
    updateNotifBadge(Array.isArray(data.notifications) ? data.notifications.length : 0);
  } catch (err) {
    updateNotifBadge(0);
  }
}

function logout() {
  currentUser = null;
  currentUserNama = null;
  currentUserStatus = null;
  currentUserRumah = null;
  currentUserHp = null;
  localStorage.removeItem('user');
  localStorage.removeItem('userNama');
  localStorage.removeItem('userStatus');
  localStorage.removeItem('userRumah');
  localStorage.removeItem('userHp');
  localStorage.removeItem('token');
  showAuthUI();
}

async function panic() {
  if (!currentUser) {
    alert('Login dulu!');
    return;
  }

  if (currentUserStatus === 'suspended') {
    alert('Akun Anda telah di-suspend dan tidak dapat mengirim panic alert.');
    return;
  }

  if (currentUserStatus === 'pending') {
    alert('Akun Anda sedang menunggu verifikasi admin.');
    return;
  }

  const token = localStorage.getItem('token');
  const res = await fetch('/panic', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    const data = await res.json();
    alert(data.error || 'Akun Anda tidak dapat mengirim panic. Hubungi admin.');
  } else {
    const data = await res.json();
    alert(data.message || 'Panic signal terkirim!');
  }
}

function showNotif() {
  if (!currentUser) {
    alert('Login dulu!');
    return;
  }

  showUserUI();
  showSection('notifSection');
  highlightNav('btnNotif');
  updateNotifBadge(0);
  loadNotifications();
}

async function loadNotifications() {
  const listEl = document.getElementById('notifList');
  const noNotifEl = document.getElementById('noNotif');

  try {
    const res = await fetch('/notif', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) throw new Error('Failed to load notifications');
    const data = await res.json();

    if (Array.isArray(data.notifications) && data.notifications.length > 0) {
      noNotifEl.classList.add('hidden');
      listEl.innerHTML = data.notifications.map(n => `
        <div class="bg-gray-800 p-3 rounded-lg">
          <p class="text-sm">${n.message}</p>
          ${n.action ? `<button class="text-xs text-blue-400 mt-1">${n.action}</button>` : ''}
        </div>
      `).join('');
    } else {
      listEl.innerHTML = '';
      noNotifEl.classList.remove('hidden');
    }
  } catch (err) {
    listEl.innerHTML = `
      <div class="bg-gray-800 p-3 rounded-lg">
        <p class="text-sm text-red-400">Gagal memuat notifikasi.</p>
      </div>
    `;
    noNotifEl.classList.add('hidden');
  }
}

// ===== MODAL FUNCTIONS =====
function showReport() {
  if (!currentUser) {
    alert('Login dulu!');
    return;
  }
  document.getElementById('reportModal').classList.remove('hidden');
}

function showGuest() {
  if (!currentUser) {
    alert('Login dulu!');
    return;
  }
  document.getElementById('guestModal').classList.remove('hidden');
}

function showEmergency() {
  if (!currentUser) {
    alert('Login dulu!');
    return;
  }
  loadEmergencyContacts();
  document.getElementById('emergencyModal').classList.remove('hidden');
}

function showInfo() {
  if (!currentUser) {
    alert('Login dulu!');
    return;
  }
  loadInfo();
  document.getElementById('infoModal').classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// ===== SUBMIT FUNCTIONS =====
async function submitReport() {
  const category = document.getElementById('reportCategory').value;
  const description = document.getElementById('reportDescription').value;
  const location = document.getElementById('reportLocation').value;
  const photoInput = document.getElementById('reportPhoto');

  if (!description) {
    alert('Deskripsi harus diisi!');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('category', category);
    formData.append('description', description);
    formData.append('location', location);
    if (photoInput.files.length > 0) {
      formData.append('photo', photoInput.files[0]);
    }

    const res = await fetch('/report', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await res.json();
    alert(data.message || 'Laporan terkirim!');
    closeModal('reportModal');
    // Clear form
    document.getElementById('reportDescription').value = '';
    document.getElementById('reportLocation').value = '';
    document.getElementById('reportPhoto').value = '';
  } catch (err) {
    alert('Gagal mengirim laporan');
  }
}

async function submitGuest() {
  const guestName = document.getElementById('guestName').value;
  const guestPhone = document.getElementById('guestPhone').value;
  const purpose = document.getElementById('guestPurpose').value;
  const houseNumber = document.getElementById('guestHouse').value;
  const photoInput = document.getElementById('guestPhoto');

  if (!guestName || !purpose || !houseNumber) {
    alert('Nama tamu, tujuan, dan no rumah harus diisi!');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('guestName', guestName);
    formData.append('guestPhone', guestPhone);
    formData.append('purpose', purpose);
    formData.append('houseNumber', houseNumber);
    if (photoInput.files.length > 0) {
      formData.append('photo', photoInput.files[0]);
    }

    const res = await fetch('/guest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await res.json();
    alert(data.message || 'Tamu tercatat!');
    closeModal('guestModal');
    // Clear form
    document.getElementById('guestName').value = '';
    document.getElementById('guestPhone').value = '';
    document.getElementById('guestPurpose').value = '';
    document.getElementById('guestHouse').value = '';
    document.getElementById('guestPhoto').value = '';
  } catch (err) {
    alert('Gagal mencatat tamu');
  }
}

async function sendEmergency() {
  const type = document.getElementById('emergencyType').value;
  const message = document.getElementById('emergencyMessage').value;
  const photoInput = document.getElementById('emergencyPhoto');

  if (!message) {
    alert('Pesan darurat harus diisi!');
    return;
  }

  if (!confirm('Yakin kirim alert darurat?')) return;

  try {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('message', message);
    if (photoInput.files.length > 0) {
      formData.append('photo', photoInput.files[0]);
    }

    const res = await fetch('/emergency', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await res.json();
    alert(data.message || 'Alert darurat terkirim!');
    closeModal('emergencyModal');
    document.getElementById('emergencyMessage').value = '';
    document.getElementById('emergencyPhoto').value = '';
  } catch (err) {
    alert('Gagal mengirim alert darurat');
  }
}

async function loadEmergencyContacts() {
  try {
    const res = await fetch('/emergency/contacts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    const data = await res.json();
    const contactsEl = document.getElementById('emergencyContacts');
    contactsEl.innerHTML = data.contacts.map(c => `
      <div class="bg-gray-700 p-2 rounded flex justify-between items-center">
        <span>${c.icon} ${c.name}</span>
        <a href="tel:${c.phone}" class="text-blue-400 text-sm">${c.phone}</a>
      </div>
    `).join('');
  } catch (err) {
    document.getElementById('emergencyContacts').innerHTML = '<p class="text-red-400">Gagal memuat kontak</p>';
  }
}

async function loadInfo() {
  try {
    const res = await fetch('/info', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    const data = await res.json();
    const infoEl = document.getElementById('infoContent');
    infoEl.textContent = data.content || 'Belum ada informasi';
  } catch (err) {
    document.getElementById('infoContent').textContent = 'Gagal memuat informasi';
  }
}

