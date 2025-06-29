import "./gamestyle.css";

const key_down: Record<string, boolean> = {
  ArrowUp: false,
  ArrowDown: false,
  w: false,
  s: false
}; // the TS map bruh

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

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

if(start_game_button)
    start_game_button.addEventListener("click", game_loop)


if (!board) throw new Error("Board element not found");
if (!rightplayer) throw new Error("Board element not found");
if (!leftplayer) throw new Error("Board element not found");
if (!ball) throw new Error("Board element not found");


//ball stuff
const ball_len = ball.clientWidth;
let ballX = board.clientWidth / 2;
let ballY = board.clientHeight / 2;
let dy = 2;
let dx = 2;

//board stuff
const boardHeight = board.clientHeight;
const boardWidth = board.clientWidth;
const board_border_width = parseInt(getComputedStyle(board).borderLeftWidth);

//players settings
const block_height = rightplayer.clientHeight;
const block_width = rightplayer.clientWidth;
const player_speed = 5;
let rightplayerY = board.clientHeight / 2 - (block_height / 2);
let leftplayerY = board.clientHeight / 2 - (block_height / 2);
const player_indent = 20;
rightplayer.style.right = player_indent + "px";
leftplayer.style.left = player_indent + "px"


//other variables
let game_interval_id = 0;
let game_hit_lock = false;

set_starting_pos();

function game_loop()
{
    if(start_game_button)
        start_game_button.style.display = "none";
	
    if(ball && leftplayer && rightplayer && board)
    {
		//starting pos
		set_starting_pos()

        clearInterval(game_interval_id);
        game_interval_id = setInterval(frame, 5); //loop every 5 milisec
        function frame()
        {
			change_player_pos();
			if(ballX <= 0 || ballX + ball_len >= boardWidth)
			{
				clearInterval(game_interval_id);
				if(start_game_button)
					start_game_button.style.display = "block";
			}
            else
            {
                if(ball && board)
                {
                    if (!game_hit_lock && ((ballX <= player_indent + block_width && ballX >= player_indent &&
						ballY + ball_len >= leftplayerY && ballY <= leftplayerY + block_height) ||
						(ballX + ball_len >= (boardWidth - player_indent) - block_width && ballX + ball_len <= (boardWidth - player_indent) &&
						ballY + ball_len >= rightplayerY && ballY + ball_len<= rightplayerY + block_height)
						))
						{
							dx = -dx;
							dx *= 1.05;
							dy *= 1.05;
							game_hit_lock = true;
							setTimeout(() => {game_hit_lock = false;}, 1000);
						}

                    if (ballY + ball_len >= boardHeight || ballY <= 0)
                        dy = -dy;

                    ballX += dx;
                    ballY += dy;

                    ball.style.left = ballX + "px"; 
                    ball.style.top = ballY + "px";
                } 
            }
        }
    }
}

function set_starting_pos()
{
	if(ball && rightplayer && leftplayer && board)
	{
		ball.style.top = boardHeight / 2 - (ball_len / 2) + "px";
		ball.style.left = boardWidth / 2 - (ball_len / 2) + "px";
		rightplayer.style.top = boardHeight / 2  - (block_height / 2) + "px";
		leftplayer.style.top = boardHeight / 2  - (block_height / 2) + "px";
		ballX = board.clientWidth / 2;
		ballY = board.clientHeight / 2;
		rightplayerY = board.clientHeight / 2 - (block_height / 2);
		leftplayerY = board.clientHeight / 2 - (block_height / 2);
		dy = 2;
		dx = 2;
	}
	
}
function change_player_pos()
{
	if(key_down["ArrowDown"] == true)
	{
		if(rightplayer && rightplayerY + block_height + board_border_width <= boardHeight)
        {
            rightplayerY += player_speed;
            rightplayer.style.top = rightplayerY + "px";
        }
	}
	if(key_down["ArrowUp"] == true)
	{
		if(rightplayer && rightplayerY - board_border_width > 0)
        {
            rightplayerY -= player_speed;
            rightplayer.style.top = rightplayerY + "px";
        }
	}
	if(key_down["s"] == true)
	{
		if(leftplayer && leftplayerY + block_height + board_border_width <= boardHeight)
        {
            leftplayerY += player_speed;
            leftplayer.style.top = leftplayerY + "px";
        }
	}
	if(key_down["w"] == true)
	{
		if(leftplayer && leftplayerY - board_border_width > 0)
        {
            leftplayerY -= player_speed;
            leftplayer.style.top = leftplayerY + "px";
        }
	}
}

function handleKeyDown(key_pressed: KeyboardEvent)
{
	key_down[key_pressed.key] = true;
}

function handleKeyUp(key_pressed: KeyboardEvent)
{
	key_down[key_pressed.key] = false;
}