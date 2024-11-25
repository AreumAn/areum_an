let character = document.getElementById('character');
let gameContainer = document.querySelector('.game-container');
let playBtn = document.getElementById('playBtn');
let watchBtn = document.getElementById('watchBtn');
let achievementList = document.getElementById('achievement-list');
let isPlaying = false;
let isAutoMode = false;
let currentHurdle = 0;
let lastMode = null;

let audioContext;

const jobs = [
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

function createJumpSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function createAchievementSound() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

function jump() {
    const character = document.getElementById('character');
    if (!character.classList.contains('jump')) {
        character.classList.add('jump');
        setTimeout(() => {
            character.classList.remove('jump');
        }, 500);
    }
}

function showMenu(type) {
    const messageEl = document.querySelector('.message');
    const buttonContainer = document.querySelector('.button-container');
    const playBtn = document.getElementById('playBtn');
    const watchBtn = document.getElementById('watchBtn');

    messageEl.classList.remove('hidden');
    buttonContainer.classList.remove('hidden');

    switch(type) {
        case 'gameOver':
            messageEl.textContent = 'Try Again!';
            playBtn.textContent = 'Play Again';
            watchBtn.textContent = 'Watch';
            break;
        case 'gameSuccess':
            messageEl.textContent = 'Congratulations🎉! You completed all challenges!';
            playBtn.textContent = 'Play Again';
            watchBtn.textContent = 'Watch';
            break;
        case 'watchComplete':
            messageEl.textContent = 'You have seen all achievements!';
            playBtn.textContent = 'Play';
            watchBtn.textContent = 'Watch Again';
            break;
        default:
            messageEl.classList.add('hidden');
            playBtn.textContent = 'Play';
            watchBtn.textContent = 'Watch';
    }
}

function hideMenu() {
    document.querySelector('.message').classList.add('hidden');
    document.querySelector('.button-container').classList.add('hidden');
}

function createHurdle() {
    if (currentHurdle >= jobs.length || !isPlaying) return;
    
    const hurdle = document.createElement('div');
    hurdle.className = 'hurdle';
    hurdle.style.left = '800px';
    document.querySelector('.game-container').appendChild(hurdle);

    let position = 800;
    let hurdlePassed = false;

    const moveHurdle = setInterval(() => {
        if (!isPlaying) {
            clearInterval(moveHurdle);
            hurdle.remove();
            return;
        }

        const speed = isAutoMode ? 2 : 2;
        position -= speed;
        hurdle.style.left = position + 'px';

        if (isAutoMode && position === 300) {
            jump();
        }

        if (position >= 230 && position <= 270) {
            const characterBottom = parseInt(window.getComputedStyle(document.getElementById('character')).getPropertyValue('bottom'));

            if (characterBottom < 120 && !isAutoMode) {
                clearInterval(moveHurdle);
                endGame('gameOver');
                return;
            }
            
            if (!hurdlePassed && position <= 250) {
                hurdlePassed = true;
                addJob(jobs[currentHurdle]);
                currentHurdle++;
                
                if (currentHurdle >= jobs.length) {
                    setTimeout(() => {
                        endGame('success');
                    }, 500);
                } else {
                    setTimeout(createHurdle, 2000);
                }
            }
        }

        if (position < -50) {
            clearInterval(moveHurdle);
            hurdle.remove();
        }
    }, 10);
}

function addJob(job) {
    const isCurrent = job.isCurrent ? '🔥' : '✅ ';
    const li = document.createElement('li');
    li.className = 'achievement-item';
    li.innerHTML = `${isCurrent} ${job.company} - ${job.title}<br>⏰ ${job.duration}`;
    
    achievementList.insertBefore(li, achievementList.firstChild);
    
    createAchievementSound();

    const speechBubble = document.querySelector('.speech-bubble');
    const achievementText = document.querySelector('.achievement-text');
    achievementText.textContent = `${job.location} ${job.company}`;
    speechBubble.classList.remove('hidden');
    
    setTimeout(() => {
        speechBubble.classList.add('hidden');
    }, 3000);
}

function startGame(mode) {
    if (isPlaying) return;
    
    lastMode = mode;
    isAutoMode = mode === 'watch';
    isPlaying = true;
    currentHurdle = 0;
    achievementList.innerHTML = '';
    
    hideMenu();
    
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const hurdles = document.querySelectorAll('.hurdle');
    hurdles.forEach(hurdle => hurdle.remove());
    
    if (!isAutoMode) {
        document.querySelector('.space-to-jump').classList.remove('hidden');
    }
    
    setTimeout(createHurdle, 1000);
}

function endGame(type = 'gameOver') {
    isPlaying = false;
    isAutoMode = false;
    
    document.querySelector('.space-to-jump').classList.add('hidden');
    
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

playBtn.addEventListener('click', () => startGame('play'));
watchBtn.addEventListener('click', () => startGame('watch'));

showMenu();
