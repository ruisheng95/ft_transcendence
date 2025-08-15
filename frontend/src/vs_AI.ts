/* eslint-disable @typescript-eslint/no-explicit-any */
import "./gamestyle.css";

import { display_game } from "./game-local-display_game";
import { add_history } from "./spa-navigation";


//vs_AI_game
export function vs_AI_game_setup ()
{
	const vs_AI_game_button = document.querySelector<HTMLButtonElement>("#vs_AI_game_button");
	const game_popup = document.querySelector<HTMLDivElement>("#game_popup");
	const close_vs_AI_winner_popup = document.querySelector<HTMLDivElement>("#close_vs_AI_winner_popup");
	const vs_AI_winner_popup = document.querySelector<HTMLDivElement>("#vs_AI_winner_popup");

	if(!vs_AI_game_button || !game_popup || !close_vs_AI_winner_popup || !vs_AI_winner_popup)
		throw new Error("Error vs_AI_game buttons not found");

	vs_AI_game_button.addEventListener("click", () => {
		game_popup.classList.remove("hidden");
		game_popup.style.backgroundImage = "";
		display_game(handle_game_end_vs_AI, true);
		add_history("vs_AI_game");
	});

	close_vs_AI_winner_popup.addEventListener("click", () => {
		vs_AI_winner_popup.classList.add("hidden");
		add_history("");
	});
}

function handle_game_end_vs_AI(msg_obj : any)
{
	const game_popup = document.querySelector<HTMLDivElement>("#game_popup");
	const text_div = document.querySelector<HTMLDivElement>("#vs_AI_text");
	const vs_AI_winner_popup = document.querySelector<HTMLDivElement>("#vs_AI_winner_popup");


	if(!text_div || !vs_AI_winner_popup || !game_popup) throw new Error("vs AI game end stuff not found");

	if(msg_obj.winner == "leftplayer")
		text_div.innerHTML = "Congratulations 🎉<br> you won!";
	else
		text_div.innerHTML = "You lost :( better luck next time <br> (u literally lost to a bot 🥀💔)";

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
   <div id="vs_AI_winner_popup" class="border border-2 border-white flex flex-col justify-center items-center hidden fixed bg-black bg-opacity-90 inset-0" style="background-color: rgba(0,0,0,0.9)">
   	<div id="local1v1_popup_screen" class="bg-black border border-2 border-white w-[50%] h-[50%] flex flex-col justify-center items-center gap-8 rounded-lg shadow-2xl">

   		<div id="vs_AI_text" class="text-white text-center text-[32px] font-bold mx-8"></div>

   		<button id="close_vs_AI_winner_popup" class="border-2 border-white text-white text-[18px] px-6 py-3">Close</button>
   	</div>
   </div>
`

export const vs_AI_game_popup = `
    ${vs_AI_winner_popup}
`;

// AI FUNCTIONS HAVE BEEN MOVED TO DISPLAY GAME