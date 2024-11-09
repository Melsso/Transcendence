document.addEventListener('DOMContentLoaded', function () {
	const container = document.querySelector('.background-container');
	const containerWidth = container.offsetWidth;
	const containerHeight = container.offsetHeight;
	const screenSizeFactor = Math.min(containerWidth, containerHeight) / 500;
	const squareCount = Math.floor(screenSizeFactor * 30); 
	const squareSize = 40; 

	function isOverlapping(newTop, newLeft, existingSquares) {
		for (let square of existingSquares) {
			const existingTop = parseFloat(square.style.top);
			const existingLeft = parseFloat(square.style.left);
			const overlapX = newLeft < existingLeft + squareSize + 10 && newLeft + squareSize + 10 > existingLeft;
			const overlapY = newTop < existingTop + squareSize + 10 && newTop + squareSize + 10 > existingTop;
			if (overlapX && overlapY) {
				return true;
			}
		}
		return false;
	}

	const existingSquares = [];
	for (let i = 0; i < squareCount; i++) {
		const square = document.createElement('div');
		square.classList.add('square');

		let randomTop, randomLeft;
		let attempts = 0;
		const maxAttempts = 100;
		do {
			randomTop = Math.random() * (containerHeight - squareSize);
			randomLeft = Math.random() * (containerWidth - squareSize);
			attempts++;
		} while (isOverlapping(randomTop, randomLeft, existingSquares) && attempts < maxAttempts);
		if (attempts < maxAttempts) {
			square.style.top = `${randomTop}px`;
			square.style.left = `${randomLeft}px`;
			const randomDelay = Math.random() * 6; 
			square.style.animationDelay = `${randomDelay}s`;
			container.appendChild(square);
			existingSquares.push(square);
		}
	}

	function repositionSquare(square) {
		const containerWidth = container.offsetWidth;
		const containerHeight = container.offsetHeight; 
		const newTop = Math.random() * (containerHeight - squareSize);
		const newLeft = Math.random() * (containerWidth - squareSize);
		square.style.top = `${newTop}px`;
		square.style.left = `${newLeft}px`;
		square.style.animation = 'none'; 
		square.offsetHeight; 
		square.style.animation = null; 
	}

	function staggeredReposition() {
		existingSquares.forEach((square, index) => {
			setTimeout(() => {
				repositionSquare(square);
			}, index * 500);
		});
	}
	setInterval(staggeredReposition, 6000);
});