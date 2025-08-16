/* eslint-disable @typescript-eslint/no-explicit-any */
import "./gamestyle.css";
import { add_history } from "./spa-navigation";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

//important notes:
// if paddles stop appearing again for some reason, hardcode the paddle height to 100px or change player_height = 150
// somehow it will renders

//local 2v2 game
export function local_2v2_game_setup()
{
	const local_2v2_start_button = document.querySelector<HTMLButtonElement>("#local_2v2_start_button"); // changed to start button
	const local_2v2_game_popup = document.querySelector<HTMLDivElement>("#local_2v2_game_popup");
	const local2v2_regist_page = document.querySelector<HTMLDivElement>("#local2v2_registration");

	const p1_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p1_name_input");
	const p2_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p2_name_input");
	const p3_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p3_name_input");
	const p4_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p4_name_input");
	
	const close_local2v2_winner_popup = document.querySelector<HTMLButtonElement>("#close_local2v2_winner_popup");
	const local2v2_winner_popup = document.querySelector<HTMLDivElement>("#local2v2_winner_popup");
	
	const map_input = document.querySelector<HTMLInputElement>("#input-map");

	if (!local2v2_regist_page || !local2v2_winner_popup || !close_local2v2_winner_popup || !p1_name_input_element || !p2_name_input_element || !p3_name_input_element || !p4_name_input_element || !local_2v2_start_button || !local_2v2_game_popup || !map_input)
		throw new Error("Error local_2v2_game buttons not found");

	p1_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	p2_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	p3_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	p4_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	local_2v2_start_button.addEventListener("click", () => {
		const local2v2_team1_name_display = document.querySelector<HTMLDivElement>("#local2v2_team1_name_display");
		const local2v2_team2_name_display = document.querySelector<HTMLDivElement>("#local2v2_team2_name_display");

		const p1_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p1_name_input");
		const p2_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p2_name_input");
		const p3_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p3_name_input");
		const p4_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p4_name_input");

		if(!local2v2_team1_name_display || !local2v2_team2_name_display || !p1_name_input_element ||  !p2_name_input_element || !p3_name_input_element || !p4_name_input_element)
			throw new Error("Error: local2v2 start game elements not found");

		const team1_display_name = `<h1 class="text-red-500">${p1_name_input_element.value || "player1"}</h1> <h1 class="text-white">&</h1> <h1 class="text-green-500">${p2_name_input_element.value || "player2"}</h1>`;
		const team2_display_name = `<h1 class="text-blue-500">${p3_name_input_element.value || "player3"}</h1> <h1 class="text-white">&</h1> <h1 class="text-pink-500">${p4_name_input_element.value || "player4"}</h1>`;
		
		local2v2_team1_name_display.innerHTML = team1_display_name;
		local2v2_team2_name_display.innerHTML = team2_display_name;

		local2v2_regist_page.classList.add("hidden");

		local_2v2_game_popup.classList.remove("hidden");
		local_2v2_game_popup.style.backgroundImage = map_input.value;
		local_2v2_game_init();
	});

	close_local2v2_winner_popup.addEventListener("click", () => {
		local2v2_winner_popup.classList.add("hidden");
		add_history("");
	});
}

const local2v2_winner_popup = html`
	<div id="local2v2_winner_popup" class="bg-black flex h-screen items-center justify-center hidden fixed inset-0 text-white">
		<div id="local2v2_popup_screen" class="w-[70vw] h-[70vh] flex flex-col justify-between items-center">

			<!-- Tournament Title -->
			<h1 class="text-5xl font-bold text-center">Match Result</h1>	
			
			<!-- Result Layout -->
			<section class="grid grid-cols-2 w-full place-items-center">
				<!-- Left -->
				<div class="w-full space-y-10 px-12 text-center">
					<div id="local2v2_left_result" class="mb-20"></div>
					<div id="local2v2_left_name1" class="text-4xl font-bold"></div>
					<div id="local2v2_left_name2" class="text-4xl font-bold"></div>	
				</div>
				<!-- Right -->
				<div class="w-full space-y-10 px-12 text-center">
					<div id="local2v2_right_result" class="mb-20"></div>
					<div id="local2v2_right_name1" class="text-4xl font-bold"></div>
					<div id="local2v2_right_name2" class="text-4xl font-bold"></div>		
				</div>
			</section>

			<!-- Exit Game Button -->
			<button id="close_local2v2_winner_popup" class="button-primary">Exit</button>
		</div>
	</div>
`

export const local_2v2_game_popup = html`
	<div id="local_2v2_game_popup" class="hidden bg-black bg-cover bg-center fixed inset-0">
		<div class="bg-black/70 h-full flex flex-col justify-center items-center text-white">
			<div id="local_2v2_game_board_area"></div>
			<div id="local2v2_player_names" class="flex gap-[600px] mb-[16px] mt-[20px]">
				<div id="local2v2_team1_name_display" class="text-2xl font-bold"><h1>Team 1</h1></div>
				<div id="local2v2_team2_name_display" class="text-2xl font-bold"><h1>Team 2</h1></div>
			</div>
		</div>
	</div>

	${local2v2_winner_popup}
`;

function verify_name_input(event : Event)
{
	const target = event.target as HTMLInputElement;
	if(target)
	{
		const input = target.value;
		const valid_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
		let clean_input = "";
		let invalid_char = false;

		const local2v2_error_msg_div = document.querySelector<HTMLDivElement>("#local2v2_error_msg");
		if(!local2v2_error_msg_div) throw new Error("local2v2errordiv not found");

		for (const input_char of input)
		{
			if (valid_chars.includes(input_char))
				clean_input += input_char;
			else
				invalid_char = true;

		}

		if(input.length > 20)
		{
			local2v2_error_msg_div.innerText = "Input too long";
			clean_input = clean_input.substring(0, 20);
		}
		else if (invalid_char == true)

			local2v2_error_msg_div.innerText = "Numbers, alphabets and '_' only";
		else
			local2v2_error_msg_div.innerText = ""

		target.value = clean_input;
	}
}

function local_2v2_game_init()
{
	const socket = new WebSocket("ws://localhost:3000/ws_2v2");

	const game_obj = document.querySelector<HTMLDivElement>("#local_2v2_game_board_area");

	//board stuff
	const boardHeight = 500;
	const boardWidth = 1000;
	const board_border_width = 4;

	//players settings
	const block_height = 100;
	const block_width = 10;
	const player_speed = 5;
	const player1Y = boardHeight / 4 - block_height / 2;
	const player2Y = (3 * boardHeight) / 4 - block_height / 2;
	const player3Y = (3 * boardHeight) / 4 - block_height / 2;
	const player4Y = boardHeight / 4 - block_height / 2;
	const player_indent = 20;

	//ball stuff
	const ball_len = 15;
	const ballX = boardWidth / 2 - ball_len / 2 - 3;
	const ballY = boardHeight / 2 - ball_len / 2;
	const dy = 2;
	const dx = 2;

	//key binds
	const key_binds = new Map();
	key_binds.set("w", "player1_up");
	key_binds.set("s", "player1_down");
	key_binds.set("t", "player2_up");
	key_binds.set("g", "player2_down");
	key_binds.set("=", "player3_up");
	key_binds.set("[", "player3_down");
	key_binds.set("ArrowUp", "player4_up");
	key_binds.set("ArrowDown", "player4_down");

	if(!game_obj) throw new Error("local2v2 init elements not found");

	game_obj.innerHTML = "";

	game_obj.innerHTML = `
	<div id="local2v2_game_buttons" class="flex gap-[400px] mb-[20px] mt-[20px]">
		<button id="close_local_2v2_game" type="button" class="text-white text-[20px] border border-white px-[10px] py-[5px]">Exit game</button>
		<button id="local2v2_start_game_button" type="button" class="text-white text-[20px] border border-white px-[10px] py-[5px]">Start game</button>
	</div>

	<div class="flex items-center">
		<!-- Left side controls -->
		<div class="flex flex-col space-y-4 mr-4">
			<div class="text-white text-center mb-2">Team 1</div>
			<div class="flex flex-col space-y-2">
				<div class="bg-red-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-red-500 text-white">W</div>
				<div class="bg-red-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-red-500 text-white">S</div>
			</div>
			<div class="flex flex-col space-y-2 mt-4">
				<div class="bg-green-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-green-500 text-white">T</div>
				<div class="bg-green-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-green-500 text-white">G</div>
			</div>
		</div>

		<!-- Game board -->
		<div id="local2v2_board" class="bg-black/60 relative border-4 border-white w-[${boardWidth}px] h-[${boardHeight}px]">
			<div id="local2v2_center_line" class="w-[1px] h-full border-l-4 border-dashed border-gray-500 mx-auto"></div>
			<div id="local2v2_ball" class="bg-yellow-300 rounded-full absolute" style="width: ${ball_len}px; height: ${ball_len}px; left: ${ballX}px; top: ${ballY}px;"></div>
			<div id="local2v2_player1" class="bg-red-500 rounded absolute w-[${block_width}px] h-[100px] left-[${player_indent}px] top-[${player1Y}px]"></div>
			<div id="local2v2_player2" class="bg-green-500 rounded absolute w-[${block_width}px] h-[100px] left-[${8 * player_indent}px] top-[${player2Y}px]"></div>
			<div id="local2v2_player3" class="bg-blue-500 rounded absolute w-[${block_width}px] h-[100px] left-[calc(100%-${8 * player_indent}px-${block_width}px] top-[${player3Y}px]"></div>
			<div id="local2v2_player4" class="bg-pink-500 rounded absolute w-[${block_width}px] h-[100px] left-[calc(100%-${player_indent}px-${block_width}px)] top-[${player4Y}px]"></div>
		</div>

		<!-- Right side controls -->
		<div class="flex flex-col space-y-4 ml-4">
			<div class="text-white text-center mb-2">Team 2</div>
			<div class="flex flex-col space-y-2">
				<div class="bg-blue-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-blue-500 text-white">=</div>
				<div class="bg-blue-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-blue-500 text-white">[</div>
			</div>
			<div class="flex flex-col space-y-2 mt-4">
				<div class="bg-pink-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-pink-500 text-white">
					<i class="fa fa-arrow-up"></i>
				</div>
				<div class="bg-pink-500/30 w-12 h-8 flex items-center justify-center font-bold text-sm rounded border border-pink-500 text-white">
					<i class="fa fa-arrow-down"></i>
				</div>
			</div>
		</div>
	</div>
	`;

	const start_game_button = document.querySelector<HTMLButtonElement>("#local2v2_start_game_button");
	const close_local_2v2_game = document.querySelector<HTMLButtonElement>("#close_local_2v2_game");
	const local_2v2_game_popup = document.querySelector<HTMLDivElement>("#local_2v2_game_popup");
	const board = document.querySelector<HTMLDivElement>("#local2v2_board");
	const player1 = document.querySelector<HTMLDivElement>("#local2v2_player1");
	const player2 = document.querySelector<HTMLDivElement>("#local2v2_player2");
	const player3 = document.querySelector<HTMLDivElement>("#local2v2_player3");
	const player4 = document.querySelector<HTMLDivElement>("#local2v2_player4");
	const ball = document.querySelector<HTMLDivElement>("#local2v2_ball");

	//bruh stupid ts
	if(!local_2v2_game_popup || !board || !player1 || !player2 || !player3 || !player4 || !ball || !start_game_button || !close_local_2v2_game)
		throw new Error("Required game elements not found 1");

	let playing = true;
	// Initial render to position elements correctly

	render_positions(ballX, ballY, player1Y, player2Y, player3Y, player4Y);
	socket.addEventListener("message", process_msg_from_socket);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
	start_game_button.addEventListener("click", start_the_fkin_game);
	close_local_2v2_game.addEventListener("click", () => {
		playing = false;
		local_2v2_game_popup.classList.add("hidden");
	});

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
			start_game_button.classList.add("hidden");
		
		//send the init JSON to backend
		if (socket.readyState === WebSocket.OPEN)
			socket.send(JSON.stringify(config_obj));
	}

	function process_msg_from_socket(message: MessageEvent)
	{
		//console.log("JSON recv to frontend");
		const msg_obj = JSON.parse(message.data);
			
		if(msg_obj.type == "game_update")
		{
			if(playing == false)
				return;
			render_positions(msg_obj.ballX, msg_obj.ballY, msg_obj.player1Y, msg_obj.player2Y, msg_obj.player3Y, msg_obj.player4Y);
		}
		else if(msg_obj.type == "game_over")
		{
			if(playing == false)
				return;
			playing = false;
			if (start_game_button)
				start_game_button.style.display = "block";
			local2v2_display_winner(msg_obj);
		}
	}

	function render_positions(ballX: number, ballY: number, player1Y: number, player2Y: number, player3Y: number, player4Y: number)
	{
		if(playing == false)
			return;

		if (ball && player1 && player2 && player3 && player4)
		{
			ball.style.left = ballX + "px";
			ball.style.top = ballY + "px";

			player1.style.left = player_indent + "px";
			player1.style.top = player1Y + "px";
			
			player2.style.left = (8 * player_indent)  + "px";
			player2.style.top = player2Y + "px";

			player3.style.right = (8 * player_indent) + "px";
			player3.style.top = player3Y + "px";

			player4.style.right = player_indent + "px";
			player4.style.top = player4Y + "px";
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

	function local2v2_display_winner(gameover_obj : any)
	{

		const local2v2_left_result = document.querySelector<HTMLDivElement>("#local2v2_left_result");
		const local2v2_left_name1 = document.querySelector<HTMLDivElement>("#local2v2_left_name1");
		const local2v2_left_name2 = document.querySelector<HTMLDivElement>("#local2v2_left_name2");

		const local2v2_right_result = document.querySelector<HTMLDivElement>("#local2v2_right_result");
		const local2v2_right_name1 = document.querySelector<HTMLDivElement>("#local2v2_right_name1");
		const local2v2_right_name2 = document.querySelector<HTMLDivElement>("#local2v2_right_name2");

		const local2v2_winner_popup = document.querySelector<HTMLDivElement>("#local2v2_winner_popup");
		const p1_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p1_name_input");
		const p2_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p2_name_input");
		const p3_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p3_name_input");
		const p4_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p4_name_input");
		const local_2v2_game_popup = document.querySelector<HTMLDivElement>("#local_2v2_game_popup");
		
		if(!local_2v2_game_popup || !local2v2_winner_popup || !p1_name_input_element ||
			!p2_name_input_element || !p3_name_input_element || !p4_name_input_element || 
			!local2v2_left_result || !local2v2_left_name1 || !local2v2_left_name2 ||
			!local2v2_right_result || !local2v2_right_name1 || !local2v2_right_name2 )
			throw new Error("Local2v2 winner display elements not found");
		
		local2v2_left_name1.innerText = p1_name_input_element.value || "Player1";
		local2v2_left_name2.innerText = p2_name_input_element.value || "Player2";
		local2v2_right_name1.innerText = p3_name_input_element.value || "Player3";
		local2v2_right_name2.innerText = p4_name_input_element.value || "Player4";

		if(gameover_obj.winner == "leftside") {
			local2v2_left_result.innerHTML = `<h2 class="match-win">Winner</h2>`;
			local2v2_right_result.innerHTML = `<h2 class="match-lose">Loser</h2>`;
		}
		else {
			local2v2_right_result.innerHTML = `<h2 class="match-win">Winner</h2>`;
			local2v2_left_result.innerHTML = `<h2 class="match-lose">Loser</h2>`;
		}
		
		local2v2_winner_popup.classList.remove("hidden");
		local_2v2_game_popup.classList.add("hidden");

		//remove the registration stuff for next use
		p1_name_input_element.value = "";
		p2_name_input_element.value = "";
		p3_name_input_element.value = "";
		p4_name_input_element.value = "";
	}
}