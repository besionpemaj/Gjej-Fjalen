const GRID_ROWS = 6;

let wordLength = 5; // Default word length
let currentRow = 0;
let currentCol = 0;
let gameOver = false;
let targetWord = '';
let currentGuess = '';

// Get word list based on length
function getWordList(length) {
    switch(length) {
        case 4: return WORDS_4;
        case 5: return WORDS_5;
        case 6: return WORDS_6;
        default: return WORDS_5;
    }
}

// Initialize modal
function initModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const startButton = document.getElementById('start-button');
    const lengthOptions = document.querySelectorAll('.length-option');
    
    // Set default selection
    lengthOptions.forEach(option => {
        option.addEventListener('click', () => {
            lengthOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            wordLength = parseInt(option.dataset.length);
        });
    });
    
    // Start button
    startButton.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
        initGame();
    });
    
    // Close button
    modalClose.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
        initGame();
    });
    
    // Show modal on page load
    modalOverlay.style.display = 'flex';
}

// Initialize game
function initGame() {
    const words = getWordList(wordLength);
    targetWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
    
    // Update grid CSS
    const grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;
    grid.innerHTML = '';
    
    for (let i = 0; i < GRID_ROWS; i++) {
        for (let j = 0; j < wordLength; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${i}-${j}`;
            grid.appendChild(tile);
        }
    }
    
    // Create keyboard
    createKeyboard();
    
    // Reset game state
    currentRow = 0;
    currentCol = 0;
    gameOver = false;
    currentGuess = '';
    
    // Hide replay button
    hideReplayButton();
    
    // Remove old event listeners and add new one
    document.removeEventListener('keydown', handleKeyPress);
    document.addEventListener('keydown', handleKeyPress);
}

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    
    // First row: A B C Ç D E Ë F G H
    const row1 = document.createElement('div');
    row1.className = 'keyboard-row';
    const row1Letters = ['A', 'B', 'C', 'Ç', 'D', 'E', 'Ë', 'F', 'G', 'H'];
    row1Letters.forEach(letter => {
        const key = createKey(letter);
        row1.appendChild(key);
    });
    keyboard.appendChild(row1);
    
    // Second row: I J K L M N O P Q R
    const row2 = document.createElement('div');
    row2.className = 'keyboard-row';
    const row2Letters = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
    row2Letters.forEach(letter => {
        const key = createKey(letter);
        row2.appendChild(key);
    });
    keyboard.appendChild(row2);
    
    // Third row: S T U V X Y Z + Enter + Backspace
    const row3 = document.createElement('div');
    row3.className = 'keyboard-row';
    const row3Letters = ['S', 'T', 'U', 'V', 'X', 'Y', 'Z'];
    row3Letters.forEach(letter => {
        const key = createKey(letter);
        row3.appendChild(key);
    });
    
    const enterKey = document.createElement('button');
    enterKey.className = 'key wide';
    enterKey.textContent = 'ENTER';
    enterKey.type = 'button';
    enterKey.onclick = (e) => {
        e.preventDefault();
        handleEnter();
        enterKey.blur();
    };
    row3.appendChild(enterKey);
    
    const backspaceKey = document.createElement('button');
    backspaceKey.className = 'key wide';
    backspaceKey.textContent = '⌫';
    backspaceKey.type = 'button';
    backspaceKey.onclick = (e) => {
        e.preventDefault();
        handleBackspace();
        backspaceKey.blur();
    };
    row3.appendChild(backspaceKey);
    
    keyboard.appendChild(row3);
}

function createKey(letter) {
    const key = document.createElement('button');
    key.className = 'key';
    key.textContent = letter;
    key.type = 'button';
    key.onclick = (e) => {
        e.preventDefault();
        handleLetterInput(letter);
        key.blur();
    };
    return key;
}

function handleKeyPress(event) {
    if (gameOver) return;
    
    const key = event.key.toUpperCase();
    
    if (key === 'ENTER') {
        event.preventDefault();
        handleEnter();
    } else if (key === 'BACKSPACE') {
        event.preventDefault();
        handleBackspace();
    } else if (ALBANIAN_LETTERS.includes(key)) {
        handleLetterInput(key);
    }
}

function handleLetterInput(letter) {
    if (gameOver) return;
    if (currentCol >= wordLength) return;
    
    const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
    tile.textContent = letter;
    tile.classList.add('filled');
    
    currentGuess += letter;
    currentCol++;
}

function handleBackspace() {
    if (gameOver) return;
    if (currentCol <= 0) return;
    
    currentCol--;
    currentGuess = currentGuess.slice(0, -1);
    
    const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
    tile.textContent = '';
    tile.classList.remove('filled');
}

function handleEnter() {
    if (gameOver) return;
    if (currentCol !== wordLength) {
        showMessage(`Shkruani ${wordLength} shkronja!`, 'error');
        return;
    }
    
    // Check the guess (no word validation - allow any word)
    const result = checkGuess(currentGuess, targetWord);
    updateTiles(result);
    updateKeyboard(result);
    
    // Check if won
    if (currentGuess === targetWord) {
        gameOver = true;
        setTimeout(() => {
            showMessage('Urime! E keni gjetur fjalën!', 'success');
            showReplayButton();
        }, wordLength * 200 + 500);
        return;
    }
    
    // Move to next row
    currentRow++;
    currentCol = 0;
    currentGuess = '';
    
    // Check if game over (lost)
    if (currentRow >= GRID_ROWS) {
        gameOver = true;
        setTimeout(() => {
            showMessage(`Fjala ishte: ${targetWord}`, 'error');
            showReplayButton();
        }, wordLength * 200 + 500);
    }
}

function checkGuess(guess, target) {
    const result = [];
    const targetArray = target.split('');
    const guessArray = guess.split('');
    const targetCount = {};
    
    // Count letters in target word
    targetArray.forEach(letter => {
        targetCount[letter] = (targetCount[letter] || 0) + 1;
    });
    
    // First pass: mark correct positions
    for (let i = 0; i < wordLength; i++) {
        if (guessArray[i] === targetArray[i]) {
            result[i] = 'correct';
            targetCount[guessArray[i]]--;
        } else {
            result[i] = null;
        }
    }
    
    // Second pass: mark present/absent
    for (let i = 0; i < wordLength; i++) {
        if (result[i] === null) {
            if (targetCount[guessArray[i]] > 0) {
                result[i] = 'present';
                targetCount[guessArray[i]]--;
            } else {
                result[i] = 'absent';
            }
        }
    }
    
    return result;
}

function updateTiles(result) {
    // Add staggered flip animation like online Wordle (slower)
    for (let i = 0; i < wordLength; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        tile.classList.remove('filled');
        
        // Stagger the animation delay for each tile (slower: 200ms delay)
        setTimeout(() => {
            tile.classList.add(result[i]);
        }, i * 200); // 200ms delay between each tile (slower than before)
    }
}

function updateKeyboard(result) {
    const guessArray = currentGuess.split('');
    
    for (let i = 0; i < wordLength; i++) {
        const letter = guessArray[i];
        const key = Array.from(document.querySelectorAll('.key'))
            .find(k => k.textContent === letter);
        
        if (key) {
            // Remove existing classes
            key.classList.remove('correct', 'present', 'absent');
            
            // Add new class if it's better than existing
            const currentClass = key.className.includes('correct') ? 'correct' :
                               key.className.includes('present') ? 'present' : '';
            
            if (result[i] === 'correct') {
                key.classList.add('correct');
            } else if (result[i] === 'present' && currentClass !== 'correct') {
                key.classList.add('present');
            } else if (result[i] === 'absent' && !currentClass) {
                key.classList.add('absent');
            }
        }
    }
}

function showMessage(text, type = '') {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message show ${type}`;
    
    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

function shakeRow(row) {
    for (let i = 0; i < wordLength; i++) {
        const tile = document.getElementById(`tile-${row}-${i}`);
        tile.style.animation = 'shake 0.5s';
    }
    
    setTimeout(() => {
        for (let i = 0; i < wordLength; i++) {
            const tile = document.getElementById(`tile-${row}-${i}`);
            tile.style.animation = '';
        }
    }, 500);
}

function showReplayButton() {
    const replayButton = document.getElementById('replay-button');
    replayButton.style.display = 'block';
}

function hideReplayButton() {
    const replayButton = document.getElementById('replay-button');
    replayButton.style.display = 'none';
}

// Initialize modal and game on page load
document.addEventListener('DOMContentLoaded', () => {
    initModal();
    
    // Add replay button event listener
    document.getElementById('replay-button').addEventListener('click', () => {
        hideReplayButton();
        initGame();
    });
});