// timer.js — Pomodoro timer (pomofocus-style)

var focusTime = 25 * 60;
var shortBreak = 5 * 60;
var longBreak = 15 * 60;
var timeLeft = focusTime;
var currentMode = 'focus';  // 'focus', 'short', 'long'
var timer = null;
var timerDone = new Audio("assets/audio/end-timer.mp3");
var breakCount = 0;

function displayTime() {
    var mins = Math.floor(timeLeft / 60);
    var secs = timeLeft % 60;
    document.getElementById("timer-display").textContent =
        String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        var modeLabel = currentMode === 'focus' ? 'Focus' : currentMode === 'short' ? 'Short Break' : 'Long Break';
    document.title = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0') + ' | ' + modeLabel + " | Ambient Studies";
}

function countdown() {
    if (timeLeft > 0) {
        timeLeft--;
        displayTime();
        // Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

function sendTimerNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body, icon: 'assets/images/icon.png' });
    }
}
  } else {
        pauseTimer();
        timerDone.play().catch(function(){});
        if (currentMode === 'focus') {
            sendTimerNotification('Time for a break!', 'Your focus session has ended.');
        } else {
            sendTimerNotification('Back to work!', 'Break is over — time to focus.');
        }
        // Auto-advance to next mode
        if (currentMode === 'focus') {
            breakCount++;
            if (breakCount >= 4) {
                switchTimerMode('long');
                breakCount = 0;
            } else {
                switchTimerMode('short');
            }
        } else {
            switchTimerMode('focus');
        }
    }
}

function toggleTimer() {
    var btn = document.getElementById('btn-timer-main');
    var skipBtn = document.getElementById('btn-timer-skip');

    if (timer) {
        // Pause
        pauseTimer();
        btn.textContent = 'START';
        skipBtn.style.display = 'none';
    } else {
        // Start
        timer = setInterval(countdown, 1000);
        btn.textContent = 'PAUSE';
        skipBtn.style.display = '';
    }
}

function pauseTimer() {
    clearInterval(timer);
    timer = null;
}

function skipTimer() {
    pauseTimer();
    if (currentMode === 'focus') {
        breakCount++;
        if (breakCount >= 4) {
            switchTimerMode('long');
            breakCount = 0;
        } else {
            switchTimerMode('short');
        }
    } else {
        switchTimerMode('focus');
    }
}

function switchTimerMode(mode) {
    pauseTimer();
    currentMode = mode;

    if (mode === 'focus') timeLeft = focusTime;
    else if (mode === 'short') timeLeft = shortBreak;
    else if (mode === 'long') timeLeft = longBreak;

    displayTime();
    document.title = 'Ambient Studies';

    // Update tabs
    document.querySelectorAll('.timer-tab').forEach(function (tab) {
        tab.classList.remove('active');
    });
    var tabMap = { focus: 0, short: 1, long: 2 };
    document.querySelectorAll('.timer-tab')[tabMap[mode]].classList.add('active');

    // Reset button state
    document.getElementById('btn-timer-main').textContent = 'START';
    document.getElementById('btn-timer-skip').style.display = 'none';
}

displayTime();
window.addEventListener('beforeunload', function (e) {
    if (timer) {
        e.preventDefault();
        e.returnValue = '';
    }
});