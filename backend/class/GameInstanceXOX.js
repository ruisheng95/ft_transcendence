import { MsgType } from "./MessageType.js";

export class GameInstanceXOX
{
	#emailsArray = []; //ck added
	#fastify = null; //ck added
	#connectionArray = [];
	
	// Game state variables
	#grid = [
		['-', '-', '-'],
		['-', '-', '-'],
		['-', '-', '-']
	];

	#whosTurn = false;
	#gameStatus = "";
	#clickCounter = 0;
	#player1Name = "";
	#player2Name = "";
	
	#winPatterns = [
		[[0,0],[0,1],[0,2]],
		[[1,0],[1,1],[1,2]],
		[[2,0],[2,1],[2,2]],
		[[0,0],[1,0],[2,0]],
		[[0,1],[1,1],[2,1]],
		[[0,2],[1,2],[2,2]],
		[[0,0],[1,1],[2,2]],
		[[0,2],[1,1],[2,0]]
	];

	//idle timer
	#idleTimer = null; //timer to check time between make move
	#TURN_TIMEOUT_MS = 10000; // currently idle after 10s (but can change later)

	constructor(fastify, players_emails)
	{
		this.#fastify = fastify;
		this.#emailsArray = players_emails;
	}

	#sendJson(json) {
		this.#connectionArray.forEach((connection) =>
			connection.send(JSON.stringify(json))
		);
	}

	//to return get the (gameState) struct to send to frontend
	#getGameState()
	{
		return {
			grid: this.#grid,
			whosTurn: this.#whosTurn,
			gameStatus: this.#gameStatus,
			player1Name: this.#player1Name,
			player2Name: this.#player2Name,
			clickCounter: this.#clickCounter
		};
	}

	#checkWinner(symbol) {
		return this.#winPatterns.findIndex(pattern => 
			pattern.every(([row, col]) => this.#grid[row][col] === symbol)
		);
	}

	#makeMove(row, col, playerIndex) {
		console.log("entered make move");

		//if filled cell
		if (this.#grid[row][col] !== '-')
			return;
	
		//actually making the move
		const symbol = this.#whosTurn ? 'X' : 'O';
		this.#grid[row][col] = symbol;
		this.#clickCounter++;

		//check for winner
		const winPatternIndex = this.#checkWinner(symbol);

		if (winPatternIndex !== -1)
		{
			this.#gameStatus = 'finished';
			const winner_p = this.whosTurn ? "leftplayer" : "rightplayer";
			
			// Send final game update with winner info
			this.#sendJson({
				type: "game_update",
				gameState: this.#getGameState(),
				lastMove: { row, col, symbol },
				gameResult: {
					type: 'winner',
					winnerSymbol: symbol,
					winPattern: this.#winPatterns[winPatternIndex]
				}
			});

			// End game
			this.#sendJson({ type: MsgType.GAME_OVER, winner: winner_p });

			// Update database (still need work)
			if (playerIndex === 0)
				this.#update_playerstats_aftergame(this.#emailsArray[0], this.#emailsArray[1]);
			else
				this.#update_playerstats_aftergame(this.#emailsArray[1], this.#emailsArray[0]);
		}
		else if (this.#clickCounter === 9) //tie
		{
			this.#gameStatus = 'finished';
			
			this.#sendJson({
				type: "game_update",
				gameState: this.#getGameState(),
				lastMove: { row, col, symbol },
				gameResult: { type: 'tie' }
			});

			this.#sendJson({ type: MsgType.GAME_OVER, winner: "tie" });

			////////////////////////////////////////////////////////////////
			//remember update database here as well (JASON)
			//////////////////////////////////////////////////////////////////
		}
		else
		{
			this.#whosTurn = !this.#whosTurn;
			
			this.#sendJson({
				type: "game_update",
				gameState: this.#getGameState(),
				lastMove: { row, col, symbol }
			});
		}
	}

	registerPlayer(connection){
		// Hardcode max 2 players for now
		if (this.#connectionArray.length == 2) {
			return -1;
		}
		this.#connectionArray.push(connection);
		return this.#connectionArray.length;
	}

	startGame() {
		if (this.#connectionArray.length != 2)
		{
			console.warn("Failed to start XOX game", this.#connectionArray.length);
			return;
		}

		// Initialize game state
		this.#grid = [
			['-', '-', '-'],
			['-', '-', '-'],
			['-', '-', '-']
		];
		this.#gameStatus = 'playing';
		this.#whosTurn = Math.random() < 0.5; // Randomly choose starting player
		this.#clickCounter = 0;

		console.log("First person: ", this.#whosTurn);

		this.#resetIdleTimer();

		// console.log(`XOX Game started. First turn: player ${this.#whosTurn ? 1 : 0}`);

		// Send game_start message to frontend
		this.#sendJson({
			type: "game_start",
			gameState: this.#getGameState(),
			players: this.#emailsArray
		});
	}

	make_move_checker(type, cell, connection) {

		if (this.#gameStatus !== 'playing')
			return;

		if(type === "make_move")
		{
			// Find which player made the move
			this.#connectionArray.forEach((conn, index) => {
				if (conn === connection)
				{
					//check if its  this player's turn
					// Player 0 (index 0) should play when whosTurn is true
					// Player 1 (index 1) should play when whosTurn is false
					if (!((index === 0 && this.#whosTurn === true) || (index === 1 && this.#whosTurn === false)))
					{
						connection.send(JSON.stringify({
							type: "error",
							message: "Not your turn!"
						}));
						return;
					}

					this.#resetIdleTimer();

					// Handle the move (key should contain row and col)
					console.log(cell);
					this.#makeMove(cell.row, cell.col, index);
				}
	   		});
		}
	}

	#resetIdleTimer() {

		//idea is to start a timer and use the timeIntervalId, whenever wanna reset just clear the id and add a new one
		// resets everytime a player makes a move, when a player timeout check whos turn and send the symbol of the timeout person to frontend
		if (this.#idleTimer)
			clearTimeout(this.#idleTimer);
		
		this.#idleTimer = setTimeout(() => {
			//use whos turn to determine who idled
			const idlePlayerSymbol = this.#whosTurn ? 'X' : 'O';
			
			//console.log(`Player with symbol ${idlePlayerSymbol} timed out`);
			
			this.#sendJson({
				type: "idle_timeout",
				idlePlayer: idlePlayerSymbol,
			});
			
			//update playerstats
			const winnerEmail = this.#emailsArray[idlePlayerSymbol == 'X' ? 1 : 0];
			const loserEmail = this.#emailsArray[idlePlayerSymbol == 'X' ? 0 : 1];
			this.#update_playerstats_aftergame(winnerEmail, loserEmail);
			
			this.stopGame();
		}, this.#TURN_TIMEOUT_MS);
	}


	stopGame() {
		this.#connectionArray.forEach((connection) => connection.close());
		this.#connectionArray.length = 0;
		this.#gameStatus = 'finished';
	}

	isGamePlayer(connection) {
		const found = this.#connectionArray.some((conn) => conn === connection);
		return found;
	}

	// Database update function (same pattern as pong)
	#update_playerstats_aftergame(winner_email, loser_email) {

		///////////////////////////////////////////////////////////////
		//FOR JASON TO MODIFY HUHUHUHUHUHUHUH
		///////////////////////////////////////////////////////////

		// the stuff below are wrong lol delete them later

		//update winner
		this.#fastify.betterSqlite3
			.prepare(
				"UPDATE USER SET TOTAL_WIN = TOTAL_WIN + 1, WINNING_STREAK = WINNING_STREAK + 1, RATING = RATING + 5 WHERE EMAIL = ?"
			)
			.run(winner_email);

		//update loser
		this.#fastify.betterSqlite3
			.prepare(
				"UPDATE USER SET TOTAL_LOSE = TOTAL_LOSE + 1, WINNING_STREAK = 0, RATING = CASE WHEN RATING > 0 THEN RATING - 5 ELSE 0 END WHERE EMAIL = ?"
			)
			.run(loser_email);

		//update match history
		const curr_date = new Date().toLocaleDateString(); // 8/5/2025 <- prints in this format
		this.#fastify.betterSqlite3
			.prepare(
				"INSERT INTO PONG_MATCH (date, match_type, user1_email, user1_result, user2_email, user2_result) VALUES (?, ?, ?, ?, ?, ?)"
			)
			.run(curr_date, "xox 1v1", winner_email, 1, loser_email, 0);
	}
}