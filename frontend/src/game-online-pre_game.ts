import "./gamestyle.css";
import { online_1v1_play } from "./game-online-1v1";

// online_play_menus	
export function online_play_menus_setup()
{
	//navigation stuff
	const online_1v1_button = document.querySelector<HTMLButtonElement>("#online_1v1_button");
	const online_2v2_button = document.querySelector<HTMLButtonElement>("#online_2v2_button");
	const online_tournament_button = document.querySelector<HTMLButtonElement>("#online_tournament_button");

	if (!online_1v1_button || !online_2v2_button || !online_tournament_button)
		throw new Error("online play menus stuff not found");

	online_1v1_button.addEventListener("click", () => {
		// online_play_menus_popup.classList.add("hidden"); moved to hide in online 1v1
		online_1v1_play();
	});
}