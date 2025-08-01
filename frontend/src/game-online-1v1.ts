/* eslint-disable @typescript-eslint/no-explicit-any */
import { add_history, terminate_history } from "./spa-navigation";
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
		<div id="online_game_board" class="bg-black w-[1000px] h-[500px] relative justify-center border-4 border-white">
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

	//vars
	let ball_len = 0, ballX = 0, ballY = 0, dy = 0, dx = 0,
    boardHeight = 0, boardWidth = 0, board_border_width = 0,
    block_height = 0, block_width = 0, player_speed = 0,
    rightplayerY = 0, leftplayerY = 0, player_indent = 0;


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
			type: "game_start",

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
		
		//send the init JSON to backend
		if (socket.readyState === WebSocket.OPEN)
			socket.send(JSON.stringify(config_obj));
	}

	function process_msg_from_socket(message: MessageEvent)
	{
		//console.log("JSON recv to frontend: ", message.data);
		const msg_obj = JSON.parse(message.data);
			
		if(msg_obj.type === "matchmaking_status")
			display_matchmaking_popup(msg_obj);
		else if(msg_obj.type == "game_update")
		{
			if(playing == false)
				return ;

			//remove the start button
			if (start_game_button)
				start_game_button.style.display = "none";

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
			handle_game_end(msg_obj);
		}
	}

	function init_positions()
	{
		if(ball && board && rightplayer && leftplayer)
		{
			//ball stuff
			ball_len = ball.clientWidth;
			ballX = board.clientWidth / 2;
			ballY = board.clientHeight / 2;
			dy = 2;
			dx = 2;

			//board stuff
			boardHeight = board.clientHeight;
			boardWidth = board.clientWidth;
			board_border_width = parseInt(getComputedStyle(board).borderLeftWidth);

			//players settings
			block_height = rightplayer.clientHeight;
			block_width = rightplayer.clientWidth;
			player_speed = 5;
			rightplayerY = board.clientHeight / 2 - (block_height / 2);
			leftplayerY = board.clientHeight / 2 - (block_height / 2);
			player_indent = 20;
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

	//online play functions
	function display_matchmaking_popup(msg_obj : any)
	{
		const matchmaking_popup = document.querySelector<HTMLDivElement>("#online1v1_matchmaking_popup");
		const p1_name_div = document.querySelector<HTMLDivElement>("#online_mm_p1_name");
		const p2_name_div = document.querySelector<HTMLDivElement>("#online_mm_p2_name");
		const mm_status_div = document.querySelector<HTMLDivElement>("#mm_status");

		if(!mm_status_div || !matchmaking_popup || !p1_name_div || !p2_name_div) throw new Error("Display matchmaking popup elements not found");

		let p1_name = "";
		let p2_name = "";
		const players = JSON.parse(msg_obj.players);
		if(msg_obj.status === "Waiting for players")
		{
			mm_status_div.innerHTML = `
			<div class="flex justify-center">
				<div>Searching for players</div>
				<div class="animate-pulse [animation-delay:0ms]">.</div>
				<div class="animate-pulse [animation-delay:300ms]">.</div>
				<div class="animate-pulse [animation-delay:600ms]">.</div>
			</div>
			` //pulsing dots aniamtion lmaoo
			p1_name = players[0];
			p2_name = `<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>` //spinning circle animation
		}
		else if(msg_obj.status === "Lobby full")
		{
			start_match_countdown(mm_status_div);
			p1_name = players[0];
			p2_name = players[1];
		}

		p1_name_div.innerHTML = p1_name;
		p2_name_div.innerHTML = p2_name;

		matchmaking_popup.classList.remove("hidden");
	}

	function start_match_countdown(mm_status_div: HTMLDivElement)
	{
		const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");
		const matchmaking_popup = document.querySelector<HTMLDivElement>("#online1v1_matchmaking_popup");

		if(!game_popup || !matchmaking_popup) throw new Error("start match countdown elements not found");

		let countdown = 3;

		//show initial countdown cuz setinterval starts one sec late
		mm_status_div.innerHTML = `
			<div class="flex flex-col items-center">
				<div>Match found!</div>
				<div>Match starting in ${countdown}</div>
			</div>
			`;
		countdown--;
		
		const interval = setInterval(() => {
			mm_status_div.innerHTML = `
			<div class="flex flex-col items-center">
				<div>Match found!</div>
				<div>Match starting in ${countdown}</div>
			</div>
			`;
			
			countdown--;
			
			if (countdown < 0)
			{
				clearInterval(interval);
				game_popup.classList.remove("hidden");
				matchmaking_popup.classList.add("hidden");
				init_positions();
				render_positions();
			}
		}, 1000);
	}

	function handle_game_end(gameover_obj : any)
	{
		const online1v1_winner_div = document.querySelector<HTMLDivElement>("#online_1v1_winner_name");
		const online1v1_winner_popup = document.querySelector<HTMLDivElement>("#online_1v1_winner_popup");
		const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");
		const close_online_1v1_winner_popup_button = document.querySelector<HTMLButtonElement>("#close_online1v1_winner_popup");

		if(!game_popup || !online1v1_winner_popup || !online1v1_winner_div || !close_online_1v1_winner_popup_button)
			throw new Error("Online1v1 winner display elements not found");

		if(gameover_obj.winner == "leftplayer")
			online1v1_winner_div.innerHTML = `<h1 class="text-white text-[40px]">"Player1"</h1>`;
		else
			online1v1_winner_div.innerHTML = `<h1 class="text-white text-[40px]">"Player2"</h1>`;

		online1v1_winner_popup.classList.remove("hidden");
		game_popup.classList.add("hidden");

		close_online_1v1_winner_popup_button.addEventListener("click", () => {
			online1v1_winner_popup.classList.add("hidden");
			add_history("");
		})
	}
}

const online1v1_matchmaking_popup = `
	<div id="online1v1_matchmaking_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0">
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

			<div id="mm_status" class="text-white mt-[10vh] text-[4vh]"></div>
		</div>
	</div>
`

const online_1v1_winner_popup = `
	<div id="online_1v1_winner_popup" class="border border-2 border-white flex flex-col justify-center items-center hidden fixed bg-black bg-opacity-90 inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="online_1v1_popup_screen" class="bg-black border border-2 border-white w-[50%] h-[50%] flex flex-col justify-center items-center">

			<div class="text-center">
				<h1 class="text-[50px] text-white">WINNER! 🎉:</h1>
				<div id="online_1v1_winner_name" class="text-[40px] font-bold mb-6 text-white"></div>
				<div class="text-[50px] mb-6 text-white">Congratulations</div>
			</div>

			<button id="close_online1v1_winner_popup" class="border-1 border-white text-white text-[20px] px-[5px] py-[5px]">close</button>
		</div>
	</div>
`
export const online_game_popup = `

	${online1v1_matchmaking_popup}
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
	${online_1v1_winner_popup}
`;