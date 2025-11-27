// HTML에서 필요한 요소들을 가져옵니다.
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');

// 타이머 관련 변수들 초기화
let startTime;
let updatedTime;
let difference;
let timerInterval; // 타이머의 setInterval ID를 저장
let running = false; // 타이머 실행 상태

// 시작 버튼 클릭 이벤트
startBtn.addEventListener('click', () => {
    // 여기에 '시작' 버튼을 눌렀을 때 타이머가 시작되는 코드를 작성하세요.
    // Copilot에게 물어보세요: "// 1초마다 시간을 업데이트하는 타이머 시작"
    console.log("시작 버튼 클릭됨");
});

// 정지 버튼 클릭 이벤트
stopBtn.addEventListener('click', () => {
    // 여기에 '정지' 버튼을 눌렀을 때 타이머가 멈추는 코드를 작성하세요.
    // Copilot에게 물어보세요: "// 타이머를 일시 정지"
    console.log("정지 버튼 클릭됨");
});

// 초기화 버튼 클릭 이벤트
resetBtn.addEventListener('click', () => {
    // 여기에 '초기화' 버튼을 눌렀을 때 타이머가 0으로 리셋되는 코드를 작성하세요.
    // Copilot에게 물어보세요: "// 타이머를 0으로 리셋"
    console.log("초기화 버튼 클릭됨");
});