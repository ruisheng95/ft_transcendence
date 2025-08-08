/* eslint-disable @typescript-eslint/no-explicit-any */
import "./gamestyle.css";
import { display_game } from "./game-local-display_game";
import { add_history } from "./spa-navigation";

//local 1v1 game
export function local_1v1_game_setup()
{
	const local_1v1_start_button = document.querySelector<HTMLButtonElement>("#local_1v1_start_button"); // changed to start button
	const game_popup = document.querySelector<HTMLDivElement>("#game_popup");
	const local1v1_regist_page = document.querySelector<HTMLDivElement>("#local1v1_registration");

	const p1_name_input_element = document.querySelector<HTMLInputElement>("#local1v1_p1_name_input");
	const p2_name_input_element = document.querySelector<HTMLInputElement>("#local1v1_p2_name_input");
	
	const close_local1v1_winner_popup = document.querySelector<HTMLButtonElement>("#close_local1v1_winner_popup");
	const local1v1_winner_popup = document.querySelector<HTMLDivElement>("#local1v1_winner_popup");

	if (!local1v1_regist_page || !local1v1_winner_popup || !close_local1v1_winner_popup || !p1_name_input_element || !p2_name_input_element || !local_1v1_start_button || !game_popup)
		throw new Error("Error local_1v1_game buttons not found");

	p1_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	p2_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	local_1v1_start_button.addEventListener("click", () => {
		const local1v1_p1_name_display = document.querySelector<HTMLDivElement>("#p1_name_display");
		const local1v1_p2_name_display = document.querySelector<HTMLDivElement>("#p2_name_display");

		const p1_name_input_element = document.querySelector<HTMLInputElement>("#local1v1_p1_name_input");
		const p2_name_input_element = document.querySelector<HTMLInputElement>("#local1v1_p2_name_input");

		if(!local1v1_p1_name_display || !local1v1_p2_name_display || !p1_name_input_element ||  !p2_name_input_element)
			throw new Error("Error: local1v1 start game elements not found");

		const p1_display_name = p1_name_input_element.value || "player1";
		const p2_display_name = p2_name_input_element.value || "player2";
		
		local1v1_p1_name_display.innerHTML = `<h1>${p1_display_name.length < 10 ? p1_display_name : p1_display_name.substring(0, 7) + "..."}</h1>`;
		local1v1_p2_name_display.innerHTML = `<h1>${p2_display_name.length < 10 ? p2_display_name : p2_display_name.substring(0, 7) + "..."}</h1>`;

		local1v1_regist_page.classList.add("hidden");

		game_popup.classList.remove("hidden");
		display_game(local1v1_display_winner);
	});

	close_local1v1_winner_popup.addEventListener("click", () => {
		local1v1_winner_popup.classList.add("hidden");
		add_history("");
	});
}

const local1v1_winner_popup = `
	<div id="local1v1_winner_popup" class="border border-2 border-white flex flex-col justify-center items-center hidden fixed bg-black bg-opacity-90 inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="local1v1_popup_screen" class="bg-black border border-2 border-white w-[50%] h-[50%] flex flex-col justify-center items-center">

			<div class="text-center">
				<h1 class="text-[50px] text-white">WINNER! 🎉:</h1>
				<div id="local1v1_winner_name" class="text-[40px] font-bold mb-6 text-white"></div>
				<div class="text-[50px] mb-6 text-white">Congratulations</div>
			</div>

			<button id="close_local1v1_winner_popup" class="border-1 border-white text-white text-[20px] px-[5px] py-[5px]">close</button>
		</div>
	</div>
`

export const local_1v1_game_popup = `
	${local1v1_winner_popup}
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

function local1v1_display_winner(gameover_obj : any)
{
	const local1v1_winner_div = document.querySelector<HTMLDivElement>("#local1v1_winner_name");
	const local1v1_winner_popup = document.querySelector<HTMLDivElement>("#local1v1_winner_popup");
	const p1_name_input_element = document.querySelector<HTMLInputElement>("#local1v1_p1_name_input");
	const p2_name_input_element = document.querySelector<HTMLInputElement>("#local1v1_p2_name_input");
	const game_popup = document.querySelector<HTMLDivElement>("#game_popup");
	
	if(!game_popup || !local1v1_winner_popup || !local1v1_winner_div || !p1_name_input_element || !p2_name_input_element)
		throw new Error("Local1v1 winner display elements not found");

	if(gameover_obj.winner == "leftplayer")
		local1v1_winner_div.innerHTML = `<h1 class="text-white text-[40px]">${p1_name_input_element.value != "" ? p1_name_input_element.value : "Player1"}</h1>`;
	else
		local1v1_winner_div.innerHTML = `<h1 class="text-white text-[40px]">${p2_name_input_element.value != "" ? p2_name_input_element.value : "Player2"}</h1>`;
	
	local1v1_winner_popup.classList.remove("hidden");
	game_popup.classList.add("hidden");

	//remove the registration stuff for next use
	p1_name_input_element.value = "";
	p2_name_input_element.value = "";
}
