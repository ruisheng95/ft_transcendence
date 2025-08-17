import "./gamestyle.css";

import { local_1v1_game_popup, local_1v1_game_setup } from "./game-local-1v1";
import { local_2v2_game_popup, local_2v2_game_setup } from "./game-local-2v2";
import { local_tour_game_popup, local_tour_game_setup } from "./game-local-tournament";
import { add_history } from "./spa-navigation";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

// local_play_menus	
export function local_play_menus_setup()
{
	//navigation stuff
	const local_1v1_button = document.querySelector<HTMLButtonElement>("#local_1v1_button");
	const local_2v2_button = document.querySelector<HTMLButtonElement>("#local_2v2_button");
	const local_tournament_button = document.querySelector<HTMLButtonElement>("#local_tournament_button");
 	const registration_1v1 = document.querySelector<HTMLDivElement>("#local1v1_registration");
	const registration_2v2 = document.querySelector<HTMLDivElement>("#local2v2_registration");
	const registration_tournament = document.querySelector<HTMLDivElement>("#localTour_registration");
	const close_1v1_registration = document.querySelector<HTMLButtonElement>("#close_1v1_registration");
	const close_2v2_registration = document.querySelector<HTMLButtonElement>("#close_2v2_registration");
	const close_tournament_registration = document.querySelector<HTMLButtonElement>("#close_tournament_registration");
	const all_maps = document.querySelectorAll<HTMLButtonElement>(".mapselect-logic");
	const map_input = document.querySelector<HTMLInputElement>("#input-map");

	if (!local_1v1_button || !local_2v2_button || !local_tournament_button || !registration_1v1 || 
		!registration_2v2 || !registration_tournament || !close_1v1_registration || !close_2v2_registration || 
		!close_tournament_registration || !all_maps || !map_input)
		throw new Error("some navigation stuff not found");

	//init ALL maps
	all_maps.forEach(map => {
		map.addEventListener("click", () => {
			all_maps.forEach(m => {
				m.classList.add("grayscale");
				m.classList.remove("border-yellow-400", "shadow-md");
			});
			
			map.classList.remove("grayscale");
			map.classList.add("border-yellow-400", "shadow-md");
			if (map_input && map.dataset.map !== undefined)
 				map_input.value = map.dataset.map;
		})
	})

	local_1v1_button.addEventListener("click", () => {
		open_local1v1();
		add_history("/pong/local1v1");
	});

	local_2v2_button.addEventListener("click", () => {
		open_local2v2();
		add_history("/pong/local2v2");
	});

	local_tournament_button.addEventListener("click", () => {
		open_localTour();
		add_history("/pong/localtournament");
	});

	close_1v1_registration.addEventListener("click", () => {
		registration_1v1.classList.add("hidden");
		add_history("/pong");
	});

	close_2v2_registration.addEventListener("click", () => {
		registration_2v2.classList.add("hidden");
		add_history("/pong");
	});

	close_tournament_registration.addEventListener("click", () => {
		registration_tournament.classList.add("hidden");
		add_history("/pong");
	});

	local_1v1_game_setup();
	local_2v2_game_setup();
	local_tour_game_setup();
}

export function open_local1v1()
{
	const registration_1v1 = document.querySelector<HTMLDivElement>("#local1v1_registration");
	const p1_name_input = document.querySelector<HTMLInputElement>("#local1v1_p1_name_input");
	const p2_name_input = document.querySelector<HTMLInputElement>("#local1v1_p2_name_input");

	if(!registration_1v1 || !p1_name_input || !p2_name_input) throw new Error("open local1v1 elements not found");
	registration_1v1.classList.remove("hidden");
	p1_name_input.value = "";
	p2_name_input.value = "";
	const el = document.querySelector<HTMLDivElement>('[data-game="local1v1"]');
	el?.click();
}

export function open_local2v2()
{
	const registration_2v2 = document.querySelector<HTMLDivElement>("#local2v2_registration");
	const p1_name_input_2v2 = document.querySelector<HTMLInputElement>("#local2v2_p1_name_input");
	const p2_name_input_2v2 = document.querySelector<HTMLInputElement>("#local2v2_p2_name_input");
	const p3_name_input_2v2 = document.querySelector<HTMLInputElement>("#local2v2_p3_name_input");
	const p4_name_input_2v2 = document.querySelector<HTMLInputElement>("#local2v2_p4_name_input");

	if(!registration_2v2 || !p1_name_input_2v2 || !p2_name_input_2v2 || !p3_name_input_2v2 || !p4_name_input_2v2) throw new Error("open local2v2 elements not found");
	
	registration_2v2.classList.remove("hidden");
	p1_name_input_2v2.value = "";
	p2_name_input_2v2.value = "";
	p3_name_input_2v2.value = "";
	p4_name_input_2v2.value = "";
	const el = document.querySelector<HTMLDivElement>('[data-game="local2v2"]');
	el?.click();
}

export function open_localTour()
{
	const registration_tournament = document.querySelector<HTMLDivElement>("#localTour_registration");
	const p1_name_input_tour = document.querySelector<HTMLInputElement>("#localTour_p1_name_input");
	const p2_name_input_tour = document.querySelector<HTMLInputElement>("#localTour_p2_name_input");
	const p3_name_input_tour = document.querySelector<HTMLInputElement>("#localTour_p3_name_input");
	const p4_name_input_tour = document.querySelector<HTMLInputElement>("#localTour_p4_name_input");

	if(!registration_tournament || !p1_name_input_tour || !p2_name_input_tour || !p3_name_input_tour || !p4_name_input_tour) throw new Error("open localTour elements not found");

	registration_tournament.classList.remove("hidden");
	p1_name_input_tour.value = "";
	p2_name_input_tour.value = "";
	p3_name_input_tour.value = "";
	p4_name_input_tour.value = "";
	const el = document.querySelector<HTMLDivElement>('[data-game="localTour"]');
	el?.click();
}

// export const local_play_menus_popup = `
// 	<div id="local_play_menus_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
// 		<div class="relative bg-black h-[70vh] w-[50vw] flex flex-col items-center justify-center border border-2 border-white">
// 			<h1 class="text-white text-[40px] font-bold mb-[6vh]">Select Local Game Mode</h1>
			
// 			<div class="flex flex-col gap-6">
// 				<button id="local_1v1_button" class="bg-black text-white text-[24px] font-semibold px-[4vw] py-[3vh] border-1 border-white">
// 					1v1
// 				</button>

// 				<button id="local_2v2_button" class="bg-black text-white text-[24px] font-semibold px-[4vw] py-[3vh] border-1 border-white">
// 					2v2
// 				</button>
				
// 				<button id="local_tournament_button" class="bg-black text-white text-[24px] font-semibold px-[4vw] py-[3vh] border-1 border-white">
// 					Tournament
// 				</button>
// 			</div>
			
// 			<button id="close_local_play_menus" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">Close</button>
// 		</div>
// 	</div>
	
// 	<div id="local1v1_registration" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
// 		<div class="relative bg-black h-[70vh] w-[50vw] flex flex-col items-center justify-center border border-2 border-white">
// 			<h1 class="text-white text-[40px] font-bold mb-[6vh]">1v1 Player Registration</h1>
// 			<div class="flex flex-col gap-6 w-[60%]">
// 				<div class="flex flex-col gap-2">
// 					<h1 class="text-white text-[18px]">Player 1 Name:</h1>
// 					<input id="local1v1_p1_name_input" type="text" class=" px-[2vh] py-2 border border-white text-white">
// 				</div>
				
// 				<div class="flex flex-col gap-2">
// 					<h1 class="text-white text-[18px]">Player 2 Name:</h1>
// 					<input id="local1v1_p2_name_input" type="text" class=" px-[2vh] py-2 border border-white text-white">
// 				</div>
				
// 				<div id="local1v1_error_msg" class="hidden"></div>
// 				<button id="local_1v1_start_button" class="bg-black text-white text-[20px] font-semibold px-[2vw] py-[1vh] border border-white mt-4">
// 					Start 1v1 Game
// 				</button>
// 			</div>
			
// 			<button id="close_1v1_registration" class="text-white border border-white absolute bottom-4 left-4 w-[5vw] h-[5vh]">Back</button>
// 		</div>
// 	</div>

// 	<div id="localTour_registration" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
// 		<div class="relative bg-black h-[80vh] w-[50vw] flex flex-col items-center justify-center border border-2 border-white">
// 			<h1 class="text-white text-[40px] font-bold mb-[4vh]">Tournament Registration</h1>
			
// 			<div class="flex flex-col gap-4 w-[60%]">
// 				<div class="flex flex-col gap-2">
// 					<h1 class="text-white text-[18px]">Player 1 Name:</h1>
// 					<input id="localTour_p1_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
// 				</div>
				
// 				<div class="flex flex-col gap-2">
// 					<h1 class="text-white text-[18px]">Player 2 Name:</h1>
// 					<input id="localTour_p2_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
// 				</div>
				
// 				<div class="flex flex-col gap-2">
// 					<h1 class="text-white text-[18px]">Player 3 Name:</h1>
// 					<input id="localTour_p3_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
// 				</div>
				
// 				<div class="flex flex-col gap-2">
// 					<h1 class="text-white text-[18px]">Player 4 Name:</h1>
// 					<input id="localTour_p4_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
// 				</div>
				
// 				<div id="localTour_error_msg" class="hidden"></div>
// 				<button id="local_tour_main_start_button" class="bg-black text-white text-[20px] font-semibold px-[2vw] py-[1vh] border border-white">
// 					Start Tournament
// 				</button>
// 			</div>
			
// 			<button id="close_tournament_registration" class="text-white border border-white absolute bottom-4 left-4 w-[5vw] h-[5vh]">Back</button>
// 		</div>
// 	</div>

// 	<div id="local2v2_registration" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
// 		<div class="relative bg-black h-[80vh] w-[50vw] flex flex-col items-center justify-center border border-2 border-white">
// 			<h1 class="text-white text-[40px] font-bold mb-[4vh]">2v2 Registration</h1>
			
// 			<div class="flex flex-col gap-4 w-[60%]">
// 				<div class="flex flex-col gap-2">
// 					<h1 class="text-white text-[18px]">Player 1 Name:</h1>
// 					<input id="local2v2_p1_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
// 				</div>
				
// 				<div class="flex flex-col gap-2">
// 					<h1 class="text-white text-[18px]">Player 2 Name:</h1>
// 					<input id="local2v2_p2_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
// 				</div>
				
// 				<div class="flex flex-col gap-2">
// 					<h1 class="text-white text-[18px]">Player 3 Name:</h1>
// 					<input id="local2v2_p3_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
// 				</div>
				
// 				<div class="flex flex-col gap-2">
// 					<h1 class="text-white text-[18px]">Player 4 Name:</h1>
// 					<input id="local2v2_p4_name_input" type="text" class=" px-[2vh] py-[1vh] border border-white text-white">
// 				</div>
				
// 				<div id="local2v2_error_msg" class="hidden"></div>
// 				<button id="local_2v2_start_button" class="bg-black text-white text-[20px] font-semibold px-[2vw] py-[1vh] border border-white">
// 					Start 2v2
// 				</button>
// 			</div>
			
// 			<button id="close_2v2_registration" class="text-white border border-white absolute bottom-4 left-4 w-[5vw] h-[5vh]">Back</button>
// 		</div>
// 	</div>
// 	${local_1v1_game_popup}
// 	${local_2v2_game_popup}
// 	${local_tour_game_popup}
// `;

const local1v1_Registration = html`
	<div id="local1v1_registration" class="h-full px-48 space-y-6 flex flex-col justify-center hidden fixed bg-gray-950 inset-0 text-white inter-font">
		
		<!--Title -->
		<h1 class="text-4xl text-center mb-6 font-bold">Match Registration</h1>

		<!-- Game Information -->
		<section class="flex items-center justify-center space-x-4">
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">Local Play</span>
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">1 vs 1</span>
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">2 Players</span>
		</section>
		
		<!-- Game Setting Header -->
		<header class="grid grid-cols-[3fr_2fr] gap-10 text-center">
			<h2 class="text-2xl font-bold">Map Selection</h2>
			<h2 class="text-2xl font-bold">Players</h2>
		</header>

		<!-- Game Setting Details -->
		<main class="grid grid-cols-[3fr_2fr] gap-10 place-items-center mb-10">
		
			<!-- Map Selection -->
			<section class="grid grid-cols-2 gap-6 px-12">
				<div data-map="" data-game="local1v1" class="mapselect-logic text-2xl flex items-center justify-center select-map">None</div>
				<img data-map="url('/map-1.avif')" class="mapselect-logic object-cover select-map" src="/map-1.avif" alt="map">
				<img data-map="url('/map-2.avif')" class="mapselect-logic object-cover select-map" src="/map-2.avif" alt="map">
				<img data-map="url('/map-3.png')" class="mapselect-logic object-cover select-map" src="/map-3.png" alt="map">
			</section>

			<!-- Player List -->
			<section class="px-12 space-y-6 text-black">
				<input class="w-full bg-white text-lg focus:outline-none rounded-full px-10 py-4"
					type="text" 
					placeholder="Player Name"
					id="local1v1_p1_name_input" 
					maxlength="24">
				<input class="w-full bg-white text-lg focus:outline-none rounded-full px-10 py-4"
					type="text"
					id="local1v1_p2_name_input"
					placeholder="Player Name" 
					maxlength="24">

				<!-- Error Message -->
				<div id="local1v1_error_msg" class="h-8 err-msg text-center"></div>
			</section>
		</main>

		<!-- Start Button -->
		<div class="flex justify-center">
			<button id="local_1v1_start_button" class="button-primary">
				<i class="fas fa-play mr-4"></i>Start Match
			</button>
		</div>
		
		<!--Exit Button -->
		<button id="close_1v1_registration" class="absolute top-10 right-10 button-remove">
			<i class="fas fa-times text-black text-xl"></i>
		</button>
	</div>
`;

const localTour_Registration = html`
	<div id="localTour_registration" class="h-full px-48 space-y-6 flex flex-col justify-center hidden fixed bg-gray-950 inset-0 text-white inter-font">
		
		<!--Title -->
		<h1 class="text-4xl text-center mb-6 font-bold">Match Registration</h1>

		<!-- Game Information -->
		<section class="flex items-center justify-center space-x-4">
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">Local Play</span>
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">Tournament</span>
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">4 Players</span>
		</section>
		
		<!-- Game Setting Header -->
		<header class="grid grid-cols-[3fr_2fr] gap-10 text-center">
			<h2 class="text-2xl font-bold">Map Selection</h2>
			<h2 class="text-2xl font-bold">Players</h2>
		</header>

		<!-- Game Setting Details -->
		<main class="grid grid-cols-[3fr_2fr] gap-10 place-items-center mb-10">
		
			<!-- Map Selection -->
			<section class="grid grid-cols-2 gap-6 px-12">
				<div data-map="" data-game="localTour" class="mapselect-logic text-2xl flex items-center justify-center select-map">None</div>
				<img data-map="url('/map-1.avif')" class="mapselect-logic object-cover select-map" src="/map-1.avif" alt="map">
				<img data-map="url('/map-2.avif')" class="mapselect-logic object-cover select-map" src="/map-2.avif" alt="map">
				<img data-map="url('/map-3.png')" class="mapselect-logic object-cover select-map" src="/map-3.png" alt="map">
			</section>

			<!-- Player List -->
			<section class="px-12 space-y-6 text-black">
				<input class="w-full bg-white text-lg focus:outline-none rounded-full px-10 py-4"
					type="text" 
					placeholder="Player Name"
					id="localTour_p1_name_input"
					maxlength="24">
				<input class="w-full bg-white text-lg focus:outline-none rounded-full px-10 py-4"
					type="text"
					id="localTour_p2_name_input"
					placeholder="Player Name" 
					maxlength="24">
				<input class="w-full bg-white text-lg focus:outline-none rounded-full px-10 py-4"
					type="text"
					id="localTour_p3_name_input"
					placeholder="Player Name" 
					maxlength="24">
				<input class="w-full bg-white text-lg focus:outline-none rounded-full px-10 py-4"
					type="text"
					id="localTour_p4_name_input"
					placeholder="Player Name" 
					maxlength="24">

				<!-- Error Message -->
				<div id="localTour_error_msg" class="h-8 err-msg text-center"></div>
			</section>
		</main>

		<!-- Start Button -->
		<div class="flex justify-center">
			<button id="local_tour_main_start_button" class="button-primary">
				<i class="fas fa-play mr-4"></i>Start Match
			</button>
		</div>
		
		<!--Exit Button -->
		<button id="close_tournament_registration" class="absolute top-10 right-10 button-remove">
			<i class="fas fa-times text-black text-xl"></i>
		</button>
	</div>
`;

const local2v2_Registration = html`
	<div id="local2v2_registration" class="h-full px-48 space-y-6 flex flex-col justify-center hidden fixed bg-gray-950 inset-0 text-white inter-font">
		
		<!--Title -->
		<h1 class="text-4xl text-center mb-b font-bold">Match Registration</h1>

		<!-- Game Information -->
		<section class="flex items-center justify-center space-x-4">
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">Local Play</span>
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">2 vs 2</span>
			<span class="bg-white/20 px-6 py-1 font-medium rounded-full">4 Players</span>
		</section>
		
		<!-- Game Setting Header -->
		<header class="grid grid-cols-[3fr_2fr] gap-10 text-center">
			<h2 class="text-2xl font-bold">Map Selection</h2>
			<h2 class="text-2xl font-bold">Players</h2>
		</header>

		<!-- Game Setting Details -->
		<main class="grid grid-cols-[3fr_2fr] gap-10 place-items-center mb-10">
		
			<!-- Map Selection -->
			<section class="grid grid-cols-2 gap-6 px-12">
				<div data-map="" data-game="local2v2" class="mapselect-logic text-2xl flex items-center justify-center select-map">None</div>
				<img data-map="url('/map-1.avif')" class="mapselect-logic object-cover select-map" src="/map-1.avif" alt="map">
				<img data-map="url('/map-2.avif')" class="mapselect-logic object-cover select-map" src="/map-2.avif" alt="map">
				<img data-map="url('/map-3.png')" class="mapselect-logic object-cover select-map" src="/map-3.png" alt="map">
			</section>

			<!-- Player List -->
			<section class="px-12 space-y-6 text-black">
				<input class="w-full bg-white text-lg focus:outline-none rounded-full px-10 py-4"
					type="text" 
					placeholder="Player Name"
					id="local2v2_p1_name_input"
					maxlength="24">
				<input class="w-full bg-white text-lg focus:outline-none rounded-full px-10 py-4"
					type="text"
					id="local2v2_p2_name_input"
					placeholder="Player Name" 
					maxlength="24">
				<input class="w-full bg-white text-lg focus:outline-none rounded-full px-10 py-4"
					type="text"
					id="local2v2_p3_name_input"
					placeholder="Player Name" 
					maxlength="24">
				<input class="w-full bg-white text-lg focus:outline-none rounded-full px-10 py-4"
					type="text"
					id="local2v2_p4_name_input"
					placeholder="Player Name" 
					maxlength="24">

				<!-- Error Message -->
				<div id="local2v2_error_msg" class="h-8 err-msg text-center"></div>
			</section>
		</main>

		<!-- Start Button -->
		<div class="flex justify-center">
			<button id="local_2v2_start_button" class="button-primary">
				<i class="fas fa-play mr-4"></i>Start Match
			</button>
		</div>
		
		<!--Exit Button -->
		<button id="close_2v2_registration" class="absolute top-10 right-10 button-remove">
			<i class="fas fa-times text-black text-xl"></i>
		</button>
	</div>
`;

export const local_play_menus_popup = html`

	<input type="hidden" id="input-map" name="map">

	${local1v1_Registration}
	${local2v2_Registration}
	${localTour_Registration}

	${local_1v1_game_popup}
	${local_2v2_game_popup}
	${local_tour_game_popup}
`;