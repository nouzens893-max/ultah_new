/**
 * Birthday Celebration & Realistic 3D Cake Interactive Experience
 * Pure JavaScript - Procedural Web Audio, Physics Confetti, Fireworks & Mic Blow
 */

(function () {
  'use strict';

  // State Management
  const state = {
    isCandleLit: true,
    isLightsOn: true,
    isMusicPlaying: false,
    poppedBalloons: 0,
    micListening: false,
    micStream: null,
    audioCtx: null,
    musicInterval: null,
    isCakeSliced: false,
    userData: {
      name: 'My Girl',
      date: '9 Oktober',
      age: 19,
      greeting: 'Semoga harimu dipenuhi kebahagiaan, tawa ceria, dan semua impian indahmu terwujud nyata! ✨',
      polaroid: 'Setiap detik usiamu adalah anugerah. Teruslah bersinar, tersenyum, dan tebarkan bahagia bagi sekitarmu!',
      signature: '~ Dari Cowomu yang Jago Main Jungle ~'
    },
    wishes: [
      { sender: 'Zex', text: 'Semoga cita cita kamu tercapai 🤲✨', time: '10 minutes ago' },
      { sender: 'Jeka', text: 'Semoga panjang umur 🎂🥳', time: '10 days ago' },
      { sender: 'Tofan', text: 'Semoga sehat sehat selalu 🚀🔥', time: '5 month ago' }
    ]
  };

  // DOM Elements
  const els = {
    body: document.body,
    fireworksCanvas: document.getElementById('fireworksCanvas'),
    confettiCanvas: document.getElementById('confettiCanvas'),
    balloonsContainer: document.getElementById('balloonsContainer'),
    ambientVignette: document.getElementById('ambientVignette'),
    candleAmbientGlow: document.getElementById('candleAmbientGlow'),
    flameElement: document.getElementById('flameElement'),
    smokeTrail: document.getElementById('smokeTrail'),
    candleStatusText: document.getElementById('candleStatusText'),
    candleStatusBadge: document.getElementById('candleStatusBadge'),
    mainCandle: document.getElementById('mainCandle'),
    cakeKnife: document.getElementById('cakeKnife'),
    cakeSlicePiece: document.getElementById('cakeSlicePiece'),
    sliceToast: document.getElementById('sliceToast'),
    giftBoxStage: document.getElementById('giftBoxStage'),
    giftModal: document.getElementById('giftModal'),
    btnCloseGiftModal: document.getElementById('btnCloseGiftModal'),
    btnClaimGift: document.getElementById('btnClaimGift'),
    customModal: document.getElementById('customModal'),
    btnCustomize: document.getElementById('btnCustomize'),
    btnCloseCustomModal: document.getElementById('btnCloseCustomModal'),
    btnSaveCustom: document.getElementById('btnSaveCustom'),
    btnResetCustom: document.getElementById('btnResetCustom'),
    customNameInput: document.getElementById('customNameInput'),
    customDateInput: document.getElementById('customDateInput'),
    customAgeInput: document.getElementById('customAgeInput'),
    customGreetingInput: document.getElementById('customGreetingInput'),
    customPolaroidInput: document.getElementById('customPolaroidInput'),
    displayName: document.getElementById('displayName'),
    displayDate: document.getElementById('displayDate'),
    displayVoucherCode: document.getElementById('displayVoucherCode'),
    displayAge: document.getElementById('displayAge'),
    displaySubtitle: document.getElementById('displaySubtitle'),
    displayPolaroidText: document.getElementById('displayPolaroidText'),
    displaySignature: document.getElementById('displaySignature'),
    polaroidFrame: document.getElementById('polaroidFrame'),
    btnOpenPhotoModal: document.getElementById('btnOpenPhotoModal'),
    photoModal: document.getElementById('photoModal'),
    btnClosePhotoModal: document.getElementById('btnClosePhotoModal'),
    btnBlowDirect: document.getElementById('btnBlowDirect'),
    btnMicBlow: document.getElementById('btnMicBlow'),
    btnRelight: document.getElementById('btnRelight'),
    btnCutCake: document.getElementById('btnCutCake'),
    btnMusic: document.getElementById('btnMusic'),
    musicIcon: document.getElementById('musicIcon'),
    musicLabel: document.getElementById('musicLabel'),
    btnLights: document.getElementById('btnLights'),
    lightIcon: document.getElementById('lightIcon'),
    lightLabel: document.getElementById('lightLabel'),
    micVisualizer: document.getElementById('micVisualizer'),
    micMeterFill: document.getElementById('micMeterFill'),
    micBtnText: document.getElementById('micBtnText'),
    poppedScore: document.getElementById('poppedScore'),
    btnSpawnBalloons: document.getElementById('btnSpawnBalloons'),
    wishesStream: document.getElementById('wishesStream'),
    inputSender: document.getElementById('inputSender'),
    inputWish: document.getElementById('inputWish'),
    btnSendWish: document.getElementById('btnSendWish')
  };

  // =========================================================================
  // Web Audio Synthesizer (Music & Sound Effects)
  // =========================================================================
  function getAudioContext() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new AudioCtx();
    }
    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  // Play Tone helper
  function playTone(freq, type = 'sine', duration = 0.3, startTime = 0, gainLevel = 0.15) {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(gainLevel, ctx.currentTime + startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // Sound: Pop Balloon
  function playPopSound() {
    try {
      const ctx = getAudioContext();
      // Noise burst for sharp pop
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) { }
  }

  // Sound: Candle Blowout Wind Swoosh
  function playBlowSound() {
    try {
      const ctx = getAudioContext();
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.5);
      filter.Q.value = 3.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) { }
  }

  // Sound: Cheer / Applause & Party Fanfare
  function playCheerFanfare() {
    // Joyful melodic fanfare
    const notes = [
      { f: 523.25, d: 0.2, t: 0 },    // C5
      { f: 659.25, d: 0.2, t: 0.15 }, // E5
      { f: 783.99, d: 0.35, t: 0.3 }, // G5
      { f: 1046.5, d: 0.6, t: 0.5 }   // C6
    ];
    notes.forEach(n => playTone(n.f, 'triangle', n.d, n.t, 0.25));
  }

  // Sound: Cake Slice cutting
  function playSliceSound() {
    playTone(880, 'sine', 0.15, 0, 0.1);
    playTone(1174, 'triangle', 0.25, 0.08, 0.15);
  }

  // Melody: Happy Birthday
  const happyBirthdayNotes = [
    { note: 261.63, dur: 0.3, pause: 0.35 }, // C4
    { note: 261.63, dur: 0.15, pause: 0.2 }, // C4
    { note: 293.66, dur: 0.45, pause: 0.5 }, // D4
    { note: 261.63, dur: 0.45, pause: 0.5 }, // C4
    { note: 349.23, dur: 0.45, pause: 0.5 }, // F4
    { note: 329.63, dur: 0.8, pause: 0.9 },  // E4

    { note: 261.63, dur: 0.3, pause: 0.35 }, // C4
    { note: 261.63, dur: 0.15, pause: 0.2 }, // C4
    { note: 293.66, dur: 0.45, pause: 0.5 }, // D4
    { note: 261.63, dur: 0.45, pause: 0.5 }, // C4
    { note: 392.00, dur: 0.45, pause: 0.5 }, // G4
    { note: 349.23, dur: 0.8, pause: 0.9 },  // F4

    { note: 261.63, dur: 0.3, pause: 0.35 }, // C4
    { note: 261.63, dur: 0.15, pause: 0.2 }, // C4
    { note: 523.25, dur: 0.45, pause: 0.5 }, // C5
    { note: 440.00, dur: 0.45, pause: 0.5 }, // A4
    { note: 349.23, dur: 0.45, pause: 0.5 }, // F4
    { note: 329.63, dur: 0.45, pause: 0.5 }, // E4
    { note: 293.66, dur: 0.8, pause: 0.9 },  // D4

    { note: 466.16, dur: 0.3, pause: 0.35 }, // Bb4
    { note: 466.16, dur: 0.15, pause: 0.2 }, // Bb4
    { note: 440.00, dur: 0.45, pause: 0.5 }, // A4
    { note: 349.23, dur: 0.45, pause: 0.5 }, // F4
    { note: 392.00, dur: 0.45, pause: 0.5 }, // G4
    { note: 349.23, dur: 1.1, pause: 1.2 }   // F4
  ];

  function playHappyBirthdaySong() {
    if (!state.isMusicPlaying) return;
    let offset = 0;
    happyBirthdayNotes.forEach(item => {
      setTimeout(() => {
        if (state.isMusicPlaying) {
          playTone(item.note, 'triangle', item.dur, 0, 0.2);
          playTone(item.note * 0.5, 'sine', item.dur, 0, 0.1); // Warm sub-octave
        }
      }, offset * 1000);
      offset += item.pause;
    });

    // Schedule loop
    state.musicInterval = setTimeout(() => {
      if (state.isMusicPlaying) {
        playHappyBirthdaySong();
      }
    }, (offset + 1.2) * 1000);
  }

  function toggleMusic(forceState) {
    const shouldPlay = forceState !== undefined ? forceState : !state.isMusicPlaying;
    state.isMusicPlaying = shouldPlay;

    if (state.isMusicPlaying) {
      getAudioContext();
      els.btnMusic.classList.add('playing');
      els.musicIcon.textContent = '⏸️';
      els.musicLabel.textContent = 'Jeda Musik';
      playHappyBirthdaySong();
    } else {
      els.btnMusic.classList.remove('playing');
      els.musicIcon.textContent = '🎵';
      els.musicLabel.textContent = 'Putar Musik';
      clearTimeout(state.musicInterval);
    }
  }

  // =========================================================================
  // Canvas Confetti System
  // =========================================================================
  const confettiParticles = [];
  const confettiColors = ['#ff5e7e', '#ffc947', '#48dbfb', '#1dd1a1', '#f368e0', '#ff9f43', '#ffffff'];

  function initConfetti() {
    const canvas = els.confettiCanvas;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRotation;
        p.opacity -= 0.005;

        if (p.opacity <= 0 || p.y > canvas.height + 20) {
          confettiParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }

        ctx.restore();
      }

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  function shootConfetti(count = 120, originX, originY) {
    const x = originX !== undefined ? originX : window.innerWidth / 2;
    const y = originY !== undefined ? originY : window.innerHeight * 0.55;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      confettiParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        size: Math.random() * 8 + 6,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rotation: Math.random() * 360,
        vRotation: (Math.random() - 0.5) * 12,
        gravity: 0.22,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }
  }

  // =========================================================================
  // Canvas Fireworks System
  // =========================================================================
  const fireworkSparks = [];

  function initFireworks() {
    const canvas = els.fireworksCanvas;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = fireworkSparks.length - 1; i >= 0; i--) {
        const s = fireworkSparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.06; // gravity
        s.vx *= 0.98; // air resistance
        s.vy *= 0.98;
        s.alpha -= 0.015;

        if (s.alpha <= 0) {
          fireworkSparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  function launchFirework(x, y) {
    const sparkCount = 65;
    const palette = ['#ff477e', '#ffd166', '#06d6a0', '#118ab2', '#ff9f1c', '#f72585'];
    const chosenColor = palette[Math.floor(Math.random() * palette.length)];

    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 5 + 2.5;
      fireworkSparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2.2 + 1.2,
        color: chosenColor,
        alpha: 1
      });
    }
  }

  function launchFireworksSequence(rounds = 6) {
    let fired = 0;
    const interval = setInterval(() => {
      const x = Math.random() * (window.innerWidth * 0.7) + window.innerWidth * 0.15;
      const y = Math.random() * (window.innerHeight * 0.4) + 80;
      launchFirework(x, y);
      fired++;
      if (fired >= rounds) clearInterval(interval);
    }, 450);
  }

  // =========================================================================
  // Realistic Candle Blowing Interactions
  // =========================================================================
  function blowOutCandle() {
    if (!state.isCandleLit) return;
    state.isCandleLit = false;

    // Sound effect
    playBlowSound();

    // Visual extinguish
    els.flameElement.classList.add('blown-out');
    els.candleAmbientGlow.classList.add('extinguished');
    els.smokeTrail.classList.add('active');

    // Update Status
    els.candleStatusBadge.querySelector('.status-dot').className = 'status-dot extinguished';
    els.candleStatusText.textContent = '🎉 Horeee! Permohonan Dibuat & Lilin Terpadam!';

    // UI Buttons toggle
    els.btnBlowDirect.classList.add('hidden');
    els.btnMicBlow.classList.add('hidden');
    els.btnRelight.classList.remove('hidden');
    stopMicListening();

    // Lights back on if they were dimmed
    if (!state.isLightsOn) {
      setTimeout(() => toggleLights(true), 600);
    }

    // Celebration sequence
    setTimeout(() => {
      playCheerFanfare();
      shootConfetti(150);
      launchFireworksSequence(8);
      toggleMusic(true);
    }, 400);

    setTimeout(() => {
      els.smokeTrail.classList.remove('active');
    }, 3200);
  }

  function relightCandle() {
    state.isCandleLit = true;
    playTone(700, 'sine', 0.2, 0, 0.15);

    els.flameElement.classList.remove('blown-out');
    els.candleAmbientGlow.classList.remove('extinguished');
    els.smokeTrail.classList.remove('active');

    els.candleStatusBadge.querySelector('.status-dot').className = 'status-dot pulsing';
    els.candleStatusText.textContent = 'Lilin Menyala Hangat 🕯️ Buatlah Permohonan!';

    els.btnBlowDirect.classList.remove('hidden');
    els.btnMicBlow.classList.remove('hidden');
    els.btnRelight.classList.add('hidden');
  }

  // =========================================================================
  // Microphone Blow Detection
  // =========================================================================
  async function toggleMicListening() {
    if (state.micListening) {
      stopMicListening();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      state.micStream = stream;
      state.micListening = true;

      els.micVisualizer.classList.remove('hidden');
      els.micBtnText.textContent = 'Hentikan Mic';
      els.btnMicBlow.classList.add('action-btn-primary');

      const ctx = getAudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let blowScore = 0;

      function checkAudio() {
        if (!state.micListening) return;

        analyser.getByteFrequencyData(dataArray);

        // Low & mid frequencies (blowing produces broad low/mid breath noise)
        let sum = 0;
        for (let i = 2; i < 30; i++) {
          sum += dataArray[i];
        }
        const average = sum / 28;
        const volumePercent = Math.min(100, (average / 140) * 100);
        els.micMeterFill.style.width = volumePercent + '%';

        // Threshold detection
        if (volumePercent > 65) {
          blowScore += 1;
          if (blowScore >= 3) {
            blowOutCandle();
            stopMicListening();
            return;
          }
        } else {
          blowScore = Math.max(0, blowScore - 0.5);
        }

        requestAnimationFrame(checkAudio);
      }

      requestAnimationFrame(checkAudio);
    } catch (err) {
      console.warn('Microphone access not granted:', err);
      alert('Izin mikrofon tidak diberikan atau tidak didukung di browser ini. Anda tetap dapat meniup lilin dengan tombol "Tiup Lilin" atau klik langsung lilinnya! 😊');
      stopMicListening();
    }
  }

  function stopMicListening() {
    state.micListening = false;
    if (state.micStream) {
      state.micStream.getTracks().forEach(track => track.stop());
      state.micStream = null;
    }
    els.micVisualizer.classList.add('hidden');
    els.micMeterFill.style.width = '0%';
    els.micBtnText.textContent = 'Tiup via Mikrofon';
    els.btnMicBlow.classList.remove('action-btn-primary');
  }

  // =========================================================================
  // Cake Slicing Feature
  // =========================================================================
  function sliceCake() {
    if (state.isCakeSliced) {
      // Reset slice
      state.isCakeSliced = false;
      els.cakeSlicePiece.classList.remove('sliced');
      els.cutBtnText.textContent = 'Potong Kue';
      return;
    }

    state.isCakeSliced = true;
    playSliceSound();

    // Animate knife
    els.cakeKnife.classList.add('cutting');

    setTimeout(() => {
      els.cakeSlicePiece.classList.add('sliced');
      els.cutBtnText.textContent = 'Satukan Kue Lagi';
      shootConfetti(40, window.innerWidth / 2 + 80, window.innerHeight * 0.45);

      // Show toast
      els.sliceToast.classList.remove('hidden');
      setTimeout(() => {
        els.sliceToast.classList.add('hidden');
      }, 4000);
    }, 800);

    setTimeout(() => {
      els.cakeKnife.classList.remove('cutting');
    }, 1500);
  }

  // =========================================================================
  // Interactive Floating Balloons
  // =========================================================================
  const balloonColors = [
    { bg: 'radial-gradient(circle at 35% 35%, #ff758c 0%, #ff4b6b 60%, #a80a2b 100%)', pop: '#ff4b6b' },
    { bg: 'radial-gradient(circle at 35% 35%, #ffd166 0%, #ffb703 60%, #b57600 100%)', pop: '#ffd166' },
    { bg: 'radial-gradient(circle at 35% 35%, #48dbfb 0%, #0abde3 60%, #075f73 100%)', pop: '#0abde3' },
    { bg: 'radial-gradient(circle at 35% 35%, #a29bfe 0%, #6c5ce7 60%, #3e339e 100%)', pop: '#6c5ce7' },
    { bg: 'radial-gradient(circle at 35% 35%, #1dd1a1 0%, #10ac84 60%, #095944 100%)', pop: '#1dd1a1' }
  ];

  function createFloatingBalloon(startX) {
    const balloon = document.createElement('div');
    balloon.className = 'floating-balloon';

    const colorConfig = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    balloon.style.background = colorConfig.bg;

    const shine = document.createElement('div');
    shine.className = 'balloon-shine';

    const knot = document.createElement('div');
    knot.className = 'balloon-knot';

    const string = document.createElement('div');
    string.className = 'balloon-string';

    balloon.appendChild(shine);
    balloon.appendChild(knot);
    balloon.appendChild(string);

    const x = startX !== undefined ? startX : Math.random() * (window.innerWidth - 80) + 40;
    let y = window.innerHeight + 100;
    const speed = Math.random() * 1.5 + 1.2;
    const swayAmplitude = Math.random() * 25 + 15;
    const swayFreq = Math.random() * 0.02 + 0.015;
    let phase = Math.random() * Math.PI * 2;

    balloon.style.left = x + 'px';
    balloon.style.top = y + 'px';

    els.balloonsContainer.appendChild(balloon);

    let frameId;
    function floatUp() {
      y -= speed;
      phase += swayFreq;
      const currentX = x + Math.sin(phase) * swayAmplitude;
      balloon.style.transform = `translate(${currentX - x}px, 0)`;
      balloon.style.top = y + 'px';

      if (y < -120) {
        cancelAnimationFrame(frameId);
        balloon.remove();
      } else {
        frameId = requestAnimationFrame(floatUp);
      }
    }
    frameId = requestAnimationFrame(floatUp);

    // Pop Balloon on Click / Tap (Optimal untuk HP & Desktop)
    let isPopped = false;
    const triggerPop = (e) => {
      if (isPopped) return;
      isPopped = true;
      if (e.cancelable) {
        e.preventDefault();
      }
      e.stopPropagation();
      cancelAnimationFrame(frameId);
      popBalloon(balloon, colorConfig.pop);
    };

    balloon.addEventListener('touchstart', triggerPop, { passive: false });
    balloon.addEventListener('pointerdown', triggerPop);
    balloon.addEventListener('click', triggerPop);
  }

  function popBalloon(balloonEl, popColor) {
    const rect = balloonEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    playPopSound();

    // Burst particles
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'balloon-burst-particle';
      p.style.backgroundColor = popColor;
      p.style.left = centerX + 'px';
      p.style.top = centerY + 'px';
      document.body.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 60 + 20;
      const targetX = centerX + Math.cos(angle) * dist;
      const targetY = centerY + Math.sin(angle) * dist;

      p.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${targetX - centerX}px, ${targetY - centerY}px) scale(0)`, opacity: 0 }
      ], {
        duration: 450,
        easing: 'cubic-bezier(0.1, 1, 0.2, 1)'
      }).onfinish = () => p.remove();
    }

    balloonEl.remove();

    // Increment Counter
    state.poppedBalloons++;
    els.poppedScore.textContent = state.poppedBalloons;

    // Reveal apology section after 10 pops
    if (state.poppedBalloons >= 10 && !state.hasRevealedApology) {
      state.hasRevealedApology = true;
      revealApologySection();
    }
  }

  // =========================================================================
  // Apology Section Reveal (triggered at 10 balloon pops)
  // =========================================================================
  function revealApologySection() {
    const section = document.getElementById('apologySection');
    if (!section) return;

    section.classList.remove('hidden');
    section.classList.add('apology-reveal');

    // Gentle fanfare
    playTone(523.25, 'sine', 0.3, 0, 0.12);
    playTone(659.25, 'sine', 0.3, 0.2, 0.12);
    playTone(783.99, 'sine', 0.4, 0.4, 0.1);

    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }

  function spawnInitialBalloons() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createFloatingBalloon();
      }, i * 700);
    }
    // Continuous gentle spawner
    setInterval(() => {
      if (document.querySelectorAll('.floating-balloon').length < 8) {
        createFloatingBalloon();
      }
    }, 3800);
  }

  // =========================================================================
  // Room Lights Dimming
  // =========================================================================
  function toggleLights(forceState) {
    state.isLightsOn = forceState !== undefined ? forceState : !state.isLightsOn;

    if (state.isLightsOn) {
      els.body.classList.remove('lights-off');
      els.body.classList.add('lights-on');
      els.lightIcon.textContent = '💡';
      els.lightLabel.textContent = 'Matikan Lampu';
    } else {
      els.body.classList.remove('lights-on');
      els.body.classList.add('lights-off');
      els.lightIcon.textContent = '☀️';
      els.lightLabel.textContent = 'Nyalakan Lampu';
    }
  }

  // =========================================================================
  // 3D Surprise Gift Box
  // =========================================================================
  function openGiftBox() {
    els.giftBoxStage.classList.add('opened');
    playTone(523.25, 'triangle', 0.2, 0, 0.2);
    playTone(659.25, 'triangle', 0.3, 0.15, 0.25);
    playTone(783.99, 'triangle', 0.4, 0.3, 0.3);

    shootConfetti(60, window.innerWidth / 2, window.innerHeight * 0.6);

    setTimeout(() => {
      els.giftModal.classList.remove('hidden');
    }, 600);
  }

  // =========================================================================
  // Wish Wall & Guestbook
  // =========================================================================
  function renderWishes() {
    els.wishesStream.innerHTML = '';
    state.wishes.forEach(wish => {
      const card = document.createElement('div');
      card.className = 'wish-bubble';
      card.innerHTML = `
        <div class="wish-bubble-header">
          <span class="wish-author">${escapeHtml(wish.sender)}</span>
          <span class="wish-time">${escapeHtml(wish.time)}</span>
        </div>
        <p class="wish-text">${escapeHtml(wish.text)}</p>
      `;
      els.wishesStream.appendChild(card);
    });
  }

  function addWish() {
    const sender = els.inputSender.value.trim();
    const text = els.inputWish.value.trim();

    if (!sender || !text) {
      alert('Silakan masukkan nama dan ucapan doamu terlebih dahulu! 😊');
      return;
    }

    state.wishes.unshift({
      sender: sender,
      text: text,
      time: 'Baru saja'
    });

    els.inputSender.value = '';
    els.inputWish.value = '';

    renderWishes();
    shootConfetti(35, window.innerWidth / 2, window.innerHeight * 0.8);
    playTone(600, 'sine', 0.25, 0, 0.15);

    try {
      localStorage.setItem('birthday_wishes', JSON.stringify(state.wishes));
    } catch (e) { }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // =========================================================================
  // Personalization & Settings
  // =========================================================================
  function loadUserData() {
    try {
      const saved = localStorage.getItem('birthday_profile');
      if (saved) {
        state.userData = Object.assign(state.userData, JSON.parse(saved));
      }
      const savedWishes = localStorage.getItem('birthday_wishes');
      if (savedWishes) {
        state.wishes = JSON.parse(savedWishes);
      }
    } catch (e) { }

    updateDisplayedData();
  }

  function updateDisplayedData() {
    els.displayName.textContent = state.userData.name;
    els.displayAge.textContent = state.userData.age;
    els.displaySubtitle.textContent = state.userData.greeting;
    els.displayPolaroidText.textContent = `"${state.userData.polaroid}"`;
    els.displaySignature.textContent = state.userData.signature;

    if (els.displayDate) {
      els.displayDate.textContent = state.userData.date || '9 Oktober';
    }
    if (els.displayVoucherCode) {
      const codeDate = (state.userData.date || '9 Oktober').toUpperCase().replace(/\s+/g, '-');
      els.displayVoucherCode.textContent = `KODE KADO: #${codeDate}-2026`;
    }

    // Fill form inputs
    els.customNameInput.value = state.userData.name;
    if (els.customDateInput) {
      els.customDateInput.value = state.userData.date || '9 Oktober';
    }
    els.customAgeInput.value = state.userData.age;
    els.customGreetingInput.value = state.userData.greeting;
    els.customPolaroidInput.value = state.userData.polaroid;
  }

  function saveCustomization() {
    state.userData.name = els.customNameInput.value.trim() || 'Sahabat Terbaik';
    state.userData.date = els.customDateInput ? (els.customDateInput.value.trim() || '9 Oktober') : '9 Oktober';
    state.userData.age = parseInt(els.customAgeInput.value, 10) || 21;
    state.userData.greeting = els.customGreetingInput.value.trim() || 'Semoga harimu dipenuhi kebahagiaan!';
    state.userData.polaroid = els.customPolaroidInput.value.trim() || 'Setiap detik usiamu adalah anugerah.';

    try {
      localStorage.setItem('birthday_profile', JSON.stringify(state.userData));
    } catch (e) { }

    updateDisplayedData();
    els.customModal.classList.add('hidden');
    shootConfetti(50);
  }

  function resetCustomization() {
    state.userData = {
      name: 'My Girl',
      date: '9 Oktober',
      age: 19,
      greeting: 'Semoga harimu dipenuhi kebahagiaan, tawa ceria, dan semua impian indahmu terwujud nyata! ✨',
      polaroid: 'Setiap detik usiamu adalah anugerah. Teruslah bersinar, tersenyum, dan tebarkan bahagia bagi sekitarmu!',
      signature: '~ Dari Cowomu yang Jago Main Jungle ~ '
    };
    try {
      localStorage.removeItem('birthday_profile');
    } catch (e) { }
    updateDisplayedData();
    els.customModal.classList.add('hidden');
  }

  // =========================================================================
  // Event Listeners Setup
  // =========================================================================
  function initEvents() {
    // Candle clicks
    els.mainCandle.addEventListener('click', () => {
      if (state.isCandleLit) blowOutCandle();
      else relightCandle();
    });

    els.btnBlowDirect.addEventListener('click', blowOutCandle);
    els.btnRelight.addEventListener('click', relightCandle);
    els.btnMicBlow.addEventListener('click', toggleMicListening);

    // Cake Slice
    els.btnCutCake.addEventListener('click', sliceCake);

    // Audio & Lights
    els.btnMusic.addEventListener('click', () => toggleMusic());
    els.btnLights.addEventListener('click', () => toggleLights());

    // Balloons Spawner
    els.btnSpawnBalloons.addEventListener('click', () => {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => createFloatingBalloon(), i * 200);
      }
    });

    // Gift Box
    els.giftBoxStage.addEventListener('click', openGiftBox);
    els.btnCloseGiftModal.addEventListener('click', () => {
      els.giftModal.classList.add('hidden');
      els.giftBoxStage.classList.remove('opened');
    });
    els.btnClaimGift.addEventListener('click', () => {
      els.giftModal.classList.add('hidden');
      els.giftBoxStage.classList.remove('opened');
      shootConfetti(80);
    });

    // Customization Modal
    els.btnCustomize.addEventListener('click', () => {
      els.customModal.classList.remove('hidden');
    });
    els.btnCloseCustomModal.addEventListener('click', () => {
      els.customModal.classList.add('hidden');
    });
    els.btnSaveCustom.addEventListener('click', saveCustomization);
    els.btnResetCustom.addEventListener('click', resetCustomization);

    // Photo Modal
    function openPhotoModal() {
      els.photoModal.classList.remove('hidden');
    }
    function closePhotoModal() {
      els.photoModal.classList.add('hidden');
    }
    if (els.btnOpenPhotoModal) {
      els.btnOpenPhotoModal.addEventListener('click', openPhotoModal);
    }
    if (els.polaroidFrame) {
      els.polaroidFrame.addEventListener('click', openPhotoModal);
      els.polaroidFrame.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPhotoModal(); }
      });
    }
    if (els.btnClosePhotoModal) {
      els.btnClosePhotoModal.addEventListener('click', closePhotoModal);
    }

    // Wish Wall
    els.btnSendWish.addEventListener('click', addWish);
    els.inputWish.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addWish();
    });

    // Outside modal clicks
    window.addEventListener('click', (e) => {
      if (e.target === els.giftModal) {
        els.giftModal.classList.add('hidden');
        els.giftBoxStage.classList.remove('opened');
      }
      if (e.target === els.customModal) {
        els.customModal.classList.add('hidden');
      }
      if (e.target === els.photoModal) {
        closePhotoModal();
      }
    });
  }

  // =========================================================================
  // App Initialization
  // =========================================================================
  function init() {
    loadUserData();
    renderWishes();
    initConfetti();
    initFireworks();
    spawnInitialBalloons();
    initEvents();

    // First visit initial celebration burst
    setTimeout(() => {
      shootConfetti(60);
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
