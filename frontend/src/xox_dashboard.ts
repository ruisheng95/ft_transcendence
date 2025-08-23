
import { xox_online_play } from "./game-online-xox.ts";
import { hide_all_main_pages } from "./pong_modes.ts";
//import { WS } from "./class/WS.ts";
import { add_history } from "./spa-navigation.ts";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);


export function xox_setup ()
{
	const xox_button = document.querySelector<HTMLButtonElement>("#xox_button");
	const xox_popup  = document.querySelector<HTMLButtonElement>("#xox_dashboard_popup");
	const xox_online_button = document.querySelector<HTMLButtonElement>("#online_xox_button");

	if(!xox_button || !xox_popup || !xox_online_button)
		throw new Error("Error pf_config stuff not found");

	xox_button.addEventListener("click", () => {
		hide_all_main_pages();
		xox_popup.classList.remove("hidden");
		xox_button.classList.add("bg-yellow-400");
		xox_button.querySelector<HTMLDivElement>("i")?.classList.add("text-black");
		add_history("tic_tac_toe");
	});

	xox_online_button.addEventListener("click", () => {
		xox_online_play();
	});
}

const statsSection = html`
	<!-- Stats -->
	<div class="w-5/12 h-11/12 flex flex-col justify-between">
			
		<h2 class="text-xl font-bold flex items-center">
			<i class="fa-solid fa-chart-pie mr-3"></i>
			Statistics
		</h2>

		<section class="grid grid-cols-2 gap-4 px-12">
			
			<!-- Total Matches -->
			<div class="col-span-2 flex justify-center">
				<div class="w-1/2 bg-white/20 rounded-lg px-4 py-2">
				<div class="flex items-center font-semibold mb-2">
					<i class="fas fa-gamepad text-yellow-400 text-2xl mr-3"></i>
					Total Matches
				</div>
				<div class="text-5xl font-bold text-end">14</div>
			</div>

			</div>

			<!-- Total Wins -->
			<div class="bg-white/20 rounded-lg px-4 py-2">
				<div class="flex items-center font-semibold mb-2">
					<i class="fas fa-face-laugh-squint text-yellow-400 text-2xl mr-3"></i>
					Total Wins
				</div>
				<div class="text-5xl font-bold text-end">10</div>
			</div>

			<!-- Total Loses -->
			<div class="bg-white/20 rounded-lg px-4 py-2">
				<div class="flex items-center font-semibold mb-2">
					<i class="fas fa-face-sad-cry text-yellow-400 text-2xl mr-3"></i>
					Total Loses
				</div>
				<div class="text-5xl font-bold text-end">4</div>
			</div>

			<!-- Win Rate -->
			<div class="bg-white/20 rounded-xl px-4 py-2 col-span-2">
				<div class="flex items-center font-semibold mb-4">
					<i class="fas fa-balance-scale text-yellow-400 text-2xl mr-3"></i>
					Win Rate
				</div>
				<div class="mb-4 w-full bg-red-500 rounded-full h-4">
					<div class="bg-green-500 h-4 rounded-l-full" style="width: 73%"></div>
				</div>
				<div class="text-2xl font-semibold text-end">73%</div>
			</div>
		</section>

		<button id="local_xox_button" class="mx-12 h-1/6 text-3xl tracking-widest font-bold pixel-font flex items-center rounded-2xl justify-center border-2 border-yellow-400 hover:bg-yellow-400/20 transition duration-200 ">
			Play
		</button>

		<button id="online_xox_button" class="mx-12 h-1/6 text-3xl tracking-widest font-bold pixel-font flex items-center rounded-2xl justify-center border-2 border-yellow-400 hover:bg-yellow-400/20 transition duration-200 ">
			online play
		</button>

	</div>
`

export const xox_popup = html`

	<div id="xox_dashboard_popup" class="hidden h-[90vh] inter-font py-8 px-12 text-white">
		
		<main class="flex w-full h-full gap-8">

			<!-- History Section -->
			<div class="w-7/12">
				<h2 class="text-xl font-bold mb-6 flex items-center">
					<i class="fa fa-history mr-3"></i>
					Match History
				</h2>

				<!-- Table Header -->
				<div class="grid grid-cols-[2fr_2fr_3fr_1fr] gap-4 pr-9 px-4 mb-1 font-semibold">
					<span>Date</span>
					<span>Match Type</span>
					<span>Players</span>
					<span>Result</span>
				</div>
				
				<!-- Table Entry -->
				<div class="h-[73vh] overflow-y-scroll pr-2 space-y-3">
					<div class="flex flex-col w-full h-full justify-center items-center text-gray-400">
						<span class="text-xl">No match history yet</span>
					</div>
				</div>
			</div>
			${statsSection}

		</main>
	</div>
`
