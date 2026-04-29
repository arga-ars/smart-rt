let currentFilter = 'all';
let adminKey = localStorage.getItem('adminKey') || '';

// realtime panic
const socket = window.socket;
let currentEmergency = null;

socket.on('panic', (data) => {
  const li = document.createElement('li');
  li.className = 'bg-red-600 p-2 rounded animate-pulse';
  li.innerText = `🚨 ${data.nama} (Rumah ${data.no_rumah}) - ${new Date(data.time).toLocaleTimeString('id-ID')}`;
  document.getElementById('panicList').prepend(li);

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
    loadPending();
    loadUsers();
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
    loadUsers();
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
    loadUsers();
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
    loadUsers();
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

function setFilter(filter) {
  currentFilter = filter;
  loadUsers();
}

loadUsers();
loadPending();