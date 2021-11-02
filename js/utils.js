'use strict';
let gTouchStartTimeStamp = 0;
let gTtouchEndTimeStamp = 0;

// Window/Document init .......................................................
function initDocumentSetup() {
	window.oncontextmenu = () => {
		//disable right mouse context menu
		return false;
	};

	document.addEventListener('keydown', (event) => {
		if (event.ctrlKey && event.key === 'z') {
			undoStep();
		}
	});
}

// Array / Board functions ....................................................
function buildBoard(rowsCount, colCount) {
	var mat = [];
	for (var i = 0; i < rowsCount; i++) {
		mat[i] = [];
		for (var j = 0; j < colCount; j++) {
			mat[i][j] = {
				isMine: false,
				isShown: false,
				isMarked: false,
				isBlown: false,
				minesAroundCount: 0
			};
		}
	}
	return mat;
}

// Cell Functions .............................................................
// Called when a cell (td) is clicked
function cellClick(event, elCell) {
	if (!gGame.isOn) return;

	const pos = getCellPosByClassId(elCell); // pos= {i,j}
	if (gIsPlacingMines) {
		// once player place mines by himself
		placeMine(pos);
		return;
	}

	if (gGame.isHintMode) {
		getHint(pos);
		return;
	}

	if ('ontouchstart' in document.body) {
		playOnTouchScreen(event, pos);
	} else playUsingMouse(event, pos);
}

// Touch screen actions
function playOnTouchScreen(event, pos) {
	touchStart(event);
	if (gGame.shownCount === 0 && event.touches.length === 1) onGame1stClick(pos);
}

function touchStart(event) {
	gTouchStartTimeStamp = event.timeStamp;
}

function touchEnd(event, elCell) {
	gTtouchEndTimeStamp = event.timeStamp;
	let timeDiff = gTtouchEndTimeStamp - gTouchStartTimeStamp;

	const pos = getCellPosByClassId(elCell); // pos= {i,j}

	if (timeDiff <= 1000) revealCellContent(pos);
	if (timeDiff > 1000) cellMark(pos);
	updateGameStatus();
}

function playUsingMouse(event, pos) {
	const mouseEvent = event.button; // event.button--> 0: left button,1: wheel or the middle button ,2: right button
	if (gGame.shownCount === 0 && mouseEvent === 0) onGame1stClick(pos);
	if (mouseEvent === 0) revealCellContent(pos);
	if (mouseEvent === 2) cellMark(pos);
	updateGameStatus();
}

function onGame1stClick(pos) {
	gInterval = setInterval(() => {
		gGame.secsPassed++;
		renderTimer();
	}, 1000);
	if (!gIsPlacingMinesMod) {
		spreadMines(gBoard, pos);
	}
	gIsPlacingMinesMod = false;
}

function updateGameStatus(){
	if (gGame.shownCount + gGame.markedCount === gLevel.size ** 2) gameOver(true);
	renderBoard(gBoard);
	saveStepForUndo();
}

function saveStepForUndo() {
	const copyCurrGameState = JSON.parse(JSON.stringify(gGame));
	const copyCurrBoardState = JSON.parse(JSON.stringify(gBoard));
	gGameSaves.push({
		gameState: copyCurrGameState,
		boardState: copyCurrBoardState
	});
}

function revealCellContent(pos) {
	let clickedCell = gBoard[pos.i][pos.j];
	if (clickedCell.isShown) return;
	if (clickedCell.isMarked) return;
	if (clickedCell.isMine) {
		clickedCell.isBlown = true;
		gGame.lives--;
		if (gGame.lives === 0) {
			toggleShowAllCells(gBoard, 'reveal');
			gameOver(false);
		} else {
			gGame.shownCount--;
			gGame.markedCount++;
		}
		renderLives();
		renderMinesLeft();
	}
	clickedCell.isShown = true;
	expandNegCells(pos);
	gGame.shownCount++;
}

// Called on right click to mark a cell (suspected to be a mine)--> hide the context menu on right click
function cellMark(pos) {
	let clickedCell = gBoard[pos.i][pos.j];
	if (clickedCell.isShown) return;
	if (!clickedCell.isMarked) {
		if (gGame.markedCount === gLevel.mines) return;
		else {
			clickedCell.isMarked = !clickedCell.isMarked;
			gGame.markedCount++;
		}
	} else {
		clickedCell.isMarked = !clickedCell.isMarked;
		gGame.markedCount--;
	}
	renderMinesLeft();
}

function toggleShowAllCells(board, coverRevealStr) {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[0].length; j++) {
			if (coverRevealStr === 'cover') {
				board[i][j].isShown = false;
			} else if (coverRevealStr === 'reveal') {
				board[i][j].isShown = true;
			}
		}
	}
	renderBoard(gBoard);
}

function expandNegCells(pos) {
	if (
		pos.i < 0 ||
		pos.i > gLevel.size - 1 ||
		pos.j < 0 ||
		pos.j > gLevel.size - 1
	)
		return;
	if (gBoard[pos.i][pos.j].minesAroundCount > 0) return;
	for (let i = pos.i - 1; i <= pos.i + 1; i++) {
		if (i < 0 || i > gBoard.length - 1) continue;
		for (let j = pos.j - 1; j <= pos.j + 1; j++) {
			if (j < 0 || j > gBoard[0].length - 1) continue;
			if (i === pos.i && j === pos.j) continue;
			if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
				gBoard[i][j].isShown = true;
				gGame.shownCount++;
				expandNegCells({ i, j }); // RECURSE
			}
		}
	}
}

function countNeighbors(cellI, cellJ, mat) {
	var count = 0;
	for (let i = cellI - 1; i <= cellI + 1; i++) {
		if (i < 0 || i >= mat.length) continue;
		for (var j = cellJ - 1; j <= cellJ + 1; j++) {
			if (j < 0 || j >= mat[i].length) continue;
			if (i === cellI && j === cellJ) continue;
			if (mat[i][j].isMine) {
				count++;
			}
		}
	}
	return count;
}

function getCellInnerText(board, i, j) {
	const currCell = board[i][j];
	if (currCell.isMarked === true) {
		return FLAG;
	}
	if (currCell.isShown === false) {
		return ' ';
	}
	if (currCell.isMine === true) {
		return MINE;
	}
	if (currCell.minesAroundCount) {
		return currCell.minesAroundCount;
	} else return ' ';
}

function getCellPosByClassId(elCell) {
	const posArr = elCell.classList[0].split('-'); // gets the 1st className item "cell-1-4" and splits
	const pos = { i: +posArr[1], j: +posArr[2] };
	return pos;
}

// Update Status Bar ..........................................................
function renderMinesLeft(minesCount) {
	const elMinesLeft = document.querySelectorAll('.status-bar span')[0];
	if (minesCount) {
		elMinesLeft.innerText = gLevel.mines - minesCount;
	} else {
		elMinesLeft.innerText = gLevel.mines - gGame.markedCount;
	}
}

function renderTimer() {
	let elElapsedTime = document.querySelectorAll('.status-bar span')[1];
	let strNumber = '';

	if (gGame.secsPassed < 10) {
		strNumber = '0:0' + gGame.secsPassed;
	}
	if (gGame.secsPassed < 60) {
		strNumber = '0:' + gGame.secsPassed;
	} else {
		let min = Math.floor(gGame.secsPassed / 60);
		let sec = Math.round(60 * (gGame.secsPassed / 60 - min));
		if (sec < 10) strNumber = `${min}:0${sec}`;
		else strNumber = `${min}:${sec}`;
	}
	elElapsedTime.innerText = strNumber;
}

function renderLives() {
	const elHearts = document.querySelector('.hearts');
	elHearts.innerText = gGame.lives ? HEART.repeat(gGame.lives) : BROKEN_HEART;
}

// Alerts .....................................................................
function renderAlert(msg, duration = 3000) {
	msg = msg.toUpperCase();
	const elMsg = document.querySelector('.message');
	elMsg.innerText = msg;
	elMsg.classList.add('horizontal-move');
	elMsg.style.fontSize = '20px';
	elMsg.style.visibility = 'visible';
	setTimeout(hideAlert, duration);
}

function hideAlert() {
	const elMsg = document.querySelector('.message');
	elMsg.style.visibility = 'hidden';
	elMsg.classList.remove('horizontal-move');
	elMsg.style.fontSize = '18px';
}

// Random funcs ...............................................................
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomSmiley() {
	const smileyArr = ['😬', '😇', '😃', '🤩', '🥳', '🤠', '👍', '🎓'];
	return smileyArr[getRandomInt(0, smileyArr.length - 1)];
}
