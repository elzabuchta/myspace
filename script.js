// Interactive Features for Donna Sheridan's MySpace Profile

// 1. Secret Diary Entries / Dad Mystery
const diarySecrets = {
  sam: `<strong>Diary Entry - July 17, 1979:</strong><br>
  "Sam took me to the old ruin on top of the hill today... He's an architect, so he drew plans for a dream house for us on Kalokairi. He has this irresistible Irish charm. But yesterday he mentioned a fiancée back home in London... How could he break my heart like that?? 💔"`,

  bill: `<strong>Diary Entry - July 28, 1979:</strong><br>
  "Bill Anderson saved me today with his sailboat! He was so spontaneous and full of adventure. We sailed around the bay, drank Greek wine, and laughed under the Aegean stars. He handed me the helm and said I was born to live on this island. ⛵✨"`,

  harry: `<strong>Diary Entry - August 8, 1979:</strong><br>
  "Harry 'Spontaneous' Bright turned up with his guitar! He's such a sweet London gentleman with his headbanging rock spirit. He bought me a headful of flowers and played guitar for me all evening by the water. Our last summer together... 🎸🇬🇷"`
};

function revealDadSecret(dadKey) {
  const outputDiv = document.getElementById('diary-modal-content');
  if (diarySecrets[dadKey]) {
    outputDiv.innerHTML = diarySecrets[dadKey];
  }
}

// 2. Simulated Web Audio API Synth / Music Player Tracks
const tracks = [
  { title: "Track 1: Dancing Queen (Dynamos Acoustic Mix)", freq: 440 },
  { title: "Track 2: Super Trouper - Donna & The Dynamos", freq: 523.25 },
  { title: "Track 3: Mamma Mia - Donna Sheridan", freq: 659.25 },
  { title: "Track 4: Money, Money, Money (Villa Donna Blues)", freq: 392 }
];

let currentTrackIndex = 0;
let isPlaying = false;
let audioCtx = null;
let oscillator = null;
let progressInterval = null;
let progressPercent = 0;

function updateTrackUI() {
  const titleElem = document.getElementById('current-song-title');
  if (titleElem) {
    titleElem.innerText = tracks[currentTrackIndex].title;
  }

  // Highlight active playlist item
  const playlistItems = document.querySelectorAll('.playlist li');
  playlistItems.forEach((item, index) => {
    if (index === currentTrackIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  resetProgressBar();
}

function selectTrack(index) {
  currentTrackIndex = index;
  updateTrackUI();
  if (isPlaying) {
    stopSynth();
    playSynth();
  }
}

function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  updateTrackUI();
  if (isPlaying) {
    stopSynth();
    playSynth();
  }
}

function nextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  updateTrackUI();
  if (isPlaying) {
    stopSynth();
    playSynth();
  }
}

function togglePlay() {
  const playBtn = document.getElementById('play-btn');
  if (!isPlaying) {
    isPlaying = true;
    if (playBtn) playBtn.innerText = "⏸️ Pause";
    playSynth();
    startProgressBar();
  } else {
    isPlaying = false;
    if (playBtn) playBtn.innerText = "▶️ Play Synth Track";
    stopSynth();
    stopProgressBar();
  }
}

function playSynth() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Play a friendly cheerful melodic synth note simulating 70s ABBA tune
    oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(tracks[currentTrackIndex].freq, audioCtx.currentTime);

    // Slight vibrato for disco flare
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 5; // 5Hz vibrato
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 8;
    lfo.connect(oscillator.frequency);
    lfo.start();

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
  } catch (e) {
    console.log('Web Audio API initialized on user gesture.');
  }
}

function stopSynth() {
  if (oscillator) {
    try {
      oscillator.stop();
      oscillator.disconnect();
    } catch(e) {}
    oscillator = null;
  }
}

function resetProgressBar() {
  progressPercent = 0;
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) progressBar.style.width = '0%';
}

function startProgressBar() {
  stopProgressBar();
  progressInterval = setInterval(() => {
    progressPercent += 2;
    if (progressPercent > 100) {
      nextTrack();
    } else {
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) progressBar.style.width = progressPercent + '%';
    }
  }, 300);
}

function stopProgressBar() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

// 3. Greek House Builder Mini-Game Logic
let currentSelectedBlock = '🏛️';

function selectBlock(symbol, btnElem) {
  currentSelectedBlock = symbol;

  // Highlight active button
  const buttons = document.querySelectorAll('.builder-controls .block-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (btnElem) {
    btnElem.classList.add('active');
  }

  const statusElem = document.getElementById('builder-status');
  if (statusElem) {
    if (symbol === '') {
      statusElem.innerText = "Aktivní nástroj: 🧹 Guma (Vymazat prvek)";
    } else {
      statusElem.innerText = "Aktivní blok: " + symbol;
    }
  }
}

function initBuilderGrid() {
  const gridContainer = document.getElementById('builder-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = '';

  // 8 columns x 5 rows = 40 cells
  // Default starter Greek dome house preset map
  const defaultPreset = {
    // Row 2 (index 16-23)
    18: '🔵', 19: '🛖', 20: '🔵',
    // Row 3 (index 24-31)
    26: '🧱', 27: '🪟', 28: '🧱', 29: '🌴',
    // Row 4 (index 32-39)
    34: '🏛️', 35: '🚪', 36: '🏛️', 37: '🏺'
  };

  for (let i = 0; i < 40; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.dataset.index = i;

    if (defaultPreset[i]) {
      cell.innerText = defaultPreset[i];
    }

    cell.addEventListener('click', function() {
      this.innerText = currentSelectedBlock;
    });

    gridContainer.appendChild(cell);
  }
}

function resetBuilderGrid() {
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => {
    cell.innerText = '';
  });
}

// Initialize Builder Grid on DOM loaded
document.addEventListener('DOMContentLoaded', function() {
  initBuilderGrid();
});

// 4. Guestbook Comments Posting
let commentCounter = 4;

function postComment() {
  const nameInput = document.getElementById('guest-name');
  const avatarSelect = document.getElementById('guest-avatar-select');
  const msgInput = document.getElementById('guest-msg');
  const commentsList = document.getElementById('comments-list');
  const countElem = document.getElementById('comment-count');

  const name = nameInput.value.trim() || "Anonymous Islander";
  const avatar = avatarSelect.value;
  const msg = msgInput.value.trim();

  if (!msg) {
    alert("Please write a message before posting to Donna's guestbook!");
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
                  ' at ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  commentCounter++;

  const commentHtml = `
    <div class="comment-item">
      <div class="comment-author">
        <div class="author-pic">${avatar}</div>
        <a href="#">${escapeHtml(name)}</a>
        <span class="comment-date">${dateStr}</span>
      </div>
      <div class="comment-text">
        ${escapeHtml(msg)}
      </div>
    </div>
  `;

  commentsList.insertAdjacentHTML('afterbegin', commentHtml);
  if (countElem) countElem.innerText = commentCounter;

  // Clear input
  msgInput.value = '';
  nameInput.value = '';

  alert("🎉 Your comment was posted to Donna's MySpace page!");
}

function focusCommentBox() {
  const msgInput = document.getElementById('guest-msg');
  if (msgInput) msgInput.focus();
}

function triggerGreekOuzoAlert() {
  alert("🏛️ YASAS! Villa Donna Booking Request received!\n\nDonna says: 'I hope you don't mind cold showers and goats on the balcony, but the sunset is worth every penny!' 🌅🍷");
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}
