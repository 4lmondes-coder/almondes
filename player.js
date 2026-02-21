const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const fileInput = document.getElementById('fileInput');
const listEl = document.getElementById('list');
const nowTitle = document.getElementById('nowTitle');
const nowArtist = document.getElementById('nowArtist');
const coverImg = document.getElementById('coverImg');
const progress = document.getElementById('progress');
const curTime = document.getElementById('curTime');
const durTime = document.getElementById('durTime');

let files = [];
let order = [];
let current = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

function play(){ audio.play().then(()=>{ isPlaying=true; playBtn.textContent='⏸️'; }).catch(()=>{}); }
function pause(){ audio.pause(); isPlaying=false; playBtn.textContent='▶️'; }

playBtn.addEventListener('click', ()=> audio.paused ? play() : pause());
prevBtn.addEventListener('click', ()=> { current=(current-1+files.length)%files.length; loadTrackAt(current); play(); });
nextBtn.addEventListener('click', ()=> { current=(current+1)%files.length; loadTrackAt(current); play(); });
shuffleBtn.addEventListener('click', ()=>{ isShuffle=!isShuffle; shuffleBtn.style.background=isShuffle?'rgba(29,185,84,0.14)':'transparent'; });
repeatBtn.addEventListener('click', ()=>{ isRepeat=!isRepeat; repeatBtn.style.background=isRepeat?'rgba(29,185,84,0.14)':'transparent'; });

fileInput.addEventListener('change', e=>{
  files = Array.from(e.target.files).filter(f=>f.type.startsWith('audio/'));
  if(!files.length) return;
  order = files.map((_,i)=>i);
  current=0;
  renderList();
  loadTrackAt(current);
});

function loadTrackAt(pos){
  if(!files.length) return;
  current=pos;
  const file = files[current];
  const url = URL.createObjectURL(file);
  audio.src = url;
  nowTitle.textContent = file.name.replace(/\.[^/.]+$/,'');
  nowArtist.textContent='Local';
  coverImg.style.display='none';
  audio.load();
  updateActive();
}

function updateActive(){
  document.querySelectorAll('.track-item').forEach((el,i)=> el.classList.toggle('active',i===current));
}

function renderList(){
  listEl.innerHTML='';
  files.forEach((f,i)=>{
    const div=document.createElement('div');
    div.className='track-item';
    div.textContent=f.name.replace(/\.[^/.]+$/,'');
    div.onclick=()=>{ current=i; loadTrackAt(current); play(); };
    listEl.appendChild(div);
  });
  updateActive();
}

audio.addEventListener('timeupdate', ()=>{
  if(!isNaN(audio.duration)){
    const pct=(audio.currentTime/audio.duration)*100;
    progress.value=pct;
    curTime.textContent=Math.floor(audio.currentTime/60)+':'+String(Math.floor(audio.currentTime%60)).padStart(2,'0');
    durTime.textContent=Math.floor(audio.duration/60)+':'+String(Math.floor(audio.duration%60)).padStart(2,'0');
  }
});
progress.addEventListener('input', ()=>{ audio.currentTime=(progress.value/100)*audio.duration; });

audio.addEventListener('ended', ()=>{
  if(!files.length) return;
  if(isRepeat){ loadTrackAt(current); play(); return; }
  if(isShuffle){ current=Math.floor(Math.random()*files.length); } 
  else{ current=(current+1)%files.length; }
  loadTrackAt(current); play();
});
