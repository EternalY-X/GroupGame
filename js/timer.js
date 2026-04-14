// timer.js — Pomodoro timer

let timeLeft = 25 * 60;
let timer;
let timerDone = new Audio("TimerEndsAudio"); //Needs to be added


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
    }
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
    timeLeft = 25 * 60;
    displayTime();
}

displayTime();