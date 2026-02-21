<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Player Douglas Almondes</title>

<!-- Manifest será carregado via manifest.json -->
<link id="pwamanifestlink" rel="manifest" href="manifest.json">

<style>
:root{
  --bg:#0b0b0b; --panel:#121212; --muted:#bdbdbd; --accent:#1db954; --accent-2:#14a746;
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0; font-family:Inter,system-ui,Segoe UI,Roboto,"Helvetica Neue",Arial;
  background:linear-gradient(180deg,var(--bg),#070707 70%); color:#fff;
  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
  display:flex; justify-content:center; padding:16px;
}
.app{
  width:100%; max-width:980px; display:grid;
  grid-template-columns: 395px 1fr; gap:14px;
  align-items:start;
  margin-bottom:28px;
}

/* responsive adjustments */
@media (max-width:980px){
  .app{ grid-template-columns: 320px 1fr; gap:12px; padding:12px; }
}
@media (max-width:860px){
  .app{ grid-template-columns: 1fr; padding-bottom:28px }
  .cover{ height:300px }
  .playlist-panel{ height:auto; max-height:395px }
}

/* floating install button */
#installBtn {
  position:fixed; right:14px; bottom:18px; z-index:9999;
  background:var(--accent); color:#021; border:none; padding:10px 14px; border-radius:999px; font-weight:700;
  box-shadow:0 8px 24px rgba(0,0,0,0.45); cursor:pointer;
}

/* player styling */
.panel {
  background:linear-gradient(180deg,var(--panel),#0f0f0f);
  border-radius:14px; padding:16px; box-shadow:0 8px 30px rgba(0,0,0,0.6);
}
.cover {
  width:100%; border-radius:12px; height:395px; background:#0f0f0f;
  display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;
}
.cover img{ width:100%; height:100%; object-fit:cover; display:block; }
.visual-canvas{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; flex-wrap:wrap; padding:8px }
.track-info{ padding:12px 6px 0; text-align:center }
.title{ font-size:18px; font-weight:700; margin:6px 0 4px; color:#fff; word-break:break-word; }
.artist{ font-size:13px; color:var(--muted); margin-bottom:8px; }
.progress-row{ display:flex; align-items:center; gap:8px; margin-top:10px }
.time{ font-size:12px; color:var(--muted); width:44px; text-align:center; white-space:nowrap; }
.progress{
  -webkit-appearance:none; appearance:none; height:8px; border-radius:999px;
  background:#222; flex:1; outline:none;
}
.progress::-webkit-slider-thumb{ -webkit-appearance:none; appearance:none; width:14px; height:14px; border-radius:50%; background:var(--accent); box-shadow:0 0 6px rgba(29,185,84,0.25) }
.controls { display:flex; justify-content:center; gap:16px; margin-top:14px; align-items:center; flex-wrap:wrap }
.ctrl-btn{ background:none; border:none; color:var(--accent); font-size:22px; width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 8px 20px rgba(0,0,0,0.6) }
.ctrl-btn.secondary{ background:#0f0f0f; color:var(--muted); width:44px; height:44px; font-size:18px; border-radius:12px; }
.ctrl-btn:active{ transform:scale(.96) }

/* sleep timer area */
.sleep {
  display:flex; gap:10px; align-items:center; justify-content:space-between; margin-top:14px; padding-top:12px; border-top:1px solid #111;
  flex-wrap:wrap;
}
.sleep .left{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.sleep .countdown{ background:#0d0d0d; padding:8px 12px; border-radius:10px; color:var(--muted) }

/* playlist */
.playlist-panel{ background:linear-gradient(180deg,#0f0f0f,#0b0b0b); border-radius:14px; padding:12px; height:calc(100vh - 72px); overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.6) }
.header-list{ display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px; flex-wrap:wrap }
.label{ font-weight:700; color:#fff }
.controls-top{ display:flex; gap:8px; align-items:center; flex-wrap:wrap }
.btn-small{ background:var(--accent); color:#041; border:none; padding:8px 12px; border-radius:10px; cursor:pointer; font-weight:700 }
.choose{ background:#222; color:var(--muted); padding:8px 12px; border-radius:10px; cursor:pointer; border: none; }

/* list and items */
.list{ overflow:auto; height:calc(100% - 64px); padding-right:6px }
.track-item{ padding:10px; border-radius:10px; display:flex; gap:12px; align-items:center; cursor:pointer; background:transparent; transition:all .12s; border:1px solid transparent; }
.track-item:hover{ background:#111 }
.track-item.active{ background:linear-gradient(90deg, rgba(29,185,84,.12), transparent); border-color:rgba(29,185,84,.14) }
.track-meta{ flex:1; min-width:0 }
.track-title{ font-size:14px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.track-sub{ font-size:12px; color:var(--muted) }

/* small list item icon (cover thumbnail) */
.track-thumb{ width:44px; height:44px; border-radius:8px; background:#0b0b0b; flex:0 0 44px; overflow:hidden; display:flex; align-items:center; justify-content:center }
.track-thumb img{ width:100%; height:100%; object-fit:cover; display:block }

/* small devices: shrink panels padding */
@media (max-width:420px){
  .ctrl-btn{ width:46px; height:46px; font-size:18px }
  .cover{ height:240px }
}
</style>
</head>
<body>

<!-- Install button (hidden until prompt available) -->
<button id="installBtn" style="display:none">Instalar</button>

<div class="app" id="appRoot">
 <!-- ESQUERDA: Tocando agora -->
  <div class="panel">
    <div class="cover" id="coverBox">
      <img id="coverImg" src="" alt="Capa" style="display:none">
      <div class="visual-canvas" id="visualCanvas"></div>
    </div>

    <div class="track-info">
      <div class="title" id="nowTitle">Nenhuma faixa</div>
      <div class="artist" id="nowArtist">Selecione a pasta de músicas</div>

      <div class="progress-row">
        <div class="time" id="curTime">0:00</div>
        <input id="progress" class="progress" type="range" min="0" max="100" value="0">
        <div class="time" id="durTime">0:00</div>
      </div>

      <div class="controls">
        <button class="ctrl-btn secondary" id="shuffleBtn" title="Shuffle">🔀</button>
        <button class="ctrl-btn" id="prevBtn" title="Anterior">⏮️</button>
        <button class="ctrl-btn" id="playBtn" title="Play/Pause">▶️</button>
        <button class="ctrl-btn" id="nextBtn" title="Próxima">⏭️</button>
        <button class="ctrl-btn secondary" id="repeatBtn" title="Repeat">🔁</button>
      </div>

      <div class="volume-control" style="margin-top:8px; justify-content:center;">
        🔊
        <input type="range" id="volumeSlider" min="0" max="1" step="0.01" value="1" style="width:140px;margin-left:8px">
      </div>

      <div class="sleep">
        <div class="left">
          <label style="color:var(--muted);font-size:13px">Sleep timer</label>
          <input id="sleepMin" type="number" min="1" max="240" placeholder="min 10" style="width:70px;padding:8px;border-radius:10px;border:none;background:#0c0c0c;color:#fff">
          <button id="setSleep" class="btn-small">Ativar</button>
          <button id="cancelSleep" class="choose">Cancelar</button>
        </div>
        <div class="countdown" id="countdownDisplay">—</div>
      </div>
    </div>
  </div>

  <!-- DIREITA: Lista de reprodução -->
  <div class="playlist-panel panel" id="playlistPanel">
    <div class="header-list">
      <div><div class="label">Playlist local Douglas Almondes</div><div style="font-size:12px;color:var(--muted)">Selecione a pasta contendo MP3</div></div>
      <div class="controls-top">
        <label for="fileInput" class="choose" title="Selecionar pasta">📁 Selecionar</label>
        <input id="fileInput" type="file" webkitdirectory multiple accept="audio/*" style="display:none">
        <button id="clearBtn" class="choose" title="Limpar lista">Limpar</button>
      </div>
    </div>

    <div style="margin-bottom:8px;display:flex;gap:8px;align-items:center">
      <div style="font-size:13px;color:var(--muted)">Última posição:</div>
      <div style="font-size:13px;color:var(--muted)" id="lastSaved">—</div>
      <button id="savePos" class="choose" style="margin-left:auto">Salvar agora</button>
    </div>

    <div class="list" id="list"></div>
  </div>
</div>

<!-- elemento de áudio oculto -->
<audio id="audio" crossorigin="anonymous"></audio>

<!-- load jsmediatags (CDN). Service worker caches it on first run -->
<script src="https://cdn.jsdelivr.net/npm/jsmediatags@3.9.7/dist/jsmediatags.min.js"></script>

<!-- Player JS -->
<script src="player.js"></script>

<!-- Auto select folder + autoplay -->
<script src="auto-play.js"></script>

</body>
</html>
