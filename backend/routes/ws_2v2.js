const root = async function (fastify) {
  fastify.get("/ws_2v2", { websocket: true }, (connection) => {
	//declare vars
	let boardHeight, boardWidth, board_border_width;
	let ball_len, ballX, ballY, dy, dx;
	let block_height,
	  block_width,
	  player_speed,
	  player1Y,
	  player2Y,
	  player3Y,
	  player4Y,
	  player_indent;
	let game_interval_id, game_hit_lock;
	const player_movement = {	"player1_up": false, "player1_down": false, 
								"player2_up": false, "player2_down": false,
								"player3_up": false, "player3_down": false,
								"player4_up": false, "player4_down": false
	 };

	connection.on("message", recv_msg);
	//connection.on('close', handle_close_socket);

	//functions
	function set_starting_pos() {
		ballX = boardWidth / 2;
		ballY = boardHeight / 2;
		player1Y = boardHeight / 4 - block_height / 2;
		player2Y = (3 * boardHeight) / 4 - block_height / 2;
		player3Y = (3 * boardHeight) / 4 - block_height / 2;
		player4Y = boardHeight / 4 - block_height / 2;
	}

	function change_player_pos()
	{
		if (player_movement["player1_down"] == true) {
			if (player1Y + block_height + 2 * board_border_width <= boardHeight)
			player1Y += player_speed;
		}
		if (player_movement["player1_up"] == true) {
			if (player1Y - board_border_width > 0) player1Y -= player_speed;
		}

		if (player_movement["player2_down"] == true) {
			if (player2Y + block_height + 2 * board_border_width <= boardHeight)
			player2Y += player_speed;
		}
		if (player_movement["player2_up"] == true) {
			if (player2Y - board_border_width > 0) player2Y -= player_speed;
		}
		
		if (player_movement["player3_down"] == true) {
			if (player3Y + block_height + 2 * board_border_width <= boardHeight)
			player3Y += player_speed;
		}
		if (player_movement["player3_up"] == true) {
			if (player3Y - board_border_width > 0) player3Y -= player_speed;
		}

		if (player_movement["player4_down"] == true) {
			if (player4Y + block_height + 2 * board_border_width <= boardHeight)
			player4Y += player_speed;
		}
		if (player_movement["player4_up"] == true) {
			if (player4Y - board_border_width > 0) player4Y -= player_speed;
		}
	}

	function game_loop() {
	  //console.log("entered game loop wweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
	  set_starting_pos();
	  clearInterval(game_interval_id);
	  game_interval_id = setInterval(frame, 5);

	  function frame() {
		change_player_pos();
		if (ballX <= ball_len / 2 || ballX + ball_len >= boardWidth) {
		  //game hit border, end game
		  const winner_side = ballX <= ball_len / 2 ? "rightside" : "leftside";
		  clearInterval(game_interval_id);
		  connection.send(JSON.stringify({ type: "game_over", winner: winner_side}));
		} else {
		  if (
			!game_hit_lock &&
			//Math.abs to make detection area bigger to counter ball jump bug
			//added direction conditions like dx < 0 to prevent frenly sabotage lol
			//player 1 (leftest position)
			(dx < 0 && ballX <= player_indent + block_width + Math.abs(dx) &&
			ballX >= player_indent - Math.abs(dx) &&
			ballY + ball_len >= player1Y - 2 &&
			ballY <= player1Y + block_height + 2) ||
			
			//Player 2 (second from left)
			(dx < 0 && ballX <= (player_indent * 8) + block_width + Math.abs(dx) &&
			ballX >= (player_indent * 8) - Math.abs(dx) &&
			ballY + ball_len >= player2Y - 2 &&
			ballY <= player2Y + block_height + 2) ||
			
			//Player 3 (second from right)
			(dx > 0 && ballX + ball_len >= boardWidth - (player_indent * 8) - block_width - Math.abs(dx) &&
			ballX + ball_len <= boardWidth - (player_indent * 8) + Math.abs(dx) &&
			ballY + ball_len >= player3Y - 2 &&
			ballY <= player3Y + block_height + 2) ||
			
			//Player 4(rightest player)
			(dx > 0 && ballX + ball_len >= boardWidth - player_indent - block_width - Math.abs(dx) &&
			ballX + ball_len <= boardWidth - player_indent + Math.abs(dx) &&
			ballY + ball_len >= player4Y - 2 &&
			ballY <= player4Y + block_height + 2)
			) {
			dx = -dx;
			dx *= 1.1;

			//control max speed
			const MAXSPEED = 10;
			dx = dx < MAXSPEED ? dx : MAXSPEED;
			console.log("speed: ", dx);

			dy *= 1 + (Math.random() * 0.2 + (-0.1)); //randomnes for dy
			//dy *= 1.1;
			game_hit_lock = true;
			setTimeout(() => {
			  game_hit_lock = false;
			}, 200); //does exactly wat i want damnnn non blocks and later sets gamelock to false
		  }

		  //check collision wif horizontal walls
		  if (ballY + ball_len >= boardHeight - board_border_width || ballY <= 0) dy = -dy;

		  ballX += dx;
		  ballY += dy;

		  //send game state to frontend
		  const gameState = {
			type: "game_update",
			ballX: ballX,
			ballY: ballY,
			player1Y: player1Y,
			player2Y: player2Y,
			player3Y: player3Y,
			player4Y: player4Y,
			speed_x: dx,
			speed_y: dy
		  };
		  connection.send(JSON.stringify(gameState));
		}
	  }
	}

	function recv_msg(message) {
	  const message_obj = JSON.parse(message.toString());
	  // console.log("Received:", message_obj);

	  if (message_obj.type == "game_init") {
		//init game vars
		boardHeight = message_obj.boardHeight;
		boardWidth = message_obj.boardWidth;
		board_border_width = message_obj.board_border_width;
		block_height = message_obj.block_height;
		block_width = message_obj.block_width;
		player_speed = message_obj.player_speed;
		player_indent = message_obj.player_indent;
		ball_len = message_obj.ball_len;
		dy = message_obj.dy;
		dx = message_obj.dx;

		//start the game
		game_loop();
	  } else if (message_obj.type == "keyup") player_movement[message_obj.action] = false;
	  else if (message_obj.type == "keydown") player_movement[message_obj.action] = true;
	}

	// function handle_close_socket()
	// {
	// 	clearInterval(game_interval_id);
	// }
  });

};

export default root;
