import { MsgType } from "./MessageType.js";

export const defaultGameSetting2v2 = {
  boardWidth: 1000,
  boardHeight: 500,
  board_border_width: 4,
  block_height: 75, // Smaller paddles for 2v2
  block_width: 10,
  player_speed: 5, 
  player_indent: 20,
  ball_len: 15,
  dy: 4, 
  dx: 4,
};

export class GameInstance2v2 {
  #emailsArray = []; // [team1_player1, team1_player2, team2_player1, team2_player2]
  #fastify = null;
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
  // Team 1 (left side) - players 0 and 1
  #leftplayer1Y = 0;
  #leftplayer2Y = 0;
  // Team 2 (right side) - players 2 and 3
  #rightplayer1Y = 0;
  #rightplayer2Y = 0;
  #game_interval_id = 0;
  #game_hit_lock = false;
  
  // Movement state for 4 players
  #player_movement = {
    leftplayer1_up: false,
    leftplayer1_down: false,
    leftplayer2_up: false,
    leftplayer2_down: false,
    rightplayer1_up: false,
    rightplayer1_down: false,
    rightplayer2_up: false,
    rightplayer2_down: false,
  };

  constructor(fastify, players_emails) {
    this.#fastify = fastify;
    this.#emailsArray = players_emails;
  }

  #sendJson(json) {
    this.#connectionArray.forEach((connection) =>
      connection.send(JSON.stringify(json))
    );
  }

  #change_player_pos() {
    // Left team player 1
    if (this.#player_movement["leftplayer1_down"] == true) {
      if (
        this.#leftplayer1Y + this.#block_height + this.#board_border_width <=
        this.#boardHeight
      )
        this.#leftplayer1Y += this.#player_speed;
    }
    if (this.#player_movement["leftplayer1_up"] == true) {
      if (this.#leftplayer1Y - this.#board_border_width > 0)
        this.#leftplayer1Y -= this.#player_speed;
    }

    // Left team player 2
    if (this.#player_movement["leftplayer2_down"] == true) {
      if (
        this.#leftplayer2Y + this.#block_height + this.#board_border_width <=
        this.#boardHeight
      )
        this.#leftplayer2Y += this.#player_speed;
    }
    if (this.#player_movement["leftplayer2_up"] == true) {
      if (this.#leftplayer2Y - this.#board_border_width > 0)
        this.#leftplayer2Y -= this.#player_speed;
    }

    // Right team player 1
    if (this.#player_movement["rightplayer1_down"] == true) {
      if (
        this.#rightplayer1Y + this.#block_height + this.#board_border_width <=
        this.#boardHeight
      )
        this.#rightplayer1Y += this.#player_speed;
    }
    if (this.#player_movement["rightplayer1_up"] == true) {
      if (this.#rightplayer1Y - this.#board_border_width > 0)
        this.#rightplayer1Y -= this.#player_speed;
    }

    // Right team player 2
    if (this.#player_movement["rightplayer2_down"] == true) {
      if (
        this.#rightplayer2Y + this.#block_height + this.#board_border_width <=
        this.#boardHeight
      )
        this.#rightplayer2Y += this.#player_speed;
    }
    if (this.#player_movement["rightplayer2_up"] == true) {
      if (this.#rightplayer2Y - this.#board_border_width > 0)
        this.#rightplayer2Y -= this.#player_speed;
    }
  }

  #frame() {
    this.#change_player_pos();
    
    if (
      this.#ballX <= this.#ball_len / 2 ||
      this.#ballX + this.#ball_len >= this.#boardWidth
    ) {
      // Game hit border, end game
      const winning_team = this.#ballX <= this.#ball_len / 2 ? "team2" : "team1";
      clearInterval(this.#game_interval_id);
      this.#sendJson({ type: MsgType.GAME_OVER, winner: winning_team });

      // Update database
      if (this.#ballX <= this.#ball_len / 2) {
        // Team 2 wins (right side)
        this.#update_team_stats_aftergame(
          [this.#emailsArray[2], this.#emailsArray[3]],
          [this.#emailsArray[0], this.#emailsArray[1]] 
        );
      } else {
        // Team 1 wins (left side)
        this.#update_team_stats_aftergame(
          [this.#emailsArray[0], this.#emailsArray[1]],
          [this.#emailsArray[2], this.#emailsArray[3]]  
        );
      }
    } else {
      // Check paddle collisions - need to check all 4 paddles
      if (
        !this.#game_hit_lock &&
        (
          // Left team player 1 paddle hit (at player_indent position) - ball coming from right
          (this.#dx < 0 && 
           this.#ballX <= this.#player_indent + this.#block_width + Math.abs(this.#dx) &&
           this.#ballX >= this.#player_indent - Math.abs(this.#dx) &&
           this.#ballY + this.#ball_len >= this.#leftplayer1Y - 2 &&
           this.#ballY <= this.#leftplayer1Y + this.#block_height + 2) ||
          
          // Left team player 2 paddle hit (at 8 * player_indent position) - ball coming from right
          (this.#dx < 0 &&
           this.#ballX <= (8 * this.#player_indent) + this.#block_width + Math.abs(this.#dx) &&
           this.#ballX >= (8 * this.#player_indent) - Math.abs(this.#dx) &&
           this.#ballY + this.#ball_len >= this.#leftplayer2Y - 2 &&
           this.#ballY <= this.#leftplayer2Y + this.#block_height + 2) ||
          
          // Right team player 1 paddle hit (at 8 * player_indent from right) - ball coming from left
          (this.#dx > 0 &&
           this.#ballX + this.#ball_len >= this.#boardWidth - (8 * this.#player_indent) - this.#block_width - Math.abs(this.#dx) &&
           this.#ballX + this.#ball_len <= this.#boardWidth - (8 * this.#player_indent) + Math.abs(this.#dx) &&
           this.#ballY + this.#ball_len >= this.#rightplayer1Y - 2 &&
           this.#ballY <= this.#rightplayer1Y + this.#block_height + 2) ||
          
          // Right team player 2 paddle hit (at player_indent from right) - ball coming from left
          (this.#dx > 0 &&
           this.#ballX + this.#ball_len >= this.#boardWidth - this.#player_indent - this.#block_width - Math.abs(this.#dx) &&
           this.#ballX + this.#ball_len <= this.#boardWidth - this.#player_indent + Math.abs(this.#dx) &&
           this.#ballY + this.#ball_len >= this.#rightplayer2Y - 2 &&
           this.#ballY <= this.#rightplayer2Y + this.#block_height + 2)
        )
      ) {
        this.#dx = -this.#dx;
        this.#dx *= 1.1;
        this.#dy *= 1.1;
        this.#game_hit_lock = true;
        setTimeout(() => {
          this.#game_hit_lock = false;
        }, 200);
      }

      // Check collision with horizontal walls
      if (this.#ballY + this.#ball_len >= this.#boardHeight || this.#ballY <= 0)
        this.#dy = -this.#dy;

      this.#ballX += this.#dx;
      this.#ballY += this.#dy;

      // Send game state to frontend with all 4 player positions
      const gameState = {
        type: MsgType.GAME_UPDATE,
        ballX: this.#ballX,
        ballY: this.#ballY,
        leftplayer1Y: this.#leftplayer1Y,
        leftplayer2Y: this.#leftplayer2Y,
        rightplayer1Y: this.#rightplayer1Y,
        rightplayer2Y: this.#rightplayer2Y,
        speed_x: this.#dx,
        speed_y: this.#dy,
      };
      this.#sendJson(gameState);
    }
  }

  registerPlayer(connection) {
    if (this.#connectionArray.length == 4) {
      return -1;
    }
    this.#connectionArray.push(connection);
    return this.#connectionArray.length;
  }

  startGame(data) {
    if (this.#connectionArray.length != 4) {
      console.warn("Failed to start 2v2 game", this.#connectionArray.length);
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
    
    // Position players: 2 on each side
    const quarterHeight = this.#boardHeight / 4;
    this.#leftplayer1Y = quarterHeight - this.#block_height / 2;
    this.#leftplayer2Y = 3 * quarterHeight - this.#block_height / 2;
    this.#rightplayer1Y = 3 * quarterHeight - this.#block_height / 2; 
    this.#rightplayer2Y = quarterHeight - this.#block_height / 2; 

    // Start the game loop
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
            if (key === "w" || key === "ArrowUp") {
              this.#player_movement.leftplayer1_up = type === "keydown";
            } else if (key === "s" || key === "ArrowDown") {
              this.#player_movement.leftplayer1_down = type === "keydown";
            }
          }
          else if (index === 1) {
            if (key === "w" || key === "ArrowUp") {
              this.#player_movement.leftplayer2_up = type === "keydown";
            } else if (key === "s" || key === "ArrowDown") {
              this.#player_movement.leftplayer2_down = type === "keydown";
            }
          }
          else if (index === 2) {
            if (key === "w" || key === "ArrowUp") {
              this.#player_movement.rightplayer1_up = type === "keydown";
            } else if (key === "s" || key === "ArrowDown") {
              this.#player_movement.rightplayer1_down = type === "keydown";
            }
          }
          else if (index === 3) {
            if (key === "w" || key === "ArrowUp") {
              this.#player_movement.rightplayer2_up = type === "keydown";
            } else if (key === "s" || key === "ArrowDown") {
              this.#player_movement.rightplayer2_down = type === "keydown";
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

  // Team-based stats update
  #update_team_stats_aftergame(winning_team_emails, losing_team_emails) {
    // Update winners
    winning_team_emails.forEach(email => {
      this.#fastify.betterSqlite3
        .prepare("UPDATE USER SET TOTAL_WIN = TOTAL_WIN + 1, WINNING_STREAK = WINNING_STREAK + 1, RATING = RATING + 5 WHERE EMAIL = ?")
        .run(email);
    });

    // Update losers
    losing_team_emails.forEach(email => {
      this.#fastify.betterSqlite3
        .prepare("UPDATE USER SET TOTAL_LOSE = TOTAL_LOSE + 1, WINNING_STREAK = 0, RATING = CASE WHEN RATING > 0 THEN RATING - 5 ELSE 0 END WHERE EMAIL = ?")
        .run(email);
    });

    const curr_date = new Date().toLocaleDateString();
    

    this.#fastify.betterSqlite3
      .prepare("INSERT INTO PONG_MATCH (date, match_type, user1_email, user1_result, user2_email, user2_result, user3_email, user3_result, user4_email, user4_result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(
        curr_date, 
        "pong 2v2", 
        winning_team_emails[0], 1, 
        winning_team_emails[1], 1, 
        losing_team_emails[0], 0,
        losing_team_emails[1], 0
      );
  }
}
