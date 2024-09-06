var blueRobot   = { row: 0, col: 0, src: "assets/BlueRobot.png"};
var redRobot    = { row: 4, col: 0, src: "assets/RedRobot.png"};
var greenRobot  = { row: 0, col: 4, src: "assets/GreenRobot.png"};
var yellowRobot = { row: 4, col: 4, src: "assets/YellowRobot.png"};

var map =
[
    ["0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "GM", "0 ", "0 ", "0 ", "0 ", "0 ", "RS", "0 ", "0 ", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "BM", "0 ", "0 ", "0 "],
    ["R ", "L ", "0 ", "D ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "GU", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "U ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "0 ", "YU", "0 ", "0 ", "V ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "BS", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "YW", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "1 ", "1 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "1 ", "1 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "YM", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "BU", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "GS", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "BW", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "RM", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "YS", "0 ", "0 ", "0 ", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "0 ", "RU", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "GW", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 "],
];
document.addEventListener('DOMContentLoaded', function () {

	const mainSLgame = document.getElementById('S&L-page');
	const SLButton = document.getElementById('S&L-play');

	SLButton.addEventListener('click', function() {
        printMap(document.getElementById('game-board'));
        var gameMap = document.getElementById('game-board');
        placeimg(blueRobot);
        placeimg(redRobot);
        placeimg(yellowRobot);
        placeimg(greenRobot);
        // removeimg(0, 0);
	});
});


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
    "GM": "assets/GreenToken1.png",
    "RS": "assets/RedToken1.png",
    "BM": "assets/BlueToken1.png",
    "RW": "assets/RW.jpg",
    "GU": "assets/GU.jpg",
    "YU": "assets/YellowToken1.png",
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
            if (imageMap[value]) {
                var img = document.createElement('img');
                img.src = imageMap[value];
                img.alt = value;
                img.className = 'token';
                cell.appendChild(img);
            }
            if (value == "U")
                cell.className = 'U tile';
            if (value == "R")
                cell.className = 'R tile';
            if (value == "L")
                cell.className = 'L tile';
            if (value == "D")
                cell.className = 'D tile';
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
