'use strict';

function getHighScores() {
	gLevels.forEach((level) => {
		gHighScores[level.id] = +localStorage.getItem(level.name);
	});

	// for (let i = 0; i < gLevels.length; i++) {
	// 	gHighScores[gLevels[i].id] = +localStorage.getItem(gLevel.name);
	// }
}

function checkForHighScore() {
	const currGameScore = gGame.secsPassed;
	if (!gHighScores[gLevel.id] || currGameScore < gHighScores[gLevel.id]) {
		setHighScore(gLevel.name, currGameScore);
		renderAlert('new highscore!!');
	} else {
		renderAlert('you win the game' + getRandomSmiley());
	}
}

function setHighScore(levelName, score) {
	localStorage.setItem(levelName, score);
	gHighScores[gLevel.id] = score;
	renderHighScores();
}

function resetHighScores() {
	const ans = confirm('are you sure ?');
	if (ans) {
		localStorage.clear();
		for (let i in gHighScores) {
			gHighScores[gLevels[i].id] = 0;
		}
		renderHighScores();
		renderAlert('High scores cleared');
	}
}

function renderHighScores() {
	let elHighScores = document.querySelectorAll('.bottom-section-levels span');
	for (const [index, leveEl] of elHighScores.entries()) {
		if (gHighScores[index] > 0) {
			leveEl.innerText = gHighScores[index] + 's';
		}else leveEl.innerText = gHighScores[index]
	}
}
