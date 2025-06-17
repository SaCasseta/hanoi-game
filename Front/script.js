const towers = document.querySelectorAll('.tower');
const info = document.getElementById('info');
const phaseDisplay = document.getElementById('phase');
const timerDisplay = document.getElementById('timer');
const resetButton = document.getElementById('reset');
const startButton = document.getElementById('start');
const exitButton = document.getElementById('exit');
const playerNameInput = document.getElementById('playerName');
const gameContainer = document.getElementById('game-container');
const playerForm = document.getElementById('player-form');
const leaderboard = document.getElementById('leaderboard');
const leaderboardBody = document.getElementById('leaderboard-body');
let moveCount = 0;
let draggedDisk = null;
let currentPhase = 1;
let diskCount = 3;
let timerInterval = null;
let timeElapsed = 0;
let totalTime = 0;
let isTimerStarted = false;

startButton.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    alert('Por favor, digite seu nome!');
    return;
  }
  playerForm.style.display = 'none';
  leaderboard.style.display = 'none';
  gameContainer.style.display = 'flex';
  phaseDisplay.style.display = 'block';
  timerDisplay.style.display = 'block';
  info.style.display = 'block';
  resetButton.style.display = 'block';
  exitButton.style.display = 'block';
  playerNameInput.disabled = true;
  startButton.disabled = true;
  setupPhase();
});

exitButton.addEventListener('click', () => {
  stopTimer();
  const playerName = playerNameInput.value.trim();
  const timestamp = new Date(totalTime * 1000).toISOString();
  axios.post('http://localhost:8080/usuario', { 
    nome: playerName, 
    fase: currentPhase,
    tempo: timestamp 
  }, {
    headers: { 'Content-Type': 'application/json' }
  })
  .then(() => {
    currentPhase = 1;
    diskCount = 3;
    totalTime = 0;
    moveCount = 0;
    timeElapsed = 0;
    isTimerStarted = false;
    phaseDisplay.textContent = `Fase: ${currentPhase}`;
    gameContainer.style.display = 'none';
    phaseDisplay.style.display = 'none';
    timerDisplay.style.display = 'none';
    info.style.display = 'none';
    resetButton.style.display = 'none';
    exitButton.style.display = 'none';
    playerForm.style.display = 'block';
    leaderboard.style.display = 'block';
    playerNameInput.disabled = false;
    startButton.disabled = false;
    playerNameInput.value = '';
    loadLeaderboard();
  })
  .catch(error => {
    console.error('Erro ao salvar o progresso:', error.response || error);
    alert(`Erro ao salvar o progresso: ${error.response?.status ? `HTTP ${error.response.status} - ${error.response.data?.message || error.message}` : error.message}`);
  });
});

towers.forEach(tower => {
  tower.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('disk')) {
      const disks = Array.from(tower.children).filter(child => child.classList.contains('disk'));
      const topDisk = disks[disks.length - 1];
      if (e.target !== topDisk) {
        e.preventDefault();
        return;
      }
      draggedDisk = e.target;
      e.dataTransfer.setData('text/plain', draggedDisk.id);
      if (!isTimerStarted) {
        startTimer();
        isTimerStarted = true;
      }
    }
  });

  tower.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  tower.addEventListener('drop', (e) => {
    e.preventDefault();
    const diskId = e.dataTransfer.getData('text/plain');
    const disk = document.getElementById(diskId);
    const targetTower = e.currentTarget;

    if (isValidMove(disk, targetTower)) {
      targetTower.appendChild(disk);
      moveCount++;
      info.textContent = `Movimentos: ${moveCount}`;
      checkWin();
    }
  });
});

function isValidMove(disk, targetTower) {
  const disks = Array.from(targetTower.children).filter(child => child.classList.contains('disk'));
  const topDisk = disks[disks.length - 1];
  if (!topDisk) return true;
  const diskSize = parseInt(disk.textContent);
  const topDiskSize = parseInt(topDisk.textContent);
  return diskSize < topDiskSize;
}

function checkWin() {
  const tower3 = document.getElementById('tower3');
  const diskCountInTower3 = Array.from(tower3.children).filter(child => child.classList.contains('disk')).length;
  if (diskCountInTower3 === diskCount) {
    stopTimer();
    totalTime += timeElapsed;
    info.textContent = `Parabéns! Fase ${currentPhase} concluída em ${moveCount} movimentos e ${formatTime(timeElapsed)}!`;
    currentPhase++;
    diskCount++;
    phaseDisplay.textContent = `Fase: ${currentPhase}`;
    setupPhase();
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeElapsed++;
    timerDisplay.textContent = `Tempo: ${formatTime(timeElapsed)}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function setupPhase() {
  const tower1 = document.getElementById('tower1');
  const tower2 = document.getElementById('tower2');
  const tower3 = document.getElementById('tower3');
  tower1.innerHTML = '<div class="pole"></div>';
  tower2.innerHTML = '<div class="pole"></div>';
  tower3.innerHTML = '<div class="pole"></div>';
  for (let i = diskCount; i >= 1; i--) {
    const disk = document.createElement('div');
    disk.id = `disk${i}`;
    disk.className = 'disk';
    disk.draggable = true;
    disk.textContent = i;
    disk.style.width = `${60 + (i - 1) * 40}px`;
    tower1.appendChild(disk);
  }
  moveCount = 0;
  info.textContent = `Movimentos: ${moveCount}`;
  timeElapsed = 0;
  timerDisplay.textContent = `Tempo: 00:00`;
  isTimerStarted = false;
  stopTimer();
}

function resetGame() {
  setupPhase();
}

function loadLeaderboard() {
  axios.get('http://localhost:8080/usuario')
    .then(response => {
      const users = response.data;
      users.sort((a, b) => {
        if (b.fase === a.fase) {
          return new Date(a.tempo).getTime() - new Date(b.tempo).getTime();
        }
        return b.fase - a.fase;
      });
      leaderboardBody.innerHTML = '';
      users.forEach((user, index) => {
        const row = document.createElement('tr');
        const seconds = Math.floor(new Date(user.tempo).getTime() / 1000);
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${user.nome}</td>
          <td>${user.fase}</td>
          <td>${formatTime(seconds)}</td>
        `;
        leaderboardBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar o placar:', error.response || error);
      alert(`Erro ao carregar o placar: ${error.response?.status ? `HTTP ${error.response.status} - ${error.response.data?.message || error.message}` : error.message}`);
    });
}

resetButton.addEventListener('click', resetGame);