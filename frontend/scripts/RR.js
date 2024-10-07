var blueRobot   = { row: 0, col: 0, src: "assets/Riccochet Robots/Robots/BlueRobot.png", name: "blue"};
var redRobot    = { row: 4, col: 0, src: "assets/Riccochet Robots/Robots/RedRobot.png", name: "red"};
var greenRobot  = { row: 0, col: 4, src: "assets/Riccochet Robots/Robots/GreenRobot.png", name: "green"};
var yellowRobot = { row: 5, col: 3, src: "assets/Riccochet Robots/Robots/YellowRobot.png", name: "yellow"};
var grayRobot   = { row: 7, col: 4, src: "assets/Riccochet Robots/Robots/GrayRobot.png", name: "gray"};
var robots = [blueRobot, redRobot, greenRobot, yellowRobot, grayRobot];
var TTokens = [
    { name: "MT1", src: "assets/Riccochet Robots/Tokens/MT1.png" },
    { name: "MT2", src: "assets/Riccochet Robots/Tokens/MT2.png" },
    { name: "MT3", src: "assets/Riccochet Robots/Tokens/MT3.png" },
    { name: "MT4", src: "assets/Riccochet Robots/Tokens/MT4.png" },
    { name: "MT5", src: "assets/Riccochet Robots/Tokens/M5.png" }
];
var direction = {row: 0, col: 0};
var SelectedRobot;

var copyRobots = JSON.parse(JSON.stringify(robots));

var map =
[
    ["LU ", "U  ", "UD ", "U  ", "RU ", "LU ", "U  ", "U  ", "U  ", "RU ", "LU ", "U  ", "U  ", "U  ", "UD ", "RU "],
    ["L  ", "R  ", "LUX", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "R  ", "LUX", "R  "],
    ["L  ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "R  ", "DLX", "   ", "   ", "   ", "R  "],
    ["L  ", "   ", "   ", "   ", "   ", "R  ", "DLX", "   ", "   ", "   ", "   ", "U  ", "   ", "   ", "   ", "RD "],
    ["LD ", "   ", "   ", "   ", "D  ", "   ", "U  ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "RU "],
    ["LU ", "   ", "   ", "   ", "RUX", "L  ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "R  "],
    ["L  ", "DRX", "L  ", "   ", "   ", "   ", "   ", " D ", " D ", "   ", "D  ", "   ", "   ", "XDR", "L  ", "R  "],
    ["L  ", "U  ", "   ", "   ", "   ", "   ", "  R", "LU1", "1RU", "L  ", "RUX", "L  ", "  D", "  U", "   ", "R  "],
    ["L  ", "   ", "   ", "  D", "   ", "   ", "  R", "LD1", "1RD", "L  ", "   ", "  R", "ULX", "   ", "   ", "R  "],
    ["L  ", "   ", "   ", "URX", "L  ", "   ", "   ", " U ", " U ", "  R", "XDL", "   ", "   ", "   ", "   ", "R  "],
    ["L  ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "U  ", "   ", "   ", "   ", "   ", "RD "],
    ["L R", "LXD", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "XDR", "L  ", "   ", "   ", "   ", "  D", "RU "],
    ["L  ", "  U", "   ", "   ", "   ", "   ", "XDR", "L  ", "   ", "  U", "   ", "   ", "   ", "   ", "XRU", "RL "],
    ["LD ", "   ", "  D", "   ", "   ", "   ", "  U", "   ", "   ", "   ", "   ", "   ", "   ", "  D", "   ", "R  "],
    ["LU ", "  R", "LUX", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "   ", "  R", "LUX", "   ", "R  "],
    ["LD ", "D  ", "D  ", "D  ", "D  ", "DR ", "DL ", "D  ", "D  ", "D  ", "D R", "DL ", "D  ", "D  ", "D  ", "DR "],
];

var itemCoordinates = [];

document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('robot-buttons').style.display = 'none';
    document.getElementById('rr-mover-counter').style.display = 'none';
    document.getElementById('rr-players').style.display = 'none';
    document.getElementById('game-board').style.display = 'none';
    document.getElementById('rr-menu').style.display = 'none';
	const mainSLgame = document.getElementById('S&L-page');
	const SLButton = document.getElementById('S&L-play');

	SLButton.addEventListener('click', function() {
        showRRmenu();
        // printMap(document.getElementById('game-board'));
        // var gameMap = document.getElementById('game-board');
        // getRandomItemInOrder();
        // printItems(itemQueue);
        // printRobots(robots);
        // gameLogic();
        // let Locations = getPossibleLocations(yellowRobot, map);
        // placeimg(blueRobot);
        // placeimg(redRobot);
        // placeimg(yellowRobot);
        // placeimg(greenRobot);
        // removeimg(0, 0);
	});
});

function showRRmenu() {
    const main_menu = document.getElementById('rr-main-menu');
    const invite_bar = document.getElementById('rr-inv-menu');
    document.getElementById('rr-menu').style.display = 'flex';
    main_menu.style.display = 'flex';
    invite_bar.style.display = 'none'
    
}

function showButtons() {
    document.getElementById('robot-buttons').style.display = 'flex';
    document.getElementById('rr-mover-counter').style.display = 'flex';
    document.getElementById('rr-players').style.display = 'flex';
    document.getElementById('game-board').style.display = 'grid';
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; 
    }
    return array;
}

var items = [
    "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", 
    "M9", "M10", "M11", "M12", "M13", "M14", "M15", "M16", "V"
];

var itemQueue = shuffleArray(items.slice()); 

function getRandomItemInOrder() {
    return itemQueue.length > 0 ? itemQueue[0] : null;
}


function printItems(itemQueue) {
    var itemIndex = 0; 

    for (var i = 0; i < map.length; i++) {
        for (var j = 0; j < map[i].length; j++) {
            var cellValue = map[i][j].trim();
            if (cellValue.includes("X") && itemIndex < itemQueue.length) {
                var gameBoard = document.getElementById('game-board'); 
                var cellIndex = i * map[i].length + j;
                var cell = gameBoard.children[cellIndex];

                var existingToken = cell.querySelector('.token');
                if (existingToken) {
                    cell.removeChild(existingToken);
                }

                var img = document.createElement('img');
                img.src = 'assets/Riccochet Robots/Tokens/' + itemQueue[itemIndex] + '.png';
                img.alt = itemQueue[itemIndex];
                img.className = 'token';

                cell.appendChild(img);

                var color = getColor(itemQueue[itemIndex]);
                itemCoordinates.push({
                    src: img.src,
                    name: itemQueue[itemIndex],
                    col: j,
                    row: i,
                    color: color
                });
                itemIndex++;
            }
        }
    }
}

function printRobots(robotArray) {
    robotArray.forEach(function(robot) {
        var gameBoard = document.getElementById('game-board');
        var cellIndex = robot.row * 16 + robot.col;  // Assuming a 16x16 grid
        var cell = gameBoard.children[cellIndex];

        // Remove existing robot if any (avoid duplicates)
        var existingRobot = cell.querySelector('.robot');
        if (existingRobot) {
            cell.removeChild(existingRobot);
        }

        // Create and append robot image
        var img = document.createElement('img');
        img.src = robot.src;
        img.alt = robot.name;
        img.className = 'robot';

        cell.appendChild(img);
    });
}



function removeimg(row, col) {
    var index = row * 16 + col;
    var gameBoard = document.getElementById('game-board');
    var tile = gameBoard.children[index];
    var img = tile.querySelector('img');
    
    if (img) {
        tile.removeChild(img);
    }
}

function placetoken(token, row, col) {
    var index = row * 16 + col;
    
    var gameBoard = document.getElementById('game-board');
    
    var tile = gameBoard.children[index];
    var img = document.createElement('img');
    img.src = token.src;
    img.alt = token.name;
    img.className = 'token';

    tile.appendChild(img);
}

function placeimg(robot) {
    var index = robot.row * 16 + robot.col;
    
    var gameBoard = document.getElementById('game-board');
    
    var tile = gameBoard.children[index];
    var img = document.createElement('img');
    img.src = robot.src;
    img.alt = 'Robot';
    img.className = 'token';

    tile.appendChild(img);
}

var imageMap =
{
    "M1": "assets/GreenToken1.png",
    "M2": "assets/RedToken1.png",
    "M3": "assets/BlueToken1.png",
    // "M4": "assets/RW.jpg",
    "GU": "assets/GU.jpg",
    "M4": "assets/YellowToken1.png",
    "V ": "assets/V.jpg",
    "BS": "assets/BS.jpg",
    "YW": "assets/YW.jpg",
    "YM": "assets/YM.jpg",
    "GS": "assets/GS.jpg",
    "BU": "assets/BU.jpg",
    "BW": "assets/BW.jpg",
    "RM": "assets/RM.jpg",
    "YS": "assets/YS.jpg",
    "RU": "assets/RU.jpg",
    "GW": "assets/GW.jpg",
    // "B": "assets/BlueRobot.png",
    // "R": "assets/RedRobot.png",
    // "G": "assets/GreenRobot.png",
    // "Y": "assets/YellowRobot.png",
    // "1 ": "assets/wall.jpg"
};



function printMap(gameMap) {
    gameMap.innerHTML = '';

    for (var i = 0; i < map.length; i++) {
        for (var j = 0; j < map[i].length; j++) {
            var cell = document.createElement('div');
            cell.className = 'tile';

            var value = map[i][j].trim();

            if (value.includes("U")) {
                cell.classList.add('U');
            }
            if (value.includes("R")) {
                cell.classList.add('R');
            }
            if (value.includes("L")) {
                cell.classList.add('L');
            }
            if (value.includes("D")) {
                cell.classList.add('D');
            }
            gameMap.appendChild(cell);
        }
    }
}

function getRandomItem()
{
    var items =
    [
        "GM", "RS", "BM", "RW", "GU", "YU", "V ", "BS", 
        "YW", "YM", "GS", "BU", "BW", "RM", "YS", "RU", "GW"
    ];
    var randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
}

function getRowIndex(map, target)
{
    for (var i = 0; i < map.length; i++)
        if (map[i].includes(target))
            return i;
    return -1;
}

function getColIndex(map, target)
{
    for (var i = 0; i < map.length; i++)
        for (var j = 0; j < map[i].length; j++)
            if (map[i][j] === target)
                return j;
    return -1;
}

function getTarget(col, row, map)
{
    if (row >= 0 && row < map.length && col >= 0 && col < map[row].length)
        return map[row][col];
    console.error("Index out of bounds");
    return null;
}

function isTarget(row, col, target, map)
{ return getTarget(col, row, map) === target; }


function isRobot(row, col, robotName)
{
    for (var i = 0; i < copyRobots.length; i++){
        if (robotName !== copyRobots[i].name && row === copyRobots[i].row && col === copyRobots[i].col){
            return true;
        }
    }
    return false;
}
function positionCheck(map, robot, dCol, dRow)
{
    if (dRow == 1 && map[robot.row][robot.col].includes("D")) 
        return (false);
    if (dRow == -1 && map[robot.row][robot.col].includes("U")) 
        return (false);
    if (dCol == 1 && map[robot.row][robot.col].includes("R")) 
        return (false);
    if (dCol == -1 && map[robot.row][robot.col].includes("L")) 
        return (false);
    return (true);
}

function getLocation(dCol, dRow, robot, map)
{
    var tmpRobot = JSON.parse(JSON.stringify(robot));

    while (1)
    {
        if (isRobot(tmpRobot.row + dRow, tmpRobot.col + dCol, tmpRobot.name))
            break ;
        var bool = positionCheck(map, tmpRobot, dCol, dRow);
        tmpRobot.row += dRow * bool;
        tmpRobot.col += dCol * bool;
        if (!bool)
            break ;
    }
    return (tmpRobot);
}

function getPossibleLocations(robot, map)
{
    var locations = [];

    var tmpRobot = getLocation(0, -1, robot, map);
    if (!(tmpRobot.row == robot.row && tmpRobot.col == robot.col))
        locations.push(tmpRobot);
    var tmpRobot = getLocation(0, 1, robot, map);
    if (!(tmpRobot.row == robot.row && tmpRobot.col == robot.col))
        locations.push(tmpRobot);
    var tmpRobot = getLocation(-1, 0, robot, map);
    if (!(tmpRobot.row == robot.row && tmpRobot.col == robot.col))
        locations.push(tmpRobot);
    var tmpRobot = getLocation(1, 0, robot, map);
    if (!(tmpRobot.row == robot.row && tmpRobot.col == robot.col))
        locations.push(tmpRobot);
    return locations;
}

function shuffleArray(array)
{
    var currentIndex = array.length;
    var randomIndex;

    while (currentIndex !== 0)
    {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function directionKey() {
    return new Promise((resolve) => {
        function onKeyPress(event) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'l'].includes(event.key)) {
                // Set the direction based on the key pressed
                switch (event.key) {
                    case 'ArrowUp':
                        direction.row = -1;
                        direction.col = 0;
                        updateMoveCounter();
                        break;
                    case 'ArrowDown':
                        direction.row = 1;
                        direction.col = 0;
                        updateMoveCounter();
                        break;
                    case 'ArrowLeft':
                        direction.row = 0;
                        direction.col = -1;
                        updateMoveCounter();
                        break;
                    case 'ArrowRight':
                        direction.row = 0;
                        direction.col = 1;
                        updateMoveCounter();
                        break;
                    case 'l':
                        reset_status();
                        resetMoveCounter();
                        break;
                }

                // Clean up the event listener
                document.removeEventListener('keydown', onKeyPress);
                resolve(); // Resolve the promise to continue the game loop
            }
        }

        document.addEventListener('keydown', onKeyPress);
    });
}
// const reset = document.getElementById('reset-robot-button');
function reset_status() 
{

    for (var i = 0;copyRobots[i]; i++)
        {
            removeRobotImage(copyRobots[i]);
        }
    printRobots(robots);
    document.querySelectorAll('.highlight').forEach(function(tile) {
        tile.remove();
    });
    SelectedRobot = null;
    copyRobots = JSON.parse(JSON.stringify(robots));
    document.querySelectorAll('.robot-highlight').forEach(function(robotHighlight) {
        robotHighlight.remove();
    });
    document.querySelectorAll('#robot-buttons button').forEach(function(button) {
        button.classList.remove('selected');
    });
}

let timerInterval;

let seconds = 120; // Initialize seconds to 120

function startTimer() {
    timerInterval = setInterval(() => {
        seconds--;
        document.getElementById("rr-timer").textContent = formatTime(seconds);

        if (seconds <= 0) {
            clearInterval(timerInterval);
            alert("Time's up!");
        }
    }, 1000);
}


function formatTime(s) {
    const minutes = Math.floor(s / 60);
    const secondsRemaining = s % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secondsRemaining < 10 ? '0' : ''}${secondsRemaining}`;
}


function resetTimer() {
    clearInterval(timerInterval);
    seconds = 120;
    document.getElementById("rr-timer").textContent = formatTime(seconds);
    startTimer();
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}
async function gameLogic()
{
    var index = itemCoordinates.length - 1;
    itemCoordinates = shuffleArray(itemCoordinates);
    while (index !== -1)
    {
        resetMoveCounter();
        highlightItem(itemCoordinates[index]);
        while (!isFound(itemCoordinates[index]))
        {
            await directionKey();
            if (SelectedRobot && (direction.col || direction.row))
            {
                SelectedRobot = copyRobots[getRobotIndex(SelectedRobot)];
                var tmpRobot = getLocation(direction.col, direction.row, SelectedRobot, map);
                updateRobot(tmpRobot, copyRobots[getRobotIndex(SelectedRobot)]);
            }
            resetVars();
        }
        // startTimer();
        unhighlightItem();
        greyOutItem(itemCoordinates[index]);
        index--;
    }
}

let moveCount = 0; 
function updateMoveCounter() {
    moveCount++; 
    document.getElementById("move-count").textContent = moveCount; 
}
function resetMoveCounter() {
    moveCount = 0;
    document.getElementById("move-count").textContent = moveCount;
}

function removeRobotImage(robot) {
    var gameBoard = document.getElementById('game-board');
    var cellIndex = robot.row * 16 + robot.col;
    var cell = gameBoard.children[cellIndex];

    var images = cell.getElementsByTagName('img');

    for (var i = 0; i < images.length; i++) {
        if (images[i].alt === "Robot" || images[i].src === robot.src || images[i].alt === robot.name) {
            cell.removeChild(images[i]);
            break;
        }
    }
}

function updateRobot(tmpRobo, robot)
{
    removeRobotImage(robot);
    robot.col = tmpRobo.col;
    robot.row = tmpRobo.row;
    placeimg(robot);
    if (tmpRobo.name == "blue")
        selectBlueRobot();
    if (tmpRobo.name == "red")
        selectRedRobot();
    if (tmpRobo.name == "green")
        selectGreenRobot();
    if (tmpRobo.name == "yellow")
        selectYellowRobot();
    if (tmpRobo.name == "gray")
        selectGrayRobot();
}

function unhighlightItem()
{
    document.getElementById('highlighted-img').style.display = 'none';
}

function highlightItem(item)
{
    const imgElement = document.getElementById("highlighted-img");
    imgElement.src = 'assets/Riccochet Robots/Tokens/' + item.name + '.png';
    imgElement.style.display = 'block';
}

function greyOutItem(item)
{
    var gameBoard = document.getElementById('game-board');
    var cellIndex = item.row * 16 + item.col;
    var cell = gameBoard.children[cellIndex];

    var images = cell.getElementsByTagName('img');

    for (var i = 0; i < images.length; i++) {
        if (images[i].alt === item.name) {
            cell.removeChild(images[i]);
            break;
        }
    }

    var newItem = getTItem(item.name);
    for (var i = 0; i < TTokens.length; i++)
        if (TTokens[i].name === newItem)
            break ;
    placetoken(TTokens[i], item.row, item.col);
}

function resetVars()
{
    direction.col = 0;
    direction.row = 0;
}

document.getElementById('green-robot-button').addEventListener('click', selectGreenRobot);
document.getElementById('yellow-robot-button').addEventListener('click', selectYellowRobot);
document.getElementById('gray-robot-button').addEventListener('click', selectGrayRobot);
document.getElementById('blue-robot-button').addEventListener('click', selectBlueRobot);
document.getElementById('red-robot-button').addEventListener('click', selectRedRobot);

document.addEventListener('keydown', function(event)
{
    switch(event.key)
    {
        case 'q':
            selectGreenRobot();
            break;
        case 'w':
            selectYellowRobot();
            break;
        case 'e':
            selectGrayRobot();
            break;
        case 'r':
            selectBlueRobot();
            break;
        case 'f':
            selectRedRobot();
            break;
        default:
            break;
    }
});

var currentRobot = null;

function selectGreenRobot() {
    currentRobot = copyRobots[2];
    updateSelectedButton('green-robot-button');
    onRobotSelected(currentRobot);
}

function selectYellowRobot() {
    currentRobot = copyRobots[3];
    updateSelectedButton('yellow-robot-button');
    onRobotSelected(currentRobot);
}

function selectGrayRobot() {
    currentRobot = copyRobots[4];
    updateSelectedButton('gray-robot-button');
    onRobotSelected(currentRobot);
}

function selectBlueRobot() {
    currentRobot = copyRobots[0];
    updateSelectedButton('blue-robot-button');
    onRobotSelected(currentRobot);
}

function selectRedRobot() {
    currentRobot = copyRobots[1];
    updateSelectedButton('red-robot-button');
    onRobotSelected(currentRobot);
}

function updateSelectedButton(buttonId) {
    document.querySelectorAll('#robot-buttons button').forEach(function(button) {
        button.classList.remove('selected');
    });
    document.getElementById(buttonId).classList.add('selected');
}


function onRobotSelected(robot) {
    if (!robot) {
        console.log('No robot selected');
        return;
    }
    SelectedRobot = robot;
    document.querySelectorAll('.highlight').forEach(function(tile) {
        tile.remove();
    });


    document.querySelectorAll('.robot-highlight').forEach(function(robotHighlight) {
        robotHighlight.remove();
    });

    var locations = getPossibleLocations(robot, map);

    locations.forEach(function(location) {
        var index = location.row * 16 + location.col;
        var gameBoard = document.getElementById('game-board');
        var tile = gameBoard.children[index];


        if (tile) {
            var highlightDiv = tile.querySelector('.highlight');
            if (!highlightDiv) {
                highlightDiv = document.createElement('div');
                highlightDiv.className = 'highlight';
                tile.appendChild(highlightDiv);
            }
        }
    });


    var robotImage = document.querySelector(`img[src="${robot.src}"]`);
    if (robotImage) {
    
        var robotHighlightDiv = document.createElement('div');
        robotHighlightDiv.className = 'robot-highlight';
        robotImage.parentElement.appendChild(robotHighlightDiv);
    }
}

function getColor(input)
{
    if (input === "V")
        return "default";
    var number = parseInt(input.slice(1), 10);
    switch (number % 4)
    {
        case 0:
            return "green";
        case 1:
            return "red";
        case 2:
            return "blue";
        case 3:
            return "yellow";
    }
}

function getTItem(input)
{
    if (input === "V")
        return ("MT5"); // check change later
    var number = parseInt(input.slice(1), 10) - 1;
    switch (Math.floor(number / 4))
    {
        case 0:
            return "MT1";
        case 1:
            return "MT2";
        case 2:
            return "MT3";
        case 3:
            return "MT4";
    }
}

function getRobotIndex(robot)
{
    if (robot.name === "blue")
        return (0);
    if (robot.name === "red")
        return (1);
    if (robot.name === "green")
        return (2);
    if (robot.name === "yellow")
        return (3);
    if (robot.name === "gray")
        return (4);
    return (-1);
}

function isFound(item)
{
    for (var it = 0; it < 4; it++)
    {

        if (item.color === copyRobots[it].name && item.row === copyRobots[it].row && item.col === copyRobots[it].col)
        {
            return (true);
        }
    }
    // add conditon for void!
    return (false);
}