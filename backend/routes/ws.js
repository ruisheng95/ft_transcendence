const fp = require("fastify-plugin");
const websocket = require('@fastify/websocket');

async function websocketPlugin(fastify, opts)
{
	await fastify.register(websocket); //need use async await if not somehow it will skip this register function and the websocket wont be initialised bruh

	fastify.get("/ws", { websocket: true }, (connection, req) => {

		//declare vars
		let boardHeight, boardWidth, board_border_width;
		let ball_len, ballX, ballY, dy, dx;
		let block_height, block_width, player_speed, rightplayerY, leftplayerY, player_indent;
		let game_interval_id, game_hit_lock;
		const key_down = {ArrowUp: false, ArrowDown: false, w: false, s: false};

		connection.on('message', recv_msg);
		//connection.on('close', handle_close_socket);

		//functions
		function set_starting_pos()
		{
			ballX = boardWidth / 2;
			ballY = boardHeight / 2;
			rightplayerY = boardHeight / 2 - (block_height / 2);
			leftplayerY = boardHeight / 2 - (block_height / 2);
		}

		function change_player_pos()
		{
			if(key_down["ArrowDown"] == true)
			{
				if(rightplayerY + block_height + board_border_width <= boardHeight)
					rightplayerY += player_speed;
			}
			if(key_down["ArrowUp"] == true)
			{
				if(rightplayerY - board_border_width > 0)
					rightplayerY -= player_speed;
			}
			if(key_down["s"] == true)
			{
				if(leftplayerY + block_height + board_border_width <= boardHeight)
					leftplayerY += player_speed;
			}
			if(key_down["w"] == true)
			{
				if(leftplayerY - board_border_width > 0)
					leftplayerY -= player_speed;
			}
		}

		function game_loop()
		{
			//console.log("entered game loop wweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
			set_starting_pos();
			clearInterval(game_interval_id);
			game_interval_id = setInterval(frame, 10);
			
			function frame()
			{
				change_player_pos();
				if(ballX <= ball_len / 2 || ballX + ball_len >= boardWidth) //game hit border, end game
				{
					clearInterval(game_interval_id);
					connection.send(JSON.stringify({type: "game_over"}));
				}
				else
				{
					if (!game_hit_lock && (
						//left paddle hit
						(ballX <= player_indent + block_width + 2 && ballX >= player_indent - 2 &&
						ballY + ball_len >= leftplayerY - 2 && ballY <= leftplayerY + block_height + 2) ||
						
						//right paddle hit
						(ballX + ball_len >= (boardWidth - player_indent) - block_width - 2 && 
						ballX + ball_len <= (boardWidth - player_indent) + 2 &&
						ballY + ball_len >= rightplayerY - 2 && ballY <= rightplayerY + block_height + 2)
					)) {
						dx = -dx;
						dx *= 1.1;
						dy *= 1.1;
						game_hit_lock = true;
						setTimeout(() => { game_hit_lock = false; }, 1000); //does exactly wat i want damnnn non blocks and later sets gamelock to false
					}

					//check collision wif horizontal walls
					if (ballY + ball_len >= boardHeight || ballY <= 0)
						dy = -dy;

					ballX += dx;
					ballY += dy;

					//send game state to frontend
					const gameState = {
						type: "game_update",
						ballX: ballX,
						ballY: ballY,
						leftplayerY: leftplayerY,
						rightplayerY: rightplayerY
					}
					connection.send(JSON.stringify(gameState));
				}
			}
		}

		function recv_msg(message)
		{
			const message_obj = JSON.parse(message.toString());
			// console.log("Received:", message_obj);

			if(message_obj.type == "game_init")
			{
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
			}
			else if(message_obj.type == "keyup")
				key_down[message_obj.key] = false;
			else if(message_obj.type == "keydown")
				key_down[message_obj.key] = true;
		}

		// function handle_close_socket()
		// {
		// 	clearInterval(game_interval_id);
		// }
	});
}

module.exports = fp(websocketPlugin);