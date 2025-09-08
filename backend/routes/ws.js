import {
  OnlineMatchmaking,
  defaultGameSetting,
} from "../class/GameInstance.js";
import { defaultGameSetting2v2 } from "../class/GameInstance2v2.js";
import { MsgType } from "../class/MessageType.js";

const root = async function (fastify) {
  const onlineMatchmaking = new OnlineMatchmaking(fastify); //modifed by ck
  fastify.get("/ws", { websocket: true, onRequest: fastify.verify_session }, (connection) => {
    //declare vars
    let boardHeight, boardWidth, board_border_width;
    let ball_len, ballX, ballY, dy, dx;
    let block_height,
      block_width,
      player_speed,
      rightplayerY,
      leftplayerY,
      player_indent;
    let game_interval_id;
    const player_movement = {
      rightplayer_up: false,
      rightplayer_down: false,
      leftplayer_up: false,
      leftplayer_down: false,
    };

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
      if (player_movement["rightplayer_down"] == true) {
        if (rightplayerY + block_height + 2 * board_border_width <= boardHeight)
          rightplayerY += player_speed;
      }
      if (player_movement["rightplayer_up"] == true) {
        if (rightplayerY - board_border_width > 0) rightplayerY -= player_speed;
      }
      if (player_movement["leftplayer_down"] == true) {
        if (leftplayerY + block_height + 2 * board_border_width <= boardHeight)
          leftplayerY += player_speed;
      }
      if (player_movement["leftplayer_up"] == true) {
        if (leftplayerY - board_border_width > 0) leftplayerY -= player_speed;
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
          const winner_p = ballX <= ball_len / 2 ? "rightplayer" : "leftplayer";
          clearInterval(game_interval_id);
          connection.send(
            JSON.stringify({ type: "game_over", winner: winner_p })
          );
        } else {
          if (
            //Math.abs to make detection area bigger to counter ball jump bug
            ((
				dx < 0 &&
				ballX <= player_indent + block_width + Math.abs(dx) &&
              ballX >= player_indent - Math.abs(dx) &&
              ballY + ball_len >= leftplayerY - 2 &&
              ballY <= leftplayerY + block_height + 2) ||
              //same thing applied here also
              (
				dx > 0 &&
				ballX + ball_len >= boardWidth - player_indent - block_width - Math.abs(dx) &&
                ballX + ball_len <= boardWidth - player_indent + Math.abs(dx) &&
                ballY + ball_len >= rightplayerY - 2 &&
                ballY <= rightplayerY + block_height + 2))
          ) {
            dx = -dx;
            dx *= 1.1;

            //control max speed
            const MAXSPEED = 10;
            dx = dx < MAXSPEED ? dx : MAXSPEED;
            console.log("speed: ", dx);

            dy *= 1 + (Math.random() * 0.2 + -0.1); //randomnes for dy
            //dy *= 1.1;
            // game_hit_lock = true;
            // setTimeout(() => {
            //   game_hit_lock = false;
            // }, 200); //does exactly wat i want damnnn non blocks and later sets gamelock to false
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
            leftplayerY: leftplayerY,
            rightplayerY: rightplayerY,
            speed_x: dx,
            speed_y: dy,
          };
          connection.send(JSON.stringify(gameState));
        }
      }
    }

    function recv_msg(message) {
      const message_obj = fastify.parseJson(message.toString());
      console.log("Received:", message_obj);

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
      } else if (message_obj.type == "keyup")
        player_movement[message_obj.action] = false;
      else if (message_obj.type == "keydown")
        player_movement[message_obj.action] = true;
    }

    // function handle_close_socket()
    // {
    // 	clearInterval(game_interval_id);
    // }
  });

  fastify.get(
    "/ws-online",
    { websocket: true, onRequest: fastify.verify_session },
    (connection, request) => {
      const tournamentId = request.query.tournament;
      const matchId = request.query.match;
	//   console.log("TESTING: TOURNEMENT ID: ", tournamentId, " matchid: ", matchId);

      onlineMatchmaking.registerPlayer(
        fastify.get_email_by_session(request),
        connection,
        2,
        request,
        get_username_from_email(fastify.get_email_by_session(request)),
        {
          isTournamentGame: !!tournamentId, // convert existing value to boolean (true)
          tournamentId: tournamentId,
          matchId: matchId
        },
		'pong'
      );

      connection.on("message", (message) => {
        const message_obj = fastify.parseJson(message.toString());
		// console.log("MESSAGE_OBJ: ", message_obj);
        const player = onlineMatchmaking.getPlayerByConnection(connection);
        if (message_obj.type == MsgType.GAME_START) {
          player.gameInstance?.startGame(defaultGameSetting);
        } else if (
          message_obj.type == "keyup" ||
          message_obj.type == "keydown"
        ) {
          player.gameInstance?.performKeyPress(
            message_obj.type,
            message_obj.key,
            connection
          );
        }
      });

      connection.on("close", () => {
        const player = onlineMatchmaking.getPlayerByConnection(connection);
        if (player.gameInstance) {
          // Stop game if any one player disconnected
          player.gameInstance.handlePlayerDisconnected(connection);
          player.gameInstance = null;
        }
        onlineMatchmaking.removePlayerByConnection(connection);
        request.log.info("Socket disconnect: " + player.email);
      });

	  function get_username_from_email(email)
	  {
		const { USERNAME } = fastify.betterSqlite3
        .prepare("SELECT USERNAME FROM USER WHERE EMAIL = ?")
        .get(email);

		return USERNAME;
	  }
    }
  );

  // Online 2v2 route
  fastify.get(
    "/ws-online-2v2",
    { websocket: true, onRequest: fastify.verify_session },
    (connection, request) => {
      onlineMatchmaking.registerPlayer(
        fastify.get_email_by_session(request),
        connection,
        4, // 4 players for 2v2
        request,
        get_username_from_email(fastify.get_email_by_session(request)),
        {//add this empty object
        },//
        'pong'
      );

      connection.on("message", (message) => {
        const message_obj = fastify.parseJson(message.toString());
        const player = onlineMatchmaking.getPlayerByConnection(connection);
        if (message_obj.type == MsgType.GAME_START) {
          player.gameInstance?.startGame(defaultGameSetting2v2);
        } else if (
          message_obj.type == "keyup" ||
          message_obj.type == "keydown"
        ) {
          player.gameInstance?.performKeyPress(
            message_obj.type,
            message_obj.key,
            connection
          );
        }
      });

      connection.on("close", () => {
        const player = onlineMatchmaking.getPlayerByConnection(connection);
        if (player.gameInstance) {
          player.gameInstance.handlePlayerDisconnected(connection);
          player.gameInstance = null;
        }
        onlineMatchmaking.removePlayerByConnection(connection);

		//send JSON to all players in the lobby that a player has left
        const remainingPlayers = onlineMatchmaking.getWaitingPlayers(4, 'pong');
        remainingPlayers.forEach(player => {
          player.connection.send(JSON.stringify({
            type: MsgType.MATCHMAKING_STATUS,
            status: "Waiting for players",
            gameType: 'pong',
            players: JSON.stringify(remainingPlayers.map(player => player.username)),
          }))
        });

        request.log.info("Socket disconnect: " + player.email);
      });

      function get_username_from_email(email)
      {
        const { USERNAME } = fastify.betterSqlite3
            .prepare("SELECT USERNAME FROM USER WHERE EMAIL = ?")
            .get(email);

        return USERNAME;
      }
    }
  );

  // Online xox route
	fastify.get(
	"/ws-online-xox",
	{ websocket: true, onRequest: fastify.verify_session },
	(connection, request) => {
		onlineMatchmaking.registerPlayer(
		fastify.get_email_by_session(request),
		connection,
		2, // 2 players for XOX
		request,
		get_username_from_email(fastify.get_email_by_session(request)),
		{
			//empty object CUZ WHY NOT (nah srsly need this if not matchmaking cannot register the xox)
        },
		'xox'
		);

		connection.on("message", (message) => {
			const message_obj = fastify.parseJson(message.toString());
			const player = onlineMatchmaking.getPlayerByConnection(connection);
			// console.log("FRONTEND SEND A MESSAGEEEEE: ", message_obj);
			if (message_obj.type == MsgType.GAME_START)
				player.gameInstance?.startGame();
			else if (message_obj.type === "make_move")
			{
				player.gameInstance.make_move_checker(
				message_obj.type,
				message_obj.cell,
				connection
				);
			}
		});

		connection.on("close", () => {
		const player = onlineMatchmaking.getPlayerByConnection(connection);
		if (player.gameInstance) {
			player.gameInstance.handlePlayerDisconnected(connection)
			player.gameInstance = null;
		}
		onlineMatchmaking.removePlayerByConnection(connection);
		request.log.info("Socket disconnect: " + player.email);
		});

		function get_username_from_email(email)
		{
			const { USERNAME } = fastify.betterSqlite3
				.prepare("SELECT USERNAME FROM USER WHERE EMAIL = ?")
				.get(email);

			return USERNAME;
		}
	}
	);
};

export default root;
