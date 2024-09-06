var blueRobot   = { row: 0, col: 0, src: "assets/BlueRobot.png"};
var redRobot    = { row: 4, col: 0, src: "assets/RedRobot.png"};
var greenRobot  = { row: 0, col: 4, src: "assets/GreenRobot.png"};
var yellowRobot = { row: 4, col: 4, src: "assets/YellowRobot.png"};

var map =
[
    ["LU", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "U", "RU"],
    ["L ", "X", "X", "", "", "", "", "", "", "", "D", "", "", "", "", "R"],
    ["L ", "X", "X", "", "", "", "", "", "", "", "", "", "", "", "", "R"],
    ["L ", "X", "X", "L ", "", "", "", "", "", "", "", "", "", "", "", "R"],
    ["L ", "X", "", "U ", "", "", "", "", "", "", "", "", "", "", "", "R"],
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
        console.log(itemQueue);
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
