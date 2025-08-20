/* eslint-disable @typescript-eslint/no-explicit-any */
import "./gamestyle.css";

import { display_game } from "./game-local-display_game";
import { add_history } from "./spa-navigation";
import { translate_text } from "./language";


//vs_AI_game
export function vs_AI_game_setup ()
{
	const vs_AI_game_button = document.querySelector<HTMLButtonElement>("#vs_AI_game_button");
	const game_popup = document.querySelector<HTMLDivElement>("#game_popup");
	const close_vs_AI_winner_popup = document.querySelector<HTMLDivElement>("#close_vs_AI_winner_popup");
	const vs_AI_winner_popup = document.querySelector<HTMLDivElement>("#vs_AI_winner_popup");

	const vs_AI_p1_name_display = document.querySelector<HTMLDivElement>("#p1_name_display");
	const vs_AI_p2_name_display = document.querySelector<HTMLDivElement>("#p2_name_display");

	if(!vs_AI_game_button || !game_popup || !close_vs_AI_winner_popup || !vs_AI_winner_popup || !vs_AI_p2_name_display || !vs_AI_p1_name_display)
		throw new Error("Error vs_AI_game buttons not found");

	vs_AI_game_button.addEventListener("click", () => {
		game_popup.classList.remove("hidden");
		vs_AI_p1_name_display.innerHTML = "player";
		vs_AI_p2_name_display.innerHTML = "Ai";
		game_popup.style.backgroundImage = "";
		display_game(handle_game_end_vs_AI, true);
		add_history("vs_AI_game");
	});

	close_vs_AI_winner_popup.addEventListener("click", () => {
		vs_AI_winner_popup.classList.add("hidden");
		add_history("/pong");
	});
}

function handle_game_end_vs_AI(msg_obj : any)
{
	const game_popup = document.querySelector<HTMLDivElement>("#game_popup");
	const text_div = document.querySelector<HTMLDivElement>("#vs_AI_text");
	const vs_AI_winner_popup = document.querySelector<HTMLDivElement>("#vs_AI_winner_popup");


	if(!text_div || !vs_AI_winner_popup || !game_popup) throw new Error("vs AI game end stuff not found");

	if(msg_obj.winner == "leftplayer")
		text_div.innerHTML = translate_text("Congratulations 🎉<br> you won!");
	else
		text_div.innerHTML = translate_text("You lost :( better luck next time <br> (u literally lost to a bot 🥀💔)");

	vs_AI_winner_popup.classList.remove("hidden");
	game_popup.classList.add("hidden");
}

export function vs_AI_spa_nav()
{
	const game_popup = document.querySelector<HTMLDivElement>("#game_popup");

	if(!game_popup) throw new Error("vs_AI spa nav elements not found");

	game_popup.classList.remove("hidden");
	display_game(handle_game_end_vs_AI, true);
}

const vs_AI_winner_popup = `
   <div id="vs_AI_winner_popup" class="bg-gray-950 flex h-screen items-center justify-center hidden fixed inset-0 text-white">
   	<div id="local1v1_popup_screen" class="bg-gray-950 border border-2 border-white w-[50%] h-[50%] flex flex-col justify-center items-center gap-8 rounded-lg shadow-2xl">

   		<div id="vs_AI_text" class="text-white text-center text-[32px] font-bold mx-8"></div>

   		<button id="close_vs_AI_winner_popup" class="button-primary">Exit</button>
   	</div>
   </div>
`

export const vs_AI_game_popup = `
    ${vs_AI_winner_popup}
`;

// AI FUNCTIONS HAVE BEEN MOVED TO DISPLAY GAME