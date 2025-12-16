// 예시 타이머 수정본: 오류 캡처, 디버그 로그 사용, pointer 이벤트 사용
(function () {
  const display = document.getElementById('display');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');

  let elapsedSeconds = 0;
  let intervalId = null;
  let lastPointerTime = 0;

  function debug(...args) {
    if (window.debugLog) window.debugLog.log(args.join(' '));
    else console.log(...args);
  }

  function formatTime(sec) {
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function updateDisplay() {
    if (display) display.textContent = formatTime(elapsedSeconds);
  }

  function startTimer(e) {
    try {
      if (e && e.preventDefault) e.preventDefault();
      const now = Date.now();
      // 터치/포인터로 인한 중복 호출 방지 (200ms 버퍼)
      if (now - lastPointerTime < 200) {
        debug('Ignored duplicate pointer event');
        return;
      }
      lastPointerTime = now;

      debug('startTimer called');
      if (intervalId !== null) {
        debug('Timer already running — ignoring start');
        return;
      }
      intervalId = setInterval(() => {
        elapsedSeconds += 1;
        updateDisplay();
      }, 1000);

      //전체 화면이 번쩍거리도록 적용
      //BACKGROUND COLOR TO GOLD.
      document.body.style.backgroundColor = 'gold';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 100);

      //아이콘 색깔 변경 붉은색으로 변경
      if (window.electronAPI && window.electronAPI.setAppIconBadgeColor) {
        window.electronAPI.setAppIconBadgeColor('red');
      }


      if (startBtn) startBtn.disabled = true;
      if (pauseBtn) pauseBtn.disabled = false;
    } catch (err) {
      console.error('startTimer error', err);
      if (window.debugLog) window.debugLog.error(err.stack || err.message || String(err));
    }
  }

  function pauseTimer(e) {
    try {
      
      //타이머 종료. 배경색깔 화이트로 변경
      if (window.electronAPI && window.electronAPI.setAppIconBadgeColor) {
        window.electronAPI.setAppIconBadgeColor('white');
      }
      document.body.style.backgroundColor = 'white';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 100);
      
       

      
      

      if (e && e.preventDefault) e.preventDefault();
      debug('pauseTimer called');
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (startBtn) startBtn.disabled = false;
      if (pauseBtn) pauseBtn.disabled = true;
    } catch (err) {
      console.error('pauseTimer error', err);
      if (window.debugLog) window.debugLog.error(err.stack || err.message || String(err));
    }
  }

  function resetTimer(e) {
    try {
      if (e && e.preventDefault) e.preventDefault();
      debug('resetTimer called');
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      elapsedSeconds = 0;
      updateDisplay();
      if (startBtn) startBtn.disabled = false;
      if (pauseBtn) pauseBtn.disabled = true;
    } catch (err) {
      console.error('resetTimer error', err);
      if (window.debugLog) window.debugLog.error(err.stack || err.message || String(err));
    }
  }

  // 초기 상태
  updateDisplay();
  if (pauseBtn) pauseBtn.disabled = true;

  // 이벤트: pointer 이벤트를 사용하면 터치/마우스 모두 대응
  if (startBtn) startBtn.addEventListener('pointerdown', startTimer);
  if (pauseBtn) pauseBtn.addEventListener('pointerdown', pauseTimer);
  if (resetBtn) resetBtn.addEventListener('pointerdown', resetTimer);

  // 폼 내부 버튼이라면 submit을 막기 위해 안전장치
  [startBtn, pauseBtn, resetBtn].forEach(b => {
    if (!b) return;
    if (!b.getAttribute('type')) b.setAttribute('type', 'button');
  });

  debug('timer.js loaded');
})();