import "./gamestyle.css";

//vs_AI_game
export function vs_AI_game_setup ()
{
	const vs_AI_game_button = document.querySelector<HTMLButtonElement>("#vs_AI_game_button");
	const vs_AI_game_popup = document.querySelector<HTMLDivElement>("#vs_AI_game_popup");
	const close_vs_AI_game = document.querySelector<HTMLButtonElement>("#close_vs_AI_game");

	if(!vs_AI_game_button || !vs_AI_game_popup || !close_vs_AI_game)
		throw new Error("Error vs_AI_game buttons not found");

	vs_AI_game_button.addEventListener("click", () => {
		vs_AI_game_popup.classList.remove("hidden");
		vs_AI_game_init();
	});
	close_vs_AI_game.addEventListener("click", () => {
		vs_AI_game_popup.classList.add("hidden");
	});
}

export const vs_AI_game_popup = `
    <div id="vs_AI_game_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0">
        <div class="relative m-0 p-0 bg-black text-white">
            <button id="close_vs_AI_game" class="absolute top-[10px] right-[10px] text-white text-[20px] border border-white px-[10px] py-[5px]">Exit game</button>
            <h1 class="text-[5vh] font-semibold mt-[3vh] mb-[3vh]"><center>transcendence VS_AI game bruh</center></h1>
            <div id="vs_AI_game"></div>
        </div>
    </div>
`;

function vs_AI_game_init()
{
	//prep stuffssss
	const socket = new WebSocket("ws://localhost:3000/ws");

	const game_obj = document.querySelector<HTMLDivElement>("#vs_AI_game");

	if(game_obj)
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
	let ballX = board.clientWidth / 2;
	let ballY = board.clientHeight / 2;
	let dy = 4;
	let dx = 4;

	//board stuff
	const boardHeight = board.clientHeight;
	const boardWidth = board.clientWidth;
	const board_border_width = parseInt(getComputedStyle(board).borderLeftWidth);

	//players settings
	const block_height = rightplayer.clientHeight;
	const block_width = rightplayer.clientWidth;
	const player_speed = 10;
	let rightplayerY = board.clientHeight / 2 - (block_height / 2);
	const leftplayerY = board.clientHeight / 2 - (block_height / 2);
	const player_indent = 20;

	//gamestatus
	let playing = true;

	AI_movement();

	render_positions(ballX, ballY, leftplayerY, rightplayerY);
	socket.addEventListener("message", process_msg_from_socket);

	// disable keyboard input
	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyUp);
	start_game_button.addEventListener("click", start_the_fkin_game);

	//functions

	function start_the_fkin_game()
	{
		playing = true;

		dx = 4;
		dy = 4;

		const config_obj = {
			type: "game_init",
			boardHeight: boardHeight,
			boardWidth: boardWidth,
			board_border_width: board_border_width,
			block_height: block_height,
			block_width: block_width,
			player_speed: player_speed,
			player_indent: player_indent,
			ball_len: ball_len,
			ballX: ballX,
			ballY: ballY,
			dy: dy,
			dx: dx,
		};

		if (start_game_button)
			start_game_button.style.display = "none";

		if (socket.readyState === WebSocket.OPEN)
			socket.send(JSON.stringify(config_obj));
	}

	function process_msg_from_socket(message: MessageEvent)
	{
		console.log("JSON recv to frontend");
		const msg_obj = JSON.parse(message.data);

		if(msg_obj.type == "game_update")
		{
			ballX = msg_obj.ballX;
			ballY = msg_obj.ballY;
			rightplayerY = msg_obj.rightplayerY;
			dx = msg_obj.speed_x;
			dy = msg_obj.speed_y;
			render_positions(msg_obj.ballX, msg_obj.ballY, msg_obj.leftplayerY, msg_obj.rightplayerY);
		}
		else if(msg_obj.type == "game_over")
		{
			if (start_game_button)
				start_game_button.style.display = "block";
			playing = false;
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
		if(key_pressed.key == "ArrowUp" || key_pressed.key == "ArrowDown")
			return;

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
		if(key_pressed.key == "ArrowUp" || key_pressed.key == "ArrowDown")
			return;
		if (socket.readyState === WebSocket.OPEN)
		{
			const keyup_obj = {
				type: "keyup",
				key: key_pressed.key
			}
			socket.send(JSON.stringify(keyup_obj));
		}
	}


	function AI_movement()
	{
		let predicted_y = boardHeight / 2;
		let last_key_press = "";
		
		//predict pos every sec
		setInterval(() => {
			if (playing == false)
				return;
			predicted_y = predict_ball_landing_spot() + Math.floor(Math.random() * 141) - 70; // ±70px to simulate prediction error
		}, 1000); //this function sets in ms so 1000ms = 1s (as requested by the subj)

		//move towards predicted target
		setInterval(() => {
			if (playing == false)
				return;
			
			if(Math.random() < 0.9) //simulate human distractions lol and slow reaction
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

	function handleKeyDown_AI(key_pressed: KeyboardEvent)
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

	function handleKeyUp_AI(key_pressed: KeyboardEvent)
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
