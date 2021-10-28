'use strict';

let gIsLightOn = false;
let gElCurrHint;
let gShownCells = [];
let gHintInterval;

function renderHints() {
	const elHints = document.querySelector('.hints');
	let strHtml = '';
	for (let i = 0; i < gGame.hints; i++) {
		strHtml += `<img class="hint-image" src="${HINT_OFF}" onclick="hintClick(this)" />`;
	}
	elHints.innerHTML = strHtml;
}

function hintClick(elHint) {
	if (!gGame.isOn) return;
	if (gGame.shownCount === 0) {
		renderAlert('start playing before asking for hint...');
		return;
	}

	if (gGame.isHintMode) {
		clearInterval(gHintInterval);
		gGame.isHintMode = false;
		elHint.src = HINT_OFF;
		return;
	}

	const isUsedAlready = elHint.classList.contains('used');

	if (!isUsedAlready) {
		gElCurrHint = elHint;
		gGame.isHintMode = true;
		elHint.src = HINT_GLOW;
		gHintInterval = setInterval(() => {
			blinkLight(elHint);
		}, 400);
	}
}

function blinkLight(elHint) {
	if (!gIsLightOn) {
		elHint.src = HINT_GLOW;
	} else {
		elHint.src = HINT_OFF;
	}
	gIsLightOn = !gIsLightOn;
}

function getHint(pos) {
	revealNegs(pos);
	clearInterval(gHintInterval);

	// update Model
	gGame.isHintMode = false;
	gGame.hints--;

	// update Dom
	gElCurrHint.src = HINT_USED;
	gElCurrHint.classList.add('used');
}

function revealNegs(pos) {
	gShownCells = [];
	for (let i = pos.i - 1; i <= pos.i + 1; i++) {
		if (i < 0 || i > gBoard.length - 1) continue;
		for (let j = pos.j - 1; j <= pos.j + 1; j++) {
			if (j < 0 || j > gBoard[0].length - 1) continue;
			if (gBoard[i][j].isShown) {
				continue;
			} else {
				gBoard[i][j].isShown = true;
				gShownCells.push({ i, j });
			}
		}
	}
	renderBoard(gBoard);
	setTimeout(hideRevealdCells, 1000);
}

function hideRevealdCells() {
	gShownCells.forEach((cell) => {
		gBoard[cell.i][cell.j].isShown = false;
	});
	renderBoard(gBoard);
}
