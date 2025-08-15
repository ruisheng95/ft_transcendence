/* eslint-disable @typescript-eslint/no-explicit-any */
import { add_history, disable_navigation, enable_navigation, terminate_history } from "./spa-navigation";

// let first_call_flag = false;

function add_2v2_popups_to_dom() {
	if (document.querySelector("#online2v2_matchmaking_popup")) {
		return;
	}
	
	const popupHTML = `
		${online2v2_matchmaking_popup}
		${online_2v2_winner_popup}
	`;
	document.body.insertAdjacentHTML('beforeend', popupHTML);
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
		team1_display.innerHTML = "<h1>Team 1</h1>";
		player_names_container.appendChild(team1_display);
	}
	
	if (!team2_display) {
		team2_display = document.createElement("div");
		team2_display.id = "online2v2_team2_name_display";
		team2_display.className = "text-2xl font-bold";
		team2_display.innerHTML = "<h1>Team 2</h1>";
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

	// Add unique ID to test using the same browser
	const sessionParam = localStorage.getItem("session") || "";
	const uniqueId = Date.now() + Math.random(); 
	const socketUrl = `${import.meta.env.VITE_SOCKET_URL}/ws-online-2v2?session=${sessionParam}&uid=${uniqueId}`;
	const socket = new WebSocket(socketUrl);

	const game_obj = document.querySelector<HTMLDivElement>("#online_game_board_area");
	
	if(!game_obj) throw new Error("Game obj not found");
	
	game_obj.innerHTML = "";

	game_obj.innerHTML = `
	<div id="game_buttons" class="flex gap-[400px] mb-[20px] mt-[20px]">
		<button id="online2v2_close_game" type="button" class="text-white text-[20px] border border-white px-[10px] py-[5px]">Exit game</button>
		<button id="online2v2_start_game_button" type="button" class="text-white text-[20px] border border-white px-[10px] py-[5px]">Start game</button>
	</div>

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

	const start_game_button = document.querySelector<HTMLButtonElement>("#online2v2_start_game_button");
	const board = document.querySelector<HTMLDivElement>("#online2v2_game_board");
	const leftplayer1 = document.querySelector<HTMLDivElement>("#online2v2_leftplayer1");
	const leftplayer2 = document.querySelector<HTMLDivElement>("#online2v2_leftplayer2");
	const rightplayer1 = document.querySelector<HTMLDivElement>("#online2v2_rightplayer1");
	const rightplayer2 = document.querySelector<HTMLDivElement>("#online2v2_rightplayer2");
	const ball = document.querySelector<HTMLDivElement>("#online2v2_game_ball");
	const close_game_button = document.querySelector<HTMLButtonElement>("#online2v2_close_game");
	const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");

	//bruh stupid ts
	if(!board || !leftplayer1 || !leftplayer2 || !rightplayer1 || !rightplayer2 || !ball || !start_game_button || !game_popup || !close_game_button)
		throw new Error("Required game elements not found 4");

	//vars
	let ball_len = 0, ballX = 0, ballY = 0, dy = 0, dx = 0,
    boardHeight = 0, boardWidth = 0, board_border_width = 0,
    block_height = 0, block_width = 0, player_speed = 0,
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
	start_game_button.addEventListener("click", start_the_fkin_game)

	close_game_button.addEventListener("click", () => {
		game_popup.classList.add("hidden");
		playing = false;
		cleanup_2v2_ui();
		terminate_history();
		socket.close();
	});

	setup_2v2_ui();

	function start_the_fkin_game()
	{
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
		
		if (socket.readyState === WebSocket.OPEN)
			socket.send(JSON.stringify(config_obj));
	}

	function process_msg_from_socket(message: MessageEvent)
	{
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

			if (start_game_button)
				start_game_button.style.display = "none";

			ballX = msg_obj.ballX;
			ballY = msg_obj.ballY;
			leftplayer1Y = msg_obj.leftplayer1Y;
			leftplayer2Y = msg_obj.leftplayer2Y;
			rightplayer1Y = msg_obj.rightplayer1Y;
			rightplayer2Y = msg_obj.rightplayer2Y;
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
		if(ball && board && leftplayer1 && leftplayer2 && rightplayer1 && rightplayer2)
		{
			ball_len = ball.clientWidth;
			ballX = board.clientWidth / 2 - ball_len / 2;
			ballY = board.clientHeight / 2 - ball_len / 2;
			dy = 2;
			dx = 2;

			boardHeight = board.clientHeight;
			boardWidth = board.clientWidth;
			board_border_width = parseInt(getComputedStyle(board).borderLeftWidth);

			block_height = leftplayer1.clientHeight;
			block_width = leftplayer1.clientWidth;
			player_speed = 5;
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
				<div>Searching for players (${players.length}/4)</div>
				<div class="animate-pulse [animation-delay:0ms]">.</div>
				<div class="animate-pulse [animation-delay:300ms]">.</div>
				<div class="animate-pulse [animation-delay:600ms]">.</div>
			</div>
			` 

			exit_mm.addEventListener("click", () => {
				matchmaking_popup.classList.add("hidden");
				socket.close();
				cleanup_2v2_ui();
				add_history("");
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
						team1_html += `<div class="text-gray-500 text-[20px] mb-2">Waiting...</div>`;
					} else {
						team2_html += `<div class="text-gray-500 text-[20px] mb-2">Waiting...</div>`;
					}
				}
			}
			
			team1_names_div.innerHTML = team1_html;
			team2_names_div.innerHTML = team2_html;
		}
		else if(msg_obj.status === "Lobby full")
		{
			disable_navigation();
			start_match_countdown(mm_status_div);
			
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

	function start_match_countdown(mm_status_div: HTMLDivElement)
	{
		const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");
		const matchmaking_popup = document.querySelector<HTMLDivElement>("#online2v2_matchmaking_popup");
		const team1_display_div = document.querySelector<HTMLDivElement>("#online2v2_team1_name_display");
		const team2_display_div = document.querySelector<HTMLDivElement>("#online2v2_team2_name_display");

		if(!game_popup || !matchmaking_popup || !team1_display_div || !team2_display_div) 
			throw new Error("start match countdown elements not found");

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
				
				team1_display_div.innerHTML = `
					<h1 class="text-red-500">${team1_player1_name}</h1> <h1 class="text-white">&</h1> <h1 class="text-green-500">${team1_player2_name}</h1>
				`;
				team2_display_div.innerHTML = `
					<h1 class="text-blue-500">${team2_player1_name}</h1> <h1 class="text-white">&</h1> <h1 class="text-pink-500">${team2_player2_name}</h1>
				`;
				
				init_positions();
				render_positions();
			}
		}, 1000);
	}

	function handle_game_end(gameover_obj : any)
	{
		const online2v2_winner_div = document.querySelector<HTMLDivElement>("#online2v2_winner_name");
		const online2v2_loser_div = document.querySelector<HTMLDivElement>("#online2v2_loser_name");
		const online2v2_winner_popup = document.querySelector<HTMLDivElement>("#online_2v2_winner_popup");
		const game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");
		const close_online_2v2_winner_popup_button = document.querySelector<HTMLButtonElement>("#close_online2v2_winner_popup");

		if(!online2v2_loser_div || !game_popup || !online2v2_winner_popup || !online2v2_winner_div || !close_online_2v2_winner_popup_button)
			throw new Error("Online2v2 winner display elements not found");

		enable_navigation();
		if(gameover_obj.winner == "team1")
		{
			online2v2_winner_div.innerHTML = `Winners🏆: ${team1_player1_name} & ${team1_player2_name} <p class="text-green-500">+5 each</p>`;
			online2v2_loser_div.innerHTML = `Losers💔: ${team2_player1_name} & ${team2_player2_name} <p class="text-red-500">-5 each</p>`;
		}
		else
		{
			online2v2_winner_div.innerHTML = `Winners🏆: ${team2_player1_name} & ${team2_player2_name} <p class="text-green-500">+5 each</p>`;
			online2v2_loser_div.innerHTML = `Losers💔: ${team1_player1_name} & ${team1_player2_name} <p class="text-red-500">-5 each</p>`;
		}

		online2v2_winner_popup.classList.remove("hidden");
		game_popup.classList.add("hidden");

		socket.close();
		cleanup_2v2_ui();

		close_online_2v2_winner_popup_button.addEventListener("click", () => {
			online2v2_winner_popup.classList.add("hidden");
			add_history("");
		})
	}
}

const online2v2_matchmaking_popup = `
	<div id="online2v2_matchmaking_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0">
		<div class="relative p-6 bg-black text-white border border-white">
			<h1 class="text-[5vh] font-semibold mt-[3vh] mb-[10vh]"><center>Online 2v2 matchmaking lobby</center></h1>
			
			<div class="flex justify-center items-center gap-8">
				<div class="text-center">
					<h2 class="text-white text-[3vh] font-bold mb-4">Team 1</h2>
					<div id="online2v2_mm_team1_names" class="text-white text-[3vh] font-bold border border-white px-4 py-2 min-h-[120px]">
					</div>
				</div>
				<div class="text-white text-[3vh] font-bold">VS</div>
				<div class="text-center">
					<h2 class="text-white text-[3vh] font-bold mb-4">Team 2</h2>
					<div id="online2v2_mm_team2_names" class="text-white text-[3vh] font-bold border border-white px-4 py-2 min-h-[120px]">
					</div>
				</div>
			</div>

			<div class="flex flex-col items-center">
			<div id="online2v2_mm_status" class="text-white mt-[10vh] text-[4vh]"></div>
				<button id="online2v2_exit_matchmaking" class="border border-white px-[4vw] py-2 mt-[3vh]">Exit</button>
			</div>
		</div>
	</div>
`

const online_2v2_winner_popup = `
	<div id="online_2v2_winner_popup" class="border border-2 border-white flex flex-col justify-center items-center hidden fixed bg-black bg-opacity-90 inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="online_2v2_popup_screen" class="bg-black border border-2 border-white w-[50%] h-[50%] flex flex-col justify-center items-center">

			<div class="text-center flex flex-col items-center">
				<h1 class="text-[50px] text-white mb-6">Game over!</h1>

				<h1 class="text-[30px] text-white mb-2">Results:</h1>
				<div class="w-[60%] border-t-2 border-white mb-4"></div>
				<div id="online2v2_winner_name" class="text-[20px] font-bold mb-2 text-white flex gap-2"></div>
				<div id="online2v2_loser_name" class="text-[20px] font-bold mb-6 text-white flex gap-2"></div>
			</div>

			<button id="close_online2v2_winner_popup" class="border-1 border-white text-white text-[20px] px-[5px] py-[5px]">close</button>
		</div>
	</div>
`
