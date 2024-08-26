document.addEventListener('DOMContentLoaded', function () {
	const historyTab = document.getElementById('History');
	const matchHistoryContainer = document.querySelector('.match-history-container');


	historyTab.click();
	loadMatchHistory();
	historyTab.addEventListener('click', function () {
		 if (matchHistoryContainer.innerHTML === '') {
			  loadMatchHistory();
		 }
	});

	function loadMatchHistory() {
		 const matchData = [
			  {
					"GAMEID": "#0237da",
					"Player1": "John Doe",
					"Player2": "Jane Smith",
					"Score": "13-14",
					"Winner": "Jane Smith"
			  },
			  {
					"GAMEID": "#0298db",
					"Player1": "John Doe",
					"Player2": "Jake Johnson",
					"Score": "20-18",
					"Winner": "John Doe"
			  },
			  {
				"GAMEID": "#0237da",
				"Player1": "John Doe",
				"Player2": "Jane Smith",
				"Score": "13-14",
				"Winner": "Jane Smith"
		  		},
		  	   {
				"GAMEID": "#0298db",
				"Player1": "John Doe",
				"Player2": "Jake Johnson",
				"Score": "20-18",
				"Winner": "John Doe"
		  },
		  {
			"GAMEID": "#0237da",
			"Player1": "John Doe",
			"Player2": "Jane Smith",
			"Score": "13-14",
			"Winner": "Jane Smith"
	  },
	  {
			"GAMEID": "#0298db",
			"Player1": "John Doe",
			"Player2": "Jake Johnson",
			"Score": "20-18",
			"Winner": "John Doe"
	  },
	  {
		"GAMEID": "#0237da",
		"Player1": "John Doe",
		"Player2": "Jane Smith",
		"Score": "13-14",
		"Winner": "Jane Smith"
  },
  {
		"GAMEID": "#0298db",
		"Player1": "John Doe",
		"Player2": "Jake Johnson",
		"Score": "20-18",
		"Winner": "John Doe"
  },
  {
	"GAMEID": "#0237da",
	"Player1": "John Doe",
	"Player2": "Jane Smith",
	"Score": "13-14",
	"Winner": "Jane Smith"
},
{
	"GAMEID": "#0298db",
	"Player1": "John Doe",
	"Player2": "Jake Johnson",
	"Score": "20-18",
	"Winner": "John Doe"
},
{
	"GAMEID": "#0237da",
	"Player1": "John Doe",
	"Player2": "Jane Smith",
	"Score": "13-14",
	"Winner": "Jane Smith"
},
{
	"GAMEID": "#0298db",
	"Player1": "John Doe",
	"Player2": "Jake Johnson",
	"Score": "20-18",
	"Winner": "John Doe"
}			  
		 ];

		 const playerAvatars = {
			  "John Doe": "assets/avatar1.svg",
			  "Jane Smith": "assets/avatar2.svg",
			  "Jake Johnson": "assets/avatar3.svg"
		 };

		 matchData.forEach(match => {
			  const matchCard = document.createElement('div');
			  matchCard.classList.add('match-card');
			  if (match.Winner !== "John Doe") {
					matchCard.classList.add('lost');
			  }

			  matchCard.innerHTML = `
					<div class="player">
						 <img src="${playerAvatars[match.Player1]}" alt="Avatar of ${match.Player1}">
						 <div>
							  <div>${match.Player1}</div>
							  <div class="game-name">${match.GAMEID}</div>
						 </div>
					</div>
					<div class="score">${match.Score}</div>
					<div class="player">
						 <div>
							  <div>${match.Player2}</div>
							  <div class="game-name">${match.GAMEID}</div>
						 </div>
						 <img src="${playerAvatars[match.Player2]}" alt="Avatar of ${match.Player2}">
					</div>
			  `;

			  matchHistoryContainer.appendChild(matchCard);
		 });
	}
});
