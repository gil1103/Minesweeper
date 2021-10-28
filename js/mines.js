'use strict';

function spreadMines(board, pos) {
	for (let i = 0; i < gLevel.mines; i++) {
		let Idx = getRandomInt(0, gLevel.size - 1);
		let Jdx = getRandomInt(0, gLevel.size - 1);

		// handle 1st click before spreading the mines
		if (Idx === pos.i && Jdx === pos.j) {
			i--;
			continue;
		}

		// avoid duplicates
		if (board[Idx][Jdx].isMine) {
			i--;
			continue;
		} else {
			board[Idx][Jdx].isMine = true;
		}
	}
	updateMinesCounts(board);
}

// Count mines around each cell and set the cell's minesAroundCount
function updateMinesCounts(board) {
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			board[i][j].minesAroundCount = countNeighbors(i, j, board);
		}
	}
}

// Manual placement...................................
function placeMinesBtnClick() {
	restartGame();
	gBoard = buildBoard(gLevel.size, gLevel.size);
	gIsPlacingMines = !gIsPlacingMines;

	togglePlaceMinesBtnColor();
}

function placeMine(pos) {
	//update Model
	gBoard[pos.i][pos.j].isMine = true;
	gPlacedMinesCount++;
  
	// update Dom
	toggleShowAllCells(gBoard, 'reveal');
  renderMinesLeft(gPlacedMinesCount);

	if (gPlacedMinesCount === gLevel.mines) {
		gIsPlacingMines = false;
		toggleShowAllCells(gBoard, 'reveal');
		gPlacedMinesCount = 0;
		renderAlert('finished placing mines', 1000);
		gIsPlacingMinesMod = true;
		setTimeout(() => {
			renderAlert('good luck soldier');
		}, 1000);
		setTimeout(restartGame, 500);
		togglePlaceMinesBtnColor();
	}
}

function togglePlaceMinesBtnColor() {
	let elPlaceMineBtn = document.querySelectorAll('.right-bottom .tooltip')[2];
	elPlaceMineBtn.classList.toggle('PlaceMinesBtn-active');
  return elPlaceMineBtn.classList.contains('PlaceMinesBtn-active');
}

function removePlaceMinesBtnColor() {
	let isPlaceMineBtnOn = togglePlaceMinesBtnColor();
	if (isPlaceMineBtnOn) {
		togglePlaceMinesBtnColor();
	}
}
