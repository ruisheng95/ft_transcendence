import "./gamestyle.css";

// local_1v1_game
export function local_1v1_game_setup()
{
	const local_1v1_start_button = document.querySelector<HTMLButtonElement>("#local_1v1_start_button"); // changed to start button
	const local_1v1_game_popup = document.querySelector<HTMLDivElement>("#local_1v1_game_popup");
	const close_local_1v1_game = document.querySelector<HTMLButtonElement>("#close_local_1v1_game");

	const local_1v1_open_game = document.querySelector<HTMLButtonElement>("#local_1v1_open_game");
	const p1_name_input_element = document.querySelector<HTMLInputElement>("#local1v1_p1_name_input");
	const p2_name_input_element = document.querySelector<HTMLInputElement>("#local1v1_p2_name_input");
	
	if (!p1_name_input_element || !p2_name_input_element || !local_1v1_open_game || !local_1v1_start_button || !local_1v1_game_popup || !close_local_1v1_game)
		throw new Error("Error local_1v1_game buttons not found");

	p1_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	p2_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	local_1v1_start_button.addEventListener("click", () => {
		const local1v1_p1_name_display = document.querySelector<HTMLDivElement>("#local1v1_p1_name_display");
		const local1v1_p2_name_display = document.querySelector<HTMLDivElement>("#local1v1_p2_name_display");

		const p1_name_input_element = document.querySelector<HTMLInputElement>("#local1v1_p1_name_input");
		const p2_name_input_element = document.querySelector<HTMLInputElement>("#local1v1_p2_name_input");

		if(!local1v1_p1_name_display || !local1v1_p2_name_display || !p1_name_input_element ||  !p2_name_input_element)
			throw new Error("Error: local1v1 start game elements not found");

		const p1_display_name = p1_name_input_element.value;
		const p2_display_name = p2_name_input_element.value;
		
		local1v1_p1_name_display.innerHTML = `<h1>${p1_display_name.length < 10 ? p1_display_name : p1_display_name.substring(0, 7) + "..."}</h1>`;
		local1v1_p2_name_display.innerHTML = `<h1>${p2_display_name.length < 10 ? p2_display_name : p2_display_name.substring(0, 7) + "..."}</h1>`;

		local_1v1_open_game.click();
	});

	local_1v1_open_game.addEventListener("click", () => {
		local_1v1_game_popup.classList.remove("hidden");
		local_1v1_game_init();
	});

	close_local_1v1_game.addEventListener("click", () => {
		local_1v1_game_popup.classList.add("hidden");
	});
}

export const local_1v1_game_popup = `
<button id="local_1v1_open_game" class="hidden"></button>
<div id="local_1v1_game_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0">
	<div class="relative m-0 p-0 bg-black text-white">
		<button id="close_local_1v1_game" class="absolute top-[10px] right-[10px] text-white text-[20px] border border-white px-[10px] py-[5px]">Exit game</button>
		<h1 class="text-[5vh] font-semibold mt-[3vh] mb-[3vh]"><center>Local 1v1 Game</center></h1>
		
		<div class="flex justify-center items-center">
			<div id="local1v1_p1_name_display" class="text-white text-[3vh] font-bold mr-[20px]"><h1>player1</h1></div>
			<div id="local_1v1_game"></div>
			<div id="local1v1_p2_name_display" class="text-white text-[3vh] font-bold ml-[20px]"><h1>player2</h1></div>
		</div>
	</div>
</div>
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

		const local1v1_error_msg_div = document.querySelector<HTMLDivElement>("#local1v1_error_msg");
		if(!local1v1_error_msg_div) throw new Error("local1v1errordiv not found");

		for (const input_char of input)
		{
			local1v1_error_msg_div.classList.add("hidden");
			if (valid_chars.includes(input_char))
				clean_input += input_char;
			else
				invalid_char = true;

		}

		if(input.length > 20)
		{
			local1v1_error_msg_div.classList.remove("hidden");
			local1v1_error_msg_div.innerHTML = `<h1 class="text-red-500 text-[15px]"> Input too long </h1>`;
			clean_input = clean_input.substring(0, 20);
		}
		else if (invalid_char == true)
		{
			local1v1_error_msg_div.classList.remove("hidden");
			local1v1_error_msg_div.innerHTML = `<h1 class="text-red-500 text-[15px]"> Numbers, alphabets and '_' only </h1>`;
		}
		else
			local1v1_error_msg_div.classList.add("hidden");

		target.value = clean_input;
	}
}

function local_1v1_game_init() {
	const socket = new WebSocket("ws://localhost:3000/ws");

	const game_obj = document.querySelector<HTMLDivElement>("#local_1v1_game");

	if (game_obj)
		game_obj.innerHTML = `
	<button id="start_game_button" type="button" class="bg-black text-white w-[10vw] h-[10vh] absolute top-[20px] left-[20px] text-lg border-2 border-white">Start game</button>
	<center>
	<div id="board" class="bg-black w-[80vw] h-[85vh] relative justify-center border-4 border-white">
		<div id="ball" class="bg-white w-[15px] h-[15px] absolute top-[100px]"></div>
		<div id="leftplayer" class="bg-white w-[10px] h-[150px] absolute"></div>
		<div id="rightplayer" class="bg-white w-[10px] h-[150px] absolute"></div>
	</div>
	</center>
	`;

	const start_game_button = document.querySelector<HTMLButtonElement>("#start_game_button");
	const board = document.querySelector<HTMLDivElement>("#board");
	const rightplayer = document.querySelector<HTMLDivElement>("#rightplayer");
	const leftplayer = document.querySelector<HTMLDivElement>("#leftplayer");
	const ball = document.querySelector<HTMLDivElement>("#ball");

	//bruh stupid ts
	if (!board) throw new Error("board element not found");
	if (!rightplayer) throw new Error("rightplayer element not found");
	if (!leftplayer) throw new Error("leftplayer element not found");
	if (!ball) throw new Error("ball element not found");
	if (!start_game_button) throw new Error("start game button element not found");


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
	const block_height = rightplayer.clientHeight;
	const block_width = rightplayer.clientWidth;
	const player_speed = 5;
	const rightplayerY = board.clientHeight / 2 - (block_height / 2);
	const leftplayerY = board.clientHeight / 2 - (block_height / 2);
	const player_indent = 20;


	render_positions(ballX, ballY, leftplayerY, rightplayerY);
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
		console.log("JSON recv to frontend");
		const msg_obj = JSON.parse(message.data);
			
		if(msg_obj.type == "game_update")
			render_positions(msg_obj.ballX, msg_obj.ballY, msg_obj.leftplayerY, msg_obj.rightplayerY);
		else if(msg_obj.type == "game_over")
		{
			if (start_game_button)
				start_game_button.style.display = "block";
		}
	}

	function render_positions(ballX: number, ballY: number, leftplayerY: number, rightplayerY: number)
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
}