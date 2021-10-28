'use strict';

let gUsedSafeCells = [];

function safeBtnClick() {
	if (gGame.safeClicks === 0) {
		renderAlert('no more safe clicks ❌');
		return;
	}

	if (gGame.shownCount === 0) {
		renderAlert('please start game first 🕹');
		return;
	}

	const safeCells = getSafeCells();
	renderSafeCell(safeCells);
	gGame.safeClicks--;
	renderSafeClicksBtn();
}

function renderSafeCell(safeCells) {
	let idx = getRandomInt(0, safeCells.length - 1);

	if (gUsedSafeCells.includes(idx)) {
		renderSafeCell(safeCells);
	} else {
		gUsedSafeCells.push(idx);
		let i = safeCells[idx].i;
		let j = safeCells[idx].j;
		const elCell = document.querySelector(`.cell-${i}-${j}`);
		elCell.innerHTML = SAFE_CELL;
    setTimeout(() => {
			hideSafeCell(elCell);
		}, 1000);
	}
}

function getSafeCells() {
	let safeCells = [];
	for (let i = 0; i < gBoard.length; i++) {
		for (let j = 0; j < gBoard[0].length; j++) {
			if (
				gBoard[i][j].isMine === false &&
				gBoard[i][j].isShown === false &&
				gBoard[i][j].isMarked === false
			) {
				safeCells.push({ i, j });
			}
		}
	}
	return safeCells;
}

function hideSafeCell(elCell) {
	elCell.innerHTML = ' ';
}

function renderSafeClicksBtn() {
	const elSafeBtn = document.querySelector('.right-bottom span');
	elSafeBtn.innerText = gGame.safeClicks;
}


