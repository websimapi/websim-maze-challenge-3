import YouTubePlayer from 'youtube-player';

// Decode the "secret" seed (it's a ROT1 cipher - shifting each letter by 1)
const encodedSeed = "Qmfbtf!nblf!uijt!bduvbmmz!kvtu!b!sjdlspmm!cfdbvtf!jut!Bqsjm!2tu";
const seed = decodeSeed(encodedSeed);

// Set up variables
const mazeSize = 15;
const cellSize = 400 / mazeSize;
let playerPosition = { x: 0, y: 0 };
let treasurePosition = { x: mazeSize - 1, y: mazeSize - 1 };
let maze = [];

// Elements
const mazeElement = document.getElementById('maze');
const playerElement = document.getElementById('player');
const treasureElement = document.getElementById('treasure');
const playButton = document.getElementById('play-button');
const messageElement = document.getElementById('message');

// Control buttons
document.getElementById('up').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('down').addEventListener('click', () => movePlayer(0, 1));
document.getElementById('left').addEventListener('click', () => movePlayer(-1, 0));
document.getElementById('right').addEventListener('click', () => movePlayer(1, 0));

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
    }
});

// Initialize the maze and game
initMaze();
renderMaze();
positionPlayer();

// Create treasure chest with SVG
createTreasureChest();

// YouTube setup
let player;
treasureElement.addEventListener('click', () => {
    playRickroll();
});

playButton.addEventListener('click', (e) => {
    e.stopPropagation();
    playRickroll();
});

function initMaze() {
    // Create an empty maze
    for (let y = 0; y < mazeSize; y++) {
        maze[y] = [];
        for (let x = 0; x < mazeSize; x++) {
            maze[y][x] = { wall: true, visited: false };
        }
    }

    // Generate the maze using a basic algorithm with the seed influence
    generateMaze(0, 0);
    
    // Ensure start and end are paths
    maze[0][0].wall = false;
    maze[mazeSize - 1][mazeSize - 1].wall = false;
    
    // Create a path to ensure the maze is solvable
    ensureSolvableMaze();
}

function generateMaze(x, y) {
    maze[y][x].visited = true;
    maze[y][x].wall = false;

    // Get random direction order influenced by seed
    const directions = getDirectionsFromSeed(x, y);
    
    for (let i = 0; i < directions.length; i++) {
        const [dx, dy] = directions[i];
        const nx = x + dx * 2;
        const ny = y + dy * 2;
        
        if (nx >= 0 && nx < mazeSize && ny >= 0 && ny < mazeSize && !maze[ny][nx].visited) {
            maze[y + dy][x + dx].wall = false;
            generateMaze(nx, ny);
        }
    }
}

function getDirectionsFromSeed(x, y) {
    // Use the seed and position to generate a consistent random order
    const directions = [
        [0, -1], // up
        [1, 0],  // right
        [0, 1],  // down
        [-1, 0]  // left
    ];
    
    // Use the seed character at the position derived from x,y
    const seedIndex = (x * 5 + y * 7) % seed.length;
    const seedChar = seed.charCodeAt(seedIndex);
    
    // Shuffle based on the seed character
    for (let i = 0; i < directions.length; i++) {
        const j = (seedChar + i * x + y) % directions.length;
        [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    
    return directions;
}

function ensureSolvableMaze() {
    // Simple path from start to end
    let x = 0;
    let y = 0;
    
    while (x < mazeSize - 1 || y < mazeSize - 1) {
        if (x < mazeSize - 1) {
            maze[y][x + 1].wall = false;
            x++;
        }
        if (y < mazeSize - 1) {
            maze[y + 1][x].wall = false;
            y++;
        }
    }
}

function renderMaze() {
    mazeElement.innerHTML = '';
    
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            const cell = document.createElement('div');
            cell.className = `cell ${maze[y][x].wall ? 'wall' : 'path'}`;
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.left = `${x * cellSize}px`;
            cell.style.top = `${y * cellSize}px`;
            mazeElement.appendChild(cell);
        }
    }
}

function positionPlayer() {
    playerElement.style.left = `${playerPosition.x * cellSize + (cellSize - playerElement.offsetWidth) / 2}px`;
    playerElement.style.top = `${playerPosition.y * cellSize + (cellSize - playerElement.offsetHeight) / 2}px`;
    
    // Check if player reached the treasure
    if (playerPosition.x === treasurePosition.x && playerPosition.y === treasurePosition.y) {
        treasureElement.classList.remove('hidden');
        messageElement.textContent = "Click the chest to claim your reward!";
    } else {
        treasureElement.classList.add('hidden');
    }
}

function movePlayer(dx, dy) {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    
    // Check bounds and walls
    if (
        newX >= 0 && newX < mazeSize && 
        newY >= 0 && newY < mazeSize && 
        !maze[newY][newX].wall
    ) {
        playerPosition.x = newX;
        playerPosition.y = newY;
        positionPlayer();
    }
}

function createTreasureChest() {
    treasureElement.innerHTML = `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="16" width="48" height="32" fill="#8B4513" />
            <rect x="8" y="16" width="48" height="4" fill="#A0522D" />
            <rect x="10" y="20" width="44" height="24" fill="#CD853F" />
            <rect x="28" y="20" width="8" height="24" fill="#8B4513" />
        </svg>
    `;
    
    treasureElement.style.left = `${treasurePosition.x * cellSize}px`;
    treasureElement.style.top = `${treasurePosition.y * cellSize}px`;
    treasureElement.style.width = `${cellSize}px`;
    treasureElement.style.height = `${cellSize}px`;
}

function playRickroll() {
    // Create YouTube container if not exists
    let youtubeContainer = document.getElementById('youtube-container');
    if (!youtubeContainer) {
        youtubeContainer = document.createElement('div');
        youtubeContainer.id = 'youtube-container';
        const youtubeWrapper = document.createElement('div');
        youtubeWrapper.className = 'youtube-wrapper';
        youtubeContainer.appendChild(youtubeWrapper);
        document.body.appendChild(youtubeContainer);
        
        // Create the player
        player = YouTubePlayer('youtube-container', {
            videoId: 'dQw4w9WgXcQ',
            playerVars: {
                autoplay: 1,
                controls: 1
            }
        });
    }
    
    // Show the container
    youtubeContainer.style.display = 'flex';
    
    // Make sure video is playing
    if (player) {
        player.playVideo();
    }
}

function decodeSeed(encoded) {
    let decoded = '';
    for (let i = 0; i < encoded.length; i++) {
        const charCode = encoded.charCodeAt(i);
        decoded += String.fromCharCode(charCode - 1);
    }
    return decoded;
}

