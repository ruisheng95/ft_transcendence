/* eslint-disable @typescript-eslint/no-explicit-any */
import { WS } from "./class/WS";

import { translate_text } from "./language";
import { removeAllEventListenersFromButton } from "./gameindex";
import { add_history } from "./spa-navigation";
import { disable_back_navigation } from "./spa-navigation";

let p1_name = "";
let p2_name = "";
let player_index = 0;

//notes:
// general flow: start button clicked -> open socket (backend will perform some matchmaking logic to place socket conn into a lobby) -> backend send {type: "matchmaking status"}
// render depending on msg_obj.status, either "waiting for players" or "Lobby full"
// after countdown, frontend will send {type: "start_game"} to backend, and backend will send confirmation {type: "game_start"} signal to display xox popup and start the game
// click cell -> send {type: "make_move"} to backend -> backend send move result {type: "game_update" + gameState + last_move(row + col + symbol) + gameResult (if win or lose or tie)}
// if game end, render on frontend, backend will check for win lose now
// player_assigned is to ensure that only one player send the {type: "start_game"} so u dont start two games lol

//additional notes:
// the online version for xox uses the same board as the local one
// hence i needed to remove all listeners and add listeners again to the buttons such as the cells cuz the socket theyre sending to are different

export function xox_online_play()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online-xox`);

	socket.addEventListener("message", (message : MessageEvent) => {
		const msg_obj = JSON.parse(message.data);
		console.log(msg_obj);

		if(msg_obj.type === "matchmaking_status")
			display_matchmaking_popup(msg_obj);
		else if(msg_obj.type === "game_start")
			handleGameStarted(msg_obj);
		else if(msg_obj.type === "game_update")
			handleMoveResult(msg_obj);
		else if(msg_obj.type === "player_assigned")
			player_index = msg_obj.player_index;
		else if(msg_obj.type === "idle_timeout")
			handleIdleTimout(msg_obj);
		else if(msg_obj.type === "error") //for now this isnt used but i have send a json if u click when its not ur turn
			console.log("Game error: ", msg_obj.message);
	});

	function display_matchmaking_popup(msg_obj : any)
	{
		const matchmaking_popup = document.querySelector<HTMLDivElement>("#onlinexox_matchmaking_popup");
		const p1_name_div = document.querySelector<HTMLDivElement>("#onlinexox_mm_p1_name");
		const p2_name_div = document.querySelector<HTMLDivElement>("#onlinexox_mm_p2_name");
		const mm_status_div = document.querySelector<HTMLDivElement>("#xox_mm_status");
		let exit_mm = document.querySelector<HTMLButtonElement>("#onlinexox_exit_matchmaking");

		if(!exit_mm || !mm_status_div || !matchmaking_popup || !p1_name_div || !p2_name_div) throw new Error("Display matchmaking popup elements not found");

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

			exit_mm.classList.remove("hidden");
			exit_mm = removeAllEventListenersFromButton(exit_mm);
			exit_mm.addEventListener("click", () => {
				matchmaking_popup.classList.add("hidden");
				socket.close();
				WS.removeInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online-xox`);
				add_history("/tic_tac_toe");
			});

			p1_name = players[0];
			p2_name = `<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>` //spinning circle animation
		}
		else if(msg_obj.status === "Lobby full")
		{
			exit_mm.classList.add("hidden");
			disable_back_navigation();
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
		console.log("called start match countdown");
		const game_popup = document.querySelector<HTMLDivElement>("#xox_game_popup");
		const matchmaking_popup = document.querySelector<HTMLDivElement>("#onlinexox_matchmaking_popup");
		const map_input = document.querySelector<HTMLInputElement>("#input-map");

		if(!game_popup || !matchmaking_popup || !map_input) throw new Error("start match countdown elements not found");

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
				<div>${translate_text("Match found!")}</div>
				<div>${translate_text("Match starting in")} ${countdown}</div>
			</div>
			`;
			
			countdown--;
			
			if (countdown < 0)
			{
				clearInterval(interval);
				game_popup.classList.remove("hidden");
				game_popup.style.backgroundImage = map_input.value;
				matchmaking_popup.classList.add("hidden");

				// Setup click listeners for the game cells
				setup_xox_event_listeners(socket);

				//send game start JSON ONLY IF playerindex === 0 to avoid starting two games
				if(player_index == 0)
					socket.send(JSON.stringify({type: "game_start"}));
			}
		}, 1000);
	}

	function setup_xox_event_listeners(socket: WebSocket)
	{
		const cells = document.querySelectorAll<HTMLButtonElement>('[data-row][data-col]');
		let close_button = document.querySelector<HTMLButtonElement>('#xox_close_button');

		//remove any event listeners to add new ones
		cells.forEach(cell => {
			cell = removeAllEventListenersFromButton(cell);			
			cell.addEventListener("click", () => {

				if (cell.disabled)
					return;
				
				if (cell.dataset.row === undefined || cell.dataset.col === undefined)
				{
					console.error("Cell missing row or col data attributes");
					return;
				}

				const row = parseInt(cell.dataset.row, 10);
				const col = parseInt(cell.dataset.col, 10);

				socket.send(JSON.stringify({
					type: "make_move",
					cell: { row: row, col: col }
				}));
			});
		});

		if (close_button)
		{
			close_button = removeAllEventListenersFromButton(close_button);
			close_button.addEventListener("click", () => {
				const game_popup = document.querySelector<HTMLDivElement>("#xox_game_popup");
				if (game_popup)
					game_popup.classList.add("hidden");
				add_history("/tic_tac_toe");
			});
		}
	}

	function handleGameStarted(msg_obj: any)
	{
		const gameState = msg_obj.gameState;

		const left_name_top = document.querySelector<HTMLDivElement>('#xoxleft_name_top');
		const right_name_top = document.querySelector<HTMLDivElement>('#xoxright_name_top');
		const left_name_mid = document.querySelector<HTMLDivElement>('#xoxleft_name_mid');
		const right_name_mid = document.querySelector<HTMLDivElement>('#xoxright_name_mid');
		const left_result = document.querySelector<HTMLDivElement>('#xoxleft_result');
		const right_result = document.querySelector<HTMLDivElement>('#xoxright_result');
		const instruction = document.querySelector<HTMLDivElement>('#xox_instruction');
		const close_button = document.querySelector<HTMLButtonElement>('#xox_close_button');
		const cells = document.querySelectorAll<HTMLButtonElement>('[data-row][data-col]');

		if (!left_name_top || !right_name_top || !left_name_mid || !right_name_mid || 
			!left_result || !right_result || !instruction || !close_button)
			throw new Error("handleGameStarted: required elements not found");

		left_name_top.innerText = p1_name || "Player 1";
		right_name_top.innerText = p2_name || "Player 2";

		//clear board
		cells.forEach((cell) => {
			cell.innerHTML = "";
			cell.classList.remove("font-bold", "bg-white/20");
			cell.disabled = false;
		});

		left_name_mid.innerText = "";
		left_result.innerHTML = "";
		right_name_mid.innerText = "";
		right_result.innerHTML = "";

		close_button.classList.add("hidden");
		instruction.classList.remove("hidden");

		console.log("Entered this ft");

		// Update turn indicator
		xoxUpdateTurn(gameState);
	}

	function handleMoveResult(msg_obj: any)
	{
		const gameState = msg_obj.gameState;
		const lastMove = msg_obj.lastMove;
		const gameResult = msg_obj.gameResult;

		//put symbol on cell
		const movedCell = document.querySelector<HTMLButtonElement>(`[data-row="${lastMove.row}"][data-col="${lastMove.col}"]`);
		if (movedCell)
		{
			movedCell.disabled = true;
			movedCell.innerHTML = `<p class="${lastMove.symbol === 'X' ? "text-fuchsia-500" : "text-blue-500"}">${lastMove.symbol}</p>`;
		}

		//handle finished game
		if (gameState.gameStatus === "finished" && gameResult)
		{
			if (gameResult.type === 'winner')
			{
				// Highlight winning pattern
				gameResult.winPattern.forEach(([row, col]: [number, number]) => {
					const target = document.querySelector<HTMLButtonElement>(`[data-row="${row}"][data-col="${col}"]`);
					if (target) {
						target.classList.add("font-bold", "bg-white/20");
					}
				});
				xoxWinner_popup(gameResult.winnerSymbol);
			}
			else if (gameResult.type === 'tie')
				xoxWinner_popup("");
		}
		else
			xoxUpdateTurn(gameState);
	}

	function handleIdleTimout(msg_obj : any)
	{
		const xox_game_message_div = document.querySelector<HTMLDivElement>("#xox_game_message");

		if(!xox_game_message_div) throw new Error("handleIdleTimeout elements not found");

		xoxWinner_popup(msg_obj.idlePlayer === 'X' ? 'O' : 'X'); //send the symbol opposite to the person who timeout as the winner
		xox_game_message_div.innerHTML = `Game ended because player has idled for too long`;
	}

	function xoxUpdateTurn(gameState: any)
	{
		console.log("SUPPOSINGLY RECEIVEd: ", gameState);
		const left_name_top = document.querySelector<HTMLDivElement>('#xoxleft_name_top');
		const right_name_top = document.querySelector<HTMLDivElement>('#xoxright_name_top');
		
		if (!left_name_top || !right_name_top) return;
		
		left_name_top.classList.remove("bg-fuchsia-500");
		right_name_top.classList.remove("bg-blue-500");
		
		if (gameState.gameStatus === "playing")
		{
			if (gameState.whosTurn === true)
				left_name_top.classList.add("bg-fuchsia-500");
			else
				right_name_top.classList.add("bg-blue-500");
		}
	}

	function disableCells(status: boolean)
	{
		const cells  = document.querySelectorAll<HTMLButtonElement>('[data-row][data-col]');
		cells.forEach(cell => { cell.disabled = status; });
	}

	function xoxWinner_popup(symbol: string)
	{
		const left_name_mid = document.querySelector<HTMLDivElement>('#xoxleft_name_mid');
		const left_result = document.querySelector<HTMLDivElement>('#xoxleft_result');
		const right_name_mid = document.querySelector<HTMLDivElement>('#xoxright_name_mid');
		const right_result = document.querySelector<HTMLDivElement>('#xoxright_result');
		const instruction = document.querySelector<HTMLDivElement>('#xox_instruction');
		const close_button = document.querySelector<HTMLButtonElement>('#xox_close_button');

		if (!left_name_mid || !left_result || !right_name_mid || !right_result || 
			!instruction || !close_button) return;

		left_name_mid.innerHTML = p1_name || "Player 1";
		right_name_mid.innerHTML = p2_name || "Player 2";

		// Show results
		if (symbol === "X")
		{
			left_result.innerHTML = `<h2 class="match-win">Winner</h2>`;
			right_result.innerHTML = `<h2 class="match-lose">Loser</h2>`;
		}
		else if (symbol === "O")
		{
			right_result.innerHTML = `<h2 class="match-win">Winner</h2>`;
			left_result.innerHTML = `<h2 class="match-lose">Loser</h2>`;
		}
		else //tie
		{
			right_result.innerHTML = `<h2 class="match-tie">Tie</h2>`;
			left_result.innerHTML = `<h2 class="match-tie">Tie</h2>`;
		}

		//show close button
		close_button.classList.remove("hidden");
		instruction.classList.add("hidden");
		disableCells(true);

		socket.close();
		WS.removeInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online-xox`);
	}
}

const onlinexox_matchmaking_popup = `
	<div id="onlinexox_matchmaking_popup" class="h-full px-48 space-y-6 flex flex-col justify-center hidden fixed bg-gray-950 inset-0 text-white inter-font">
		
		<!--Title -->
		<h1 id="onlinexox_title" class="text-4xl text-center mb-6 font-bold">Online Lobby</h1>

		<!-- Game Information -->
		<section class="flex items-center justify-center space-x-4 mb-10">
			<span id="onlinexox_gameinfo_text1" class="bg-white/20 px-6 py-1 font-medium rounded-full">Online</span>
			<span id="onlinexox_gameinfo_text2" class="bg-white/20 px-6 py-1 font-medium rounded-full">XOX</span>
			<span id="onlinexox_gameinfo_text3" class="bg-white/20 px-6 py-1 font-medium rounded-full">2 Players</span>
		</section>
		
		<!-- Game Setting Header -->
		<header class="grid grid-cols-[3fr_2fr] gap-10 text-center">
			<h2 id="onlinexox_header_text1" class="text-2xl font-bold pb-2">Map Selection</h2>
			<h2 id="onlinexox_header_text2" class="text-2xl font-bold pb-2">Players</h2>
		</header>

		<!-- Game Setting Details -->
		<main class="grid grid-cols-[3fr_2fr] gap-10 mb-10">
		
			<!-- Map Selection -->
			<section class="grid grid-cols-2 gap-6 px-12">
				<div id="onlinexox_map_none" data-map="" data-game="onlinexox" class="mapselect-logic text-2xl flex items-center justify-center select-map">None</div>
				<img data-map="url('/map-1.avif')" class="mapselect-logic object-cover select-map" src="/map-1.avif" alt="map">
				<img data-map="url('/map-2.avif')" class="mapselect-logic object-cover select-map" src="/map-2.avif" alt="map">
				<img data-map="url('/map-3.png')" class="mapselect-logic object-cover select-map" src="/map-3.png" alt="map">
			</section>

			<!-- Player List -->
			<section class="w-full text-4xl font-bold flex flex-col items-center justify-center text-center space-y-12  py-12 rounded-xl">

				<div id="onlinexox_mm_p1_name"></div>
				<div class="w-1/4 pixel-font text-5xl text-yellow-400">VS</div>
				<div id="onlinexox_mm_p2_name"></div>

			</section>
		</main>

		<!-- Status Msg -->
		<div id="xox_mm_status" class="text-4xl mt-10"></div>
		
		<!--Exit Button -->
		<button id="onlinexox_exit_matchmaking" class="absolute top-10 right-10 button-remove">
			<i id="onlinexox_exit_mm_icon" class="fas fa-times text-black text-xl"></i>
		</button>
	</div>
`;

export const onlinexox_popups = `
	${onlinexox_matchmaking_popup}
`