/* eslint-disable @typescript-eslint/no-explicit-any */
import { disable_back_navigation, enable_back_navigation } from "./spa-navigation";
import { WS } from "./class/WS.ts";
import { MsgType } from "./class/MessageType.ts";
import "./gamestyle.css";
import { removeAllEventListenersFromButton } from "./gameindex.ts";
import { translate_text } from "./language.ts";
import { click_pong_modes_button } from "./pong_modes.ts";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

export function online_1v1_play()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online`);
	let player_dced_flag = false;
	const tournament_context = localStorage.getItem("tournament_context");
	const gameMode = tournament_context ? "Tournament" : "1 vs 1";

	const game_obj = document.querySelector<HTMLDivElement>("#online_game_board_area");
	
	if(!game_obj) throw new Error("Game obj not found");
	
	game_obj.innerHTML = "";
	const el = document.querySelector<HTMLDivElement>('[data-game="online1v1"]');
	el?.click();

	game_obj.innerHTML = html`
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

	const board = document.querySelector<HTMLDivElement>("#online_game_board");
	const rightplayer = document.querySelector<HTMLDivElement>("#online_game_rightplayer");
	const leftplayer = document.querySelector<HTMLDivElement>("#online_game_leftplayer");
	const ball = document.querySelector<HTMLDivElement>("#online_game_ball");
	const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");

	//bruh stupid ts
	if(!board || !rightplayer || !leftplayer || !ball || !game_popup)
		throw new Error("Required game elements not found 3");

	//vars
	let ball_len = 0, ballX = 0, ballY = 0, board_border_width = 0, block_height = 0,
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

	function start_the_fkin_game()
	{	
		//send the init JSON to backend
		if (socket.readyState === WebSocket.OPEN)
			socket.send(JSON.stringify({type: "game_start"}));
	}

	function process_msg_from_socket(message: MessageEvent)
	{
		const optional_msg_div = document.querySelector<HTMLDivElement>("#online1v1_optional_msg");
		const matchmaking_popup = document.querySelector<HTMLDivElement>("#online1v1_matchmaking_popup");

		if(!optional_msg_div || !matchmaking_popup) throw new Error("process msg socket elements not found");

		console.log("JSON recv to frontend: ", message.data);
		const msg_obj = JSON.parse(message.data);
			
		if(msg_obj.type === "matchmaking_status")
			display_matchmaking_popup(msg_obj);
		else if(msg_obj.type === MsgType.GAME_UPDATE)
		{
			if(playing == false)
				return ;

			ballX = msg_obj.d[0];
			ballY = msg_obj.d[1];
			leftplayerY = msg_obj.d[2];
			rightplayerY = msg_obj.d[3];
			render_positions();
		}
		else if(msg_obj.type == "game_over")
		{		
			optional_msg_div.innerHTML = "";
			handle_game_end(msg_obj);
		}
		else if(msg_obj.type === "player_dced")
		{		
			optional_msg_div.innerHTML = translate_text("Match terminated because a player has disconnected");
			player_dced_flag = true;
			matchmaking_popup.classList.add("hidden");
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
			board_border_width = parseInt(getComputedStyle(board).borderLeftWidth);
			block_height = rightplayer.clientHeight;
			rightplayerY = board.clientHeight / 2 - (block_height / 2) + board_border_width;
			leftplayerY = board.clientHeight / 2 - (block_height / 2) + board_border_width;
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
		let exit_mm = document.querySelector<HTMLButtonElement>("#online1v1_exit_matchmaking");

		if(!exit_mm || !mm_status_div || !matchmaking_popup || !p1_name_div || !p2_name_div) throw new Error("Display matchmaking popup elements not found");

		const gameModeSpan = document.querySelector('#online1v1_gameinfo_text2');
		if (gameModeSpan) {
			gameModeSpan.textContent = translate_text(gameMode);
		}

		const players = JSON.parse(msg_obj.players);
		if(msg_obj.status === "Waiting for players")
		{
			exit_mm.classList.remove("hidden");
			
			mm_status_div.innerHTML = `
			<div class="flex justify-center">
				<div>${translate_text("Searching for players")}</div>
				<div class="animate-pulse [animation-delay:0ms]">.</div>
				<div class="animate-pulse [animation-delay:300ms]">.</div>
				<div class="animate-pulse [animation-delay:600ms]">.</div>
			</div>
			` //pulsing dots aniamtion lmaoo

			exit_mm = removeAllEventListenersFromButton(exit_mm);
			exit_mm.addEventListener("click", () => {
				matchmaking_popup.classList.add("hidden");
				socket.close();
				WS.removeInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online`);
				click_pong_modes_button();
			});

			p1_name = players[0];
			p2_name = `<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>` //spinning circle animation
		}
		else if(msg_obj.status === "Lobby full")
		{
			disable_back_navigation();
			start_matchmaking_countdown(mm_status_div, msg_obj);
			console.log(players);
			p1_name = players[0];
			p2_name = players[1];
			exit_mm.classList.add("hidden");
		}

		p1_name_div.innerHTML = p1_name;
		p2_name_div.innerHTML = p2_name;

		matchmaking_popup.classList.remove("hidden");
	}

	function start_matchmaking_countdown(mm_status_div: HTMLDivElement, msg_obj : any)
	{
		const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");
		const matchmaking_popup = document.querySelector<HTMLDivElement>("#online1v1_matchmaking_popup");
		const p1_name_div = document.querySelector<HTMLDivElement>("#online_p1_name_display");
		const p2_name_div = document.querySelector<HTMLDivElement>("#online_p2_name_display");
		const map_input = document.querySelector<HTMLInputElement>("#input-map");
		const game_countdown_div = document.querySelector<HTMLDivElement>("#online_game_countdown");

		if(!game_countdown_div || !game_popup || !matchmaking_popup || !p1_name_div || !p2_name_div || !map_input) throw new Error("start match countdown elements not found");

		let countdown = 3;

		//show initial countdown cuz setinterval starts one sec late
		mm_status_div.innerHTML = `
			<div class="flex flex-col items-center">
				<div>${translate_text("Match found!")}</div>
				<div>${translate_text("Match starting in")} ${countdown}</div>
			</div>
			`;
		countdown--;
		
		const interval = setInterval(() => {
			mm_status_div.innerHTML = `
			<div class="flex flex-col items-center">
				<div>${translate_text("Match found!")}</div>
				<div>${translate_text("Match starting in")} ${countdown}</div>
			</div>
			`;
			
			countdown--;
			
			if (countdown < 0)
			{
				clearInterval(interval);
				if(player_dced_flag === true)
					return; 
				game_popup.classList.remove("hidden");
				game_popup.style.backgroundImage = map_input.value;
				matchmaking_popup.classList.add("hidden");
				init_positions();
				render_positions();

				//auto start after 4s
				setTimeout(() => {
					const playersArr = JSON.parse(msg_obj.players);
					if (playersArr[0] === localStorage.getItem("current_username"))
						start_the_fkin_game();
				}, 4000);

				//moved this down abit to ensure the DOM is loaded and the names can be put inside
				p1_name_div.innerHTML = p1_name;
				p2_name_div.innerHTML = p2_name;
				start_game_countdown(game_countdown_div);
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

		
		if(playing == false)
				return;

		enable_back_navigation();

		online1v1_left_name.innerText = p1_name;
		online1v1_right_name.innerText = p2_name;

		if(gameover_obj.winner == "leftplayer") {
			online1v1_left_result.innerHTML = `<h2 class="match-win">${translate_text("Winner")}</h2>`;
			online1v1_left_point.innerHTML = `<span class="result-win">+5<i class="fas fa-arrow-up"></i></span>`;

			online1v1_right_result.innerHTML = `<h2 class="match-lose">${translate_text("Loser")}</h2>`;
			online1v1_right_point.innerHTML = `<span class="result-lose">-5<i class="fas fa-arrow-down"></i></span>`;
		}
		else {
			online1v1_right_result.innerHTML = `<h2 class="match-win">${translate_text("Winner")}</h2>`;
			online1v1_right_point.innerHTML = `<span class="result-win">+5<i class="fas fa-arrow-up"></i></span>`;

			online1v1_left_result.innerHTML = `<h2 class="match-lose">${translate_text("Loser")}</h2>`;
			online1v1_left_point.innerHTML = `<span class="result-lose">-5<i class="fas fa-arrow-down"></i></span>`;
		}

		online1v1_winner_popup.classList.remove("hidden");
		game_popup.classList.add("hidden");

		// check if in tournament
		const tournament_context = localStorage.getItem("tournament_context");
		
		if (tournament_context) {
			const context = JSON.parse(tournament_context);
			const tournament_socket = WS.getInstance(context.socket_url);
			
			let winner_email;
			let loser_email;
			
			if (gameover_obj.winner_email && gameover_obj.loser_email) {
				winner_email = gameover_obj.winner_email;
				loser_email = gameover_obj.loser_email;
			} else {
				// just in case lol
				console.log("Backend didn't provide emails");
				const winner_name = gameover_obj.winner === "leftplayer" ? p1_name : p2_name;
				
				if (context.current_players.player1.name === winner_name) {
					winner_email = context.current_players.player1.email;
					loser_email = context.current_players.player2.email;
				} else {
					winner_email = context.current_players.player2.email;
					loser_email = context.current_players.player1.email;
				}
			}
			
			if (tournament_socket.readyState === WebSocket.OPEN) {
				tournament_socket.send(JSON.stringify({
					type: "game_result",
					tournament_id: context.tournament_id,
					match_id: context.current_match_id,
					winner_email: winner_email,
					loser_email: loser_email
				}));
			} else {
				// wait for socket to open then send the message
				tournament_socket.addEventListener('open', () => {
					tournament_socket.send(JSON.stringify({
						type: "game_result",
						tournament_id: context.tournament_id,
						match_id: context.current_match_id,
						winner_email: winner_email,
						loser_email: loser_email
					}));
				}, { once: true }); // once: true - ensure the listener is removed after execution
			}
		}

		socket.close();
		WS.removeInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online`);

		playing = false;
		
		close_online_1v1_winner_popup_button.removeEventListener("click", close_online1v1_winner_popup_ft);
		close_online_1v1_winner_popup_button.addEventListener("click", close_online1v1_winner_popup_ft);

		function close_online1v1_winner_popup_ft()
		{
			online1v1_winner_popup?.classList.add("hidden");
			click_pong_modes_button();
		}
	}
}

export function start_game_countdown(game_countdown_div: HTMLDivElement)
{
	let gameCountdown = 3;
	
	game_countdown_div.classList.remove("hidden");
	game_countdown_div.innerHTML = `
		<div class="absolute inset-0 flex items-center justify-center z-1">
			<div class="text-8xl font-bold text-white animate-pulse">
				${gameCountdown}
			</div>
		</div>
	`;
	
	gameCountdown--;
	
	const gameInterval = setInterval(() => {
		if (gameCountdown > 0)
		{
			game_countdown_div.innerHTML = `
				<div class="absolute inset-0 flex items-center justify-center z-1">
					<div class="text-8xl font-bold text-white animate-pulse">
						${gameCountdown}
					</div>
				</div>
			`;
		}
		else if (gameCountdown === 0)
		{
			game_countdown_div.innerHTML = `
				<div class="absolute inset-0 flex items-center justify-center z-1">
					<div class="text-8xl font-bold text-white animate-bounce">
						GO!
					</div>
				</div>
			`;
		}
		else
		{
			//hide countdown
			clearInterval(gameInterval);
			game_countdown_div.classList.add("hidden");
			game_countdown_div.innerHTML = "";
		}
		
		gameCountdown--;
	}, 1000);

	// close_online_1v1_winner_popup_button.addEventListener("click", () => {
	// 		online1v1_winner_popup.classList.add("hidden");
			
	// 		// check if in tournament
	// 		const tournament_context = localStorage.getItem("tournament_context");
	// 		if (tournament_context) {
	// 			// return to tournament bracket
	// 			add_history("/onlinegame");
	// 		} else {
	// 			// return to index
	// 			add_history("");
	// 		}
	// 	})
}

const online1v1_matchmaking_popup = html`
		<div id="online1v1_matchmaking_popup" class="h-full px-48 space-y-6 flex flex-col justify-center hidden fixed bg-gray-950 inset-0 text-white inter-font">
		
		<!--Title -->
		<h1 id="online1v1_title" class="text-4xl text-center mb-6 font-bold">Online Lobby</h1>

		<!-- Game Information -->
		<section class="flex items-center justify-center space-x-4 mb-10">
			<span id="online1v1_gameinfo_text1" class="bg-white/20 px-6 py-1 font-medium rounded-full">Online</span>
			<span id="online1v1_gameinfo_text2" class="bg-white/20 px-6 py-1 font-medium rounded-full">1 vs 1</span>
			<span id="online1v1_gameinfo_text3" class="bg-white/20 px-6 py-1 font-medium rounded-full">2 Players</span>
		</section>
		
		<!-- Game Setting Header -->
		<header class="grid grid-cols-[3fr_2fr] gap-10 text-center">
			<h2 id="online1v1_header_text1" class="text-2xl font-bold pb-2">Map Selection</h2>
			<h2 id="online1v1_header_text2" class="text-2xl font-bold pb-2">Players</h2>
		</header>

		<!-- Game Setting Details -->
		<main class="grid grid-cols-[3fr_2fr] gap-10 mb-10">
		
			<!-- Map Selection -->
			<section class="grid grid-cols-2 gap-6 px-12">
				<div id="online1v1_map_none" data-map="" data-game="online1v1" class="mapselect-logic text-2xl flex items-center justify-center select-map">None</div>
				<img data-map="url('/map-1.avif')" class="mapselect-logic object-cover select-map" src="/map-1.avif" alt="map">
				<img data-map="url('/map-2.avif')" class="mapselect-logic object-cover select-map" src="/map-2.avif" alt="map">
				<img data-map="url('/map-3.png')" class="mapselect-logic object-cover select-map" src="/map-3.png" alt="map">
			</section>

			<!-- Player List -->
			<section class="w-full text-4xl font-bold flex flex-col items-center justify-center text-center space-y-12  py-12 rounded-xl">

				<div id="online_mm_p1_name"></div>
				<div class="w-1/4 pixel-font text-5xl text-yellow-400">VS</div>
				<div id="online_mm_p2_name"></div>

			</section>
		</main>

		<!-- Status Msg -->
		<div id="mm_status" class="text-4xl mt-10"></div>
		
		<!--Exit Button -->
		<button id="online1v1_exit_matchmaking" class="absolute top-10 right-10 w-6 h-6 bg-yellow-400 rounded flex items-center justify-center hover:bg-yellow-300">
			<i class="fas fa-times text-black text-xl"></i>
		</button>
	</div>
`;


const online_1v1_winner_popup = html`
	<div id="online_1v1_winner_popup" class="bg-gray-950 flex h-screen items-center justify-center hidden fixed inset-0 text-white inter-font">
		<div id="online_1v1_popup_screen" class="w-[70vw] h-[70vh] flex flex-col justify-between items-center">

			<!-- Tournament Title -->
			<h1 id="online1v1_match_result_text" class="text-5xl font-bold text-center">Match Result</h1>	
			
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
			<div id="online1v1_optional_msg"></div>

			<!-- Exit Game Button -->
			<button id="close_online1v1_winner_popup" class="button-primary">Exit</button>
		</div>
	</div>
`;

export const online_game_popup = html `

	${online1v1_matchmaking_popup}
	<div id="online_game_popup" class="hidden bg-gray-950 bg-cover bg-center fixed inset-0">
		<div class="bg-black/70 h-full flex flex-col justify-center items-center">
			<div class="flex flex-col items-center bg-transparent text-white">
				<div id="online_game_countdown"></div>
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