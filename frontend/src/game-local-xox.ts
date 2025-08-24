/* eslint-disable @typescript-eslint/no-explicit-any */
import "./gamestyle.css";
import { WS } from "./class/WS";
import { removeAllEventListenersFromButton } from "./gameindex";
import { add_history } from "./spa-navigation";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

let gameState : any; 

//notes:
// general flow: start button clicked -> send {type: "start_game"} to backend -> backend send confirmation {type: "game_start" + gameState} to frontend
// click cell -> send {type: "make_move"} to backend -> backend send move result {type: "move_result" + gameState + last_move(row + col + symbol) + gameResult (if win or lose or tie)}
// if game end, render on frontend, backend will check for win lose now
//

export function xox_game_setup()
{
	const register_page = document.querySelector<HTMLDivElement>("#localxox_registration");
	const start_button = document.querySelector<HTMLButtonElement>("#localxox_start");
	const p1_name = document.querySelector<HTMLInputElement>("#localxox_name1_input");
	const p2_name = document.querySelector<HTMLInputElement>("#localxox_name2_input");

	const game_popup = document.querySelector<HTMLDivElement>("#xox_game_popup");

	const left_name_top = document.querySelector<HTMLDivElement>('#xoxleft_name_top');
	const left_name_mid = document.querySelector<HTMLDivElement>('#xoxleft_name_mid');
	const left_result = document.querySelector<HTMLDivElement>('#xoxleft_result');

	const right_name_top = document.querySelector<HTMLDivElement>('#xoxright_name_top');
	const right_name_mid = document.querySelector<HTMLDivElement>('#xoxright_name_mid');
	const right_result = document.querySelector<HTMLDivElement>('#xoxright_result');

	const instruction = document.querySelector<HTMLDivElement>('#xox_instruction');
	const map_input = document.querySelector<HTMLInputElement>("#input-map");

	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_xox`);

	if (!register_page || !start_button || !p1_name || !p2_name || !game_popup || !map_input ||
		!left_name_top || !left_name_mid || !left_result || !right_name_top || !right_name_mid || !right_result ||
		!instruction)
		throw new Error("Error: Required DOM elements not found");

	p1_name.addEventListener("input", (event: Event) => {
		verify_name_input(event);
	});

	p2_name.addEventListener("input", (event: Event) => {
		verify_name_input(event);
	});

	start_button.addEventListener("click", () => {
		if (socket.readyState === WebSocket.OPEN)
		{
			socket.send(JSON.stringify({
				type: "start_game",
				player1Name: p1_name.value || "Player 1",
				player2Name: p2_name.value || "Player 2"
			}));
		}
	});
		
	socket.addEventListener("message", (message : any) => {
		const msg_obj = JSON.parse(message.data);
		console.log(msg_obj);
		if(msg_obj.type === "game_start")
			handleGameStarted(msg_obj.gameState);
		else if(msg_obj.type === "move_result")
			handleMoveResult(msg_obj);
		else if(msg_obj.type === "error")
			console.log("Game error: ", msg_obj.message);
	});

		function setup_xox_event_listeners()
	{
		const cells = document.querySelectorAll<HTMLButtonElement>('[data-row][data-col]');
		let close_button = document.querySelector<HTMLButtonElement>('#xox_close_button');
		
		cells.forEach(cell => {
			cell = removeAllEventListenersFromButton(cell);
			
			// Add fresh listener
			cell.addEventListener("click", () => {
				if (cell.disabled) return;
				
				if (cell.dataset.row === undefined || cell.dataset.col === undefined)
				{
					console.error("Cell missing row or col data attributes");
					return;
				}

				const row = parseInt(cell.dataset.row, 10);
				const col = parseInt(cell.dataset.col, 10);

				// Send move to backend
				socket.send(JSON.stringify({
					type: "make_move",
					row: row,
					col: col
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

	function handleGameStarted(state: any)
	{
		const close_button = document.querySelector<HTMLButtonElement>('#xox_close_button');
		const cells = document.querySelectorAll<HTMLButtonElement>('[data-row][data-col]');

		gameState = state;

		if (!left_name_top || !right_name_top || !left_name_mid || !right_name_mid || 
			!left_result || !right_result || !close_button || 
			!instruction || !register_page || !game_popup || !map_input)
			throw new Error("handleGameStarted: required elements not found");

		left_name_top.innerText = state.player1Name;
		right_name_top.innerText = state.player2Name;

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
		register_page.classList.add("hidden");
		game_popup.classList.remove("hidden");

		//apply bg
		game_popup.style.backgroundImage = map_input.value;

		//setup even listeners
		setup_xox_event_listeners();

		xoxUpdateTurn(state);
	}

	function handleMoveResult(message: any)
	{
		gameState = message.gameState;
		const lastMove = message.lastMove;
		const gameResult = message.gameResult;

		//put symbol on cell
		const movedCell = document.querySelector<HTMLButtonElement>(`[data-row="${lastMove.row}"][data-col="${lastMove.col}"]`);
		if (movedCell)
		{
			movedCell.disabled = true;
			movedCell.innerHTML = html`<p class="${lastMove.symbol === 'X' ? "text-fuchsia-500" : "text-blue-500"}">${lastMove.symbol}</p>`;
		}

		//if got gameResult means game ended
		if (gameState.gameStatus === "finished")
		{
			if (gameResult.type === 'winner')
			{
				// Highlight winning pattern
				gameResult.winPattern.forEach(([row, col]: [number, number]) => {
					const target = document.querySelector<HTMLButtonElement>(`[data-row="${row}"][data-col="${col}"]`);
					if (!target) throw new Error("Error local_1v1_game buttons not found");
					target.classList.add("font-bold", "bg-white/20");
				});
				
				xoxWinner_popup(gameResult.winnerSymbol);
			}
			else if (gameResult.type === 'tie')
				xoxWinner_popup("");
		}
		else
			xoxUpdateTurn(gameState);
	}
}

////////////////////////////////////////////////////////////////////////////
// GAME UTILS FUNCTION
///////////////////////////////////////////////////////////////////////////

function verify_name_input(event: Event)
{
	const target = event.target as HTMLInputElement;
	if (!target) return;

	const input = target.value;
	const valid_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
	let clean_input = "";
	let invalid_char = false;

	const localxox_error_msg_div = document.querySelector<HTMLDivElement>("#localxox_error_msg");
	if (!localxox_error_msg_div)
		throw new Error("Error message div not found");

	for (const input_char of input)
	{
		if (valid_chars.includes(input_char))
			clean_input += input_char;
		else
			invalid_char = true;
	}

	if (input.length > 20)
	{
		localxox_error_msg_div.innerText = "Input too long";
		clean_input = clean_input.substring(0, 20);
	}
	else if (invalid_char)
		localxox_error_msg_div.innerText = "Numbers, alphabets and '_' only";
	else
		localxox_error_msg_div.innerText = "";

	target.value = clean_input;
}

function disableCells(status: boolean)
{
	const cells  = document.querySelectorAll<HTMLButtonElement>('[data-row][data-col]');
	cells.forEach(cell => { cell.disabled = status; });
}

function xoxWinner_popup(symbol: string)
{
	const left_name_mid  = document.querySelector<HTMLDivElement>('#xoxleft_name_mid');
	const left_result    = document.querySelector<HTMLDivElement>('#xoxleft_result')

	const right_name_mid  = document.querySelector<HTMLDivElement>('#xoxright_name_mid');
	const right_result    = document.querySelector<HTMLDivElement>('#xoxright_result');

	const instruction     = document.querySelector<HTMLDivElement>('#xox_instruction');
	const close_button    = document.querySelector<HTMLButtonElement>('#xox_close_button');

	if (!right_name_mid || !left_name_mid || !left_result || !right_result || !close_button || !instruction) 
		throw new Error("xoxWinner_popup: required elements not found");

	right_name_mid.innerHTML = gameState.player2Name;
	left_name_mid.innerHTML = gameState.player1Name;

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
	else // tie
	{
		right_result.innerHTML = `<h2 class="match-tie">Tie</h2>`;
		left_result.innerHTML = `<h2 class="match-tie">Tie</h2>`;
	}

	close_button.classList.remove("hidden");
	instruction.classList.add("hidden");
	disableCells(true);
}

//to change the bar at the top
function xoxUpdateTurn(state: any)
{
	const left_name_top  = document.querySelector<HTMLDivElement>('#xoxleft_name_top');
	const right_name_top  = document.querySelector<HTMLDivElement>('#xoxright_name_top');
	
	if (!left_name_top || !right_name_top)
		throw new Error("xoxUpdateTurn: required elements not found");
	
	left_name_top.classList.remove("bg-fuchsia-500");
	right_name_top.classList.remove("bg-blue-500");
	if (state.gameStatus === "playing")
	{
		if (state.whosTurn)
			left_name_top.classList.add("bg-fuchsia-500");
		else
			right_name_top.classList.add("bg-blue-500");
	}
}

///////////////////////////////////////////////////////////////////////////
// GAME HTML
////////////////////////////////////////////////////////////////////////////

export const xox_game_popup = html`
	<div id="xox_game_popup" class="bg-gray-950 flex flex-col items-center justify-between h-screen text-white inter-font hidden fixed inset-0 bg-cover bg-center">
		<div class="bg-black/70 py-16 size-full flex flex-col justify-center items-center">
			<!-- Top Display: Player Names -->
			<div class="flex items-center">
				<div class="border border-gray-600 rounded-l-full text-center text-4xl font-semibold py-1 px-6 bg-fuchsia-500">X</div>
				<div class="w-80 border-gray-600 border-y border-r text-center text-2xl font-semibold py-2 transition-all duration-300 ease-in-out" id="xoxleft_name_top"></div>
				<div class="w-80 border-gray-600 border-y text-center text-2xl font-semibold py-2" id="xoxright_name_top"></div>
				<div class="border border-gray-600 rounded-r-full text-center text-4xl font-semibold py-1 px-6 bg-blue-500">O</div>
			</div>

			<!-- Middle content -->
			<main class="size-full flex items-center justify-between">
				<!-- Left Result Popup -->
				<div class="w-1/3 flex flex-col items-center">
					<div id="xoxleft_result" class="mb-20 w-40"></div>
					<div id="xoxleft_name_mid" class="text-4xl font-bold"></div>	
				</div>

				<!-- XOX Grid -->
				<div class="grid grid-cols-3 text-9xl">
					<button data-row="0" data-col="0" class="border-r-4 border-b-4 size-36 cursor-pointer disabled:cursor-default"></button>
					<button data-row="0" data-col="1" class="border-b-4 border-x-4 size-36 cursor-pointer disabled:cursor-default"></button>
					<button data-row="0" data-col="2" class="border-l-4 border-b-4 size-36 cursor-pointer disabled:cursor-default"></button>
					<button data-row="1" data-col="0" class="border-r-4 border-y-4 size-36 cursor-pointer disabled:cursor-default"></button>
					<button data-row="1" data-col="1" class="border-4 size-36 cursor-pointer disabled:cursor-default"></button>
					<button data-row="1" data-col="2" class="border-l-4 border-y-4 size-36 cursor-pointer disabled:cursor-default"></button>
					<button data-row="2" data-col="0" class="border-r-4 border-t-4 size-36 cursor-pointer disabled:cursor-default"></button>
					<button data-row="2" data-col="1" class="border-x-4 border-t-4 size-36 cursor-pointer disabled:cursor-default"></button>
					<button data-row="2" data-col="2" class="border-l-4 border-t-4 size-36 cursor-pointer disabled:cursor-default"></button>
				</div>

				<!-- Right Result Popup -->
				<div class="w-1/3 flex flex-col items-center">
					<div id="xoxright_result" class="mb-20 w-40"></div>
					<div id="xoxright_name_mid" class="text-4xl font-bold"></div>	
				</div>
			</main>

			<!-- Instruction -->
			<div id="xox_instruction" class="text-center h-20">
				<p class="text-xl mb-2">Use left mouse button</p>
				<i class="fa-solid fa-computer-mouse text-3xl"></i>
			</div>
			
			<!-- Exit Button -->
			<div id="xox_close_button" class="h-20 flex items-center hidden">
				<button class="button-primary">Exit</button>
			</div>

			<div id="xox_game_message"></div>
		</div>
	</div>
`;