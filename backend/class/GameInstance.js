import { MsgType } from "./MessageType.js";
import { GameInstance2v2 } from "./GameInstance2v2.js";

export const defaultGameSetting = {
  boardWidth: 1000,
  boardHeight: 500,
  board_border_width: 4,
  block_height: 150,
  block_width: 10,
  player_speed: 10,
  player_indent: 20,
  ball_len: 15,
  dy: 4,
  dx: 4,
};

export class GameInstance {
  #emailsArray = []; //ck added
  #fastify = null; //ck added
  #connectionArray = [];
  #boardHeight = 0;
  #boardWidth = 0;
  #board_border_width = 0;
  #block_height = 0;
  #block_width = 0;
  #player_speed = 0;
  #player_indent = 0;
  #ball_len = 0;
  #ballX = 0;
  #ballY = 0;
  #dy = 0;
  #dx = 0;
  #rightplayerY = 0;
  #leftplayerY = 0;
  #game_interval_id = 0;
  #game_hit_lock = false;
  #isTournamentGame = false;
  #tournamentId = null;
  #matchId = null;
  #keyDownArray = [
    { ArrowUp: false, ArrowDown: false, w: false, s: false },
    { ArrowUp: false, ArrowDown: false, w: false, s: false },
  ];
  #player_movement = {
    rightplayer_up: false,
    rightplayer_down: false,
    leftplayer_up: false,
    leftplayer_down: false,
  };

  constructor(fastify, players_emails, options = {}) {
    this.#fastify = fastify;
    this.#emailsArray = players_emails;
    this.#isTournamentGame = options.isTournamentGame || false;
    this.#tournamentId = options.tournamentId || null;
    this.#matchId = options.matchId || null;
  }

  #sendJson(json) {
    this.#connectionArray.forEach((connection) =>
      connection.send(JSON.stringify(json))
    );
  }

  #change_player_pos2() {
    if (this.#player_movement["rightplayer_down"] == true) {
      if (
        this.#rightplayerY + this.#block_height + this.#board_border_width <=
        this.#boardHeight
      )
        this.#rightplayerY += this.#player_speed;
    }
    if (this.#player_movement["rightplayer_up"] == true) {
      if (this.#rightplayerY - this.#board_border_width > 0)
        this.#rightplayerY -= this.#player_speed;
    }
    if (this.#player_movement["leftplayer_down"] == true) {
      if (
        this.#leftplayerY + this.#block_height + this.#board_border_width <=
        this.#boardHeight
      )
        this.#leftplayerY += this.#player_speed;
    }
    if (this.#player_movement["leftplayer_up"] == true) {
      if (this.#leftplayerY - this.#board_border_width > 0)
        this.#leftplayerY -= this.#player_speed;
    }
  }

  // Old function. Remove in future
  // eslint-disable-next-line no-unused-private-class-members
  #change_player_pos() {
    this.#keyDownArray.forEach((keyDown, index) => {
      if (index === 0) {
        // Left
        if (keyDown["ArrowDown"] === true) {
          if (
            this.#leftplayerY + this.#block_height + this.#board_border_width <=
            this.#boardHeight
          )
            this.#leftplayerY += this.#player_speed;
        }
        if (keyDown["ArrowUp"] === true) {
          if (this.#leftplayerY - this.#board_border_width > 0)
            this.#leftplayerY -= this.#player_speed;
        }
        if (keyDown["s"] === true) {
          if (
            this.#leftplayerY + this.#block_height + this.#board_border_width <=
            this.#boardHeight
          )
            this.#leftplayerY += this.#player_speed;
        }
        if (keyDown["w"] === true) {
          if (this.#leftplayerY - this.#board_border_width > 0)
            this.#leftplayerY -= this.#player_speed;
        }
      } else if (index === 1) {
        // Left
        if (keyDown["ArrowDown"] === true) {
          if (
            this.#rightplayerY +
              this.#block_height +
              this.#board_border_width <=
            this.#boardHeight
          )
            this.#rightplayerY += this.#player_speed;
        }
        if (keyDown["ArrowUp"] === true) {
          if (this.#rightplayerY - this.#board_border_width > 0)
            this.#rightplayerY -= this.#player_speed;
        }
        if (keyDown["s"] === true) {
          if (
            this.#rightplayerY +
              this.#block_height +
              this.#board_border_width <=
            this.#boardHeight
          )
            this.#rightplayerY += this.#player_speed;
        }
        if (keyDown["w"] === true) {
          if (this.#rightplayerY - this.#board_border_width > 0)
            this.#rightplayerY -= this.#player_speed;
        }
      }
    });
  }

  #frame() {
    this.#change_player_pos2();
    if (
      this.#ballX <= this.#ball_len / 2 ||
      this.#ballX + this.#ball_len >= this.#boardWidth
    ) {
      //game hit border, end game
      const winner_p =
        this.#ballX <= this.#ball_len / 2 ? "rightplayer" : "leftplayer";
      clearInterval(this.#game_interval_id);

      const winner_email = winner_p === "leftplayer" ? this.#emailsArray[0] : this.#emailsArray[1];
      const loser_email = winner_p === "leftplayer" ? this.#emailsArray[1] : this.#emailsArray[0];

      this.#sendJson({
        type: MsgType.GAME_OVER,
        winner: winner_p,
        winner_email: winner_email,
        loser_email: loser_email,
        tournament_id: this.#tournamentId,
        match_id: this.#matchId
      });

      //update db only for non-tournament games
      if (!this.#isTournamentGame) {
        if (this.#ballX <= this.#ball_len / 2)
        this.#update_playerstats_aftergame(
          this.#emailsArray[1],
          this.#emailsArray[0]
        );
      else
        this.#update_playerstats_aftergame(
          this.#emailsArray[0],
          this.#emailsArray[1]
        );
      }
    } else {
      if (
        !this.#game_hit_lock &&
        //left paddle hit
        //Math.abs to make detection area bigger to counter ball jump bug
        ((this.#ballX <=
          this.#player_indent + this.#block_width + Math.abs(this.#dx) &&
          this.#ballX >= this.#player_indent - Math.abs(this.#dx) &&
          this.#ballY + this.#ball_len >= this.#leftplayerY - 2 &&
          this.#ballY <= this.#leftplayerY + this.#block_height + 2) ||
          //same thing applied here also
          (this.#ballX + this.#ball_len >=
            this.#boardWidth -
              this.#player_indent -
              this.#block_width -
              Math.abs(this.#dx) &&
            this.#ballX + this.#ball_len <=
              this.#boardWidth - this.#player_indent + Math.abs(this.#dx) &&
            this.#ballY + this.#ball_len >= this.#rightplayerY - 2 &&
            this.#ballY <= this.#rightplayerY + this.#block_height + 2))
      ) {
        this.#dx = -this.#dx;
        this.#dx *= 1.1;
        this.#dy *= 1.1;
        this.#game_hit_lock = true;
        setTimeout(() => {
          this.#game_hit_lock = false;
        }, 200); //does exactly wat i want damnnn non blocks and later sets gamelock to false
      }

      //check collision wif horizontal walls
      if (this.#ballY + this.#ball_len >= this.#boardHeight || this.#ballY <= 0)
        this.#dy = -this.#dy;

      this.#ballX += this.#dx;
      this.#ballY += this.#dy;

      //send game state to frontend
      const gameState = {
        type: MsgType.GAME_UPDATE,
        // Send in this format:
        // [ballX, ballY, leftPlayerY, rightPlayerY, speed_x, speed_y]
        d: [
          parseFloat(this.#ballX.toFixed(2)),
          parseFloat(this.#ballY.toFixed(2)),
          this.#leftplayerY,
          this.#rightplayerY,
          parseFloat(this.#dx.toFixed(2)),
          parseFloat(this.#dy.toFixed(2)),
        ],
      };
      this.#sendJson(gameState);
    }
  }

  registerPlayer(connection) {
    // Hardcode max 2 players for now
    if (this.#connectionArray.length == 2) {
      return -1;
    }
    this.#connectionArray.push(connection);
    return this.#connectionArray.length;
  }

  startGame(data) {
    if (this.#connectionArray.length != 2) {
      console.warn("Failed to start game", this.#connectionArray.length);
      return;
    }
    this.#boardHeight = data.boardHeight;
    this.#boardWidth = data.boardWidth;
    this.#board_border_width = data.board_border_width;
    this.#block_height = data.block_height;
    this.#block_width = data.block_width;
    this.#player_speed = data.player_speed;
    this.#player_indent = data.player_indent;
    this.#ball_len = data.ball_len;
    this.#dy = data.dy;
    this.#dx = data.dx;

    this.#ballX = this.#boardWidth / 2;
    this.#ballY = this.#boardHeight / 2;
    this.#rightplayerY = this.#boardHeight / 2 - this.#block_height / 2;
    this.#leftplayerY = this.#boardHeight / 2 - this.#block_height / 2;

    // Bind is needed to modify 'this' to the class instance
    this.#game_interval_id = setInterval(this.#frame.bind(this), 10);
  }

  performKeyPress(type, key, connection) {
    this.#connectionArray.forEach((conn, index) => {
      if (conn === connection) {
        if (
          key === "w" ||
          key === "s" ||
          key === "ArrowUp" ||
          key === "ArrowDown"
        ) {
          if (index === 0) {
            // Left
            if (key === "w" || key === "ArrowUp") {
              this.#player_movement.leftplayer_up = type === "keydown";
            } else if (key === "s" || key === "ArrowDown") {
              this.#player_movement.leftplayer_down = type === "keydown";
            }
          } else {
            // Right
            if (key === "w" || key === "ArrowUp") {
              this.#player_movement.rightplayer_up = type === "keydown";
            } else if (key === "s" || key === "ArrowDown") {
              this.#player_movement.rightplayer_down = type === "keydown";
            }
          }
        }
      }
    });
  }

  stopGame() {
    clearInterval(this.#game_interval_id);
    this.#connectionArray.forEach((connection) => connection.close());
    this.#connectionArray.length = 0;
  }

  isGamePlayer(connection) {
    const found = this.#connectionArray.some((conn) => conn === connection);
    return found;
  }

  //functions ck coded:

  #update_playerstats_aftergame(winner_email, loser_email) {
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
      .run(curr_date, "pong 1v1", winner_email, 1, loser_email, 0);

    //personal notes:
    // fields: TOTAL_WIN TOTAL_LOSE WINNING_STREAK RATING
    // case when else statement = if else statement (CASE WHEN condition THEN value ELSE other_value END)
  }
}

class Player {
  email;
  connection;
  gameNoOfPlayers; // gameNoOfPlayers of 2 (1v1) or 4 (2v2)
  gameInstance;
  request;
  username;

  constructor(email, connection, gameNoOfPlayers, request, username) {
    this.email = email;
    this.connection = connection;
    this.gameNoOfPlayers = gameNoOfPlayers;
    this.request = request;
    this.username = username;
  }
}

export class OnlineMatchmaking {
  #playerArray = [];
  #fastify = null;

  constructor(fastify) {
    this.#fastify = fastify;
  }

  registerPlayer(email, connection, gameNoOfPlayers, request, username) {
    // console.log(`[DEBUG] registerPlayer called: ${email}, gameNoOfPlayers: ${gameNoOfPlayers}`);
    // console.log(`[DEBUG] Current player array length: ${this.#playerArray.length}`);
    
    this.#playerArray.push(
      new Player(email, connection, gameNoOfPlayers, request, username)
    );
    request.log.info("OnlineMatchmaking registered: " + email);
    
    const nonPlayingPlayers = this.#playerArray.filter(
      (player) => !player.gameInstance
    );
    
    // console.log(`[DEBUG] Non-playing players: ${nonPlayingPlayers.length}`);
    
    // Find all players waiting for the same game mode
    const playersWaitingForSameMode = nonPlayingPlayers.filter(
      (player) => player.gameNoOfPlayers === gameNoOfPlayers
    );
    
    // console.log(`[DEBUG] Players waiting for same mode (${gameNoOfPlayers}): ${playersWaitingForSameMode.length}`);
    // console.log(`[DEBUG] Player emails in same mode: ${playersWaitingForSameMode.map(p => p.email).join(', ')}`);
    
    const pendingPlayerLobby = playersWaitingForSameMode;
    const gameLobbySize = gameNoOfPlayers;
    if (pendingPlayerLobby.length === gameLobbySize) {   
      let gameInstance;
      if (gameLobbySize === 2) {
        gameInstance = new GameInstance(this.#fastify, pendingPlayerLobby.map((player) => player.email));
      } else if (gameLobbySize === 4) {
        gameInstance = new GameInstance2v2(this.#fastify, pendingPlayerLobby.map((player) => player.email));
      }
      
      pendingPlayerLobby.forEach((player, index) => {
        player.gameInstance = gameInstance;
        const playerId = gameInstance.registerPlayer(player.connection);
        request.log.info("GameInstance registered player: " + playerId);
        
        // Send player assignment first
        player.connection.send(
          JSON.stringify({
            type: "player_assigned",
            player_index: index
          })
        );
        
        // Then send lobby full status
        player.connection.send(
          JSON.stringify({
            // type: MsgType.GAME_INIT,
            // ...defaultGameSetting,
            // playerId,

            type: MsgType.MATCHMAKING_STATUS,
            status: "Lobby full",
            players: JSON.stringify(
              pendingPlayerLobby.map((player) => player.username)
            ),
          })
        );
      });
    } else {

      // push pending status to ALL players in the lobby
//       const statusMessage = JSON.stringify({
//         type: MsgType.MATCHMAKING_STATUS,
//         status: "Waiting for players",
//         players: JSON.stringify(pendingPlayerLobby.map((player) => player.username)),
//       });
      
//       // Send update to all players in the current lobby
//       pendingPlayerLobby.forEach((player) => {
//         player.connection.send(statusMessage);
//       });

      // push pending status
      connection.send(
        JSON.stringify({
          type: MsgType.MATCHMAKING_STATUS,
          status: "Waiting for players",
          players: JSON.stringify(
            pendingPlayerLobby.map((player) => player.username)
          ),
        })
      );

    }
  }

  getPlayerByConnection(connection) {
    return this.#playerArray.find((player) => player.connection === connection);
  }

  removePlayerByConnection(connection) {
    const index = this.#playerArray.findIndex(
      (player) => player.connection === connection
    );
    if (index > -1) {
      this.#playerArray.splice(index, 1);
    }
  }
}
