import "./gamestyle.css";

import { local_1v1_game_popup, local_1v1_game_setup } from "./game-local-1v1";

// local_play_menus	
export function local_play_menus_setup()
{
	const local_play_menus_button = document.querySelector<HTMLButtonElement>("#local_play_menus_button");
	const local_play_menus_popup = document.querySelector<HTMLDivElement>("#local_play_menus_popup");
	const close_local_play_menus = document.querySelector<HTMLButtonElement>("#close_local_play_menus");

	//navigation stuff
	const local_1v1_button = document.querySelector<HTMLButtonElement>("#local_1v1_button");
	const local_tournament_button = document.querySelector<HTMLButtonElement>("#local_tournament_button");
 	const registration_1v1 = document.querySelector<HTMLDivElement>("#local1v1_registration");
	const registration_tournament = document.querySelector<HTMLDivElement>("#local_play_tournament_registration");
	const close_1v1_registration = document.querySelector<HTMLButtonElement>("#close_1v1_registration");
	const close_tournament_registration = document.querySelector<HTMLButtonElement>("#close_tournament_registration");
	const start_tournament_game = document.querySelector<HTMLButtonElement>("#start_tournament_game");

	if (!local_play_menus_button || !local_play_menus_popup || !close_local_play_menus ||
		!local_1v1_button || !local_tournament_button || !registration_1v1 || 
		!registration_tournament || !close_1v1_registration || !close_tournament_registration|| !start_tournament_game) {
		console.error("Some navigation elements not found");
		return;
	}

	local_play_menus_button.addEventListener("click", () => {
		local_play_menus_popup.classList.remove("hidden");
	 });

	close_local_play_menus.addEventListener("click", () => {
		local_play_menus_popup.classList.add("hidden");
	});

	local_1v1_button.addEventListener("click", () => {
		local_play_menus_popup.classList.add("hidden");
		registration_1v1.classList.remove("hidden");
	});

	local_tournament_button.addEventListener("click", () => {
		local_play_menus_popup.classList.add("hidden");
		registration_tournament.classList.remove("hidden");
	});

	close_1v1_registration.addEventListener("click", () => {
		registration_1v1.classList.add("hidden");
		local_play_menus_popup.classList.remove("hidden");
	});

	close_tournament_registration.addEventListener("click", () => {
		registration_tournament.classList.add("hidden");
		local_play_menus_popup.classList.remove("hidden");
	});

	//player names
	local_1v1_game_setup();
}

export const local_play_menus_popup = `
	<div id="local_play_menus_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div class="relative bg-black h-[70vh] w-[50vw] flex flex-col items-center justify-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold mb-[6vh]">Select Local Game Mode</h1>
			
			<div class="flex flex-col gap-6">
				<button id="local_1v1_button" class="bg-black text-white text-[24px] font-semibold px-[4vw] py-[3vh] border-1 border-white">
					1v1
				</button>
				
				<button id="local_tournament_button" class="bg-black text-white text-[24px] font-semibold px-[4vw] py-[3vh] border-1 border-white">
					Tournament
				</button>
			</div>
			
			<button id="close_local_play_menus" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">Close</button>
		</div>
	</div>
	
	<div id="local1v1_registration" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div class="relative bg-black h-[70vh] w-[50vw] flex flex-col items-center justify-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold mb-[6vh]">1v1 Player Registration</h1>
			<div class="flex flex-col gap-6 w-[60%]">
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 1 Name:</h1>
					<input id="local1v1_p1_name_input" type="text" class=" px-[2vh] py-2 border border-white text-white">
				</div>
				
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 2 Name:</h1>
					<input id="local1v1_p2_name_input" type="text" class=" px-[2vh] py-2 border border-white text-white">
				</div>
				
				<div id="local1v1_error_msg" class="hidden"></div>
				<button id="local_1v1_start_button" class="bg-black text-white text-[20px] font-semibold px-[2vw] py-[1vh] border border-white mt-4">
					Start 1v1 Game
				</button>
			</div>
			
			<button id="close_1v1_registration" class="text-white border border-white absolute bottom-4 left-4 w-[5vw] h-[5vh]">Back</button>
		</div>
	</div>

	<div id="local_play_tournament_registration" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div class="relative bg-black h-[80vh] w-[50vw] flex flex-col items-center justify-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold mb-[4vh]">Tournament Registration</h1>
			
			<div class="flex flex-col gap-4 w-[60%]">
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 1 Name:</h1>
					<input id="localTour_p1_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
				</div>
				
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 2 Name:</h1>
					<input id="localTour_p2_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
				</div>
				
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 3 Name:</h1>
					<input id="localTour_p3_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
				</div>
				
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 4 Name:</h1>
					<input id="localTour_p4_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
				</div>
				
				<button id="start_tournament_game" class="bg-black text-white text-[20px] font-semibold px-[2vw] py-[1vh] border border-white hover:bg-white hover:text-black transition-colors mt-4">
					Start Tournament
				</button>
			</div>
			
			<button id="close_tournament_registration" class="text-white border border-white absolute bottom-4 left-4 w-[5vw] h-[5vh]">Back</button>
		</div>
	</div>

	${local_1v1_game_popup}
`;