let currentFilter = 'all';
let adminKey = localStorage.getItem('adminKey') || '';

// realtime panic
const socket = window.socket;
let currentEmergency = null;

socket.on('panic', (data) => {
  addPanicToTable(data);
  // activate emergency mode
  currentEmergency = data;
  showEmergency(data);
});

function showEmergency(data) {
  document.getElementById('emergencyOverlay').classList.remove('hidden');
  document.getElementById('emergencyText').innerHTML =
    `<b>PANIC ALERT!</b><br>Nama: ${data.nama}<br>Rumah: ${data.no_rumah}<br>HP: ${data.no_hp}`;
}

function ackEmergency() {
  currentEmergency = null;
  document.getElementById('emergencyOverlay').classList.add('hidden');
}

// Tab functions
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById(tab + 'Tab').classList.remove('hidden');
  
  document.querySelectorAll('[id^="tab"]').forEach(btn => btn.classList.remove('border-b-2', 'border-blue-500'));
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('border-b-2', 'border-blue-500');

  loadData();
}

// Set admin key
function setAdminKey() {
  const key = prompt('Masukkan Admin Key:');
  if (key) {
    adminKey = key;
    localStorage.setItem('adminKey', key);
    alert('Admin key tersimpan');
    loadData();
  }
}

// load pending users
async function loadPending() {
  try {
    const res = await fetch('/admin/pending', {
      headers: { 'x-admin-key': adminKey }
    });
    
    if (res.status === 403) {
      alert('Admin key salah!');
      setAdminKey();
      return;
    }

    const users = await res.json();
    const list = document.getElementById('pendingList');
    list.innerHTML = '';

    if (users.length === 0) {
      list.innerHTML = '<li class="text-gray-400">Tidak ada pending users</li>';
      return;
    }

    users.forEach(u => {
      const li = document.createElement('li');
      li.className = 'bg-gray-700 p-2 rounded flex justify-between items-center';
      li.innerHTML = `
        <span>${u.nama} (${u.no_rumah}) - ${u.no_hp}</span>
        <button onclick="approve('${u.username}')" class="bg-green-600 px-2 py-1 rounded text-sm">Approve</button>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Load pending error:', err);
  }
}

async function loadData() {
  loadUsers();
  loadPanic();
  loadPending();
  loadReports();
  loadGuests();
  loadEmergencies();
  loadInfo();
  loadAnnouncement();
}

async function approve(username) {
  try {
    const res = await fetch('/admin/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      },
      body: JSON.stringify({ username })
    });

    const data = await res.json();
    alert(data.message || data.error);
    loadData();
  } catch (err) {
    console.error('Approve error:', err);
  }
}

async function deleteUser(username) {
  if (!confirm('Hapus user ini?')) return;

  try {
    const res = await fetch(`/admin/user/${username}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey }
    });

    const data = await res.json();
    alert(data.message || data.error);
    loadData();
  } catch (err) {
    console.error('Delete error:', err);
  }
}

async function suspendUser(username) {
  if (!confirm('Suspend user ini?')) return;

  try {
    const res = await fetch(`/admin/user/${username}/suspend`, {
      method: 'PATCH',
      headers: { 'x-admin-key': adminKey }
    });

    const data = await res.json();
    alert(data.message || data.error);
    loadData();
  } catch (err) {
    console.error('Suspend error:', err);
  }
}

async function unsuspendUser(username) {
  if (!confirm('Unsuspend user ini?')) return;

  try {
    const res = await fetch(`/admin/user/${username}/unsuspend`, {
      method: 'PATCH',
      headers: { 'x-admin-key': adminKey }
    });

    const data = await res.json();
    alert(data.message || data.error);
    loadData();
  } catch (err) {
    console.error('Unsuspend error:', err);
  }
}

async function loadUsers() {
  try {
    const res = await fetch('/admin/users', {
      headers: { 'x-admin-key': adminKey }
    });

    if (res.status === 403) {
      alert('Admin key salah!');
      setAdminKey();
      return;
    }

    const users = await res.json();
    const table = document.getElementById('userTable');
    table.innerHTML = '';

    users
      .filter(u => currentFilter === 'all' || u.status === currentFilter)
    .forEach(u => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td class="p-2">${u.username}</td>
        <td>${u.nama}</td>
        <td>${u.no_rumah}</td>
        <td>${u.no_hp}</td>
        <td>
          <span class="px-2 py-1 rounded ${
            u.status === 'pending' ? 'bg-yellow-600' : u.status === 'suspended' ? 'bg-yellow-600' : 'bg-green-600'
          }">
            ${u.status}
          </span>
        </td>
        <td>
          ${u.status === 'pending' ? `
            <button onclick="approve('${u.username}')" class="bg-blue-600 px-2 py-1 rounded">Approve</button>
          ` : u.status === 'approved' ? `
            <button onclick="suspendUser('${u.username}')" class="bg-yellow-600 px-2 py-1 rounded">Suspend</button>
          ` : `
            <button onclick="unsuspendUser('${u.username}')" class="bg-green-600 px-2 py-1 rounded">Unsuspend</button>
          `}

          <button onclick="deleteUser('${u.username}')" 
            class="bg-red-600 px-2 py-1 rounded ml-2">
            Delete
          </button>
        </td>
      `;

      table.appendChild(tr);
    });
  } catch (err) {
    console.error('Load users error:', err);
  }
}

async function loadPanic() {
  try {
    const res = await fetch('/admin/panic', {
      headers: { 'x-admin-key': adminKey }
    });

    if (res.status === 403) {
      alert('Admin key salah!');
      setAdminKey();
      return;
    }

    const panics = await res.json();
    const table = document.getElementById('panicTable');
    table.innerHTML = '';

    panics.forEach(p => {
      addPanicToTable(p, false);
    });
  } catch (err) {
    console.error('Load panic error:', err);
  }
}

function addPanicToTable(data, prepend = true) {
  const table = document.getElementById('panicTable');
  const tr = document.createElement('tr');
  tr.className = prepend ? 'bg-red-600 animate-pulse' : '';

  tr.innerHTML = `
    <td class="p-2">${data.nama}</td>
    <td>${data.no_rumah}</td>
    <td>${data.no_hp}</td>
    <td>${new Date(data.time).toLocaleString('id-ID')}</td>
  `;

  if (prepend) {
    table.prepend(tr);
  } else {
    table.appendChild(tr);
  }
}

async function loadReports() {
  try {
    const res = await fetch('/report/admin', {
      headers: { 'x-admin-key': adminKey }
    });

    if (res.status === 403) {
      alert('Admin key salah!');
      setAdminKey();
      return;
    }

    const reports = await res.json();
    const table = document.getElementById('reportsTable');
    table.innerHTML = '';

    reports.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-2">${r.username}</td>
        <td>${r.category}</td>
        <td>${r.description.substring(0, 50)}${r.description.length > 50 ? '...' : ''}</td>
        <td>${r.location || '-'}</td>
        <td>${new Date(r.time).toLocaleString('id-ID')}</td>
      `;
      table.appendChild(tr);
    });
  } catch (err) {
    console.error('Load reports error:', err);
  }
}

async function loadGuests() {
  try {
    const res = await fetch('/admin/guests', {
      headers: { 'x-admin-key': adminKey }
    });

    if (res.status === 403) {
      alert('Admin key salah!');
      setAdminKey();
      return;
    }

    const guests = await res.json();
    const table = document.getElementById('guestsTable');
    table.innerHTML = '';

    guests.forEach(g => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-2">${g.username}</td>
        <td>${g.guestName}</td>
        <td>${g.guestPhone || '-'}</td>
        <td>${g.purpose}</td>
        <td>${g.houseNumber}</td>
        <td>${new Date(g.time).toLocaleString('id-ID')}</td>
      `;
      table.appendChild(tr);
    });
  } catch (err) {
    console.error('Load guests error:', err);
  }
}

async function loadEmergencies() {
  try {
    const res = await fetch('/admin/emergencies', {
      headers: { 'x-admin-key': adminKey }
    });

    if (res.status === 403) {
      alert('Admin key salah!');
      setAdminKey();
      return;
    }

    const emergencies = await res.json();
    const table = document.getElementById('emergenciesTable');
    table.innerHTML = '';

    emergencies.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-2">${e.username}</td>
        <td>${e.type}</td>
        <td>${e.message.substring(0, 50)}${e.message.length > 50 ? '...' : ''}</td>
        <td>${new Date(e.time).toLocaleString('id-ID')}</td>
      `;
      table.appendChild(tr);
    });
  } catch (err) {
    console.error('Load emergencies error:', err);
  }
}

async function loadInfo() {
  try {
    const res = await fetch('/admin/info', {
      headers: { 'x-admin-key': adminKey }
    });

    if (res.status === 403) {
      alert('Admin key salah!');
      setAdminKey();
      return;
    }

    const info = await res.json();
    document.getElementById('infoContent').value = info.content || '';
  } catch (err) {
    console.error('Load info error:', err);
  }
}

async function saveInfo() {
  const content = document.getElementById('infoContent').value;
  if (!content) {
    alert('Info tidak boleh kosong!');
    return;
  }

  try {
    const res = await fetch('/admin/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      },
      body: JSON.stringify({ content })
    });

    const data = await res.json();
    alert(data.message || 'Info berhasil disimpan!');
  } catch (err) {
    alert('Gagal menyimpan info');
  }
}

async function loadAnnouncement() {
  try {
    const res = await fetch('/admin/announcement', {
      headers: { 'x-admin-key': adminKey }
    });

    if (res.status === 403) {
      alert('Admin key salah!');
      setAdminKey();
      return;
    }

    const announcement = await res.json();
    document.getElementById('announcementContent').value = announcement.content || '';
  } catch (err) {
    console.error('Load announcement error:', err);
  }
}

async function saveAnnouncement() {
  const content = document.getElementById('announcementContent').value;
  if (!content) {
    alert('Pengumuman tidak boleh kosong!');
    return;
  }

  try {
    const res = await fetch('/admin/announcement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey
      },
      body: JSON.stringify({ content })
    });

    const data = await res.json();
    alert(data.message || 'Pengumuman berhasil disimpan!');
  } catch (err) {
    alert('Gagal menyimpan pengumuman');
  }
}

function setFilter(filter) {
  currentFilter = filter;
  loadUsers();
}

loadData();
showTab('panic');