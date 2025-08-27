import "./gamestyle.css";
import { online_1v1_play } from "./game-online-1v1";
import { online_2v2_play } from "./game-online-2v2";
import { online_tour_game_setup } from "./game-online-tournament";
import { add_history } from "./spa-navigation";

// online_play_menus	
export function online_play_menus_setup()
{
	//navigation stuff
	const online_1v1_button = document.querySelector<HTMLButtonElement>("#online_1v1_button");
	const online_2v2_button = document.querySelector<HTMLButtonElement>("#online_2v2_button");
	const online_tournament_button = document.querySelector<HTMLButtonElement>("#online_tournament_button");
	const online_play_menus_popup = document.querySelector<HTMLDivElement>("#online_play_menus_popup");
	const onlineTour_regist_page = document.querySelector<HTMLDivElement>("#onlineTour_registration");

	if (!online_1v1_button || !online_2v2_button || !online_tournament_button || !online_play_menus_popup)
		throw new Error("online play menus stuff not found");

	online_1v1_button.addEventListener("click", () => {
		// clear tournament context for 1v1
		localStorage.removeItem("tournament_context");
		add_history("/pong/online1v1");
		online_1v1_play();
	});

	online_2v2_button.addEventListener("click", () => {
		online_2v2_play();
		add_history("/pong/online2v2");
	});

	online_tournament_button.addEventListener("click", () => {
		online_play_menus_popup.classList.add("hidden");
		if (onlineTour_regist_page) {
			onlineTour_regist_page.classList.remove("hidden");
			online_tour_game_setup();
		}
	});
}

export const online_play_menus_popup = `
	<div id="online_play_menus_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div class="relative bg-black h-[70vh] w-[50vw] flex flex-col items-center justify-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold mb-[6vh]">Select online Game Mode</h1>
			
			<div class="flex flex-col gap-6">
				<button id="online_1v1_button" class="bg-black text-white text-[24px] font-semibold px-[4vw] py-[3vh] border-1 border-white">
					1v1
				</button>

				<button id="online_2v2_button" class="bg-black text-white text-[24px] font-semibold px-[4vw] py-[3vh] border-1 border-white">
					2v2
				</button>
				
				<button id="online_tournament_button" class="bg-black text-white text-[24px] font-semibold px-[4vw] py-[3vh] border-1 border-white">
					Tournament
				</button>
			</div>
			
			<button id="close_online_play_menus" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">Close</button>
		</div>
	</div>
`;
