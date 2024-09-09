var blueRobot   = { row: 0, col: 0, src: "assets/BlueRobot.png", name: "blue"};
var redRobot    = { row: 4, col: 0, src: "assets/RedRobot.png", name: "red"};
var greenRobot  = { row: 0, col: 4, src: "assets/GreenRobot.png", name: "green"};
var yellowRobot = { row: 4, col: 4, src: "assets/YellowRobot.png", name: "yellow"};
var grayRobot   = { row: 5, col: 5, src: "assets/GrayRobot.png", name: "gray"};

var map =
[
    ["LU", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "RU"],
    ["L ", "X", "X", "", "", "", "", "", "", "", "D", "", "", "", "", "R"],
    ["L ", "X", "X", "", "", "", "", "", "", "", "", "", "", "", "", "R"],
    ["L ", "X", "X", "L ", "", "", "", "", "", "", "", "", "", "", "", "R"],
    ["L ", "X", "", "UR ", "L", "", "", "", "", "", "", "", "", "", "", "R"],
    ["L ", "X", "", "", "", "", "", "", "L", "", "", "", "", "", "", "R"],
    ["L ", "X", "", "", "", "", "", "", "", "", "", "", "", "", "", "R"],
    ["L ", "X", "", "", "", "", "", "1 ", "1 ", "", "", "", "", "", "", "R"],
    ["L ", "X", "", "", "", "", "", "1 ", "1 ", "", "", "", "", "", "", "R"],
    ["L ", "X", "", "", "", "", "", "", "", "", "", "", "", "", "", "R"],
    ["L ", "X", "", "", "", "", "", "", "", "", "", "", "", "", "", "R"],
    ["L ", "X", "", "", "", "", "", "", "", "", "", "", "", "", "", "R"],
    ["L ", "X", "", "", "", "", "", "", "", "", "", "", "", "", "", "R"],
    ["L ", "X", "", "", "", "", "", "", "", "", "", "", "", "", "", "R"],
    ["L ", "XD", "", "", "", "RU", "", "", "", "", "", "", "", "", "", "R"],
    ["LD", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "DR"],
];
document.addEventListener('DOMContentLoaded', function () {

	const mainSLgame = document.getElementById('S&L-page');
	const SLButton = document.getElementById('S&L-play');

	SLButton.addEventListener('click', function() {
        printMap(document.getElementById('game-board'));
        var gameMap = document.getElementById('game-board');
        getRandomItemInOrder();
        printItems(itemQueue);
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
    "M9", "M10", "M11", "M12", "M13", "M14", "M15", "M16", "M17"
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

                var img = document.createElement('img');
                img.src = 'assets/' + itemQueue[itemIndex] + '.png';
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
    if (dRow == 1 && map[robot.row][robot.col].includes("D")) // check add more conditions later
        return (false);
    if (dRow == -1 && map[robot.row][robot.col].includes("U")) // check add more conditions later
        return (false);
    if (dCol == 1 && map[robot.row][robot.col].includes("R")) // check add more conditions later
        return (false);
    if (dCol == -1 && map[robot.row][robot.col].includes("L")) // check add more conditions later
        return (false);
    return (true);
}

function getLocation(dCol, dRow, robot, map)
{
    var tmpRobot = JSON.parse(JSON.stringify(robot));;

    while (1)
    {
        if (isRobot(tmpRobot.row + dRow, tmpRobot.col + dCol, tmpRobot.name))
            break ;
        console.log("TESTT");
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
        
document.getElementById('green-robot-button').addEventListener('click', selectGreenRobot);
document.getElementById('yellow-robot-button').addEventListener('click', selectYellowRobot);
document.getElementById('gray-robot-button').addEventListener('click', selectGrayRobot);
document.getElementById('blue-robot-button').addEventListener('click', selectBlueRobot);
document.getElementById('red-robot-button').addEventListener('click', selectRedRobot);

document.addEventListener('keydown', function(event) {
    switch(event.key) {
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
    document.querySelectorAll('.highlight').forEach(function(tile) {
        tile.classList.remove('highlight');
    });

    var locations = getPossibleLocations(robot, map);
    console.log(locations);
    locations.forEach(function(location) {
        var index = location.row * 16 + location.col;
        var gameBoard = document.getElementById('game-board');
        var tile = gameBoard.children[index];
        if (tile) {
            tile.classList.add('highlight');
        }
    });
}