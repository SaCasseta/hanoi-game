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
let currentGameId = null;

startButton.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    alert('Por favor, digite seu nome!');
    return;
  }
  axios.post('/api/games/start', `playerName=${encodeURIComponent(playerName)}&phase=${currentPhase}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  .then(response => {
    currentGameId = response.data.id;
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
  })
  .catch(error => {
    console.error('Erro ao iniciar o jogo:', error);
    alert('Erro ao iniciar o jogo. Tente novamente.');
  });
});

exitButton.addEventListener('click', () => {
  if (currentGameId) {
    stopTimer();
    const playerName = playerNameInput.value.trim();
    axios.post(`/api/games/${currentGameId}/complete`, { 
      timeElapsed: totalTime, 
      phase: currentPhase,
      playerName: playerName 
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
      currentGameId = null;
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
      console.error('Erro ao sair do jogo:', error);
      alert('Erro ao salvar o progresso. Tente novamente.');
    });
  }
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
      axios.post(`/api/games/${currentGameId}/move`, {
        fromTower: disk.parentElement.id,
        toTower: targetTower.id,
        disk: parseInt(disk.textContent)
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => {
        checkWin();
      })
      .catch(error => {
        console.error('Erro ao salvar movimento:', error);
        alert('Erro ao salvar movimento. Tente novamente.');
      });
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
    axios.post(`/api/games/${currentGameId}/complete`, { timeElapsed: totalTime, phase: currentPhase }, {
      headers: { 'Content-Type': 'application/json' }
    })
    .then(() => {
      currentPhase++;
      diskCount++;
      phaseDisplay.textContent = `Fase: ${currentPhase}`;
      axios.post('/api/games/start', `playerName=${encodeURIComponent(playerNameInput.value)}&phase=${currentPhase}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(response => {
        currentGameId = response.data.id;
        setupPhase();
      })
      .catch(error => {
        console.error('Erro ao iniciar nova fase:', error);
        alert('Erro ao iniciar nova fase. Tente novamente.');
      });
    })
    .catch(error => {
      console.error('Erro ao completar fase:', error);
      alert('Erro ao salvar a fase. Tente novamente.');
    });
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
  axios.get('/api/games/leaderboard')
    .then(response => {
      const games = response.data;
      // Ordenar por phase (decrescente) e, em caso de empate, por timeElapsed (crescente)
      games.sort((a, b) => {
        if (b.phase === a.phase) {
          return a.timeElapsed - b.timeElapsed;
        }
        return b.phase - a.phase;
      });
      // Limpar tabela
      leaderboardBody.innerHTML = '';
      // Preencher tabela
      games.forEach((game, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${game.playerName}</td>
          <td>${game.phase}</td>
          <td>${formatTime(game.timeElapsed)}</td>
        `;
        leaderboardBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar o placar:', error);
      alert('Erro ao carregar o placar. Tente novamente.');
    });
}

resetButton.addEventListener('click', resetGame);