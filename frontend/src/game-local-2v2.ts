/* eslint-disable @typescript-eslint/no-explicit-any */
import "./gamestyle.css";
import { add_history } from "./spa-navigation";

//local 2v2 game
export function local_2v2_game_setup()
{
	const local_2v2_start_button = document.querySelector<HTMLButtonElement>("#local_2v2_start_button"); // changed to start button
	const local_2v2_game_popup = document.querySelector<HTMLDivElement>("#local_2v2_game_popup");
	const close_local_2v2_game = document.querySelector<HTMLButtonElement>("#close_local_2v2_game");
	const local2v2_regist_page = document.querySelector<HTMLDivElement>("#local2v2_registration");

	const p1_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p1_name_input");
	const p2_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p2_name_input");
	const p3_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p3_name_input");
	const p4_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p4_name_input");
	
	const close_local2v2_winner_popup = document.querySelector<HTMLButtonElement>("#close_local2v2_winner_popup");
	const local2v2_winner_popup = document.querySelector<HTMLDivElement>("#local2v2_winner_popup");

	if (!local2v2_regist_page || !local2v2_winner_popup || !close_local2v2_winner_popup || !p1_name_input_element || !p2_name_input_element || !p3_name_input_element || !p4_name_input_element || !local_2v2_start_button || !local_2v2_game_popup || !close_local_2v2_game)
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
		const local2v2_p1_name_display = document.querySelector<HTMLDivElement>("#local2v2_p1_name_display");
		const local2v2_p2_name_display = document.querySelector<HTMLDivElement>("#local2v2_p2_name_display");

		const p1_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p1_name_input");
		const p2_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p2_name_input");
		const p3_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p3_name_input");
		const p4_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p4_name_input");

		if(!local2v2_p1_name_display || !local2v2_p2_name_display || !p1_name_input_element ||  !p2_name_input_element || !p3_name_input_element || !p4_name_input_element)
			throw new Error("Error: local2v2 start game elements not found");

		const p1_display_name = (p1_name_input_element.value || "player1") + "<br>and<br>" + (p2_name_input_element.value || "player2");
		const p2_display_name = (p3_name_input_element.value || "player3") + "<br>and<br>" + (p4_name_input_element.value || "player4");
		
		local2v2_p1_name_display.innerHTML = `<h1>${p1_display_name}</h1>`;
		local2v2_p2_name_display.innerHTML = `<h1>${p2_display_name}</h1>`;

		local2v2_regist_page.classList.add("hidden");

		local_2v2_game_popup.classList.remove("hidden");
		local_2v2_game_init();
	});

	close_local_2v2_game.addEventListener("click", () => {
		local_2v2_game_popup.classList.add("hidden");
	});

	close_local2v2_winner_popup.addEventListener("click", () => {
		local2v2_winner_popup.classList.add("hidden");
		add_history("");
	});
}

const local2v2_winner_popup = `
	<div id="local2v2_winner_popup" class="border border-2 border-white flex flex-col justify-center items-center hidden fixed bg-black bg-opacity-90 inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="local2v2_popup_screen" class="bg-black border border-2 border-white w-[50%] h-[50%] flex flex-col justify-center items-center">

			<div class="text-center text-white">
				<h1 class="text-[50px] text-white">WINNER! 🎉:</h1>
				<div id="local2v2_winner_name" class="text-[40px] font-bold mb-6 text-white"></div>
				<div class="text-[50px] mb-6 text-white">Congratulations</div>
			</div>

			<button id="close_local2v2_winner_popup" class="border-1 border-white text-white text-[20px] px-[5px] py-[5px]">close</button>
		</div>
	</div>
`

export const local_2v2_game_popup = `
	<div id="local_2v2_game_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0">
		<div class="relative m-0 p-0 bg-black text-white">
			<button id="close_local_2v2_game" class="absolute top-[10px] right-[10px] text-white text-[20px] border border-white px-[10px] py-[5px]">Exit game</button>
			<h1 class="text-[5vh] font-semibold mt-[3vh] mb-[3vh]"><center>Local 2v2 Game</center></h1>
			
			<div class="flex justify-center items-center">
				<div id="local2v2_p1_name_display" class="text-center text-white text-[3vh] font-bold mr-[20px]"><h1>player1</h1></div>
				<div id="local_2v2_game"></div>
				<div id="local2v2_p2_name_display" class="text-center text-white text-[3vh] font-bold ml-[20px]"><h1>player2</h1></div>
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
			local2v2_error_msg_div.classList.add("hidden");
			if (valid_chars.includes(input_char))
				clean_input += input_char;
			else
				invalid_char = true;

		}

		if(input.length > 20)
		{
			local2v2_error_msg_div.classList.remove("hidden");
			local2v2_error_msg_div.innerHTML = `<h1 class="text-red-500 text-[15px]"> Input too long </h1>`;
			clean_input = clean_input.substring(0, 20);
		}
		else if (invalid_char == true)
		{
			local2v2_error_msg_div.classList.remove("hidden");
			local2v2_error_msg_div.innerHTML = `<h1 class="text-red-500 text-[15px]"> Numbers, alphabets and '_' only </h1>`;
		}
		else
			local2v2_error_msg_div.classList.add("hidden");

		target.value = clean_input;
	}
}

function local_2v2_game_init()
{
	const socket = new WebSocket("ws://localhost:3000/ws_2v2");

	const game_obj = document.querySelector<HTMLDivElement>("#local_2v2_game");

	if (game_obj)
		game_obj.innerHTML = `
	<button id="local2v2_start_game_button" type="button" class="bg-black text-white w-[10vw] h-[10vh] absolute top-[20px] left-[20px] text-lg border-2 border-white">Start game</button>
	<center>
	<div id="local2v2_board" class="bg-black w-[80vw] h-[85vh] relative justify-center border-4 border-white">
		<div id="local2v2_ball" class="bg-white w-[15px] h-[15px] absolute top-[100px]"></div>
		<div id="local2v2_player1" class="bg-white w-[10px] h-[100px] absolute"></div>
		<div id="local2v2_player2" class="bg-white w-[10px] h-[100px] absolute"></div>
		<div id="local2v2_player3" class="bg-white w-[10px] h-[100px] absolute"></div>
		<div id="local2v2_player4" class="bg-white w-[10px] h-[100px] absolute"></div>
	</div>
	</center>
	`;

	const start_game_button = document.querySelector<HTMLButtonElement>("#local2v2_start_game_button");
	const board = document.querySelector<HTMLDivElement>("#local2v2_board");
	const player1 = document.querySelector<HTMLDivElement>("#local2v2_player1");
	const player2 = document.querySelector<HTMLDivElement>("#local2v2_player2");
	const player3 = document.querySelector<HTMLDivElement>("#local2v2_player3");
	const player4 = document.querySelector<HTMLDivElement>("#local2v2_player4");
	const ball = document.querySelector<HTMLDivElement>("#local2v2_ball");

	//bruh stupid ts
	if(!board || !player1 || !player2 || !player3 || !player4 || !ball || !start_game_button)
		throw new Error("Required game elements not found");

	//init them vars from the css / html

	//ball stuff
	const ball_len = ball.clientWidth;
	const ballX = board.clientWidth / 2;
	const ballY = board.clientHeight / 2;
	const dy = 2;
	const dx = 2;

	//board stuff
	const boardHeight = board.clientHeight;
	const boardWidth = board.clientWidth;
	const board_border_width = parseInt(getComputedStyle(board).borderLeftWidth);

	//players settings
	const block_height = player4.clientHeight;
	const block_width = player4.clientWidth;
	const player_speed = 5;
	const player1Y = boardHeight / 4 - block_height / 2;
	const player2Y = (3 * boardHeight) / 4 - block_height / 2;
	const player3Y = (3 * boardHeight) / 4 - block_height / 2;
	const player4Y = boardHeight / 4 - block_height / 2;
	const player_indent = 20;

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

	render_positions(ballX, ballY, player1Y, player2Y, player3Y, player4Y);
	socket.addEventListener("message", process_msg_from_socket);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
	start_game_button.addEventListener("click", start_the_fkin_game)


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
			start_game_button.style.display = "none";
		
		//send the init JSON to backend
		if (socket.readyState === WebSocket.OPEN)
			socket.send(JSON.stringify(config_obj));
	}

	function process_msg_from_socket(message: MessageEvent)
	{
		//console.log("JSON recv to frontend");
		const msg_obj = JSON.parse(message.data);
			
		if(msg_obj.type == "game_update")
			render_positions(msg_obj.ballX, msg_obj.ballY, msg_obj.player1Y, msg_obj.player2Y, msg_obj.player3Y, msg_obj.player4Y);
		else if(msg_obj.type == "game_over")
		{
			if (start_game_button)
				start_game_button.style.display = "block";
			local2v2_display_winner(msg_obj);
		}
	}

	function render_positions(ballX: number, ballY: number, player1Y: number, player2Y: number, player3Y: number, player4Y: number)
	{
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
		const local2v2_winner_div = document.querySelector<HTMLDivElement>("#local2v2_winner_name");
		const local2v2_winner_popup = document.querySelector<HTMLDivElement>("#local2v2_winner_popup");
		const p1_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p1_name_input");
		const p2_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p2_name_input");
		const p3_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p3_name_input");
		const p4_name_input_element = document.querySelector<HTMLInputElement>("#local2v2_p4_name_input");
		const local_2v2_game_popup = document.querySelector<HTMLDivElement>("#local_2v2_game_popup");
		
		if(!local_2v2_game_popup || !local2v2_winner_popup || !local2v2_winner_div || !p1_name_input_element || !p2_name_input_element || !p3_name_input_element || !p4_name_input_element)
			throw new Error("Local2v2 winner display elements not found");

		if(gameover_obj.winner == "leftside")
			local2v2_winner_div.innerHTML = (p1_name_input_element.value || "player1") + " and " + (p2_name_input_element.value || "player2");
		else
			local2v2_winner_div.innerHTML = (p3_name_input_element.value || "player3") + " and " + (p4_name_input_element.value || "player4");
		
		local2v2_winner_popup.classList.remove("hidden");
		local_2v2_game_popup.classList.add("hidden");

		//remove the registration stuff for next use
		p1_name_input_element.value = "";
		p2_name_input_element.value = "";
		p3_name_input_element.value = "";
		p4_name_input_element.value = "";
	}
}