import "./game-online.css";

//prep stuffssss
const id = new URLSearchParams(window.location.search).get("id");
let socket: WebSocket | undefined = undefined;
let reconnectCount = 0;

const game_obj = document.querySelector<HTMLDivElement>("#game");

if (game_obj)
  game_obj.innerHTML = `

<center>
<div id = "board">
    <div id = "ball"></div>
    <div id = "leftplayer"></div>
    <div id = "rightplayer"></div>
</div>
</center>
`;

const start_game_button =
  document.querySelector<HTMLButtonElement>("#start_game_button");
const board = document.querySelector<HTMLDivElement>("#board");
const rightplayer = document.querySelector<HTMLDivElement>("#rightplayer");
const leftplayer = document.querySelector<HTMLDivElement>("#leftplayer");
const ball = document.querySelector<HTMLDivElement>("#ball");
const status = document.getElementById("status");

//bruh stupid ts
if (!board) throw new Error("board element not found");
if (!rightplayer) throw new Error("rightplayer element not found");
if (!leftplayer) throw new Error("leftplayer element not found");
if (!ball) throw new Error("ball element not found");
if (!start_game_button) throw new Error("start game button element not found");
if (!status) throw new Error("status element not found");

//init them vars from the css / html

//ball stuff
// let ball_len = ball.clientWidth;
let ballX = board.clientWidth / 2;
let ballY = board.clientHeight / 2;
// let dy = 4;
// let dx = 4;

//board stuff
// let boardHeight = board.clientHeight;
// let boardWidth = board.clientWidth;
// let board_border_width = parseInt(getComputedStyle(board).borderLeftWidth);

//players settings
let block_height = rightplayer.clientHeight;
// let block_width = rightplayer.clientWidth;
// let player_speed = 10;
let rightplayerY = board.clientHeight / 2 - block_height / 2;
let leftplayerY = board.clientHeight / 2 - block_height / 2;
let player_indent = 20;
let playerId = 0;

render_positions(ballX, ballY, leftplayerY, rightplayerY);
connectWebsocket();
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
start_game_button.addEventListener("click", start_the_fkin_game);

//functions

function start_the_fkin_game() {
  if (start_game_button) {
    start_game_button.disabled = true;
    start_game_button.style.color = "grey";
    start_game_button.style.borderColor = "grey";
  }

  //send Start Game JSON to backend
  if (socket?.readyState === WebSocket.OPEN)
    socket.send(JSON.stringify({ type: "game_start" }));
}

function process_msg_from_socket(message: MessageEvent) {
  const msg_obj = JSON.parse(message.data);

  if (msg_obj.type === "game_update")
    render_positions(
      msg_obj.ballX,
      msg_obj.ballY,
      msg_obj.leftplayerY,
      msg_obj.rightplayerY
    );
  else if (msg_obj.type === "game_over") {
    if (start_game_button && playerId === 1) {
      start_game_button.disabled = false;
      start_game_button.style.color = "white";
      start_game_button.style.borderColor = "white";
    }
  } else if (msg_obj.type === "game_init") {
    if (board && rightplayer && status) {
      board.style.height = `${msg_obj.boardHeight}px`;
      board.style.width = `${msg_obj.boardWidth}px`;
      board.style.borderWidth = `${msg_obj.board_border_width}px`;
      rightplayer.style.height = `${msg_obj.block_height}px`;
      rightplayer.style.width = `${msg_obj.block_width}px`;
      player_indent = msg_obj.player_indent;
      status.innerHTML = `You are player ${msg_obj.playerId} (${
        msg_obj.playerId === 1 ? "left" : "right"
      })`;
      playerId = msg_obj.playerId;
      initVariables();
      render_positions(ballX, ballY, leftplayerY, rightplayerY);
    }
  } else if (msg_obj.type === "player_count") {
    if (msg_obj.count === 2 && start_game_button && playerId === 1) {
      start_game_button.disabled = false;
      start_game_button.style.color = "white";
      start_game_button.style.borderColor = "white";
    }
  }
}

function render_positions(
  ballX: number,
  ballY: number,
  leftplayerY: number,
  rightplayerY: number
) {
  if (ball && leftplayer && rightplayer) {
    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";

    rightplayer.style.right = player_indent + "px";
    rightplayer.style.top = rightplayerY + "px";

    leftplayer.style.left = player_indent + "px";
    leftplayer.style.top = leftplayerY + "px";
  }
}

function handleKeyDown(key_pressed: KeyboardEvent) {
  if (socket?.readyState === WebSocket.OPEN) {
    const keydown_obj = {
      type: "keydown",
      key: key_pressed.key,
    };
    socket.send(JSON.stringify(keydown_obj));
  }
}

function handleKeyUp(key_pressed: KeyboardEvent) {
  if (socket?.readyState === WebSocket.OPEN) {
    const keyup_obj = {
      type: "keyup",
      key: key_pressed.key,
    };
    socket.send(JSON.stringify(keyup_obj));
  }
}

function connectWebsocket() {
  socket = new WebSocket(import.meta.env.VITE_SOCKET_URL + (id ? `?id=${id}` : ""));
  socket.addEventListener("message", process_msg_from_socket);
  socket.addEventListener("close", () => {
    // Reconnect on socket close
    if (status) {
      status.innerHTML = "Connecting...";
      if (start_game_button) {
        start_game_button.disabled = true;
        start_game_button.style.color = "grey";
        start_game_button.style.borderColor = "grey";
      }
      reconnectCount++;
      if (reconnectCount <= 5) {
        setTimeout(function () {
          connectWebsocket();
        }, 1000);
      } else {
        status.innerHTML = "Max reconnect retries. Please refresh the page";
      }
    }
  });
}

function initVariables() {
  const boarderWidth = parseInt(
    board ? getComputedStyle(board).borderLeftWidth : "4"
  );

  //ball stuff
  //   ball_len = ball?.clientWidth || 15;
  ballX = ((board?.clientWidth || 600) + boarderWidth * 2) / 2;
  ballY = ((board?.clientHeight || 600) + boarderWidth * 2) / 2;
  //   dy = 4;
  //   dx = 4;

  //board stuff
  //   boardHeight = board?.clientHeight || 600;
  //   boardWidth = board?.clientWidth || 600;

  //players settings
  block_height = rightplayer?.clientHeight || 150;
  //   block_width = rightplayer?.clientWidth || 10;
  //   player_speed = 10;
  rightplayerY =
    ((board?.clientHeight || 600) + boarderWidth * 2) / 2 - block_height / 2;
  leftplayerY =
    ((board?.clientHeight || 600) + boarderWidth * 2) / 2 - block_height / 2;
}
