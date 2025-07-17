import "./gamestyle.css";

import { localhost_game_popup_1v1, localhost_game_setup_1v1 } from "./game-local-1v1";

// localhost_menus	
export function localhost_menus_setup()
{
	const localhost_menus_button = document.querySelector<HTMLButtonElement>("#localhost_menus_button");
	const localhost_menus_popup = document.querySelector<HTMLDivElement>("#localhost_menus_popup");
	const close_localhost_menus = document.querySelector<HTMLButtonElement>("#close_localhost_menus");

	//navigation stuff
	const local_1v1_button = document.querySelector<HTMLButtonElement>("#local_1v1_button");
	const local_tournament_button = document.querySelector<HTMLButtonElement>("#local_tournament_button");
 	const registration_1v1 = document.querySelector<HTMLDivElement>("#localhost_1v1_registration");
	const registration_tournament = document.querySelector<HTMLDivElement>("#localhost_tournament_registration");
	const close_1v1_registration = document.querySelector<HTMLButtonElement>("#close_1v1_registration");
	const close_tournament_registration = document.querySelector<HTMLButtonElement>("#close_tournament_registration");
	const start_tournament_game = document.querySelector<HTMLButtonElement>("#start_tournament_game");

	if (!localhost_menus_button || !localhost_menus_popup || !close_localhost_menus ||
		!local_1v1_button || !local_tournament_button || !registration_1v1 || 
		!registration_tournament || !close_1v1_registration || !close_tournament_registration|| !start_tournament_game) {
		console.error("Some navigation elements not found");
		return;
	}

	// Open and close menus popup
	localhost_menus_button.addEventListener("click", () => {
		localhost_menus_popup.classList.remove("hidden");
	 });

	close_localhost_menus.addEventListener("click", () => {
		localhost_menus_popup.classList.add("hidden");
	});

	// Navigate to 1v1 registration
	local_1v1_button.addEventListener("click", () => {
		localhost_menus_popup.classList.add("hidden");
		registration_1v1.classList.remove("hidden");
	});

	// Navigate to tournament registration
	local_tournament_button.addEventListener("click", () => {
		localhost_menus_popup.classList.add("hidden");
		registration_tournament.classList.remove("hidden");
	});

	// Back buttons
	close_1v1_registration.addEventListener("click", () => {
		registration_1v1.classList.add("hidden");
		localhost_menus_popup.classList.remove("hidden");
	});

	close_tournament_registration.addEventListener("click", () => {
		registration_tournament.classList.add("hidden");
		localhost_menus_popup.classList.remove("hidden");
	});



	// Start tournament game
	start_tournament_game.addEventListener("click", () => {
		const player1Name = (document.querySelector<HTMLInputElement>("#tournament_player1_name"))?.value;
		const player2Name = (document.querySelector<HTMLInputElement>("#tournament_player2_name"))?.value;
		const player3Name = (document.querySelector<HTMLInputElement>("#tournament_player3_name"))?.value;
		const player4Name = (document.querySelector<HTMLInputElement>("#tournament_player4_name"))?.value;

		if (!player1Name || !player2Name || !player3Name || !player4Name) {
			alert("Please enter all four player names");
			return;
		}

		console.log("Starting tournament with players:", player1Name, player2Name, player3Name, player4Name);
		alert(`Starting tournament: ${player1Name}, ${player2Name}, ${player3Name}, ${player4Name}`);
		// Add tournament initialization logic here
	});
		//player names
	localhost_game_setup_1v1();
}

export const localhost_menus_popup = `
	<div id="localhost_menus_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
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
			
			<button id="close_localhost_menus" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">Close</button>
		</div>
	</div>
	
	<div id="localhost_1v1_registration" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div class="relative bg-black h-[70vh] w-[50vw] flex flex-col items-center justify-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold mb-[6vh]">1v1 Player Registration</h1>
			
			<div class="flex flex-col gap-6 w-[60%]">
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 1 Name:</h1>
					<input id="player1_name" type="text" class="px-4 py-2 border border-white text-white">
				</div>
				
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 2 Name:</h1>
					<input id="player2_name" type="text" class="px-4 py-2 border border-white text-white">
				</div>
				
				<button id="localhost_start_button" class="bg-black text-white text-[20px] font-semibold px-[2vw] py-[2vh] border border-white mt-4">
					Start 1v1 Game
				</button>
			</div>
			
			<button id="close_1v1_registration" class="text-white border border-white absolute bottom-4 left-4 w-[5vw] h-[5vh]">Back</button>
		</div>
	</div>

	<div id="localhost_tournament_registration" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div class="relative bg-black h-[80vh] w-[50vw] flex flex-col items-center justify-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold mb-[4vh]">Tournament Registration</h1>
			
			<div class="flex flex-col gap-4 w-[60%]">
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 1 Name:</label>
					<input id="tournament_player1_name" type="text" class="px-4 py-2 border border-white text-white">
				</div>
				
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 2 Name:</label>
					<input id="tournament_player2_name" type="text" class="px-4 py-2 border border-white text-white">
				</div>
				
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 3 Name:</label>
					<input id="tournament_player3_name" type="text" class="px-4 py-2 border border-white text-white">
				</div>
				
				<div class="flex flex-col gap-2">
					<h1 class="text-white text-[18px]">Player 4 Name:</label>
					<input id="tournament_player4_name" type="text" class="px-4 py-2 border border-white text-white">
				</div>
				
				<button id="start_tournament_game" class="bg-black text-white text-[20px] font-semibold px-[2vw] py-[2vh] border border-white hover:bg-white hover:text-black transition-colors mt-4">
					Start Tournament
				</button>
			</div>
			
			<button id="close_tournament_registration" class="text-white border border-white absolute bottom-4 left-4 w-[5vw] h-[5vh]">Back</button>
		</div>
	</div>

	${localhost_game_popup_1v1}
`;