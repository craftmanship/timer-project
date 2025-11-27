// 간단한 타이머 구현: 초 단위로 증가
(() => {
  const display = document.getElementById('display');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');

  let elapsedSeconds = 0;
  let intervalId = null;

  function formatTime(sec) {
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function updateDisplay() {
    display.textContent = formatTime(elapsedSeconds);
  }

  function startTimer() {
    console.log('startTimer called'); // 호출 확인용
    if (intervalId !== null) {
      console.log('Timer already running. Ignoring start.');
      return; // 이미 실행중이면 무시
    }
    // 1초마다 증가
    intervalId = setInterval(() => {
      elapsedSeconds += 1;
      updateDisplay();
    }, 1000);

    // UI 상태 변경(선택)
    startBtn.disabled = true;
    pauseBtn.disabled = false;
  }

  function pauseTimer() {
    console.log('pauseTimer called');
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function resetTimer() {
    console.log('resetTimer called');
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    elapsedSeconds = 0;
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  // 초기 상태
  updateDisplay();
  pauseBtn.disabled = true;

  // 핸들러 연결
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);
})();