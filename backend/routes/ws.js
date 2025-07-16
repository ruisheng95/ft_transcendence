import { GameInstance } from "../objects/GameInstance.js";

const root = async function (fastify) {
	  const gameLobby = {};
  const defaultGameSetting = {
    boardWidth: 1120,
    boardHeight: 630,
    board_border_width: 4,
    block_height: 150,
    block_width: 10,
    player_speed: 10,
    player_indent: 20,
    ball_len: 15,
    dy: 4,
    dx: 4,
  };
  fastify.get("/ws", { websocket: true }, (connection) => {
    //declare vars
    let boardHeight, boardWidth, board_border_width;
    let ball_len, ballX, ballY, dy, dx;
    let block_height,
      block_width,
      player_speed,
      rightplayerY,
      leftplayerY,
      player_indent;
    let game_interval_id, game_hit_lock;
    const key_down = { ArrowUp: false, ArrowDown: false, w: false, s: false };

    connection.on("message", recv_msg);
    //connection.on('close', handle_close_socket);

    //functions
    function set_starting_pos() {
      ballX = boardWidth / 2;
      ballY = boardHeight / 2;
      rightplayerY = boardHeight / 2 - block_height / 2;
      leftplayerY = boardHeight / 2 - block_height / 2;
    }

    function change_player_pos() {
      if (key_down["ArrowDown"] == true) {
        if (rightplayerY + block_height + board_border_width <= boardHeight)
          rightplayerY += player_speed;
      }
      if (key_down["ArrowUp"] == true) {
        if (rightplayerY - board_border_width > 0) rightplayerY -= player_speed;
      }
      if (key_down["s"] == true) {
        if (leftplayerY + block_height + board_border_width <= boardHeight)
          leftplayerY += player_speed;
      }
      if (key_down["w"] == true) {
        if (leftplayerY - board_border_width > 0) leftplayerY -= player_speed;
      }
    }

    function game_loop() {
      //console.log("entered game loop wweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
      set_starting_pos();
      clearInterval(game_interval_id);
      game_interval_id = setInterval(frame, 10);

      function frame() {
        change_player_pos();
        if (ballX <= ball_len / 2 || ballX + ball_len >= boardWidth) {
          //game hit border, end game
          clearInterval(game_interval_id);
          connection.send(JSON.stringify({ type: "game_over" }));
        } else {
          if (
			!game_hit_lock &&
			//Math.abs to make detection area bigger to counter ball jump bug
			((ballX <= player_indent + block_width + Math.abs(dx) &&
				ballX >= player_indent - Math.abs(dx) &&
				ballY + ball_len >= leftplayerY - 2 &&
				ballY <= leftplayerY + block_height + 2) ||
				//same thing applied here also
				(ballX + ball_len >= boardWidth - player_indent - block_width - Math.abs(dx) &&
				ballX + ball_len <= boardWidth - player_indent + Math.abs(dx) &&
				ballY + ball_len >= rightplayerY - 2 &&
				ballY <= rightplayerY + block_height + 2))
			) {
            dx = -dx;
            dx *= 1.1;

			//control max speed
			const MAXSPEED = 16;
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
          if (ballY + ball_len >= boardHeight || ballY <= 0) dy = -dy;

          ballX += dx;
          ballY += dy;

          //send game state to frontend
          const gameState = {
            type: "game_update",
            ballX: ballX,
            ballY: ballY,
            leftplayerY: leftplayerY,
            rightplayerY: rightplayerY,
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
      } else if (message_obj.type == "keyup") key_down[message_obj.key] = false;
      else if (message_obj.type == "keydown") key_down[message_obj.key] = true;
    }

    // function handle_close_socket()
    // {
    // 	clearInterval(game_interval_id);
    // }
  });

  fastify.get("/ws-online", { websocket: true }, (connection, request) => {
    const id = request.query.id || "123";
    if (!gameLobby[id]) {
      gameLobby[id] = new GameInstance();
    }
    const playerId = gameLobby[id].registerPlayer(connection);
    if (playerId > 0) {
      request.log.info("Registered player " + playerId);
      setTimeout(function () {
        connection.send(
          JSON.stringify({
            type: "game_init",
            ...defaultGameSetting,
            playerId,
          })
        );
      }, 200);
    }

    connection.on("message", recv_msg);
    function recv_msg(message) {
      const message_obj = JSON.parse(message.toString());

      if (message_obj.type == "game_start") {
        if (gameLobby[id]) {
          gameLobby[id].startGame(defaultGameSetting);
        }
      } else if (message_obj.type == "keyup" || message_obj.type == "keydown") {
        if (gameLobby[id]) {
          gameLobby[id].performKeyPress(
            message_obj.type,
            message_obj.key,
            connection
          );
        }
      }
    }

    connection.on("close", () => {
      // id need to redeclare here due to closure
      const id = request.query.id || "123";
      const game = gameLobby[id];
      if (game) {
        // Stop game if any one player disconnected
        if (game.isGamePlayer(connection)) {
          game.stopGame();
          delete gameLobby[id];
        }
      }
    });
  });

};

export default root;
