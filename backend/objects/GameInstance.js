export class GameInstance {
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
  #keyDownArray = [
    { ArrowUp: false, ArrowDown: false, w: false, s: false },
    { ArrowUp: false, ArrowDown: false, w: false, s: false },
  ];

  #sendJson(json) {
    this.#connectionArray.forEach((connection) =>
      connection.send(JSON.stringify(json))
    );
  }

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
    this.#change_player_pos();
    if (
      this.#ballX <= 0 ||
      this.#ballX + this.#ball_len + this.#board_border_width * 2 >=
        this.#boardWidth
    ) {
      //game hit border, end game
      clearInterval(this.#game_interval_id);
      this.#sendJson({ type: "game_over" });
    } else {
      if (
        !this.#game_hit_lock &&
        //left paddle hit
        ((this.#ballX <= this.#player_indent + this.#block_width + 2 &&
          this.#ballX >= this.#player_indent - 2 &&
          this.#ballY + this.#ball_len >= this.#leftplayerY - 2 &&
          this.#ballY <= this.#leftplayerY + this.#block_height + 2) ||
          //right paddle hit
          (this.#ballX + this.#ball_len >=
            this.#boardWidth - this.#player_indent - this.#block_width - 2 &&
            this.#ballX + this.#ball_len <=
              this.#boardWidth - this.#player_indent + 2 &&
            this.#ballY + this.#ball_len >= this.#rightplayerY - 2 &&
            this.#ballY <= this.#rightplayerY + this.#block_height + 2))
      ) {
        this.#dx = -this.#dx;
        this.#dx *= 1.1;
        this.#dy *= 1.1;
        this.#game_hit_lock = true;
        setTimeout(() => {
          this.#game_hit_lock = false;
        }, 1000); //does exactly wat i want damnnn non blocks and later sets gamelock to false
      }

      //check collision wif horizontal walls
      if (
        this.#ballY + this.#ball_len + this.#board_border_width * 2 >=
          this.#boardHeight ||
        this.#ballY <= 0
      )
        this.#dy = -this.#dy;

      this.#ballX += this.#dx;
      this.#ballY += this.#dy;

      //send game state to frontend
      const gameState = {
        type: "game_update",
        ballX: this.#ballX,
        ballY: this.#ballY,
        leftplayerY: this.#leftplayerY,
        rightplayerY: this.#rightplayerY,
      };
      this.#sendJson(gameState);
    }
  }

  registerPlayer(connection) {
    if (this.#connectionArray.length == 2) {
      connection.close();
      return -1;
    }
    this.#connectionArray.push(connection);
    this.#sendJson({
      type: "player_count",
      count: this.#connectionArray.length,
    });
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
          this.#keyDownArray[index][key] = type === "keydown";
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
}
