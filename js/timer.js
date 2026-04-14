// timer.js — Pomodoro timer

let timeLeft = 0.5 * 60;
let timer;


// display time in MM/SS
function displayTime()
{
    let mins = Math.floor(timeLeft/60);
    let secs = timeLeft%60;

    document.getElementById("timer-display").textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function startTimer() 
{
  if (timer) return;

  timer = setInterval(function()
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
        alert("Time's up!");
        }

    }, 1000);
}