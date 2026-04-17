// timer.js — Pomodoro timer

var focusTime = 0.25 * 60;
var shortBreak = 0.05 * 60;
var longBreak = 0.15 * 60;
var timeLeft = focusTime;
var timer;
var timerDone = new Audio("TimerEndsAudio"); //Needs to be added
var isBreak = false;
var breakCount = 0;


// display time in MM/SS
function displayTime()
{
    var mins = Math.floor(timeLeft/60);
    var secs = timeLeft%60;

    document.getElementById("timer-display").textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function countdown()
{
    if (timeLeft > 0)
    {
        timeLeft--;
        displayTime();
    }

    else
    {
        clearInterval(timer);
        timer = null;
        timerDone.play();

        if(isBreak == false)
        {
            startBreak();
        }

        else
        {
            startFocus();
        }
    }
}

function startBreak()
{
    isBreak = true;

    if(breakCount < 3)
    {
        timeLeft = shortBreak;
        breakCount++;
        document.getElementById("timer-label").textContent = "Short Break";
    }
    else
    {
        timeLeft = longBreak;
        breakCount = 0;
        document.getElementById("timer-label").textContent = "Long Break";
    }
    displayTime();
    startTimer();
}

function startFocus()
{
    isBreak = false;
    timeLeft = focusTime;
    document.getElementById("timer-label").textContent = "Focus Session";

    displayTime();
    startTimer();
}

function startTimer()
{
    if(timer) return;

    timer = setInterval(countdown, 1000)
}

function pauseTimer()
{
    clearInterval(timer);
    timer = null;
}

function resetTimer()
{
    clearInterval(timer);
    timer = null;
    timeLeft = focusTime;
    isBreak = false;
    breakCount = 0;
    document.getElementById("timer-label").textContent = "Focus Session";

    displayTime();
}

displayTime();
