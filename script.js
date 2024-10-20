const timerButton = document.getElementById('timerButton');
const timerText = document.getElementById('timerText');
const cycleInfo = document.getElementById('cycleInfo');
const workTimeInput = document.getElementById('workTime');
const restTimeInput = document.getElementById('restTime');
const cycleCountInput = document.getElementById('cycleCount');
const workColorInput = document.getElementById('workColor');
const restColorInput = document.getElementById('restColor');
const endColorInput = document.getElementById('endColor'); // Новый конечный цвет
const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

let workTime = parseInt(workTimeInput.value);
let restTime = parseInt(restTimeInput.value);
let cycleCount = parseInt(cycleCountInput.value);
let currentCycle = 1;
let isWorkPhase = true;
let isRunning = false;
let isPaused = false;
let timerInterval;
let longPressTimer;

let audio = new Audio('alarm.mp3'); // Звуковой файл alarm.mp3
audio.loop = true; // Зацикливаем звук

// Функция запуска таймера
function startTimer(duration) {
    let timeLeft = duration;
    setCircleProgress(1);
    
    timerInterval = setInterval(() => {
        if (!isPaused) {
            timeLeft--;

            updateTimerText(timeLeft);
            setCircleProgress(timeLeft / duration);

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                audio.play(); // Проигрываем звук (зацикленный)
                timerText.textContent = "Нажмите, чтобы продолжить";
                isRunning = false; // Останавливаем автоматическое продолжение
            }
        }
    }, 1000);
}

// Функция обновления текста на кнопке
function updateTimerText(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Функция установки прогресса круга
function setCircleProgress(percent) {
    const offset = circumference - percent * circumference;
    circle.style.strokeDashoffset = offset;

    // Градиент от начального до конечного цвета
    const startColor = isWorkPhase ? workColorInput.value : restColorInput.value;
    const endColor = endColorInput.value; // Используем пользовательский цвет

    const currentColor = interpolateColor(startColor, endColor, 1 - percent);
    circle.style.stroke = currentColor;
}

// Функция для интерполяции цвета (градиента)
function interpolateColor(startColor, endColor, factor) {
    const result = startColor.slice(1).match(/.{2}/g)
        .map((hex, i) => parseInt(hex, 16) + factor * (parseInt(endColor.slice(1).match(/.{2}/g)[i], 16) - parseInt(hex, 16)))
        .map(Math.round)
        .map(val => val.toString(16).padStart(2, '0'))
        .join('');
    return `#${result}`;
}

// Функция для перехода на следующий этап
function nextPhase() {
    audio.pause(); // Останавливаем звук
    audio.currentTime = 0; // Сбрасываем воспроизведение звука

    if (isWorkPhase) {
        cycleInfo.textContent = `Цикл ${currentCycle}/${cycleCount} - Отдых`;
        startTimer(restTime);
    } else {
        currentCycle++;
        if (currentCycle <= cycleCount) {
            cycleInfo.textContent = `Цикл ${currentCycle}/${cycleCount} - Работа`;
            startTimer(workTime);
        } else {
            resetTimer();
        }
    }

    isWorkPhase = !isWorkPhase;
}

// Функция для сброса таймера
function resetTimer() {
    clearInterval(timerInterval);
    audio.pause(); // Останавливаем звук при сбросе
    audio.currentTime = 0;
    currentCycle = 1;
    isWorkPhase = true;
    isRunning = false;
    isPaused = false;
    timerText.textContent = 'Начать';
    cycleInfo.textContent = `Цикл 1/${cycleCount} - Работа`;
    setCircleProgress(1);
}

// Обработка нажатия на кнопку таймера
timerButton.addEventListener('click', () => {
    if (!isRunning) {
        workTime = parseInt(workTimeInput.value); restTime = parseInt(restTimeInput.value); cycleCount = parseInt(cycleCountInput.value);
        if (timerText.textContent === "Нажмите, чтобы продолжить") {
            nextPhase(); // Если этап завершен, продолжаем следующий
        } else {
            startTimer(workTime); // Запускаем первый этап
            timerText.textContent = `${workTime}:00`;
            cycleInfo.textContent = `Цикл ${currentCycle}/${cycleCount} - Работа`;
        }
    
        isRunning = true;
    } else {
        // Если таймер уже идет, ставим на паузу или возобновляем
        isPaused = !isPaused;
        timerText.textContent = isPaused ? "Пауза" : `Цикл ${currentCycle}/${cycleCount} - ${isWorkPhase ? "Работа" : "Отдых"}`;
    }
});
// Обработка долгого нажатия для сброса таймера timerButton.addEventListener('mousedown', () => { longPressTimer = setTimeout(resetTimer, 5000); // Запуск сброса через 5 сек удержания });

timerButton.addEventListener('mouseup', () => { clearTimeout(longPressTimer); // Прекращаем сброс, если кнопка отпущена раньше 
});