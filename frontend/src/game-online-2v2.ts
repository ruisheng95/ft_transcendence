/* eslint-disable @typescript-eslint/no-explicit-any */
import { disable_back_navigation, enable_back_navigation} from "./spa-navigation";
import { translate_text } from "./language";
import { handle_language_change } from "./language";
import { start_game_countdown } from "./game-online-1v1";

import "./gamestyle.css";
// let first_call_flag = false;

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

function add_2v2_popups_to_dom() {
	if (document.querySelector("#online2v2_matchmaking_popup")) {
		return;
	}
	
	const popupHTML = `
		${online2v2_matchmaking_popup}
		${online_2v2_winner_popup}
	`;
	document.body.insertAdjacentHTML('beforeend', popupHTML);

	//setting up event listeners for maps
	const all_maps2 = document.querySelectorAll<HTMLButtonElement>(".mapselect-logic2");
	const map_input = document.querySelector<HTMLInputElement>("#input-map");
	all_maps2.forEach(map => {
		map.addEventListener("click", () => {
			all_maps2.forEach(m => {
				m.classList.add("grayscale");
				m.classList.remove("border-yellow-400", "shadow-md");
			});
			
			map.classList.remove("grayscale");
			map.classList.add("border-yellow-400", "shadow-md");
			if (map_input && map.dataset.map !== undefined)
 				map_input.value = map.dataset.map;
		})
	})
}

function setup_2v2_ui() {
	const title = document.querySelector("#online_game_popup h1");
	if (title) {
		title.innerHTML = "<center>Online 2v2 Game</center>";
	}
	
	const p1_display = document.querySelector("#online_p1_name_display");
	const p2_display = document.querySelector("#online_p2_name_display");
	
	if (p1_display) p1_display.classList.add("hidden");
	if (p2_display) p2_display.classList.add("hidden");
	
	let player_names_container = document.querySelector("#online2v2_player_names");
	if (!player_names_container) {
		player_names_container = document.createElement("div");
		player_names_container.id = "online2v2_player_names";
		player_names_container.className = "flex gap-[600px] mb-[16px] mt-[20px]";
		
		const gameBoard = document.querySelector("#online_game_board_area");
		if (gameBoard && gameBoard.parentNode) {
			gameBoard.parentNode.insertBefore(player_names_container, gameBoard.nextSibling);
		}
	}
	
	let team1_display = document.querySelector("#online2v2_team1_name_display");
	let team2_display = document.querySelector("#online2v2_team2_name_display");
	
	if (!team1_display) {
		team1_display = document.createElement("div");
		team1_display.id = "online2v2_team1_name_display";
		team1_display.className = "text-2xl font-bold";
		team1_display.innerHTML = `<h1>${translate_text("Team 1")}</h1>`;
		player_names_container.appendChild(team1_display);
	}
	
	if (!team2_display) {
		team2_display = document.createElement("div");
		team2_display.id = "online2v2_team2_name_display";
		team2_display.className = "text-2xl font-bold";
		team2_display.innerHTML = `<h1>${translate_text("Team 2")}</h1>`;
		player_names_container.appendChild(team2_display);
	}
	
	player_names_container.classList.remove("hidden");
	team1_display.classList.remove("hidden");
	team2_display.classList.remove("hidden");
}

function cleanup_2v2_ui() {
	const player_names_container = document.querySelector("#online2v2_player_names");
	const team1_display = document.querySelector("#online2v2_team1_name_display");
	const team2_display = document.querySelector("#online2v2_team2_name_display");
	
	if (player_names_container) player_names_container.classList.add("hidden");
	if (team1_display) team1_display.classList.add("hidden");
	if (team2_display) team2_display.classList.add("hidden");
	
	const shared_title = document.querySelector("#online_game_popup h1");
	if (shared_title) {
		shared_title.innerHTML = "<center>Online 1v1 Game</center>";
	}
}

export function online_2v2_play()
{
	add_2v2_popups_to_dom();
	handle_language_change(localStorage.getItem("current_language") || "english");

	// Add unique ID to test using the same browser
	const sessionParam = localStorage.getItem("session") || "";
	const uniqueId = Date.now() + Math.random(); 
	const socketUrl = `${import.meta.env.VITE_SOCKET_URL}/ws-online-2v2?session=${sessionParam}&uid=${uniqueId}`;
	const socket = new WebSocket(socketUrl);

	const game_obj = document.querySelector<HTMLDivElement>("#online_game_board_area");
	
	if(!game_obj) throw new Error("Game obj not found");
	
	game_obj.innerHTML = "";

	//click the "none" map option
	const el = document.querySelector<HTMLDivElement>('[data-game="online2v2"]');
		el?.click();

	game_obj.innerHTML = `

	<div class="flex items-center">
		<!-- Left side controls -->
		<div class="flex flex-col space-y-4 mr-4">
			<div class="text-white text-center mb-2">Team 1</div>
			<div class="flex flex-col space-y-2">
				<div class="bg-red-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-red-500 text-white">W / ↑</div>
				<div class="bg-red-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-red-500 text-white">S / ↓</div>
			</div>
			<div class="flex flex-col space-y-2 mt-4">
				<div class="bg-green-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-green-500 text-white">W / ↑</div>
				<div class="bg-green-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-green-500 text-white">S / ↓</div>
			</div>
		</div>

		<!-- Game board -->
		<div id="online2v2_game_board" class="bg-black relative border-4 border-white w-[1000px] h-[500px]">
			<div id="online2v2_center_line" class="w-[1px] h-full border-l-4 border-dashed border-gray-500 mx-auto"></div>
			<div id="online2v2_game_ball" class="bg-yellow-300 rounded-full w-[15px] h-[15px] absolute"></div>
			<div id="online2v2_leftplayer1" class="bg-red-500 rounded w-[10px] h-[100px] absolute"></div>
			<div id="online2v2_leftplayer2" class="bg-green-500 rounded w-[10px] h-[100px] absolute"></div>
			<div id="online2v2_rightplayer1" class="bg-blue-500 rounded w-[10px] h-[100px] absolute"></div>
			<div id="online2v2_rightplayer2" class="bg-pink-500 rounded w-[10px] h-[100px] absolute"></div>
		</div>

		<!-- Right side controls -->
		<div class="flex flex-col space-y-4 ml-4">
			<div class="text-white text-center mb-2">Team 2</div>
			<div class="flex flex-col space-y-2">
				<div class="bg-blue-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-blue-500 text-white">W / ↑</div>
				<div class="bg-blue-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-blue-500 text-white">S / ↓</div>
			</div>
			<div class="flex flex-col space-y-2 mt-4">
				<div class="bg-pink-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-pink-500 text-white">W / ↑</div>
				<div class="bg-pink-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-pink-500 text-white">S / ↓</div>
			</div>
		</div>
	</div>
	`;

	const board = document.querySelector<HTMLDivElement>("#online2v2_game_board");
	const leftplayer1 = document.querySelector<HTMLDivElement>("#online2v2_leftplayer1");
	const leftplayer2 = document.querySelector<HTMLDivElement>("#online2v2_leftplayer2");
	const rightplayer1 = document.querySelector<HTMLDivElement>("#online2v2_rightplayer1");
	const rightplayer2 = document.querySelector<HTMLDivElement>("#online2v2_rightplayer2");
	const ball = document.querySelector<HTMLDivElement>("#online2v2_game_ball");
	const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");

	//bruh stupid ts
	if(!board || !leftplayer1 || !leftplayer2 || !rightplayer1 || !rightplayer2 || !ball || !game_popup)
		throw new Error("Required game elements not found 4");

	//vars
	let ball_len = 0, ballX = 0, ballY = 0, boardHeight = 0, block_height = 0,
    leftplayer1Y = 0, leftplayer2Y = 0, rightplayer1Y = 0, rightplayer2Y = 0, player_indent = 0;

	//playing status
	let playing = true;

	//player names
	let team1_player1_name = "";
	let team1_player2_name = "";
	let team2_player1_name = "";
	let team2_player2_name = "";

	// Player position in matchmaking (0-3)
	let my_player_index = -1;

	render_positions();
	socket.addEventListener("message", process_msg_from_socket);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);

	setup_2v2_ui();

	function start_the_fkin_game()
	{
		if (socket.readyState === WebSocket.OPEN)
			socket.send(JSON.stringify({type: "game_start"}));
	}

	function process_msg_from_socket(message: MessageEvent)
	{
		const optional_msg_div = document.querySelector<HTMLDivElement>("#online2v2_optional_msg");

		if(!optional_msg_div) throw new Error("process msg socket elements not found");

		console.log("JSON recv to frontend: ", message.data);
		const msg_obj = JSON.parse(message.data);
			
		if(msg_obj.type === "matchmaking_status") {
			display_matchmaking_popup(msg_obj);
		}
		else if(msg_obj.type === "player_assigned") {
			my_player_index = msg_obj.player_index;
			console.log(`You are player ${my_player_index}`);
		}
		else if(msg_obj.type == "gu")
		{
			if(playing == false)
				return ;

			ballX = msg_obj.ballX;
			ballY = msg_obj.ballY;
			leftplayer1Y = msg_obj.leftplayer1Y;
			leftplayer2Y = msg_obj.leftplayer2Y;
			rightplayer1Y = msg_obj.rightplayer1Y;
			rightplayer2Y = msg_obj.rightplayer2Y;
			render_positions();
		}
		else if(msg_obj.type == "game_over")
		{
			if(playing == false)
				return ;

			playing = false;
			optional_msg_div.innerHTML = "";
			handle_game_end(msg_obj);
		}
		else if(msg_obj.type == "player_dced")
		{
			playing = false;
			optional_msg_div.innerHTML = translate_text("Match terminated because a player has disconnected");
			handle_game_end(msg_obj);
		}
	}

	function init_positions()
	{
		if(ball && board && leftplayer1 && leftplayer2 && rightplayer1 && rightplayer2)
		{
			ball_len = ball.clientWidth;
			ballX = board.clientWidth / 2 - ball_len / 2;
			ballY = board.clientHeight / 2 - ball_len / 2;
			boardHeight = board.clientHeight;

			block_height = leftplayer1.clientHeight;
			player_indent = 20;
			const quarterHeight = boardHeight / 4;
			leftplayer1Y = quarterHeight - block_height / 2;
			leftplayer2Y = 3 * quarterHeight - block_height / 2;
			rightplayer1Y = 3 * quarterHeight - block_height / 2; 
			rightplayer2Y = quarterHeight - block_height / 2;
		}
	}

	function render_positions()
	{
		if (ball && leftplayer1 && leftplayer2 && rightplayer1 && rightplayer2)
		{
			ball.style.left = ballX + "px";
			ball.style.top = ballY + "px";

			// Left team positioning
			leftplayer1.style.left = player_indent + "px";
			leftplayer1.style.top = leftplayer1Y + "px";

			leftplayer2.style.left = (8 * player_indent) + "px";
			leftplayer2.style.top = leftplayer2Y + "px";

			// Right team positioning
			rightplayer1.style.right = (8 * player_indent) + "px";
			rightplayer1.style.top = rightplayer1Y + "px";

			rightplayer2.style.right = player_indent + "px";
			rightplayer2.style.top = rightplayer2Y + "px";

			// Highlight current player's paddle
			[leftplayer1, leftplayer2, rightplayer1, rightplayer2].forEach((player, index) => {
				if (index === my_player_index) {
					player.classList.add("opacity-100", "shadow-lg");
					player.style.boxShadow = "0 0 10px #ffffff";
				} else {
					player.classList.remove("shadow-lg");
					player.style.boxShadow = "";
				}
			});
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

	function display_matchmaking_popup(msg_obj : any)
	{
		const matchmaking_popup = document.querySelector<HTMLDivElement>("#online2v2_matchmaking_popup");
		const team1_names_div = document.querySelector<HTMLDivElement>("#online2v2_mm_team1_names");
		const team2_names_div = document.querySelector<HTMLDivElement>("#online2v2_mm_team2_names");
		const mm_status_div = document.querySelector<HTMLDivElement>("#online2v2_mm_status");
		const exit_mm = document.querySelector<HTMLButtonElement>("#online2v2_exit_matchmaking");

		if(!exit_mm || !mm_status_div || !matchmaking_popup || !team1_names_div || !team2_names_div) 
			throw new Error("Display matchmaking popup elements not found");

		const players = JSON.parse(msg_obj.players);
		if(msg_obj.status === "Waiting for players")
		{
			exit_mm.classList.remove("hidden");
			
			mm_status_div.innerHTML = `
			<div class="flex justify-center">
				<div>${translate_text("Searching for players")} (${players.length}/4)</div>
				<div class="animate-pulse [animation-delay:0ms]">.</div>
				<div class="animate-pulse [animation-delay:300ms]">.</div>
				<div class="animate-pulse [animation-delay:600ms]">.</div>
			</div>
			` 

			exit_mm.addEventListener("click", () => {
				matchmaking_popup.classList.add("hidden");
				socket.close();
				cleanup_2v2_ui();
			});

			let team1_html = "";
			let team2_html = "";
			
			for(let i = 0; i < 4; i++) {
				if(i < players.length) {
					if(i < 2) {
						team1_html += `<div class="text-white text-[20px] mb-2">${players[i]}</div>`;
					} else {
						team2_html += `<div class="text-white text-[20px] mb-2">${players[i]}</div>`;
					}
				} else {
					if(i < 2) {
						team1_html += `<div class="text-gray-500 text-[20px] mb-2">${translate_text("Waiting...")}</div>`;
					} else {
						team2_html += `<div class="text-gray-500 text-[20px] mb-2">${translate_text("Waiting...")}</div>`;
					}
				}
			}
			
			team1_names_div.innerHTML = team1_html;
			team2_names_div.innerHTML = team2_html;
		}
		else if(msg_obj.status === "Lobby full")
		{
			disable_back_navigation();
			start_matchmaking_countdown(mm_status_div);
			
			team1_player1_name = players[0];
			team1_player2_name = players[1];
			team2_player1_name = players[2];
			team2_player2_name = players[3];
			
			team1_names_div.innerHTML = `
				<div class="text-white text-[20px] mb-2">${team1_player1_name}</div>
				<div class="text-white text-[20px] mb-2">${team1_player2_name}</div>
			`;
			team2_names_div.innerHTML = `
				<div class="text-white text-[20px] mb-2">${team2_player1_name}</div>
				<div class="text-white text-[20px] mb-2">${team2_player2_name}</div>
			`;
			
			exit_mm.classList.add("hidden");
		}

		matchmaking_popup.classList.remove("hidden");
	}

	function start_matchmaking_countdown(mm_status_div: HTMLDivElement)
	{
		const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");
		const matchmaking_popup = document.querySelector<HTMLDivElement>("#online2v2_matchmaking_popup");
		const team1_display_div = document.querySelector<HTMLDivElement>("#online2v2_team1_name_display");
		const team2_display_div = document.querySelector<HTMLDivElement>("#online2v2_team2_name_display");
		const map_input = document.querySelector<HTMLInputElement>("#input-map");
		const game_countdown_div = document.querySelector<HTMLDivElement>("#online_game_countdown");

		if(!game_countdown_div || !game_popup || !matchmaking_popup || !team1_display_div || !team2_display_div || !map_input) 
			throw new Error("start match countdown elements not found");

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
				game_popup.classList.remove("hidden");
				matchmaking_popup.classList.add("hidden");
				
				team1_display_div.innerHTML = `
					<h1 class="text-red-500">${team1_player1_name}</h1> <h1 class="text-white">&</h1> <h1 class="text-green-500">${team1_player2_name}</h1>
				`;
				team2_display_div.innerHTML = `
					<h1 class="text-blue-500">${team2_player1_name}</h1> <h1 class="text-white">&</h1> <h1 class="text-pink-500">${team2_player2_name}</h1>
				`;
				
				//change the map background style
				game_popup.style.backgroundImage = map_input.value;
				init_positions();
				render_positions();

				setTimeout(() => {
					if (my_player_index === 0)
						start_the_fkin_game();
				}, 4000);
				
				start_game_countdown(game_countdown_div);
			}
		}, 1000);
	}


	function handle_game_end(gameover_obj : any)
	{

		const online2v2_left_result = document.querySelector<HTMLDivElement>("#online2v2_left_result");
		const online2v2_left_name1 = document.querySelector<HTMLDivElement>("#online2v2_left_name1");
		const online2v2_left_name2 = document.querySelector<HTMLDivElement>("#online2v2_left_name2");
		const online2v2_left_point = document.querySelectorAll<HTMLDivElement>(".online2v2_left_point");

		const online2v2_right_result = document.querySelector<HTMLDivElement>("#online2v2_right_result");
		const online2v2_right_name1 = document.querySelector<HTMLDivElement>("#online2v2_right_name1");
		const online2v2_right_name2 = document.querySelector<HTMLDivElement>("#online2v2_right_name2");
		const online2v2_right_point = document.querySelectorAll(".online2v2_right_point");

		const online2v2_winner_popup = document.querySelector<HTMLDivElement>("#online_2v2_winner_popup");
		const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");
		const close_online_2v2_winner_popup_button = document.querySelector<HTMLButtonElement>("#close_online2v2_winner_popup");

		if(!game_popup || !online2v2_winner_popup || !close_online_2v2_winner_popup_button ||
			!online2v2_left_result || !online2v2_left_name1 || !online2v2_left_name2 || !online2v2_left_point ||
			!online2v2_right_result || !online2v2_right_name1 || !online2v2_right_name2 || !online2v2_right_point
		)
			throw new Error("Online2v2 winner display elements not found");

		enable_back_navigation();

		online2v2_left_name1.innerText = team1_player1_name;
		online2v2_left_name2.innerText = team1_player2_name;
		online2v2_right_name1.innerText = team2_player1_name;
		online2v2_right_name2.innerText = team2_player2_name;

		if(gameover_obj.winner == "team1")
		{
			online2v2_left_result.innerHTML = `<h2 class="match-win">${translate_text("Winner")}</h2>`;
			online2v2_left_point.forEach(e => {
				e.innerHTML = `<span class="result-win">+5<i class="fas fa-arrow-up"></i></span>`;
			})

			online2v2_right_result.innerHTML = `<h2 class="match-lose">${translate_text("Loser")}</h2>`;
			online2v2_right_point.forEach(e => {
				e.innerHTML = `<span class="result-lose">-5<i class="fas fa-arrow-down"></i></span>`;
			})
		}
		else
		{
			online2v2_right_result.innerHTML = `<h2 class="match-win">${translate_text("Winner")}</h2>`;
			online2v2_right_point.forEach(e => {
				e.innerHTML = `<span class="result-win">+5<i class="fas fa-arrow-up"></i></span>`;
			})

			online2v2_left_result.innerHTML = `<h2 class="match-lose">${translate_text("Loser")}</h2>`;
			online2v2_left_point.forEach(e => {
				e.innerHTML = `<span class="result-lose">-5<i class="fas fa-arrow-down"></i></span>`;
			})
		}

		online2v2_winner_popup.classList.remove("hidden");
		game_popup.classList.add("hidden");

		socket.close();
		cleanup_2v2_ui();

		close_online_2v2_winner_popup_button.addEventListener("click", () => {
			online2v2_winner_popup.classList.add("hidden");
		})
	}
}


const online2v2_matchmaking_popup = html`
	<div id="online2v2_matchmaking_popup" class="h-full px-48 space-y-6 flex flex-col justify-center hidden fixed bg-gray-950 inset-0 text-white inter-font">

		<!--Title -->
		<h1 id="online2v2_title" class="text-4xl text-center mb-6 font-bold">Online Lobby</h1>

		<!-- Game Information -->
		<section class="flex items-center justify-center space-x-4 mb-10">
			<span id="online2v2_gameinfo_text1" class="bg-white/20 px-6 py-1 font-medium rounded-full">Online</span>
			<span id="online2v2_gameinfo_text2" class="bg-white/20 px-6 py-1 font-medium rounded-full">2 vs 2</span>
			<span id="online2v2_gameinfo_text3" class="bg-white/20 px-6 py-1 font-medium rounded-full">4 Players</span>
		</section>
		
		<!-- Game Setting Header -->
		<header class="grid grid-cols-[3fr_2fr] gap-10 text-center">
			<h2 id="online2v2_header_text1" class="text-2xl font-bold pb-2">Map Selection</h2>
			<h2 id="online2v2_header_text2" class="text-2xl font-bold pb-2">Players</h2>
		</header>

		<!-- Game Setting Details -->
		<main class="grid grid-cols-[3fr_2fr] gap-10 mb-10">
		
			<!-- Map Selection -->
			<section class="grid grid-cols-2 gap-6 px-12">
				<div id="online2v2_map_none" data-map="" data-game="online2v2" class="mapselect-logic2 text-2xl flex items-center justify-center select-map">None</div>
				<img data-map="url('/map-1.avif')" class="mapselect-logic2 object-cover select-map" src="/map-1.avif" alt="map">
				<img data-map="url('/map-2.avif')" class="mapselect-logic2 object-cover select-map" src="/map-2.avif" alt="map">
				<img data-map="url('/map-3.png')" class="mapselect-logic2 object-cover select-map" src="/map-3.png" alt="map">
			</section>

			<!-- Player List -->
			<section class="w-full text-4xl font-bold flex flex-col items-center justify-center text-center space-y-6 rounded-xl">
				<h2 id="online2v2_team1_text" class="text-xl font-bold mb-4 border py-1 px-6 rounded-xl">Team 1</h2>
				<div id="online2v2_mm_team1_names"></div>
				<div class="w-1/4 pixel-font text-5xl text-yellow-400">VS</div>
				<h2 id="online2v2_team2_text" class="text-xl font-bold mb-4 border py-1 px-6 rounded-xl">Team 2</h2>
				<div id="online2v2_mm_team2_names"></div>
			</section>
		</main>

		<!-- Status Msg -->
		<div id="online2v2_mm_status" class="text-4xl mt-10"></div>
		
		<!--Exit Button -->
		<button id="online2v2_exit_matchmaking" class="absolute top-10 right-10 button-remove">
			<i class="fas fa-times text-black text-xl"></i>
		</button>
		
	</div>
`

const online_2v2_winner_popup = html`
	<div id="online_2v2_winner_popup" class="bg-gray-950 flex h-screen items-center justify-center hidden fixed inset-0 text-white inter-font">
		<div id="online_2v2_popup_screen" class="w-[70vw] h-[70vh] flex flex-col justify-between items-center">

			<!-- Tournament Title -->
			<h1 id="online2v2_winner_popup_title" class="text-5xl font-bold text-center">Match Result</h1>

			<!-- Result Layout -->
			<section class="grid grid-cols-2 w-full place-items-center">
				<!-- Left -->
				<div class="w-full space-y-10 px-12 text-center">
					<!-- Result Status -->
					<div id="online2v2_left_result" class="mb-20"></div>
					<!-- Player Details -->
					<div class="flex items-center justify-between px-4">
						<span id="online2v2_left_name1" class="text-2xl font-medium"></span>
						<div class="online2v2_left_point text-5xl flex"></div>
					</div>
					<div class="flex items-center justify-between px-4">
						<span id="online2v2_left_name2" class="text-2xl font-medium"></span>
						<div class="online2v2_left_point text-5xl flex"></div>
					</div>
				</div>
				
				<!-- Right -->
				<div class="w-full space-y-10 px-12 text-center">
					<!-- Result Status -->
					<div id="online2v2_right_result" class="mb-20"></div>
					<!-- Player Details -->
					<div class="flex items-center justify-between px-4">
						<span id="online2v2_right_name1" class="text-2xl font-medium"></span>
						<div class="text-5xl flex online2v2_right_point"></div>
					</div>
					<div class="flex items-center justify-between px-4">
						<span id="online2v2_right_name2" class="text-2xl font-medium"></span>
						<div class="text-5xl flex online2v2_right_point"></div>
					</div>
				</div>
			</section>
			<div id="online2v2_optional_msg"></div>

			<button id="close_online2v2_winner_popup" class="button-primary">Exit</button>
		</div>
	</div>
`
