// => void means return value is void
//AI flag is optional arg wif default value set as false

import { terminate_history } from "./spa-navigation";

// eslint-disable-next-line @typescript-eslint/no-empty-function
let stop_game_ft = () => {};

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

export function display_game(handle_game_end : (msg_obj : object) => void, AI_flag = false)
{
	console.log("DISPLAY GAME CALLED");
	const socket = new WebSocket("ws://localhost:3000/ws"); //care this


	const game_obj = document.querySelector<HTMLDivElement>("#game_board_area");

	if(!game_obj) throw new Error("Game obj not found");

	//init them vars from the css / html

	//board stuff
	const boardHeight = 500;
	const boardWidth = 1000;
	const board_border_width = 4;

	//ball stuff
	const ball_len = 15;
	let ballX = (boardWidth / 2) - (ball_len / 2) - 3; // to make it look like the center of the line cuz of the border bruh 
	let ballY = (boardHeight / 2) - (ball_len / 2);
	let dy = 2;
	let dx = 2;

	//players settings
	const block_height = 150;
	const block_width = 10;
	const player_speed = 5;
	let rightplayerY = boardHeight / 2 - (block_height / 2);
	let leftplayerY = boardHeight / 2 - (block_height / 2);
	const player_indent = 20;

	//key binds
	const key_binds = new Map();
	key_binds.set("w", "leftplayer_up");
	key_binds.set("s", "leftplayer_down");
	key_binds.set("ArrowUp", "rightplayer_up");
	key_binds.set("ArrowDown", "rightplayer_down");

	//put the main frame of the game into the html
	game_obj.innerHTML = "";

	game_obj.innerHTML = html`
	<div id="game_buttons" class="flex gap-[400px] mb-[20px]">
		<button id="close_game" type="button" class="text-white text-[20px] border border-white px-[10px] py-[5px]">Exit game</button>
		<button id="game_start_game_button" type="button" class="text-white text-[20px] border border-white px-[10px] py-[5px]">Start game</button>
	</div>

	<div class="flex">
	<div class="flex flex-col space-y-2 mr-[20px]">
		<div class="bg-white/20 w-12 h-12 flex items-center justify-center font-bold text-lg rounded-lg">W</div>
		<div class="bg-white/20 w-12 h-12 flex items-center justify-center font-bold text-lg rounded-lg">S</div>
	</div>

	<div id="game_board" class="bg-black/60 w-[${boardWidth}px] h-[${boardHeight}px] relative border-4 border-white">
		<div id="game_center_line" class="w-[1px] h-full border-l-4 border-dashed border-gray-500 mx-auto"></div>
		<div id="game_ball" class="bg-yellow-300 rounded-full w-[${ball_len}px] h-[${ball_len}px] absolute"></div>
		<div id="game_leftplayer" class="bg-red-500 rounded w-[${block_width}px] h-[${block_height}px] absolute"></div>
		<div id="game_rightplayer" class="bg-blue-500 rounded w-[${block_width}px] h-[${block_height}px] absolute"></div>
	</div>

	<div class="flex flex-col space-y-2 ml-[20px]">
		<div class="bg-white/20 w-12 h-12 flex items-center justify-center font-bold text-lg rounded-lg">
			<i class="fa fa-arrow-up"></i>
		</div>
		<div class="bg-white/20 w-12 h-12 flex items-center justify-center font-bold text-lg rounded-lg">
			<i class="fa fa-arrow-down"></i>
		</div>
	</div>

	</div>
	`;

	//do stuff for the game logic
	const start_game_button = document.querySelector<HTMLButtonElement>("#game_start_game_button");
	const board = document.querySelector<HTMLDivElement>("#game_board");
	const rightplayer = document.querySelector<HTMLDivElement>("#game_rightplayer");
	const leftplayer = document.querySelector<HTMLDivElement>("#game_leftplayer");
	const ball = document.querySelector<HTMLDivElement>("#game_ball");
	const close_game_button = document.querySelector<HTMLButtonElement>("#close_game");
	const game_popup = document.querySelector<HTMLDivElement>("#game_popup");

	//bruh stupid ts
	if(!board || !rightplayer || !leftplayer || !ball || !start_game_button || !close_game_button || !game_popup)
		throw new Error("Required game elements not found");

	//playing status
	let playing = true;
	
	render_positions();
	socket.addEventListener("message", process_msg_from_socket);
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
	start_game_button.addEventListener("click", start_the_fkin_game);
	close_game_button.addEventListener("click", () => {
			game_popup.classList.add("hidden");
			start_game_button.classList.remove("hidden");
			playing = false;
			terminate_history();
		});

	// AI STUFF
	if(AI_flag == true)
		AI_movement();

	//functions

	const stop_game = () => {
		game_popup.classList.add("hidden");
		playing = false;
	};
	stop_game_ft = stop_game;

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
				return ;
			ballX = msg_obj.ballX;
			ballY = msg_obj.ballY;
			leftplayerY = msg_obj.leftplayerY;
			rightplayerY = msg_obj.rightplayerY;
			dx = msg_obj.speed_x;
			dy = msg_obj.speed_y;
			render_positions();
		}
		else if(msg_obj.type == "game_over")
		{
			console.log("recv game end, playing status: ", playing);
			if(playing == false)
				return ;
			if (start_game_button)
				start_game_button.style.display = "block";
			playing = false;
			handle_game_end(msg_obj);
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
		if(AI_flag == true && (key_pressed.key == "ArrowUp" || key_pressed.key == "ArrowDown"))
			return ;
		
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
		if(AI_flag == true && (key_pressed.key == "ArrowUp" || key_pressed.key == "ArrowDown"))
			return ;

		if (socket.readyState === WebSocket.OPEN)
		{
			const keyup_obj = {
				type: "keyup",
				action: key_binds.get(key_pressed.key)
			}
			socket.send(JSON.stringify(keyup_obj));
		}
	}

	//AI functions

	function AI_movement()
	{
		let predicted_y = boardHeight / 2;
		let last_key_press = "";
		
		//predict pos every sec
		setInterval(() => {
			if (playing == false)
				return;
			predicted_y = predict_ball_landing_spot() + Math.floor(Math.random() * 41) - 20; // ±20px to simulate prediction error
		}, 1000); //this function sets in ms so 1000ms = 1s (as requested by the subj)

		//move towards predicted target
		setInterval(() => {
			if (playing == false)
				return;
			
			if(Math.random() < 0.95) //simulate human distractions lol and slow reaction
				return;

			const paddle_center = rightplayerY + block_height / 2;
			let current_key_press = "";
			const buffer = Math.floor(Math.random() * 21) + 20; // 20-40px simulate eye error from center of the paddle (between 18-22 px)
			
			if(paddle_center > predicted_y + buffer)
				current_key_press = "ArrowUp";
			else if(paddle_center < predicted_y - buffer)
				current_key_press = "ArrowDown";
			
			//simulating key presses
			if (current_key_press !== last_key_press)
			{
				if (last_key_press)
				{
					const keyup_event = new KeyboardEvent('keyup', { key: last_key_press });
					handleKeyUp_AI(keyup_event);
				}
				
				if (current_key_press)
				{
					const keydown_event = new KeyboardEvent('keydown', { key: current_key_press });
					handleKeyDown_AI(keydown_event);
				}
				
				last_key_press = current_key_press;
			}
		}, 15);
	}

	function predict_ball_landing_spot()
	{
		let sim_x = ballX;
		let sim_y = ballY;
		let sim_dx = dx;
		let sim_dy = dy;

		while (sim_x < boardWidth - player_indent - block_width)
		{
			sim_x += sim_dx;
			sim_y += sim_dy;
			
			if (sim_y <= 0 || sim_y + ball_len >= boardHeight)
				sim_dy = -sim_dy;

			if (sim_x <= 0)
            	sim_dx = -sim_dx;
		}
		
		return sim_y;
	}

	//need to create this separate one cuz the default handle keyboard functions have to ignore Arrowup and ArrowDown
	function handleKeyDown_AI(key_pressed: KeyboardEvent)
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

	function handleKeyUp_AI(key_pressed: KeyboardEvent)
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
}

export const game_popup = html`
	<div id="game_popup" class="hidden bg-black bg-cover bg-center fixed inset-0">
		<div class="bg-black/70 h-full flex flex-col justify-center items-center">
			<div class="flex flex-col items-center text-white">
				<div id="game_board_area"></div>
				<div id="player_names" class="flex gap-[800px] mb-[16px]">
					<div id="p1_name_display" class="text-red-500 text-2xl font-bold"><h1>player1</h1></div>
					<div id="p2_name_display" class="text-blue-500 text-2xl font-bold"><h1>player2</h1></div>
				</div>
			</div>
		</div>
	</div>
`;

export function exported_stop_game_ft()
{
	stop_game_ft();
}

//notes:
//gamepopup obj needs to be taken and manually remove hidden outside here when wanna play the game
//need to manually get the p1name and p2name obj to input or change the names displayed