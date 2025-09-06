// Fastify Tic-Tac-Toe Backend - Local Play with Backend Logic
const root = async function (fastify) {
  
	fastify.get("/ws_xox", { websocket: true, onRequest: fastify.verify_session }, (connection) => {

		//Game state vars (moved from frontend)
		let whosTurn;
		let grid;
		let clickCounter;
		let gameStatus;
		let winner;
		let loser;
		let player1Name = "Player 1";
		let player2Name = "Player 2";
		
		const winPatterns = [
			[[0,0],[0,1],[0,2]],
			[[1,0],[1,1],[1,2]],
			[[2,0],[2,1],[2,2]],
			[[0,0],[1,0],[2,0]],
			[[0,1],[1,1],[2,1]],
			[[0,2],[1,2],[2,2]],
			[[0,0],[1,1],[2,2]],
			[[0,2],[1,1],[2,0]]
		];

		connection.on("message", recv_msg);
		
		function recv_msg(message)
		{
			const message_obj = fastify.parseJson(message.toString());
			//console.log("Received:", message_obj);
			if(message_obj.type === "start_game")
				handleStartGame(message_obj);
			else if(message_obj.type === "make_move")
				handleMakeMove(message_obj);
		}

		function handleStartGame(messageObj)
		{
			player1Name = messageObj.player1Name || "Player 1";
			player2Name = messageObj.player2Name || "Player 2";
			
			clickCounter = 0;
			whosTurn = Math.random() < 0.5;
			gameStatus = 'playing';
			winner = null;
			
			grid = [
				['-', '-', '-'],
				['-', '-', '-'],
				['-', '-', '-']
			];

			connection.send(JSON.stringify({
				type: "game_start",
				gameState: {
					grid: grid,
					whosTurn: whosTurn,
					gameStatus: gameStatus,
					player1Name: player1Name,
					player2Name: player2Name,
					clickCounter: clickCounter
				}
			}));
		}

		function handleMakeMove(messageObj)
		{
			const row = messageObj.row;
			const col = messageObj.col;

			if (gameStatus !== 'playing')
			{
				connection.send(JSON.stringify({
					type: "error",
					message: "Game not in progress"
				}));
				return;
			}

			if (grid[row][col] !== '-')
			{
				connection.send(JSON.stringify({
					type: "error",
					message: "Cell already occupied"
				}));
				return;
			}

			const current_symbol = whosTurn ? 'X' : 'O';
			grid[row][col] = current_symbol;
			clickCounter++;

			const winPatternIndex = checkWinner(current_symbol);
			let gameResult = null;

			if (winPatternIndex !== -1)
			{
				gameStatus = 'finished';
				winner = whosTurn ? player1Name : player2Name;
				loser = whosTurn ? player2Name : player1Name;
				gameResult = {
					type: 'winner',
					winner: winner,
					loser: loser,
					winnerSymbol: current_symbol,
					winPattern: winPatterns[winPatternIndex]
				};
			}
			else if (clickCounter === 9)
			{
				gameStatus = 'finished';
				gameResult = {
					type: 'tie'
				};
			}

			//switch turns
			if (gameStatus === 'playing')
				whosTurn = !whosTurn;

			// Send updated game state to frontend
			connection.send(JSON.stringify({
				type: "move_result",
				gameState: {
					grid: grid,
					whosTurn: whosTurn,
					gameStatus: gameStatus,
					player1Name: player1Name,
					player2Name: player2Name,
					clickCounter: clickCounter
				},
				lastMove: {
					row: row,
					col: col,
					symbol: current_symbol
				},
				gameResult: gameResult //gameResult is null unless there game ends
			}));
		}

		function checkWinner(symbol)
		{
			return winPatterns.findIndex(pattern => 
				pattern.every(([row, col]) => grid[row][col] === symbol)
			);
		}
	});
};

export default root;