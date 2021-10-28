'use strict';

// Constants ..................................................................
const MINE = '💣';
const FLAG = '🚩';
const HEART = '❤️';
const BROKEN_HEART = '💔';
const HINT_OFF = `img/hint-off.png`;
const HINT_GLOW = `img/hint-active.png`;
const HINT_USED = `img/hint-used.png`;
const SAFE_CELL = '✔️';

// Globals ....................................................................
let gBoard; // A Matrix containing cell objects
var gGameSaves;

const gLevels = [
	{ id: 0, name: 'Beginner', size: 4, mines: 2, lives: 1 },
	{ id: 1, name: 'Medium', size: 8, mines: 12, lives: 2 },
	{ id: 2, name: 'Expert', size: 12, mines: 30, lives: 3 }
];
let gLevel = gLevels[0];
let gGame;

let gInterval;

let gHighScores = [];

let gIsPlacingMines = false;
let gPlacedMinesCount = 0;
let gIsPlacingMinesMod = false;

function initGame() {
	initDocumentSetup();
	getHighScores();
	restartGame();
}

function restartGame() {
	clearInterval(gInterval);
	gGameSaves = [];
	gGame = {
		//update the current game state:
		isOn: true,
		lives: gLevel.lives,
		safeClicks: 3,
		hints: 3,
		isHintMode: false,
		shownCount: 0, //How many cells are shown
		markedCount: 0, //How many cells are marked (with a flag)
		secsPassed: 0 //How many seconds passed
	};

	if (!gIsPlacingMinesMod) {
		gBoard = buildBoard(gLevel.size, gLevel.size);
		// removePlaceMinesBtnColor();
	} else {
		toggleShowAllCells(gBoard, 'cover');
		updateMinesCounts(gBoard);
	}
	renderBoard(gBoard);
	renderAllButBoard();
}

function renderAllButBoard() {
	renderLives();
	renderTimer();
	renderMinesLeft();
	renderHighScores();
	renderHints();
	// renderSafeClicksBtn(); //todo
}

function undoStep() {
	if (!gGame.isOn) return;
	if (gGameSaves.length <= 1) {
		restartGame();
		return;
	}
	const gameSave = gGameSaves[gGameSaves.length - 2];
	renderGameStep(gameSave);
}

function renderGameStep(gameSave) {
	// perform DEEP copy of game object & board while keep timer running
	gBoard = { ...gameSave }.boardState;
	let tmpTimer = gGame.secsPassed;
	gGame = { ...gameSave }.gameState;
	gGame.secsPassed = tmpTimer;

	// render restored step
	renderBoard(gBoard);
	renderLives();
	renderTimer();
	renderMinesLeft();
	renderHints();
}

function setLevel(level) {
	gLevel = gLevels[level];
	gIsPlacingMines = false;
	gIsPlacingMinesMod = false;
	restartGame();
}

// Render the board as a <table> to the page
function renderBoard(board) {
	const cellSize = gLevel.id === 2 ? 28 : 35;
	let root = document.documentElement;
	root.style.setProperty('--cel-size', cellSize + 'px');

	let strHtml = '';
	for (var i = 0; i < board.length; i++) {
		strHtml += '<tr>';
		for (var j = 0; j < board[0].length; j++) {
			let currentCellValue = getCellInnerText(board, i, j);
			let className = `cell-${i}-${j}`;
			if (board[i][j].isShown === false) className += ' covered';
			if (board[i][j].isBlown === true) className += ' blown';
			strHtml += `
									<td class="${className}" onmousedown = 'cellClick(event,this)' ontouchstart = 'cellClick(event, this)' ontouchend='touchEnd(event,this)'>
											${currentCellValue}
									</td>`;
		}
		strHtml += `</tr>`;
	}
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHtml;
}

function gameOver(isVictory) {
	clearInterval(gInterval);
	gGame.isOn = false;
	let elSmiley = document.querySelector('.status-bar .circle');
	elSmiley.classList.add('.remove-circle');
	elSmiley.innerText = isVictory ? '😎' : '😩';
	setTimeout(() => {
		elSmiley.classList.remove('.remove-circle');
		elSmiley.innerText = ' ';
	}, 2000);

	if (isVictory) checkForHighScore();
	else renderAlert('game over', 10000);
}

function onOpenInfo() {
	console.log('onopeninfo');
	document.querySelector('.game-info-container').hidden=false;
	document.querySelector('.main-container').style.display='none';
}

function closeInfo() {
	console.log('close info');
	document.querySelector('.game-info-container').hidden = true;
	document.querySelector('.main-container').style.display = 'flex';
}
