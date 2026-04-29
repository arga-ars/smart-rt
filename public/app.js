let currentUser = null;
let currentUserNama = null;
let currentUserStatus = null;
let isRegisterMode = false;

// cek login dari localStorage saat reload
window.onload = () => {
  const saved = localStorage.getItem('user');
  const savedNama = localStorage.getItem('userNama');
  const savedStatus = localStorage.getItem('userStatus');
  if (saved && savedNama) {
    currentUser = saved;
    currentUserNama = savedNama;
    currentUserStatus = savedStatus;
    showUserUI();
  }
};

function showUserUI() {
  document.getElementById('authSection').classList.add('hidden');
  document.getElementById('portalSection').classList.remove('hidden');
  document.getElementById('welcome').innerText = `Halo, ${currentUserNama}!`;
  document.getElementById('welcomeLogin').classList.add('hidden');
  document.getElementById('runText').classList.remove('hidden');
  
  // Update panic button status
  const panicBtn = document.getElementById('panicBtn');
  if (currentUserStatus === 'suspended') {
    panicBtn.disabled = true;
    panicBtn.classList.add('opacity-50', 'cursor-not-allowed');
    document.getElementById('runText').innerText = 'Akun Anda di-suspend. Hubungi admin untuk informasi lebih lanjut.';
  } else if (currentUserStatus === 'pending') {
    panicBtn.disabled = true;
    panicBtn.classList.add('opacity-50', 'cursor-not-allowed');
    document.getElementById('runText').innerText = 'Akun Anda sedang menunggu verifikasi admin.';
  } else {
    panicBtn.disabled = false;
    panicBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    document.getElementById('runText').innerText = 'Tekan tombol PANIC jika terjadi keadaan darurat!';
  }
}

function showAuthUI() {
  document.getElementById('authSection').classList.remove('hidden');
  document.getElementById('portalSection').classList.add('hidden');
  document.getElementById('welcomeLogin').classList.remove('hidden');
  document.getElementById('runText').classList.add('hidden');
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
  
  localStorage.setItem('user', dummyUser.username);
  localStorage.setItem('userNama', dummyUser.nama);
  localStorage.setItem('userStatus', dummyUser.status);
  
  console.log('✅ Dev login berhasil');
  showUserUI();
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    const statusEl = document.getElementById('status');
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
  const statusEl = document.getElementById('status');

  if (data.error) {
    statusEl.innerText = data.error;
    statusEl.className = 'mt-4 text-center text-sm text-red-400';
  } else if (data.token) {
    currentUser = username;
    currentUserNama = data.nama;
    currentUserStatus = data.status;
    localStorage.setItem('user', currentUser);
    localStorage.setItem('userNama', currentUserNama);
    localStorage.setItem('userStatus', currentUserStatus);
    localStorage.setItem('token', data.token);

    showUserUI();
    userportal();
    statusEl.innerText = '';
    statusEl.className = 'mt-4 text-center text-sm text-yellow-400';
  } else {
    statusEl.innerText = 'Login failed';
    statusEl.className = 'mt-4 text-center text-sm text-red-400';
  }
}

function userportal() {
  document.getElementById("authSection").classList.add("hidden");
  document.getElementById("portalSection").classList.remove("hidden");
  document.getElementById("welcome").innerText = `Halo, ${currentUserNama}!`;
  
  highlightNav("btnHome");
}

function showPortal() {
  if (!currentUser) {
    alert('Login dulu!');
    return;
  }

  highlightNav("btnHome");
  userportal();
}

function highlightNav(buttonId) {
  resetNav();
  const el = document.getElementById(buttonId);
  if (el) {
    el.classList.add("bg-grey-900");
  }
}

function resetNav() {
  const buttons = ["btnHome", "btnNotif", "btnProfile"];

  buttons.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove("bg-grey-900");
  });
}
function logout() {
  currentUser = null;
  currentUserNama = null;
  currentUserStatus = null;
  localStorage.removeItem('user');
  localStorage.removeItem('userNama');
  localStorage.removeItem('userStatus');
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

