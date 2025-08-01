/* eslint-disable @typescript-eslint/no-explicit-any */
import { terminate_history } from "./spa-navigation";
import { WS } from "./class/WS.ts";

let first_call_flag = false;

export function online_1v1_play()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online`);

	const game_obj = document.querySelector<HTMLDivElement>("#online_game_board_area");
	
	if(!game_obj) throw new Error("Game obj not found");
	
	game_obj.innerHTML = "";

	game_obj.innerHTML = `
	<button id="online_game_start_game_button" type="button" class="bg-black text-white w-[10vw] h-[10vh] absolute top-[20px] left-[20px] text-lg border-2 border-white">Start game</button>
		<center>
		<div id="online_game_board" class="bg-black w-[80vw] h-[85vh] relative justify-center border-4 border-white">
			<div id="online_game_ball" class="bg-white w-[15px] h-[15px] absolute top-[100px]"></div>
			<div id="online_game_leftplayer" class="bg-white w-[10px] h-[150px] absolute"></div>
			<div id="online_game_rightplayer" class="bg-white w-[10px] h-[150px] absolute"></div>
		</div>
	</center>
	`;

	const start_game_button = document.querySelector<HTMLButtonElement>("#online_game_start_game_button");
	const board = document.querySelector<HTMLDivElement>("#online_game_board");
	const rightplayer = document.querySelector<HTMLDivElement>("#online_game_rightplayer");
	const leftplayer = document.querySelector<HTMLDivElement>("#online_game_leftplayer");
	const ball = document.querySelector<HTMLDivElement>("#online_game_ball");
	const close_game_button = document.querySelector<HTMLButtonElement>("#online_close_game");
	const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");

	//bruh stupid ts
	if(!board || !rightplayer || !leftplayer || !ball || !start_game_button || !close_game_button || !game_popup)
		throw new Error("Required game elements not found");

	// game_popup.classList.remove("hidden");
	//init them vars from the css / html

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

	//key binds
	const key_binds = new Map();
	key_binds.set("w", "leftplayer_up");
	key_binds.set("s", "leftplayer_down");
	key_binds.set("ArrowUp", "rightplayer_up");
	key_binds.set("ArrowDown", "rightplayer_down");

	//playing status
	let playing = true;

	render_positions();
	socket.addEventListener("message", process_msg_from_socket);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
	start_game_button.addEventListener("click", start_the_fkin_game)

	if(first_call_flag == false)
	{
		first_call_flag = true;
		close_game_button.addEventListener("click", () => {
			game_popup.classList.add("hidden");
			playing = false;
			terminate_history();
		});
	}

	//functions

	// const stop_game = () => {
	// 	game_popup.classList.add("hidden");
	// 	playing = false;
	// };
	// stop_game_ft = stop_game;

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
		console.log("JSON recv to frontend: ", message.data);
		const msg_obj = JSON.parse(message.data);
			
		if(msg_obj.type === "matchmaking_status")
		{
			display_matchmaking_popup(msg_obj);
		}
		else if(msg_obj.type == "game_update")
		{
			if(playing == false)
				return ;
			ballX = msg_obj.ballX;
			ballY = msg_obj.ballY;
			leftplayerY = msg_obj.leftplayerY;
			rightplayerY = msg_obj.rightplayerY;
			dx = msg_obj.speed_x;
			dy = msg_obj.speed_y;
			render_positions();
		}
		else if(msg_obj.type == "game_over")
		{
			if(playing == false)
				return ;
			if (start_game_button)
				start_game_button.style.display = "block";
			playing = false;
			// handle_game_end(msg_obj);
		}
	}

	function render_positions()
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

function display_matchmaking_popup(msg_obj : any)
{
	const matchmaking_popup = document.querySelector<HTMLDivElement>("#matchmaking_popup");
	const p1_name_div = document.querySelector<HTMLDivElement>("#online_mm_p1_name");
	const p2_name_div = document.querySelector<HTMLDivElement>("#online_mm_p2_name");
	const mm_status_div = document.querySelector<HTMLDivElement>("#mm_status");

	if(!mm_status_div || !matchmaking_popup || !p1_name_div || !p2_name_div) throw new Error("Display matchmaking popup elements not found");

	const parsed_string = msg_obj.status;
	let p1_name = "";
	let p2_name = "";
	if(parsed_string.includes("Waiting for players..."))
	{
		const startIndex = parsed_string.indexOf('["') + 2;  // +2 to skip '["'
		const endIndex = parsed_string.indexOf('"]');
		p1_name = parsed_string.substring(startIndex, endIndex);
		mm_status_div.innerHTML = `
			<div>Searching for players</div>
			<div class="animate-pulse [animation-delay:0ms]">.</div>
			<div class="animate-pulse [animation-delay:300ms]">.</div>
			<div class="animate-pulse [animation-delay:600ms]">.</div>
		` //pulsing dots aniamtion lmaoo
		p2_name = `<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>` //spinning circle animation
	}
	else if(parsed_string.includes("GameInstance registered player:"))
	{
		//extract names
	}
	p1_name_div.innerHTML = p1_name;
	p2_name_div.innerHTML = p2_name;


	matchmaking_popup.classList.remove("hidden");
}

const matchmaking_popup = `
	<div id="matchmaking_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0">
		<div class="relative m-0 p-6 bg-black text-white border border-white">
			<h1 class="text-[5vh] font-semibold mt-[3vh] mb-[10vh]"><center>Online 1v1 matchmaking lobby</center></h1>
			
			<div class="flex justify-center items-center gap-8">
				<div id="online_mm_p1_name" class="text-white text-[3vh] font-bold border border-white px-4 py-2">
					<h1>player1</h1>
				</div>
				<div class="text-white text-[3vh] font-bold">VS</div>
				<div id="online_mm_p2_name" class="text-white text-[3vh] font-bold border border-white px-4 py-2">
					<h1>player2</h1>
				</div>
			</div>

			<div id="mm_status" class="flex text-white justify-center mt-[10vh] text-[4vh]"></div>
		</div>
	</div>
`

export const online_game_popup = `

	${matchmaking_popup}
	<div id="online_game_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0">
		<div class="relative m-0 p-0 bg-black text-white">
			<button id="online_close_game" class="absolute top-[10px] right-[10px] text-white text-[20px] border border-white px-[10px] py-[5px]">Exit game</button>
			<h1 class="text-[5vh] font-semibold mt-[3vh] mb-[3vh]"><center>Online 1v1 Game</center></h1>
			
			<div class="flex justify-center items-center">
				<div id="online_p1_name_display" class="text-white text-[3vh] font-bold mr-[20px]"><h1>player1</h1></div>
				<div id="online_game_board_area"></div>
				<div id="online_p2_name_display" class="text-white text-[3vh] font-bold ml-[20px]"><h1>player2</h1></div>
			</div>
		</div>
	</div>
`;