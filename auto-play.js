const overlay = document.getElementById('startOverlay');
overlay.addEventListener('click', ()=>{
  overlay.style.display='none';
  const event = new Event('click');
  document.getElementById('playBtn').dispatchEvent(event);
});
