const fileInput = document.getElementById('fileInput');
const listEl = document.getElementById('list');
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const progress = document.getElementById('progress');
const curTime = document.getElementById('curTime');
const durTime = document.getElementById('durTime');
const nowTitle = document.getElementById('nowTitle');
const nowArtist = document.getElementById('nowArtist');
const coverImg = document.getElementById('coverImg');
const coverBox = document.getElementById('coverBox');
const visualCanvas = document.getElementById('visualCanvas');
const sleepMin = document.getElementById('sleepMin');
const setSleep = document.getElementById('setSleep');
const cancelSleep = document.getElementById('cancelSleep');
const countdownDisplay = document.getElementById('countdownDisplay');
const clearBtn = document.getElementById('clearBtn');
const savePosBtn = document.getElementById('savePos');
const lastSaved = document.getElementById('lastSaved');
const volumeSlider = document.getElementById('volumeSlider');

let files = [];
let order = [];
let current = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let analyser, audioCtx, dataArray, source;
let bars = [];
let sleepTimeout = null, countdownInterval = null, sleepRemaining = 0;

function fmt(s) {
  if (s === undefined || s === null || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function buildVisualizer(cols = 36) {
  visualCanvas.innerHTML = '';
  bars = [];
  for (let i = 0; i < cols; i++) {
    const d = document.createElement('div');
    d.style.width = `${100 / cols}%`;
    d.style.height = '6px';
    d.style.margin = '0 2px';
    d.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04))';
    d.style.borderRadius = '6px';
    d.style.transformOrigin = 'bottom';
    bars.push(d);
    visualCanvas.appendChild(d);
  }
}
buildVisualizer(36);

fileInput.addEventListener('change', (e) => {
  files = Array.from(e.target.files).filter(f => f.name.toLowerCase().endsWith('.mp3') || f.type.startsWith('audio/'));
  if (!files.length) {
    alert('Nenhum MP3 encontrado.');
    return;
  }
  files.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  order = files.map((_, i) => i);
  current = 0;
  renderList();
  loadTrackAt(current);
});

clearBtn.addEventListener('click', () => {
  files = [];
  order = [];
  current = 0;
  listEl.innerHTML = '';
  nowTitle.textContent = 'Nenhuma faixa';
  nowArtist.textContent = '';
  coverImg.style.display = 'none';
  localStorage.removeItem('player_files');
});

function renderList() {
  listEl.innerHTML = '';
  files.forEach((f, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'track-item';
    wrap.dataset.index = i;

    const thumb = document.createElement('div');
    thumb.className = 'track-thumb';

    const img = document.createElement('img');
    img.alt = 'thumb';
    img.style.display = 'none';
    thumb.appendChild(img);

    const meta = document.createElement('div');
        meta.className = 'track-meta';

    // Usaremos jsmediatags para ler título e artista
    jsmediatags.read(f, {
      onSuccess: function(tag) {
        const title = tag.tags.title || f.name;
        const artist = tag.tags.artist || 'Desconhecido';

        wrap.querySelector('.track-title').textContent = title;
        wrap.querySelector('.track-sub').textContent = artist;

        // Se houver imagem na tag, converte em URL blob e exibe
        if (tag.tags.picture) {
          const picture = tag.tags.picture;
          let base64String = "";
          for (let i = 0; i < picture.data.length; i++) {
            base64String += String.fromCharCode(picture.data[i]);
          }
          const base64 = `data:${picture.format};base64,${btoa(base64String)}`;
          img.src = base64;
          img.style.display = 'block';
        }
      },
      onError: function(error) {
        wrap.querySelector('.track-title').textContent = f.name;
        wrap.querySelector('.track-sub').textContent = '';
      }
    });

    const titleDiv = document.createElement('div');
    titleDiv.className = 'track-title';
    titleDiv.textContent = f.name;

    const subDiv = document.createElement('div');
    subDiv.className = 'track-sub';

    meta.appendChild(titleDiv);
    meta.appendChild(subDiv);

    wrap.appendChild(thumb);
    wrap.appendChild(meta);

    wrap.addEventListener('click', () => {
      current = i;
      playTrackAt(current);
    });

    listEl.appendChild(wrap);
  });
  highlightCurrent();
}

function highlightCurrent() {
  const items = listEl.querySelectorAll('.track-item');
  items.forEach(item => item.classList.remove('active'));
  const currentItem = listEl.querySelector(`.track-item[data-index="${current}"]`);
  if (currentItem) currentItem.classList.add('active');
}

function loadTrackAt(i) {
  if (!files.length || i < 0 || i >= files.length) return;
  const f = files[i];
  const url = URL.createObjectURL(f);
  audio.src = url;
  nowTitle.textContent = f.name;
  nowArtist.textContent = '';
  coverImg.style.display = 'none';

  // Tenta ler tags para mostrar título/artist/capa
  jsmediatags.read(f, {
    onSuccess: function(tag) {
      nowTitle.textContent = tag.tags.title || f.name;
      nowArtist.textContent = tag.tags.artist || '';
      if (tag.tags.picture) {
        const picture = tag.tags.picture;
        let base64String = "";
        for (let i = 0; i < picture.data.length; i++) {
          base64String += String.fromCharCode(picture.data[i]);
        }
        const base64 = `data:${picture.format};base64,${btoa(base64String)}`;
        coverImg.src = base64;
        coverImg.style.display = 'block';
      } else {
        coverImg.style.display = 'none';
      }
    },
    onError: function() {
      nowTitle.textContent = f.name;
      nowArtist.textContent = '';
      coverImg.style.display = 'none';
    }
  });

  highlightCurrent();
  setupAudioContext();
}

function playTrackAt(i) {
  loadTrackAt(i);
  audio.play();
  isPlaying = true;
  updatePlayButton();
}

function updatePlayButton() {
  playBtn.textContent = isPlaying ? '⏸️' : '▶️';
}

playBtn.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();
  } else {
    audio.play();
  }
});

audio.addEventListener('play', () => {
  isPlaying = true;
  updatePlayButton();
});

audio.addEventListener('pause', () => {
  isPlaying = false;
  updatePlayButton();
});

audio.addEventListener('ended', () => {
  if (isRepeat) {
    audio.currentTime = 0;
    audio.play();
  } else {
    nextTrack();
  }
});

prevBtn.addEventListener('click', () => {
  if (audio.currentTime > 5) {
    audio.currentTime = 0;
  } else {
    prevTrack();
  }
});

nextBtn.addEventListener('click', nextTrack);

function nextTrack() {
  if (isShuffle) {
    current = Math.floor(Math.random() * files.length);
  } else {
    current++;
    if (current >= files.length) current = 0;
  }
  playTrackAt(current);
}

function prevTrack() {
  if (isShuffle) {
    current = Math.floor(Math.random() * files.length);
  } else {
    current--;
    if (current < 0) current = files.length - 1;
  }
  playTrackAt(current);
}

shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.style.color = isShuffle ? 'var(--accent)' : 'var(--muted)';
});

repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatBtn.style.color = isRepeat ? 'var(--accent)' : 'var(--muted)';
});

progress.addEventListener('input', () => {
  const val = progress.value;
  if (!isNaN(audio.duration)) {
    audio.currentTime = (val / 100) * audio.duration;
  }
});

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const val = (audio.currentTime / audio.duration) * 100;
    progress.value = val;
    curTime.textContent = fmt(audio.currentTime);
    durTime.textContent = fmt(audio.duration);
  } else {
    curTime.textContent = '0:00';
    durTime.textContent = '0:00';
    progress.value = 0;
  }
  highlightCurrent();
});

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});

function setupAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  }

  if (source) source.disconnect();

  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  visualize();
}

function visualize() {
  if (!analyser) return;
  requestAnimationFrame(visualize);
  analyser.getByteFrequencyData(dataArray);
  bars.forEach((bar, i) => {
    const val = dataArray[i] || 0;
    const scale = val / 255;
    bar.style.transform = `scaleY(${Math.max(scale, 0.05)})`;
    bar.style.background = `linear-gradient(180deg, var(--accent), var(--accent-2))`;
  });
}

// Sleep timer functions
setSleep.addEventListener('click', () => {
  const mins = parseInt(sleepMin.value);
  if (isNaN(mins) || mins <= 0) {
    alert('Digite um número válido para minutos.');
    return;
  }
  sleepRemaining = mins * 60;
  countdownDisplay.textContent = fmt(sleepRemaining);
  if (sleepTimeout) clearTimeout(sleepTimeout);
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    sleepRemaining--;
    if (sleepRemaining <= 0) {
      clearInterval(countdownInterval);
      audio.pause();
      countdownDisplay.textContent = '—';
    } else {
      countdownDisplay.textContent = fmt(sleepRemaining);
    }
  }, 1000);
  sleepTimeout = setTimeout(() => {
    audio.pause();
    countdownDisplay.textContent = '—';
    if (countdownInterval) clearInterval(countdownInterval);
  }, mins * 60000);
});

cancelSleep.addEventListener('click', () => {
  if (sleepTimeout) clearTimeout(sleepTimeout);
  if (countdownInterval) clearInterval(countdownInterval);
  countdownDisplay.textContent = '—';
  sleepMin.value = '';
});


// Save and restore position (index + time)
savePosBtn.addEventListener('click', () => {
  if (!files.length) return;
  const state = {
    current,
    time: audio.currentTime,
  };
  localStorage.setItem('player_last_position', JSON.stringify(state));
  lastSaved.textContent = `${current + 1} / ${files.length} - ${fmt(audio.currentTime)}`;
});

function restoreLastPosition() {
  const state = localStorage.getItem('player_last_position');
  if (!state) return;
  try {
    const { current: idx, time } = JSON.parse(state);
    if (idx >= 0 && idx < files.length) {
      current = idx;
      loadTrackAt(current);
      audio.currentTime = time;
      lastSaved.textContent = `${current + 1} / ${files.length} - ${fmt(time)}`;
    }
  } catch {
    // ignore
  }
}


   
