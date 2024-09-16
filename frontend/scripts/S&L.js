var blueRobot   = { row: 0, col: 0, src: "assets/Riccochet Robots/Robots/BlueRobot.png", name: "blue"};
var redRobot    = { row: 4, col: 0, src: "assets/Riccochet Robots/Robots/RedRobot.png", name: "red"};
var greenRobot  = { row: 0, col: 4, src: "assets/Riccochet Robots/Robots/GreenRobot.png", name: "green"};
var yellowRobot = { row: 5, col: 3, src: "assets/Riccochet Robots/Robots/YellowRobot.png", name: "yellow"};
var grayRobot   = { row: 7, col: 4, src: "assets/Riccochet Robots/Robots/GrayRobot.png", name: "gray"};
var robots = [blueRobot, redRobot, greenRobot, yellowRobot, grayRobot];

var direction = {row: 0, col: 0};
var SelectedRobot;

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
document.addEventListener('DOMContentLoaded', function () {

	const mainSLgame = document.getElementById('S&L-page');
	const SLButton = document.getElementById('S&L-play');

	SLButton.addEventListener('click', function() {
        printMap(document.getElementById('game-board'));
        var gameMap = document.getElementById('game-board');
        getRandomItemInOrder();
        printItems(itemQueue);
        printRobots(robots);
        // gameLogic();
        // console.log(itemQueue);
        // let Locations = getPossibleLocations(yellowRobot, map);
        // console.log("HELLO");
        // console.log(yellowRobot);
        // placeimg(blueRobot);
        // placeimg(redRobot);
        // placeimg(yellowRobot);
        // placeimg(greenRobot);
        // removeimg(0, 0);
	});
});

var itemCoordinates = [];

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
                itemCoordinates.push({
                    name: itemQueue[itemIndex],
                    coordinates: { x: j, y: i }
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
    gameMap.innerHTML = ''; // Clear the game map

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
    if (robotName != redRobot.name && row == redRobot.row && col == redRobot.col)
        return (true);
    if (robotName != blueRobot.name && row == blueRobot.row && col == blueRobot.col)
        return (true);
    if (robotName != yellowRobot.name && row == yellowRobot.row && col == yellowRobot.col)
        return (true);
    if (robotName != greenRobot.name && row == greenRobot.row && col == greenRobot.col)
        return (true);
    if (robotName != grayRobot.name && row == grayRobot.row && col == grayRobot.col)
        return (true);
    return (false);
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
        // console.log("TESTT");
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
    var numRows = map.length;
    var numCols = map[0].length;
    

    var tmpRobot = getLocation(0, -1, robot, map);
    if (!(tmpRobot.row == robot.row && tmpRobot.col == robot.col))
        locations.push(tmpRobot);
    // console.log('UP', locations[0]);

        
    var tmpRobot = getLocation(0, 1, robot, map);
    if (!(tmpRobot.row == robot.row && tmpRobot.col == robot.col))
        locations.push(tmpRobot);
    // console.log('DOWN', locations[1]);


    var tmpRobot = getLocation(-1, 0, robot, map);
    if (!(tmpRobot.row == robot.row && tmpRobot.col == robot.col))
        locations.push(tmpRobot);
    // console.log('LEFT', locations[2]);

    var tmpRobot = getLocation(1, 0, robot, map);
    if (!(tmpRobot.row == robot.row && tmpRobot.col == robot.col))
        locations.push(tmpRobot);
    // console.log('RIGHT', locations[3]);
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

function waitForKeyPress() {
    return new Promise((resolve) => {
        function onKeyPress(event) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                // Set the direction based on the key pressed
                switch (event.key) {
                    case 'ArrowUp':
                        direction.row = -1;
                        direction.col = 0;
                        break;
                    case 'ArrowDown':
                        direction.row = 1;
                        direction.col = 0;
                        break;
                    case 'ArrowLeft':
                        direction.row = 0;
                        direction.col = -1;
                        break;
                    case 'ArrowRight':
                        direction.row = 0;
                        direction.col = 1;
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

async function gameLogic()
{
    var index = items.length - 1;
    items = shuffleArray(items);
    console.log(items);
    while (index !== -1) //items loop
    {
        highlightItem(items[index]);
        // while (!isFound(items[index])) //main game loop
        while (1) // tmp loop since isfound() is not made yet
        {
            await waitForKeyPress();
            if (SelectedRobot && (direction.col || direction.row))
            {
                var tmpRobo = getLocation(direction.col, direction.row, SelectedRobot, map);
                updateRobot(tmpRobo);
                console.log(greenRobot); // 
            }
            resetVars();
        }
        greyOutItem(items[index]);
        index--;
    }
    console.log(items);
}

function removerobot(robot)
{
        var gameBoard = document.getElementById('game-board');
        var cellIndex = robot.row * 16 + robot.col;
        var cell = gameBoard.children[cellIndex];
    
        var images = cell.getElementsByTagName('img');
        console.log(images);
        for (var i = 0; i < images.length; i++) {
            if (images[i].alt == "Robot") {
                cell.removeChild(images[i]);
                break; 
            }
        }
}

function updateRobot(tmpRobo)
{
    if (tmpRobo.name == "blue")
    {
        removeimg(blueRobot.row, blueRobot.col);
        blueRobot.col = tmpRobo.col;
        blueRobot.row = tmpRobo.row;
        placeimg(blueRobot);
        selectBlueRobot();
    }
    if (tmpRobo.name == "red")
    {
        removeimg(redRobot.row, redRobot.col);
        redRobot.col = tmpRobo.col;
        redRobot.row = tmpRobo.row;
        placeimg(redRobot);
        selectRedRobot();
    }
    if (tmpRobo.name == "green")
    {
        removeimg(greenRobot.row, greenRobot.col);
        greenRobot.col = tmpRobo.col;
        greenRobot.row = tmpRobo.row;
        placeimg(greenRobot);
        selectGreenRobot();
    }
    if (tmpRobo.name == "yellow")
    {
        removeimg(yellowRobot.row, yellowRobot.col);
        yellowRobot.col = tmpRobo.col;
        yellowRobot.row = tmpRobo.row;
        placeimg(yellowRobot);
        selectYellowRobot();
    }
    if (tmpRobo.name == "gray")
    {
        removeimg(grayRobot.row, grayRobot.col);
        grayRobot.col = tmpRobo.col;
        grayRobot.row = tmpRobo.row;
        placeimg(grayRobot);
        selectGrayRobot();
    }
}

function highlightItem(item)
{
    console.log("highlight ---->>>", item);
    // create a highlight on a the item selected
}

function greyOutItem(item)
{
    console.log("greyOut ---->>>", item);
    // create a highlight on a the item selected
}

function resetVars()
{
    direction.col = 0;
    direction.row = 0;
    // SelectedRobot = null;
}

document.getElementById('green-robot-button').addEventListener('click', selectGreenRobot);
document.getElementById('yellow-robot-button').addEventListener('click', selectYellowRobot);
document.getElementById('gray-robot-button').addEventListener('click', selectGrayRobot);
document.getElementById('blue-robot-button').addEventListener('click', selectBlueRobot);
document.getElementById('red-robot-button').addEventListener('click', selectRedRobot);

// document.addEventListener('keydown', function(event) {
//     switch(event.key) {
//         case 'q':
//             selectGreenRobot();
//             break;
//         case 'w':
//             selectYellowRobot();
//             break;
//         case 'e':
//             selectGrayRobot();
//             break;
//         case 'r':
//             selectBlueRobot();
//             break;
//         case 'f':
//             selectRedRobot();
//             break;
//             case 'ArrowUp': // check might put them in a function 
//             direction.row = -1;
//             direction.col = 0;
//             break;
//         case 'ArrowDown': // check might put them in a function
//             direction.row = 1;
//             direction.col = 0;
//             break;
//         case 'ArrowLeft': // check might put them in a function
//             direction.row = 0;
//             direction.col = -1;
//             break;
//         case 'ArrowRight': // check might put them in a function
//             direction.row = 0;
//             direction.col = 1;
//             break;
//         default:
//             break;
//         }
// });

function selectRobot(key)
{
    switch(key)
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
}

// function setDirection(key)
// {
//     switch(key)
//     {
//         case 'ArrowUp':
//             direction.row = -1;
//             direction.col = 0;
//             break;
//         case 'ArrowDown':
//             direction.row = 1;
//             direction.col = 0;
//             break;
//         case 'ArrowLeft':
//             direction.row = 0;
//             direction.col = -1;
//             break;
//         case 'ArrowRight':
//             direction.row = 0;
//             direction.col = 1;
//             break;
//         default:
//             break;
//     }
// }

document.addEventListener('keydown', function(event)
{
    selectRobot(event.key);
    // setDirection(event.key);
});

var currentRobot = null;

function selectGreenRobot() {
    currentRobot = greenRobot;
    updateSelectedButton('green-robot-button');
    onRobotSelected(currentRobot);
}

function selectYellowRobot() {
    currentRobot = yellowRobot;
    updateSelectedButton('yellow-robot-button');
    onRobotSelected(currentRobot);
}

function selectGrayRobot() {
    currentRobot = grayRobot;
    updateSelectedButton('gray-robot-button');
    onRobotSelected(currentRobot);
}

function selectBlueRobot() {
    currentRobot = blueRobot;
    updateSelectedButton('blue-robot-button');
    onRobotSelected(currentRobot);
}

function selectRedRobot() {
    currentRobot = redRobot;
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
    console.log(locations);

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