window.socket = io();

window.socket.on('connect', () => {
  const el = document.getElementById('connStatus');
  el.innerText = '🟢 Connected';
  //el.classList.remove('bg-red-600');
  //el.classList.add('bg-green-600');
});

window.socket.on('disconnect', () => {
  const el = document.getElementById('connStatus');
  el.innerText = '🔴 Disconnected';
  //el.classList.remove('bg-green-600');
 // el.classList.add('bg-red-600');
});