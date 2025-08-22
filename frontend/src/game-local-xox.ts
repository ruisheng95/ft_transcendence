import "./gamestyle.css";
import { add_history } from "./spa-navigation";
import { WS } from "./class/WS.ts";
import {fetch_data} from "./xox_dashboard.ts";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

// Game state
let whosTurn: boolean;
let grid: string[][];
let clickCounter: number;
const winPatterns = [
    [[0,0],[0,1],[0,2]],
    [[1,0],[1,1],[1,2]],
    [[2,0],[2,1],[2,2]],
    [[0,0],[1,0],[2,0]],
    [[0,1],[1,1],[2,1]],
    [[0,2],[1,2],[2,2]],
    [[0,0],[1,1],[2,2]],
    [[0,2],[1,1],[2,0]]
];

export function xox_game_setup()
{
	/////////////////////////////////////////////////////////////////////////////////////////
	// Acccess DOM
	/////////////////////////////////////////////////////////////////////////////////////////
	
	// Registration page
	const register_page = document.querySelector<HTMLDivElement>("#localxox_registration");
	const start_button  = document.querySelector<HTMLButtonElement>("#localxox_start");
	const p1_name       = document.querySelector<HTMLInputElement>("#localxox_name1_input");
	const p2_name       = document.querySelector<HTMLInputElement>("#localxox_name2_input");

	// Game page
	const game_popup    = document.querySelector<HTMLDivElement>("#xox_game_popup");
	const cells          = document.querySelectorAll<HTMLButtonElement>('[data-row][data-col]');

	const left_name_top  = document.querySelector<HTMLDivElement>('#xoxleft_name_top');
	const left_name_mid  = document.querySelector<HTMLDivElement>('#xoxleft_name_mid');
	const left_result    = document.querySelector<HTMLDivElement>('#xoxleft_result')

	const right_name_top  = document.querySelector<HTMLDivElement>('#xoxright_name_top');
	const right_name_mid  = document.querySelector<HTMLDivElement>('#xoxright_name_mid');
	const right_result    = document.querySelector<HTMLDivElement>('#xoxright_result');

	const instruction     = document.querySelector<HTMLDivElement>('#xox_instruction');
	const close_button    = document.querySelector<HTMLButtonElement>('#xox_close_button');

	// Map input
	const map_input = document.querySelector<HTMLInputElement>("#input-map");

	if (!register_page || !start_button || !p1_name || !p2_name || !close_button || !game_popup || !map_input ||
		!cells || !left_name_top || !left_name_mid || !left_result || !right_name_top || !right_name_mid || !right_result ||
		!instruction || !close_button 
	)
		throw new Error("Error local_1v1_game buttons not found");


	p1_name.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	p2_name.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	start_button.addEventListener("click", () => {

		left_name_top.innerText = p1_name.value || "player1";
		right_name_top.innerText = p2_name.value || "player2";

		clickCounter = 0;
		whosTurn = Math.random() < 0.5;
		
		grid = [
			['-', '-', '-'],
			['-', '-', '-'],
			['-', '-', '-']
		];

		cells.forEach(cell => {
			cell.innerHTML = "";
			cell.classList.remove("font-bold","bg-white/20");
		})
		disableCell(false);

		left_name_mid.innerText = "";
		left_result.innerHTML = "";
		right_name_mid.innerText = "";
		right_result.innerHTML = "";

		close_button.classList.add('hidden');
		instruction.classList.remove('hidden')
		register_page.classList.add("hidden");
		game_popup.classList.remove("hidden");

		game_popup.style.backgroundImage = map_input.value;
		xoxUpdateTurn();
		add_history("local/xox");
		console.log("Start Tic-Tac-Toe game");
	});

	cells.forEach(cell => {
		cell.addEventListener("click", () => {
			
			// Update UI
			cell.disabled = true;
			cell.innerHTML = whosTurn? html`<p class="text-fuchsia-500">X</p>` : html`<p class="text-blue-500">O</p>`;

			// Update grid 
			const current = (whosTurn? 'X' : 'O');
			if (cell.dataset.row !== undefined && cell.dataset.col !== undefined) {
				const y = parseInt(cell.dataset.row, 10);
				const x = parseInt(cell.dataset.col, 10);
				grid[y][x] = current;
			}
			
			// Check status
			const i = xoxCheckWinner(current);
			if (i != -1) 
			{
				winPatterns[i].forEach(([row, col]) => {
					const target = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)

					if (!target) throw new Error("Error local_1v1_game buttons not found");
					target.classList.add("font-bold","bg-white/20");
				})
				xoxWinner_popup(true);
			}
			else if (clickCounter === 9)
				xoxWinner_popup(false);
			else
				xoxUpdateTurn();
			
	})
	});

	close_button.addEventListener("click", () => {
		game_popup.classList.add("hidden");
		add_history("");
	});
}

////////////////////////////////////////////////////////////////////////////
// GAME UTILS FUNCTION
///////////////////////////////////////////////////////////////////////////


function verify_name_input(event : Event)
{
	const target = event.target as HTMLInputElement;
	if(target)
	{
		const input = target.value;
		const valid_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
		let clean_input = "";
		let invalid_char = false;

		const localxox_error_msg_div = document.querySelector<HTMLDivElement>("#localxox_error_msg");
		if(!localxox_error_msg_div) throw new Error("local1v1errordiv not found");

		for (const input_char of input)
		{
			if (valid_chars.includes(input_char))
				clean_input += input_char;
			else
				invalid_char = true;
		}

		if(input.length > 20)
		{
			localxox_error_msg_div.innerText = "Input too long";
			clean_input = clean_input.substring(0, 20);
		}
		else if (invalid_char == true)
			localxox_error_msg_div.innerText = "Numbers, alphabets and '_' only";
		else
			localxox_error_msg_div.innerText = "";

		target.value = clean_input;
	}
}

function disableCell(status: boolean)
{
	const cells  = document.querySelectorAll<HTMLButtonElement>('[data-row][data-col]');
	cells.forEach(cell => {cell.disabled = status});
}

function xoxWinner_popup(status: boolean) {
	
	const left_name_top  = document.querySelector<HTMLDivElement>('#xoxleft_name_top');
	const left_name_mid  = document.querySelector<HTMLDivElement>('#xoxleft_name_mid');
	const left_result    = document.querySelector<HTMLDivElement>('#xoxleft_result')

	const right_name_top  = document.querySelector<HTMLDivElement>('#xoxright_name_top');
	const right_name_mid  = document.querySelector<HTMLDivElement>('#xoxright_name_mid');
	const right_result    = document.querySelector<HTMLDivElement>('#xoxright_result');

	const instruction     = document.querySelector<HTMLDivElement>('#xox_instruction');
	const close_button    = document.querySelector<HTMLButtonElement>('#xox_close_button');

	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`);

	if (!left_name_top || !left_name_mid || !left_result || !right_name_top || !right_name_mid || !right_result ||
		!instruction || !close_button)
		throw new Error("Error local_1v1_game buttons not found");

	right_name_mid.innerHTML = right_name_top.innerText;
	left_name_mid.innerHTML = left_name_top.innerText;

	const sendObj = {
		left_name: left_name_top.innerText,
		left_result: 0,
		right_name: right_name_top.innerText,
		right_result: 0
	} 

	if (status)
	{
		if (whosTurn) {
			left_result.innerHTML = `<h2 class="match-win">Winner</h2>`; sendObj.left_result = 2;
			right_result.innerHTML = `<h2 class="match-lose">Loser</h2>`; sendObj.right_result = 1;
		}
		else {
			right_result.innerHTML = `<h2 class="match-win">Winner</h2>`; sendObj.left_result = 1;
			left_result.innerHTML = `<h2 class="match-lose">Loser</h2>`; sendObj.right_result = 2;
		}
	}
	else {
		right_result.innerHTML = `<h2 class="match-tie">Tie</h2>`;
		left_result.innerHTML = `<h2 class="match-tie">Tie</h2>`;
	}

	close_button.classList.remove('hidden');
	instruction.classList.add('hidden')
	disableCell(true);

	if(socket.readyState === WebSocket.OPEN)
		socket.send(JSON.stringify( {type: "add_xox_match", ...sendObj }));

	fetch_data();
}

function xoxCheckWinner(player: 'X' | 'O') {
	return winPatterns.findIndex(pattern => 
		pattern.every(([row, col]) => grid[row][col] === player)
	);
}

function xoxUpdateTurn() {

	const left_name_top  = document.querySelector<HTMLDivElement>('#xoxleft_name_top');
	const right_name_top  = document.querySelector<HTMLDivElement>('#xoxright_name_top');
	
	if (!left_name_top || !right_name_top)
		throw new Error("Error local_1v1_game buttons not found");

	whosTurn = !whosTurn;

	if (whosTurn) {
		left_name_top.classList.add("bg-fuchsia-500");
		right_name_top.classList.remove("bg-blue-500");
	}
	else {
		left_name_top.classList.remove("bg-fuchsia-500");
		right_name_top.classList.add("bg-blue-500");
	}

	clickCounter++;
}

///////////////////////////////////////////////////////////////////////////
// GAME HTML
////////////////////////////////////////////////////////////////////////////

export const xox_game_popup = html`
	<div id="xox_game_popup" class="bg-gray-950 flex flex-col items-center justify-between h-screen  text-white inter-font hidden fixed inset-0  bg-cover bg-center">
		<div class="bg-black/70 py-16 size-full flex flex-col justify-center items-center">

			<!-- Top Display: Player Names -->
			<div class="flex items-center">
				<!-- Left Player -->
				<div class="border border-gray-600  rounded-l-full text-center text-4xl font-semibold py-1 px-6 bg-fuchsia-500">
					X
				</div>
				<div class="w-80 border-gray-600 border-y border-r text-center text-2xl font-semibold py-2 transition-all duration-300 ease-in-out"
					id="xoxleft_name_top">
				</div>
				<!-- Right Player -->
				<div class="w-80 border-gray-600 border-y text-center text-2xl font-semibold py-2"
					id="xoxright_name_top">
				</div>
				<div class="border border-gray-600 rounded-r-full text-center text-4xl font-semibold py-1 px-6 bg-blue-500">
					O
				</div>
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
		</div>
	</div>
`;