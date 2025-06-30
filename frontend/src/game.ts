import "./gamestyle.css";


//prep stuffssss
const socket = new WebSocket("ws://localhost:3000/ws");

const game_obj = document.querySelector<HTMLDivElement>("#game");

if(game_obj)
    game_obj.innerHTML = `
<button id = "start_game_button" type="button" >Start game</button>
<center>
<div id = "board">
    <div id = "ball"></div>
    <div id = "leftplayer"></div>
    <div id = "rightplayer"></div>
</div>
</center>
`;

const start_game_button = document.querySelector<HTMLButtonElement>("#start_game_button");
const board = document.querySelector<HTMLDivElement>("#board");
const rightplayer = document.querySelector<HTMLDivElement>("#rightplayer");
const leftplayer = document.querySelector<HTMLDivElement>("#leftplayer");
const ball = document.querySelector<HTMLDivElement>("#ball");

//bruh stupid ts
if (!board) throw new Error("board element not found");
if (!rightplayer) throw new Error("rightplayer element not found");
if (!leftplayer) throw new Error("leftplayer element not found");
if (!ball) throw new Error("ball element not found");
if (!start_game_button) throw new Error("start game button element not found");


//init them vars from the css / html

//ball stuff
const ball_len = ball.clientWidth;
const ballX = board.clientWidth / 2;
const ballY = board.clientHeight / 2;
const dy = 4;
const dx = 4;

//board stuff
const boardHeight = board.clientHeight;
const boardWidth = board.clientWidth;
const board_border_width = parseInt(getComputedStyle(board).borderLeftWidth);

//players settings
const block_height = rightplayer.clientHeight;
const block_width = rightplayer.clientWidth;
const player_speed = 10;
const rightplayerY = board.clientHeight / 2 - (block_height / 2);
const leftplayerY = board.clientHeight / 2 - (block_height / 2);
const player_indent = 20;


render_positions(ballX, ballY, leftplayerY, rightplayerY);
socket.addEventListener("message", process_msg_from_socket);
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
start_game_button.addEventListener("click", start_the_fkin_game)


//functions

function start_the_fkin_game()
{
	//init the init game JSON obj
	const config_obj = {

	//type
	type: "game_init",

	//board stuff
	boardHeight: boardHeight,
	boardWidth: boardWidth,
	board_border_width: board_border_width,

	//player stuff
	block_height: block_height,
	block_width: block_width,
	player_speed: player_speed,
	player_indent: player_indent,

	// Ball stuff
	ball_len: ball_len,
	ballX: ballX,
	ballY: ballY,
	dy: dy,
	dx: dx,
};
	//remove the start button
    if (start_game_button)
        start_game_button.style.display = "none";
    
	//send the init JSON to backend
    if (socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify(config_obj));
}

function process_msg_from_socket(message: MessageEvent)
{
	console.log("JSON recv to frontend");
	const msg_obj = JSON.parse(message.data);
        
	if(msg_obj.type == "game_update")
    	render_positions(msg_obj.ballX, msg_obj.ballY, msg_obj.leftplayerY, msg_obj.rightplayerY);
	else if(msg_obj.type == "game_over")
	{
		if (start_game_button)
        	start_game_button.style.display = "block";
    }
}

function render_positions(ballX: number, ballY: number, leftplayerY: number, rightplayerY: number)
{
	if (ball && leftplayer && rightplayer)
	{
		ball.style.left = ballX + "px";
		ball.style.top = ballY + "px";

		rightplayer.style.right = player_indent + "px";
		rightplayer.style.top = rightplayerY + "px";

		leftplayer.style.left = player_indent + "px"
		leftplayer.style.top = leftplayerY + "px";
	}
}

function handleKeyDown(key_pressed: KeyboardEvent)
{
	if (socket.readyState === WebSocket.OPEN)
	{
		const keydown_obj = {
			type: "keydown",
			key: key_pressed.key
		}
		socket.send(JSON.stringify(keydown_obj));
	}
}

function handleKeyUp(key_pressed: KeyboardEvent)
{
	if (socket.readyState === WebSocket.OPEN)
	{
		const keyup_obj = {
			type: "keyup",
			key: key_pressed.key
		}
		socket.send(JSON.stringify(keyup_obj));
	}
}