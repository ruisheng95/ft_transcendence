/* eslint-disable @typescript-eslint/no-explicit-any */
import { add_history, disable_navigation, enable_navigation, terminate_history } from "./spa-navigation";
import { WS } from "./class/WS.ts";
import { MsgType } from "./class/MessageType.ts";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

export function online_1v1_play()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online`);

	const game_obj = document.querySelector<HTMLDivElement>("#online_game_board_area");
	
	if(!game_obj) throw new Error("Game obj not found");
	
	game_obj.innerHTML = "";
	const el = document.querySelector<HTMLDivElement>('[data-game="online1v1"]');
	el?.click();

	game_obj.innerHTML = html`
	<div id="online_game_buttons" class="flex gap-[400px] mb-[20px]">
		<button id="online_close_game" class="text-white text-[20px] border border-white px-[10px] py-[5px]">Exit game</button>
		<button id="online_game_start_game_button" type="button" class="text-white text-[20px] border border-white px-[10px] py-[5px]">Start game</button>
	</div>
	<div class="flex ">
		<div class="flex flex-col space-y-2  mr-[20px]">
			<div class="bg-white/20 w-12 h-12 flex items-center justify-center font-bold text-lg rounded-lg">
				<i class="fa fa-arrow-up"></i>
			</div>
			<div class="bg-white/20 w-12 h-12 flex items-center justify-center font-bold text-lg rounded-lg">
				<i class="fa fa-arrow-down"></i>
			</div>
		</div>

		<div id="online_game_board" class="bg-black/60 w-[1000px] h-[500px] relative justify-center border-4 border-white">
			<div id="online_game_center_line" class="w-[1px] h-full border-l-4 border-dashed border-gray-500 mx-auto"></div>
			<div id="online_game_ball" class="bg-yellow-500 rounded-full w-[15px] h-[15px] absolute top-[100px]"></div>
			<div id="online_game_leftplayer" class="bg-red-500 rounded w-[10px] h-[150px] absolute"></div>
			<div id="online_game_rightplayer" class="bg-blue-500 rounded w-[10px] h-[150px] absolute"></div>
		</div>

		<div class="flex flex-col space-y-2  ml-[20px]">
			<div class="bg-white/20 w-12 h-12 flex items-center justify-center font-bold text-lg rounded-lg">
				<i class="fa fa-arrow-up"></i>
			</div>
			<div class="bg-white/20 w-12 h-12 flex items-center justify-center font-bold text-lg rounded-lg">
				<i class="fa fa-arrow-down"></i>
			</div>
		</div>
	</div>
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
		throw new Error("Required game elements not found 3");

	//vars
	let ball_len = 0, ballX = 0, ballY = 0, dy = 0, dx = 0,
    boardHeight = 0, boardWidth = 0, board_border_width = 0,
    block_height = 0, block_width = 0, player_speed = 0,
    rightplayerY = 0, leftplayerY = 0, player_indent = 0;

	//playing status
	let playing = true;

	//player names
	let p1_name = "";
	let p2_name = "";

	render_positions();
	socket.addEventListener("message", process_msg_from_socket);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
	start_game_button.addEventListener("click", start_the_fkin_game)

	close_game_button.addEventListener("click", () => {
		game_popup.classList.add("hidden");
		playing = false;
		terminate_history();
		socket.close();
		WS.removeInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online`);
	});

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
		console.log("JSON recv to frontend: ", message.data);
		const msg_obj = JSON.parse(message.data);
			
		if(msg_obj.type === "matchmaking_status")
			display_matchmaking_popup(msg_obj);
		else if(msg_obj.type === MsgType.GAME_UPDATE)
		{
			if(playing == false)
				return ;

			//remove the start button
			if (start_game_button)
				start_game_button.style.display = "none";
			// Send in this format:
			// [ballX, ballY, leftPlayerY, rightPlayerY, speed_x, speed_y]
			ballX = msg_obj.d[0];
			ballY = msg_obj.d[1];
			leftplayerY = msg_obj.d[2];
			rightplayerY = msg_obj.d[3];
			dx = msg_obj.d[4];
			dy = msg_obj.d[5];
			render_positions();
		}
		else if(msg_obj.type == "game_over")
		{
			if(playing == false)
			{
				socket.close();
				WS.removeInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online`);
				return;
			}
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
			ballX = board.clientWidth / 2 - ball_len / 2 + 2;
			ballY = board.clientHeight / 2 - ball_len / 2;
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
		const exit_mm = document.querySelector<HTMLButtonElement>("#online1v1_exit_matchmaking");

		if(!exit_mm || !mm_status_div || !matchmaking_popup || !p1_name_div || !p2_name_div) throw new Error("Display matchmaking popup elements not found");

		const players = JSON.parse(msg_obj.players);
		if(msg_obj.status === "Waiting for players")
		{
			exit_mm.classList.remove("hidden");
			
			mm_status_div.innerHTML = `
			<div class="flex justify-center">
				<div>Searching for players</div>
				<div class="animate-pulse [animation-delay:0ms]">.</div>
				<div class="animate-pulse [animation-delay:300ms]">.</div>
				<div class="animate-pulse [animation-delay:600ms]">.</div>
			</div>
			` //pulsing dots aniamtion lmaoo

			exit_mm.addEventListener("click", () => {
				matchmaking_popup.classList.add("hidden");
				socket.close();
				WS.removeInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online`);
				add_history("");
			});

			p1_name = players[0];
			p2_name = `<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>` //spinning circle animation
		}
		else if(msg_obj.status === "Lobby full")
		{
			disable_navigation();
			start_match_countdown(mm_status_div);
			p1_name = players[0];
			p2_name = players[1];
			exit_mm.classList.add("hidden");
		}


		p1_name_div.innerHTML = p1_name;
		p2_name_div.innerHTML = p2_name;

		matchmaking_popup.classList.remove("hidden");
	}

	function start_match_countdown(mm_status_div: HTMLDivElement)
	{
		const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");
		const matchmaking_popup = document.querySelector<HTMLDivElement>("#online1v1_matchmaking_popup");
		const p1_name_div = document.querySelector<HTMLDivElement>("#online_p1_name_display");
		const p2_name_div = document.querySelector<HTMLDivElement>("#online_p2_name_display");
		const map_input = document.querySelector<HTMLInputElement>("#input-map");

		if(!game_popup || !matchmaking_popup || !p1_name_div || !p2_name_div || !map_input) throw new Error("start match countdown elements not found");

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
				game_popup.style.backgroundImage = map_input.value;
				matchmaking_popup.classList.add("hidden");
				p1_name_div.innerHTML = p1_name;
				p2_name_div.innerHTML = p2_name;
				init_positions();
				render_positions();
			}
		}, 1000);
	}

	function handle_game_end(gameover_obj : any)
	{
		const online1v1_left_result = document.querySelector<HTMLDivElement>("#online1v1_left_result");
		const online1v1_left_name = document.querySelector<HTMLDivElement>("#online1v1_left_name");
		const online1v1_left_point = document.querySelector<HTMLDivElement>("#online1v1_left_point");
		const online1v1_right_result = document.querySelector<HTMLDivElement>("#online1v1_right_result");
		const online1v1_right_name = document.querySelector<HTMLDivElement>("#online1v1_right_name");
		const online1v1_right_point = document.querySelector<HTMLDivElement>("#online1v1_right_point");

		const online1v1_winner_popup = document.querySelector<HTMLDivElement>("#online_1v1_winner_popup");
		const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");
		const close_online_1v1_winner_popup_button = document.querySelector<HTMLButtonElement>("#close_online1v1_winner_popup");

		if(!game_popup || !online1v1_winner_popup ||!close_online_1v1_winner_popup_button ||
			!online1v1_left_result || !online1v1_left_name || !online1v1_right_result || !online1v1_right_name ||
			!online1v1_left_point || !online1v1_right_point
		)
			throw new Error("Online1v1 winner display elements not found");

		enable_navigation();

		online1v1_left_name.innerText = p1_name;
		online1v1_right_name.innerText = p2_name;

		if(gameover_obj.winner == "leftplayer") {
			online1v1_left_result.innerHTML = `<h2 class="match-win">Winner</h2>`;
			online1v1_left_point.innerHTML = `<span class="result-win">+5<i class="fas fa-arrow-up"></i></span>`;

			online1v1_right_result.innerHTML = `<h2 class="match-lose">Loser</h2>`;
			online1v1_right_point.innerHTML = `<span class="result-lose">-5<i class="fas fa-arrow-down"></i></span>`;
		}
		else {
			online1v1_right_result.innerHTML = `<h2 class="match-win">Winner</h2>`;
			online1v1_right_point.innerHTML = `<span class="result-win">+5<i class="fas fa-arrow-up"></i></span>`;

			online1v1_left_result.innerHTML = `<h2 class="match-lose">Loser</h2>`;
			online1v1_left_point.innerHTML = `<span class="result-lose">-5<i class="fas fa-arrow-down"></i></span>`;
		}

		online1v1_winner_popup.classList.remove("hidden");
		game_popup.classList.add("hidden");

		socket.close();
		WS.removeInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online`);
		
		close_online_1v1_winner_popup_button.addEventListener("click", () => {
			online1v1_winner_popup.classList.add("hidden");
			add_history("");
		})
	}
}

const online1v1_matchmaking_popup = html`
		<div id="online1v1_matchmaking_popup" class="h-full px-48 space-y-6 flex flex-col justify-center hidden fixed bg-black inset-0 text-white inter-font">
		
		<!--Title -->
		<h1 class="text-4xl text-center mb-10 font-bold">Online Lobby</h1>

		<!-- Game Information -->
		<section class="flex items-center space-x-4">
			<h2 class="text-xl font-medium">Match Info :</h2>
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">Online</span>
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">1 vs 1</span>
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">2 Players</span>
		</section>
		
		<!-- Game Setting Header -->
		<header class="grid grid-cols-[3fr_2fr] gap-10">
			<h2 class="text-xl font-medium">Map Selection :</h2>
			<h2 class="text-xl font-medium">Players :</h2>
		</header>

		<!-- Game Setting Details -->
		<main class="grid grid-cols-[3fr_2fr] gap-10 place-items-center mb-10">
		
			<!-- Map Selection -->
			<section class="grid grid-cols-2 gap-6 px-12">
				<div data-map="" data-game="online1v1" class="mapselect-logic text-2xl flex items-center justify-center select-map">None</div>
				<img data-map="url('/map-1.avif')" class="mapselect-logic object-cover select-map" src="/map-1.avif" alt="map">
				<img data-map="url('/map-2.avif')" class="mapselect-logic object-cover select-map" src="/map-2.avif" alt="map">
				<img data-map="url('/map-3.png')" class="mapselect-logic object-cover select-map" src="/map-3.png" alt="map">
			</section>

			<!-- Player List -->
			<section class="w-full px-12 text-2xl font-bold divide-y">
				<span class="flex p-4">
					P1 : &nbsp;<div id="online_mm_p1_name"></div>
				</span>
				<span class="flex p-4">
					P2 : &nbsp;<div id="online_mm_p2_name"></div>
				</span>
			</section>
		</main>

		<!-- Status Msg -->
		<div id="mm_status" class="text-4xl mt-10"></div>
		
		<!--Exit Button -->
		<button id="online1v1_exit_matchmaking" class="absolute top-10 right-10 button-remove">
			<i class="fas fa-times text-black text-xl"></i>
		</button>
	</div>
`;


const online_1v1_winner_popup = html`
	<div id="online_1v1_winner_popup" class="bg-black flex h-screen items-center justify-center hidden fixed inset-0 text-white inter-font">
		<div id="online_1v1_popup_screen" class="w-[70vw] h-[70vh] flex flex-col justify-between items-center">

			<!-- Tournament Title -->
			<h1 class="text-5xl font-bold text-center">Match Result</h1>	
			
			<!-- Result Layout -->
			<section class="grid grid-cols-2 w-full place-items-center">
				<!-- Left -->
				<div class="w-full space-y-10 px-12 text-center">
					<!-- Result Status -->
					<div id="online1v1_left_result" class="mb-20"></div>
					<!-- Player Details -->
					<div class="flex items-center justify-between px-4">
						<span id="online1v1_left_name" class="text-2xl font-medium"></span>
						<div id="online1v1_left_point" class="text-5xl flex"></div>
					</div>
				</div>
				
				<!-- Right -->
				<div class="w-full space-y-10 px-12 text-center">
					<!-- Result Status -->
					<div id="online1v1_right_result" class="mb-20"></div>
					<!-- Player Details -->
					<div class="flex items-center justify-between px-4">
						<span id="online1v1_right_name" class="text-2xl font-medium"></span>
						<div id="online1v1_right_point" class="text-5xl flex"></div>
					</div>
				</div>
			</section>

			<!-- Exit Game Button -->
			<button id="close_online1v1_winner_popup" class="button-primary">Exit</button>
		</div>
	</div>
`

export const online_game_popup = html`

	${online1v1_matchmaking_popup}
	<div id="online_game_popup" class="hidden bg-black bg-cover bg-center fixed inset-0">
		<div class="bg-black/70 h-full flex flex-col justify-center items-center">
			<div class="flex flex-col items-center bg-transparent text-white">
				<div id="online_game_board_area"></div>
				<div id="online_names" class="flex gap-[600px] mb-[16px]">
					<div id="online_p1_name_display" class="text-red-500 text-[3vh] font-bold mr-[20px]"><h1>player1</h1></div>
					<div id="online_p2_name_display" class="text-blue-500 text-[3vh] font-bold ml-[20px]"><h1>player2</h1></div>
				</div>
			</div>
		</div>
	</div>

	${online_1v1_winner_popup}
`;