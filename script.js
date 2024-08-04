document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("puzzleGrid");
  const generateIdButton = document.getElementById("generateIdButton");
  const puzzleIdOutput = document.getElementById("puzzleIdOutput");
  const pieceModal = document.getElementById("pieceModal");
  const closeModal = document.getElementById("closeModal");
  const applyPieceButton = document.getElementById("applyPieceButton");
  const pieceTypeSelect = document.getElementById("pieceType");
  const pieceSizeInput = document.getElementById("pieceSize");
  const emptyOrientationSelect = document.getElementById("emptyOrientation");
  const emptyOrientationLabel = document.getElementById("emptyOrientationLabel");
  const WinningKeyHint = document.getElementById("WinningKeyHint");



  let selectedCellIndex = null;
  let nextLetterCode = "B".charCodeAt(0); // Start with letter 'B'

  // Create the 6x6 grid
  for (let i = 0; i < 36; i++) {
    const cell = document.createElement("div");
    cell.dataset.index = i;
    cell.classList.add("grid-cell"); // Added class for styling
    cell.addEventListener("click", () => openPieceModal(cell, i));
    grid.appendChild(cell);
  }

  // Open the piece selection modal
  function openPieceModal(cell, index) {
    // Check if the cell is already part of a selected piece or disabled
    if (
      cell.classList.contains("selected") ||
      cell.classList.contains("disabled")
    ) {
      return;
    }

    selectedCellIndex = parseInt(cell.dataset.index);
    const rowIndex = Math.floor(selectedCellIndex / 6);

    if (rowIndex !== 2 && !isWinningPiecePlaced()) {
      alert('Please place winning key first in 3rd row by selecting a cell');
      return;
    }

    if (rowIndex === 2 && !isWinningPiecePlaced() && (index == 16 || index == 17)) {
      alert('Invalid piece placement, key should not be placed at the end of the row.');
      return;
    }

    // Show/hide winning piece option based on the row index
    pieceTypeSelect.innerHTML =
      rowIndex === 2 && !isWinningPiecePlaced()
        ? `<option value="winning">Winning Key</option>`
        : `<option value="horizontal">Horizontal</option>
         <option value="vertical">Vertical</option>`;

    // set size on the bases of piece type
    pieceSizeInput.value = rowIndex === 2 && !isWinningPiecePlaced() ? 2 : 2;
    pieceSizeInput.disabled = rowIndex === 2 && !isWinningPiecePlaced() ? true : false;

    // Ensure empty orientation is hidden unless "empty" is selected
    if (pieceTypeSelect.value === "empty") {
      emptyOrientationLabel.style.display = "block";
      emptyOrientationSelect.style.display = "block";
    } else {
      emptyOrientationLabel.style.display = "none";
      emptyOrientationSelect.style.display = "none";
    }

    pieceModal.style.display = "block";
    pieceModal.focus();
  }

  // Close the modal
  closeModal.onclick = function () {
    pieceModal.style.display = "none";
  };

  // Handle piece type change to show or hide the empty orientation dropdown
  pieceTypeSelect.addEventListener("change", function () {
    if (pieceTypeSelect.value === "empty") {
      emptyOrientationLabel.style.display = "block";
      emptyOrientationSelect.style.display = "block";
    } else {
      emptyOrientationLabel.style.display = "none";
      emptyOrientationSelect.style.display = "none";
    }
  });

  // Apply the selected piece options
  applyPieceButton.onclick = function () {
    const pieceType = pieceTypeSelect.value;
    const pieceSize = parseInt(pieceSizeInput.value);
    const emptyOrientation = emptyOrientationSelect.value;

    if (!pieceSize || pieceSize < 1 || pieceSize > 3) {
      alert("Please enter a valid piece size between 1 and 3.");
      return;
    }

    if (pieceType === "empty" && !emptyOrientation) {
      alert("Please select the orientation for the empty piece.");
      return;
    }

    if (pieceType === "horizontal" && (selectedCellIndex + 1) > 3) {
      console.log("selectedCellIndex", selectedCellIndex)
    }

    // Check for winning piece priority
    const rowIndex = Math.floor(selectedCellIndex / 6);
    if (pieceType === "winning" && (rowIndex !== 2 || pieceSize !== 2)) {
      alert(
        "Winning piece can only be placed horizontally on the 3rd row with a size of 2."
      );
      return;
    }

    // Check if a winning piece has been placed
    if (!isWinningPiecePlaced() && pieceType !== "winning") {
      alert(
        "You must place the winning piece in the third row before placing any other pieces."
      );
      return;
    }

    if (applyPiece(selectedCellIndex, pieceType, pieceSize, emptyOrientation)) {
      pieceModal.style.display = "none";
    }
  };

  // Check if a winning piece has been placed
  function isWinningPiecePlaced() {
    return Array.from(grid.children).some((cell) =>
      cell.classList.contains("winning-piece")
    );
  }

  // Apply piece to the grid
  function applyPiece(startIndex, type, size) {
    const cells = Array.from(grid.children);
    let step = type === "horizontal" || type === "winning" ? 1 : 6;
    let validPlacement = true;
    let overlapDetected = false;
    // Check if the placement is valid and does not overlap with other pieces
    for (let i = 0; i < size; i++) {
      let index = startIndex + i * step;

      if (
        index >= 36 ||
        (type === "horizontal" && index % 6 < startIndex % 6) ||
        cells[index].classList.contains("disabled")
      ) {
        validPlacement = false;
        break;
      }

      // Check for overlap with previously placed pieces
      if (
        cells[index].classList.contains("winning-piece") ||
        cells[index].classList.contains("selected")
      ) {
        overlapDetected = true;
        break;
      }
    }

    // Show alert for overlap or invalid placement
    if (overlapDetected) {
      alert("Cannot place piece as it overlaps with existing pieces.");
      return false;
    }

    if (!validPlacement) {
      alert("Invalid piece placement. Please try again.");
      return false;
    }

    // Proceed with placing the piece if valid
    if (validPlacement) {
      if (type === "winning") {
        for (let i = 0; i < size; i++) {
          let index = startIndex + i * step;
          cells[index].classList.add("winning-piece");
          cells[index].classList.add("disabled"); // Mark the cell as disabled
          cells[index].style.backgroundColor = "yellow"; // Highlight winning piece in yellow
          cells[index].dataset.letter = "A"; // Store 'A' for winning piece in the cell
          cells[index].removeEventListener("click", () =>
            openPieceModal(cells[index])
          ); // Remove click event
        }
      } else {
        // Handle 'horizontal' or 'vertical' piece type
        const pieceLetter = String.fromCharCode(nextLetterCode++);
        if (nextLetterCode > "Z".charCodeAt(0)) {
          // Wrap around if exceeding 'Z'
          nextLetterCode = "B".charCodeAt(0); // Start again from 'B'
        }

        for (let i = 0; i < size; i++) {
          let index = startIndex + i * step;
          cells[index].classList.add("selected");
          cells[index].classList.add("disabled"); // Mark the cell as disabled
          cells[index].style.backgroundColor = (type == "horizontal" ? "#55FD2F" : "#E0000F");
          cells[index].dataset.letter = pieceLetter; // Store the letter in the cell
          cells[index].removeEventListener("click", () =>
            openPieceModal(cells[index])
          ); // Remove click event
        }
      }
      if (isWinningPiecePlaced()) {
        WinningKeyHint.style.display = "none";
      }
      return true; // Indicate successful piece application
    } else {
      alert("Invalid piece placement. Please try again.");
      return false;
    }


  }


  // Find the first empty cell to the right of the currently selected cell
  function findNextEmptyCellIndex() {
    const cells = Array.from(grid.children);
    const selectedCell = cells[selectedCellIndex];

    for (let i = selectedCellIndex + 1; i < cells.length; i++) {
      if (
        !cells[i].classList.contains("selected") &&
        !cells[i].classList.contains("disabled")
      ) {
        return i;
      }
    }

    return -1; // No empty cell found
  }

  // Automatically open the modal on load and focus on the first cell
  function initialFocusOnLoad() {
    const cells = Array.from(grid.children);
    if (cells.length > 0) {
      openPieceModal(cells[0]); // Open modal on the first cell
    }
  }

  // Call the function to focus on the first cell initially
  // initialFocusOnLoad();

  // Generate Puzzle ID
  // generateIdButton.addEventListener("click", generatePuzzleId);

  const timerInput = document.getElementById("timerInput");

  generateIdButton.addEventListener("click", () => {
    const cells = Array.from(grid.children);
    let puzzleId = "";

    cells.forEach((cell) => {
      if (cell.classList.contains("selected")) {
        puzzleId += cell.dataset.letter || "B"; // Use stored letter or default to 'B'
      } else if (
        cell.classList.contains("disabled") &&
        cell.style.backgroundColor === "red"
      ) {
        puzzleId += "o"; // Represent empty cells as 'o'
      } else if (cell.classList.contains("winning-piece")) {
        puzzleId += "A"; // Represent winning piece cells as 'A'
      } else {
        puzzleId += "o"; // Default for non-selected cells
      }
    });

    const timerValue = timerInput.value || 30; // Default to 30 if no value is set
    puzzleId += `&t${timerValue}`;
    puzzleIdOutput.textContent = `https://sachindeepredsky.github.io/rushhour/#${puzzleId}`;
  });
});
