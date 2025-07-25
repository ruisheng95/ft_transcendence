
// => void means return value is void
//AI flag is optional arg wif default value set as false

export function display_game(handle_game_end : (msg_obj : object) => void)
{
	const socket = new WebSocket("ws://localhost:3000/ws");

	const game_obj = document.querySelector<HTMLDivElement>("#game_board_area");

	if(!game_obj) throw new Error("Game obj not found");

	game_obj.innerHTML = "";

	game_obj.innerHTML = `
	<button id="game_start_game_button" type="button" class="bg-black text-white w-[10vw] h-[10vh] absolute top-[20px] left-[20px] text-lg border-2 border-white">Start game</button>
		<center>
		<div id="game_board" class="bg-black w-[80vw] h-[85vh] relative justify-center border-4 border-white">
			<div id="game_ball" class="bg-white w-[15px] h-[15px] absolute top-[100px]"></div>
			<div id="game_leftplayer" class="bg-white w-[10px] h-[150px] absolute"></div>
			<div id="game_rightplayer" class="bg-white w-[10px] h-[150px] absolute"></div>
		</div>
	</center>
	`;

	const start_game_button = document.querySelector<HTMLButtonElement>("#game_start_game_button");
	const board = document.querySelector<HTMLDivElement>("#game_board");
	const rightplayer = document.querySelector<HTMLDivElement>("#game_rightplayer");
	const leftplayer = document.querySelector<HTMLDivElement>("#game_leftplayer");
	const ball = document.querySelector<HTMLDivElement>("#game_ball");
	const close_game_button = document.querySelector<HTMLButtonElement>("#close_game");
	const game_popup = document.querySelector<HTMLDivElement>("#game_popup");

	//bruh stupid ts
	if(!board || !rightplayer || !leftplayer || !ball || !start_game_button || !close_game_button || !game_popup)
		throw new Error("Required game elements not found");

	//init them vars from the css / html

	//ball stuff
	const ball_len = ball.clientWidth;
	const ballX = board.clientWidth / 2;
	const ballY = board.clientHeight / 2;
	const dy = 2;
	const dx = 2;

	//board stuff
	const boardHeight = board.clientHeight;
	const boardWidth = board.clientWidth;
	const board_border_width = parseInt(getComputedStyle(board).borderLeftWidth);

	//players settings
	const block_height = rightplayer.clientHeight;
	const block_width = rightplayer.clientWidth;
	const player_speed = 5;
	const rightplayerY = board.clientHeight / 2 - (block_height / 2);
	const leftplayerY = board.clientHeight / 2 - (block_height / 2);
	const player_indent = 20;

	//key binds
	const key_binds = new Map();
	key_binds.set("w", "leftplayer_up");
	key_binds.set("s", "leftplayer_down");
	key_binds.set("ArrowUp", "rightplayer_up");
	key_binds.set("ArrowDown", "rightplayer_down");


	render_positions(ballX, ballY, leftplayerY, rightplayerY);
	socket.addEventListener("message", process_msg_from_socket);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
	start_game_button.addEventListener("click", start_the_fkin_game)
	close_game_button.addEventListener("click", () => { game_popup.classList.add("hidden"); });


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
			handle_game_end(msg_obj);
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
				action: key_binds.get(key_pressed.key)
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
				action: key_binds.get(key_pressed.key)
			}
			socket.send(JSON.stringify(keyup_obj));
		}
	}
}

export const game_popup = `
	<div id="game_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0">
		<div class="relative m-0 p-0 bg-black text-white">
			<button id="close_game" class="absolute top-[10px] right-[10px] text-white text-[20px] border border-white px-[10px] py-[5px]">Exit game</button>
			<h1 class="text-[5vh] font-semibold mt-[3vh] mb-[3vh]"><center>Local 1v1 Game</center></h1>
			
			<div class="flex justify-center items-center">
				<div id="p1_name_display" class="text-white text-[3vh] font-bold mr-[20px]"><h1>player1</h1></div>
				<div id="game_board_area"></div>
				<div id="p2_name_display" class="text-white text-[3vh] font-bold ml-[20px]"><h1>player2</h1></div>
			</div>
		</div>
	</div>
`;


//notes:
//gamepopup obj needs to be taken and manually remove hidden outside here when wanna play the game
//need to manually get the p1name and p2name obj to input or change the names displayed