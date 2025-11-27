/*
  audio.js
  Archivo independiente que contiene la lógica de sonificación:
  - Conecta datos (gasto y esperanza de vida) con sonidos
  - Usa `heartbeat.js` (si está cargado) para los pitidos cardíacos
  - Usa `coins.wav` para efectos de monedas

  Este archivo no modifica otros archivos; expone una API en
  `window.AudioSonification` para que puedas reutilizarla en otros proyectos.

  Uso básico:
  <script src="heartbeat.js"></script>    // opcional, si quieres usar HeartbeatGenerator
  <script src="audio.js"></script>
  <script>
    AudioSonification.initAudio('coins.wav','pitido.wav');
    AudioSonification.playCoinsSound(spending, maxSpending, countryName);
    AudioSonification.playBeepSound(lifeExpectancy, minLife, maxLife);
  </script>
*/

(function(global){
  const state = {
    coinsInterval: null,
    beepInterval: null,
    isPlayingCoins: false,
    isPlayingBeep: false,
    audioInitialized: false,
    coinsPath: 'coins.wav',
    beepPath: 'pitido.wav'
  };

  // Inicializar audio (carga de archivos). Requiere interacción del usuario en algunos navegadores.
  function initAudio(coinsPath = 'coins.wav', beepPath = 'pitido.wav'){
    state.coinsPath = coinsPath;
    state.beepPath = beepPath;
    state.audioInitialized = true;
  }

  // Reproducir sonido de monedas con velocidad/intervalo según gasto
  function playCoinsSound(spending, maxSpending = spending, countryName = ''){
    stopCoinsSound();
    state.isPlayingCoins = true;

    let interval = 1000;
    let volume = 0.8;
    let repetitions = 1;

    if (countryName === 'United States' || countryName === 'United States of America'){
      interval = 300; repetitions = 2;
    } else if (spending >= 8000){ interval = 300; repetitions = 3; }
    else if (spending >= 5000){ interval = 400; repetitions = 2; }
    else if (spending >= 3000){ interval = 500; repetitions = 1; }
    else if (spending >= 2000){ interval = 700; repetitions = 1; }
    else if (spending >= 1000){ interval = 1000; repetitions = 1; }
    else if (spending >= 500){ interval = 1500; repetitions = 1; }
    else if (spending >= 100){ interval = 2500; repetitions = 1; }
    else { interval = 4000; repetitions = 1; }

    const playSound = () => {
      for (let i = 0; i < repetitions; i++){
        setTimeout(() => {
          const a = new Audio(state.coinsPath);
          a.currentTime = 0;
          a.volume = volume;
          a.play().catch(e => console.debug('coins play error', e));
        }, i * 50);
      }
    };

    // Reproducir inmediatamente y luego en intervalos mientras esté activo
    playSound();
    state.coinsInterval = setInterval(() => {
      if (state.isPlayingCoins) playSound();
    }, interval);
  }

  function stopCoinsSound(){
    state.isPlayingCoins = false;
    if (state.coinsInterval){ clearInterval(state.coinsInterval); state.coinsInterval = null; }
  }

  // Reproducir pitidos relacionados con esperanza de vida
  function playBeepSound(lifeExpectancy, minLife = null, maxLife = null){
    stopBeepSound();
    state.isPlayingBeep = true;

    // Preferir HeartbeatGenerator de `heartbeat.js` si existe
    try {
      if (typeof global.heartbeatGenerator !== 'undefined' && global.heartbeatGenerator && typeof global.heartbeatGenerator.generateHeartbeatPattern === 'function'){
        global.heartbeatGenerator.generateHeartbeatPattern(lifeExpectancy);
        return;
      }
    } catch(e){ console.debug('heartbeatGenerator check failed', e); }

    // Si no hay heartbeatGenerator, intentar usar clase HeartbeatGenerator (si fue definida globalmente)
    try{
      if (typeof global.HeartbeatGenerator !== 'undefined'){
        if (!global._audio_sonification_heartbeat_local){
          global._audio_sonification_heartbeat_local = new global.HeartbeatGenerator();
        }
        global._audio_sonification_heartbeat_local.generateHeartbeatPattern(lifeExpectancy);
        return;
      }
    } catch(e){ console.debug('HeartbeatGenerator instantiation failed', e); }

    // Fallback: usar archivo de pitido simple y temporizador según rangos
    const beepPlay = (volume) => {
      const b = new Audio(state.beepPath);
      b.currentTime = 0;
      b.volume = volume;
      b.play().catch(e => console.debug('beep play error', e));
    };

    let interval = 1000;
    let volume = 0.5;

    if (lifeExpectancy < 50){ interval = 150; volume = 0.8; }
    else if (lifeExpectancy >= 50 && lifeExpectancy < 52.5){ interval = 180; volume = 0.75; }
    else if (lifeExpectancy >= 52.5 && lifeExpectancy < 55){ interval = 200; volume = 0.7; }
    else if (lifeExpectancy >= 55 && lifeExpectancy < 57.5){ interval = 250; volume = 0.65; }
    else if (lifeExpectancy >= 57.5 && lifeExpectancy < 60){ interval = 300; volume = 0.6; }
    else if (lifeExpectancy >= 60 && lifeExpectancy < 62.5){ interval = 400; volume = 0.55; }
    else if (lifeExpectancy >= 62.5 && lifeExpectancy < 65){ interval = 500; volume = 0.5; }
    else if (lifeExpectancy >= 65 && lifeExpectancy < 67.5){ interval = 600; volume = 0.45; }
    else if (lifeExpectancy >= 67.5 && lifeExpectancy < 70){ interval = 700; volume = 0.4; }
    else if (lifeExpectancy >= 70 && lifeExpectancy < 72.5){ interval = 900; volume = 0.35; }
    else if (lifeExpectancy >= 72.5 && lifeExpectancy < 75){ interval = 1000; volume = 0.3; }
    else if (lifeExpectancy >= 75 && lifeExpectancy < 77.5){ interval = 1100; volume = 0.25; }
    else if (lifeExpectancy >= 77.5 && lifeExpectancy < 80){ interval = 1200; volume = 0.2; }
    else if (lifeExpectancy >= 80 && lifeExpectancy < 82.5){ interval = 1400; volume = 0.15; }
    else if (lifeExpectancy >= 82.5 && lifeExpectancy < 85){ interval = 1600; volume = 0.14; }
    else if (lifeExpectancy >= 85 && lifeExpectancy < 87.5){ interval = 1800; volume = 0.13; }
    else if (lifeExpectancy >= 87.5 && lifeExpectancy < 90){ interval = 2000; volume = 0.12; }
    else if (lifeExpectancy >= 90){ interval = 2500; volume = 0.1; }

    // Reproducir inmediatamente y luego en intervalos
    beepPlay(volume);
    state.beepInterval = setInterval(() => {
      if (state.isPlayingBeep) beepPlay(volume);
    }, interval);
  }

  function stopBeepSound(){
    state.isPlayingBeep = false;
    // Detener instancia global o local de HeartbeatGenerator si existe
    try{
      if (typeof global.heartbeatGenerator !== 'undefined' && global.heartbeatGenerator && typeof global.heartbeatGenerator.stop === 'function'){
        global.heartbeatGenerator.stop();
      }
    } catch(e){ /* ignore */ }

    try{
      if (global._audio_sonification_heartbeat_local && typeof global._audio_sonification_heartbeat_local.stop === 'function'){
        global._audio_sonification_heartbeat_local.stop();
      }
    } catch(e){ /* ignore */ }

    if (state.beepInterval){ clearInterval(state.beepInterval); state.beepInterval = null; }
  }

  function stopAllSounds(){
    stopCoinsSound();
    stopBeepSound();
  }

  // Exponer API en window para fácil reutilización
  global.AudioSonification = {
    initAudio,
    playCoinsSound,
    stopCoinsSound,
    playBeepSound,
    stopBeepSound,
    stopAllSounds,
    _state: state
  };

})(typeof window !== 'undefined' ? window : globalThis);