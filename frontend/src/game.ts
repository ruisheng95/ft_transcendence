import "./gamestyle.css";

//localhost_game
export function localhost_game_setup ()
{
	const localhost_game_button = document.querySelector<HTMLButtonElement>("#localhost_game_button");
	const localhost_game_popup = document.querySelector<HTMLDivElement>("#localhost_game_popup");
	const close_localhost_game = document.querySelector<HTMLButtonElement>("#close_localhost_game");

	if(!localhost_game_button || !localhost_game_popup || !close_localhost_game)
		throw new Error("Error localhost_game buttons not found");

	localhost_game_button.addEventListener("click", () => {
		localhost_game_popup.classList.remove("hidden");
		localhost_game_init();
	});
	close_localhost_game.addEventListener("click", () => {
		localhost_game_popup.classList.add("hidden");
	});
}

export const localhost_game_popup = `
    <div id="localhost_game_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0">
        <div class="relative m-0 p-0 bg-black text-white">
            <button id="close_localhost_game" class="absolute top-[10px] right-[10px] text-white text-[20px] border border-white px-[10px] py-[5px]">Exit game</button>
            <h1 class="text-[5vh] font-semibold mt-[3vh] mb-[3vh]"><center>localhost transcendence game bruh</center></h1>
            <div id="localhost_game"></div>
        </div>
    </div>
`;

function localhost_game_init()
{
	//prep stuffssss
	const socket = new WebSocket("ws://localhost:3000/ws");

	const game_obj = document.querySelector<HTMLDivElement>("#localhost_game");

	if(game_obj)
		game_obj.innerHTML = `
	<button id = "start_game_button" type="button" class="bg-black text-white w-[10vw] h-[10vh] absolute top-[20px] left-[20px] text-lg border-2 border-white">Start game</button>
	<center>
	<div id="board" class="bg-black w-[80vw] h-[85vh] relative justify-center border-4 border-white">
		<div id="ball" class="bg-white w-[15px] h-[15px] absolute top-[100px]"></div>
		<div id="leftplayer" class="bg-white w-[10px] h-[150px] absolute"></div>
		<div id="rightplayer" class="bg-white w-[10px] h-[150px] absolute"></div>

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

			leftplayer.style.left = player_indent + "px";
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
}