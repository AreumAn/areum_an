const characterEl = document.getElementById('character');
const gameContainerEl = document.querySelector('.game-container');
const playBtnEl = document.getElementById('playBtn');
const watchBtnEl = document.getElementById('watchBtn');
const achievementListEl = document.getElementById('achievement-list');
const speechBubbleEl = document.querySelector('.speech-bubble');
const achievementTextEl = document.querySelector('.achievement-text');
const messageEl = document.querySelector('.message');
const buttonContainerEl = document.querySelector('.button-container');
const spaceToJumpEl = document.querySelector('.space-to-jump');

let isPlaying = false;
let isAutoMode = false;
let currentHurdle = 0;
let lastMode = null;
let audioContext;
let activeTimers = [];

const careerHistory = [
  {
    "company": "OpenTide Korea",
    "title": "Web Developer",
    "duration": "Feb 2011 - Sep 2015",
    "location": "🇰🇷",
    "isCurrent": false
  },
  {
    "company": "Mozaic Creative",
    "title": "Web Developer",
    "duration": "Nov 2016 – Apr 2017",
    "location": "🇨🇦",
    "isCurrent": false
  },
  {
    "company": "Venngage",
    "title": "Software Engineer",
    "duration": "Nov 2018 - Dec 2019",
    "location": "🇨🇦",
    "isCurrent": false
  },
  {
    "company": "Dotfusion",
    "title": "Web Developer",
    "duration": "Aug 2020 - Nov 2020",
    "location": "🇨🇦",
    "isCurrent": false
  },
  {
    "company": "Browze",
    "title": "Growth Engineer",
    "duration": "Feb 2021 - Nov 2021",
    "location": "🇨🇦",
    "isCurrent": false
  },
  {
    "company": "Biiibo",
    "title": "Software Developer",
    "duration": "Jan 2022 - Present",
    "location": "🇨🇦",
    "isCurrent": true
  }
];

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playSound(type) {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'jump') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    } else if (type === 'achievement') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }
}

function jump() {
    if (!characterEl.classList.contains('jump')) {
        characterEl.classList.add('jump');
        setTimeout(() => {
            characterEl.classList.remove('jump');
        }, 500);
    }
}

function showMenu(type) {
    messageEl.classList.remove('hidden');
    buttonContainerEl.classList.remove('hidden');

    switch(type) {
        case 'gameOver':
            messageEl.textContent = 'Try Again!';
            playBtnEl.textContent = 'Play Again';
            watchBtnEl.textContent = 'Watch';
            break;
        case 'gameSuccess':
            messageEl.textContent = 'Congratulations🎉! You completed all challenges!';
            playBtnEl.textContent = 'Play Again';
            watchBtnEl.textContent = 'Watch';
            break;
        case 'watchComplete':
            messageEl.textContent = 'You have seen all achievements!';
            playBtnEl.textContent = 'Play';
            watchBtnEl.textContent = 'Watch Again';
            break;
        default:
            messageEl.classList.add('hidden');
            playBtnEl.textContent = 'Play';
            watchBtnEl.textContent = 'Watch';
    }
}

function hideMenu() {
    messageEl.classList.add('hidden');
    buttonContainerEl.classList.add('hidden');
}

function createHurdle() {
    if (currentHurdle >= careerHistory.length || !isPlaying) return;
    
    const hurdle = document.createElement('div');
    hurdle.className = 'hurdle';
    hurdle.style.left = '800px';
    gameContainerEl.appendChild(hurdle);

    let position = 800;
    let hurdlePassed = false;

    const moveHurdle = setInterval(() => {
        if (!isPlaying) {
            clearInterval(moveHurdle);
            hurdle.remove();
            return;
        }

        const speed = 2;
        position -= speed;
        hurdle.style.left = position + 'px';

        if (isAutoMode && position === 300) {
            jump();
        }

        if (position >= 230 && position <= 270) {
            const characterBottom = parseInt(window.getComputedStyle(characterEl).getPropertyValue('bottom'));

            if (characterBottom < 120 && !isAutoMode) {
                clearInterval(moveHurdle);
                endGame('gameOver');
                return;
            }
            
            if (!hurdlePassed && position <= 250) {
                hurdlePassed = true;
                addCareerAchievement(careerHistory[currentHurdle]);
                currentHurdle++;
                
                if (currentHurdle >= careerHistory.length) {
                    setTimeout(() => {
                        endGame('success');
                    }, 500);
                } else {
                    const nextHurdleTimer = setTimeout(createHurdle, 2000);
                    activeTimers.push(nextHurdleTimer);
                }
            }
        }

        if (position < -50) {
            clearInterval(moveHurdle);
            hurdle.remove();
        }
    }, 10);
    
    activeTimers.push(moveHurdle);
}

function addCareerAchievement(career) {
    const statusIcon = career.isCurrent ? '🔥' : '✅ ';
    const li = document.createElement('li');
    li.className = 'achievement-item';
    li.innerHTML = `${statusIcon} ${career.company} - ${career.title}<br>⏰ ${career.duration}`;
    
    achievementListEl.insertBefore(li, achievementListEl.firstChild);
    
    playSound('achievement');

    achievementTextEl.textContent = `${career.location} ${career.company}`;
    speechBubbleEl.classList.remove('hidden');
    
    setTimeout(() => {
        speechBubbleEl.classList.add('hidden');
    }, 3000);
}

function clearAllTimers() {
    // Remove all active timers
    activeTimers.forEach(timer => clearTimeout(timer));
    activeTimers = [];
}

function clearAllHurdles() {
    // Remove all hurdles
    const hurdles = document.querySelectorAll('.hurdle');
    hurdles.forEach(hurdle => hurdle.remove());
}

function startGame(mode) {
    if (isPlaying) return;
    
    // Clean up previous game state
    clearAllTimers();
    clearAllHurdles();
    
    lastMode = mode;
    isAutoMode = mode === 'watch';
    isPlaying = true;
    currentHurdle = 0;
    achievementListEl.innerHTML = '';
    
    hideMenu();
    initAudioContext();
    
    if (!isAutoMode) {
        spaceToJumpEl.classList.remove('hidden');
    }
    
    const initialTimer = setTimeout(createHurdle, 1000);
    activeTimers.push(initialTimer);
}

function endGame(type = 'gameOver') {
    isPlaying = false;
    isAutoMode = false;
    
    clearAllTimers();
    
    spaceToJumpEl.classList.add('hidden');
    
    if (type === 'gameOver' && lastMode === 'play') {
        showMenu('gameOver');
    } else if (type === 'success' && lastMode === 'play') {
        showMenu('gameSuccess');
    } else if (type === 'success' && lastMode === 'watch') {
        showMenu('watchComplete');
    }
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && isPlaying && !isAutoMode) {
        jump();
        event.preventDefault();
    }
});

playBtnEl.addEventListener('click', () => startGame('play'));
watchBtnEl.addEventListener('click', () => startGame('watch'));

showMenu();

