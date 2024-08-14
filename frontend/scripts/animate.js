document.addEventListener('DOMContentLoaded', function () {
	const container = document.querySelector('.background-container');
	const squareSize = 40; // Size of each square in pixels
	const minDistance = 30; // Minimum distance between squares in pixels

	// Calculate the number of squares based on screen size
	const containerWidth = container.offsetWidth;
	const containerHeight = container.offsetHeight;
	const screenSizeFactor = Math.min(containerWidth, containerHeight) / 500;
	const squareCount = Math.floor(screenSizeFactor * 30); // Adjust the multiplier as needed

	// Function to check if a square overlaps with any existing squares
	function isOverlapping(newTop, newLeft, existingSquares) {
		 for (let square of existingSquares) {
			  const existingTop = parseFloat(square.style.top);
			  const existingLeft = parseFloat(square.style.left);

			  // Check if the new square overlaps with the existing square
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

			  // Random delay for animation to create a staggered effect
			  const randomDelay = Math.random() * 6; // Delay between 0 and 6 seconds
			  square.style.animationDelay = `${randomDelay}s`;

			  container.appendChild(square);
			  existingSquares.push(square);
		 }
	}

	// Function to reset square position independently
	function repositionSquare(square) {
		 const containerWidth = container.offsetWidth;
		 const containerHeight = container.offsetHeight;

		 // Generate new position
		 const newTop = Math.random() * (containerHeight - squareSize);
		 const newLeft = Math.random() * (containerWidth - squareSize);

		 // Update position and reapply styles to trigger animation
		 square.style.top = `${newTop}px`;
		 square.style.left = `${newLeft}px`;

		 // Reapply animation
		 square.style.animation = 'none'; // Reset animation
		 square.offsetHeight; // Trigger reflow to restart animation
		 square.style.animation = null; // Reapply animation
	}

	// Reposition squares independently by creating a staggered repositioning effect
	function staggeredReposition() {
		 existingSquares.forEach((square, index) => {
			  setTimeout(() => {
					repositionSquare(square);
			  }, index * 500); // Staggered effect with 0.5 second intervals
		 });
	}

	// Call staggeredReposition periodically
	setInterval(staggeredReposition, 6000); // Adjust interval to match the animation duration
});
