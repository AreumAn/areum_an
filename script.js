// DOM Elements
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

// Career History Data
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

// Audio Manager - Handles all sound-related functionality
const AudioManager = (() => {
  let audioContext;
  
  const initAudioContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  };
  
  const playSound = (type) => {
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
  };
  
  return {
    init: initAudioContext,
    playSound
  };
})();

// UI Manager - Handles UI elements display and updates
const UIManager = (() => {
  const showMenu = (type) => {
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
  };
  
  const hideMenu = () => {
    messageEl.classList.add('hidden');
    buttonContainerEl.classList.add('hidden');
  };
  
  const addCareerAchievement = (career) => {
    const statusIcon = career.isCurrent ? '🔥' : '✅ ';
    const li = document.createElement('li');
    li.className = 'achievement-item';
    li.innerHTML = `${statusIcon} ${career.company} - ${career.title}<br>⏰ ${career.duration}`;
    
    achievementListEl.insertBefore(li, achievementListEl.firstChild);
    
    AudioManager.playSound('achievement');

    achievementTextEl.textContent = `${career.location} ${career.company}`;
    speechBubbleEl.classList.remove('hidden');
    
    setTimeout(() => {
      speechBubbleEl.classList.add('hidden');
    }, 3000);
  };
  
  const showJumpControl = (show) => {
    if (show) {
      spaceToJumpEl.classList.remove('hidden');
    } else {
      spaceToJumpEl.classList.add('hidden');
    }
  };
  
  const clearAchievements = () => {
    achievementListEl.innerHTML = '';
  };
  
  return {
    showMenu,
    hideMenu,
    addCareerAchievement,
    showJumpControl,
    clearAchievements
  };
})();

// Character Controller - Manages character actions
const CharacterController = (() => {
  const jump = () => {
    if (!characterEl.classList.contains('jump')) {
      characterEl.classList.add('jump');
      AudioManager.playSound('jump');
      setTimeout(() => {
        characterEl.classList.remove('jump');
      }, 500);
    }
  };
  
  const getBottomPosition = () => {
    return parseInt(window.getComputedStyle(characterEl).getPropertyValue('bottom'));
  };
  
  return {
    jump,
    getBottomPosition
  };
})();

// Hurdle Manager - Creates and manages hurdles
const HurdleManager = (() => {
  let activeTimers = [];
  
  const clearAllTimers = () => {
    // Remove all active timers
    activeTimers.forEach(timer => clearTimeout(timer));
    activeTimers = [];
  };
  
  const clearAllHurdles = () => {
    // Remove all hurdles
    const hurdles = document.querySelectorAll('.hurdle');
    hurdles.forEach(hurdle => hurdle.remove());
  };
  
  const createHurdle = (currentHurdle, isPlaying, isAutoMode, onHurdlePassed, onGameOver) => {
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
        CharacterController.jump();
      }

      if (position >= 230 && position <= 270) {
        const characterBottom = CharacterController.getBottomPosition();

        if (characterBottom < 120 && !isAutoMode) {
          clearInterval(moveHurdle);
          onGameOver();
          return;
        }
        
        if (!hurdlePassed && position <= 250) {
          hurdlePassed = true;
          onHurdlePassed(currentHurdle);
        }
      }

      if (position < -50) {
        clearInterval(moveHurdle);
        hurdle.remove();
      }
    }, 10);
    
    activeTimers.push(moveHurdle);
  };
  
  return {
    createHurdle,
    clearAllTimers,
    clearAllHurdles,
    activeTimers
  };
})();

// Game Manager - Controls overall game state and logic
const GameManager = (() => {
  let isPlaying = false;
  let isAutoMode = false;
  let currentHurdle = 0;
  let lastMode = null;
  
  const startGame = (mode) => {
    if (isPlaying) return;
    
    // Clean up previous game state
    HurdleManager.clearAllTimers();
    HurdleManager.clearAllHurdles();
    
    lastMode = mode;
    isAutoMode = mode === 'watch';
    isPlaying = true;
    currentHurdle = 0;
    
    UIManager.clearAchievements();
    UIManager.hideMenu();
    AudioManager.init();
    
    if (!isAutoMode) {
      UIManager.showJumpControl(true);
    }
    
    const initialTimer = setTimeout(() => {
      HurdleManager.createHurdle(
        currentHurdle,
        isPlaying,
        isAutoMode,
        handleHurdlePassed,
        () => endGame('gameOver')
      );
    }, 1000);
    
    HurdleManager.activeTimers.push(initialTimer);
  };
  
  const handleHurdlePassed = (hurdleIndex) => {
    UIManager.addCareerAchievement(careerHistory[hurdleIndex]);
    currentHurdle++;
    
    if (currentHurdle >= careerHistory.length) {
      setTimeout(() => {
        endGame('success');
      }, 500);
    } else {
      const nextHurdleTimer = setTimeout(() => {
        HurdleManager.createHurdle(
          currentHurdle,
          isPlaying,
          isAutoMode,
          handleHurdlePassed,
          () => endGame('gameOver')
        );
      }, 2000);
      
      HurdleManager.activeTimers.push(nextHurdleTimer);
    }
  };
  
  const endGame = (type = 'gameOver') => {
    isPlaying = false;
    isAutoMode = false;
    
    HurdleManager.clearAllTimers();
    
    UIManager.showJumpControl(false);
    
    if (type === 'gameOver' && lastMode === 'play') {
      UIManager.showMenu('gameOver');
    } else if (type === 'success' && lastMode === 'play') {
      UIManager.showMenu('gameSuccess');
    } else if (type === 'success' && lastMode === 'watch') {
      UIManager.showMenu('watchComplete');
    }
  };
  
  const handleKeydown = (event) => {
    if (event.code === 'Space' && isPlaying && !isAutoMode) {
      CharacterController.jump();
      event.preventDefault();
    }
  };
  
  const isGamePlaying = () => isPlaying;
  
  return {
    startGame,
    endGame,
    handleKeydown,
    isGamePlaying
  };
})();

// Event Listeners
document.addEventListener('keydown', GameManager.handleKeydown);
playBtnEl.addEventListener('click', () => GameManager.startGame('play'));
watchBtnEl.addEventListener('click', () => GameManager.startGame('watch'));

// Initialize game menu
UIManager.showMenu();

