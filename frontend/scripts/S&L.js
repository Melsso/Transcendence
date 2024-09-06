document.addEventListener('DOMContentLoaded', function () {

	const mainSLgame = document.getElementById('S&L-page');
	const SLButton = document.getElementById('S&L-play');

	SLButton.addEventListener('click', function() {
		makeboard();

	});
});

function makeboard() {

	const board = document.getElementById('game-board');
	for (let i = 0; i < 16 * 16; i++) {
		const tiles = document.createElement('div');
		tiles.classList.add('tile');
		board.appendChild(tiles); 
	}
}



var blueRobot   = { row: 0, col: 0 };
var redRobot    = { row: 4, col: 0 };
var greenRobot  = { row: 0, col: 4 };
var yellowRobot = { row: 4, col: 4 };

var map =
[
    ["0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "GM", "0 ", "0 ", "0 ", "0 ", "0 ", "RS", "0 ", "0 ", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "BM", "0 ", "0 ", "0 "],
    ["0 ", "RW", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "GU", "0 ", "0 ", "0 "],
    ["0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 ", "0 "],
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

var imageMap =
{
    "GM": "assets/GM.jpg",
    "RS": "assets/RS.jpg",
    "BM": "assets/BM.jpg",
    "RW": "assets/RW.jpg",
    "GU": "assets/GU.jpg",
    "YU": "assets/YU.jpg",
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
    "B": "assets/GW.jpg",
    "R": "assets/GW.jpg",
    "G": "assets/GW.jpg",
    "Y": "assets/GW.jpg",
    "1 ": "assets/wall.jpg"
};

window.onload = function()
{
    var gameMap = document.getElementById('game-map');
    var table = document.createElement('table');

    printMap(gameMap);

    // tests
    test(map, "RS");

};

function printMap(gameMap)
{
    var table = document.createElement('table');
    for (var i = 0; i < map.length; i++)
    {
        var row = document.createElement('tr');
        for (var j = 0; j < map[i].length; j++)
        {
            var cell = document.createElement('td');
            cell.className = 'tile';
            var value = map[i][j].trim();

            if (imageMap[value])
            {
                var img = document.createElement('img');
                img.src = imageMap[value];
                img.alt = value;
                img.style.width = "50px";
                img.style.height = "50px";
                cell.appendChild(img);
            }

            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    gameMap.appendChild(table);
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

function changeImage(row, col, newValue, map)
{
    var gameMap = document.getElementById('game-map');
    var table = gameMap.getElementsByTagName('table')[0];
    
    if (table)
    {
        var cell = table.rows[row].cells[col];
        var value = newValue.trim();

        if (imageMap[value])
        {
            if (cell.firstChild)
                cell.removeChild(cell.firstChild);
            var img = document.createElement('img');
            img.src = imageMap[value];
            img.alt = value;
            img.style.width = "50px";
            img.style.height = "50px";
            cell.appendChild(img);
        }
    }
    map[row][col] = newValue;
}

function deleteImage(row, col, map)
{
    var gameMap = document.getElementById('game-map');
    var table = gameMap.getElementsByTagName('table')[0];
    
    if (table)
    {
        var cell = table.rows[row].cells[col];
        if (cell.firstChild)
            cell.removeChild(cell.firstChild);
    }
    
    map[row][col] = "0 ";
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


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function test(map, target)
{
    var newItem= getRandomItem();
    var newRow = getRowIndex(map, newItem);
    var newCol = getColIndex(map, newItem);
    var oldRow = getRowIndex(map, target);
    var oldCol = getColIndex(map, target);
    deleteImage(newRow, newCol, map);
    deleteImage(oldRow, oldCol, map);
    changeImage(oldRow, oldCol, newItem, map);
}
