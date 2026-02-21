window.addEventListener('load', () => {
  // Pega dados da última sessão, se existir
  const last = localStorage.getItem('player_last');
  if (!last) return;

  try {
    const { idxOrder, time } = JSON.parse(last);

    // Se não tiver arquivos carregados ainda, aguarda usuário selecionar
    if (!files.length) {
      // Quando arquivos forem carregados, tenta carregar a faixa salva
      fileInput.addEventListener('change', () => {
        current = order.indexOf(idxOrder);
        if (current === -1) current = 0;  // fallback
        loadTrackAt(current);

        audio.currentTime = time || 0;

        audio.play().catch(() => {
          alert('Toque no botão ▶️ para iniciar a reprodução.');
        });
      }, { once: true });

      // opcional: abre seletor automaticamente
      setTimeout(() => fileInput.click(), 600);

    } else {
      // Se arquivos já carregados (não muito comum nesse fluxo)
      current = order.indexOf(idxOrder);
      if (current === -1) current = 0;
      loadTrackAt(current);
      audio.currentTime = time || 0;
      audio.play().catch(() => {
        alert('Toque no botão ▶️ para iniciar a reprodução.');
      });
    }
  } catch(e) {
    console.warn('Erro ao restaurar última posição:', e);
  }
});
