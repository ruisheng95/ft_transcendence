import "./gamestyle.css";
import { online_tour_manager } from "./game-online-tournament2.ts";
import { click_pong_modes_button } from "./pong_modes.ts";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

// online_tour_game
export function online_tour_game_setup()
{
	const online_tour_start_button = document.querySelector<HTMLButtonElement>("#onlineTour_main_start_button");
	const online_tour_close_button = document.querySelector<HTMLButtonElement>("#onlineTour_main_close_button");
	const onlineTour_regist_page = document.querySelector<HTMLDivElement>("#onlineTour_registration");

	if (!onlineTour_regist_page || !online_tour_start_button || !online_tour_close_button)
		throw new Error("Error online_tour_game buttons not found");

	online_tour_start_button.addEventListener("click", () => {
		console.log("Starting online tournament...");
		onlineTour_regist_page.classList.add("hidden");
		online_tour_manager();
	});

	online_tour_close_button.addEventListener("click", () => {
		onlineTour_regist_page.classList.add("hidden");
		click_pong_modes_button();
	});
}

export function onlineTour_play()
{
	const onlineTour_regist_page = document.querySelector<HTMLDivElement>("#onlineTour_registration");
	const online_play_menus_popup = document.querySelector<HTMLDivElement>("#online_play_menus_popup");
	if(online_play_menus_popup)
		online_play_menus_popup.classList.add("hidden");
	if (onlineTour_regist_page) {
		onlineTour_regist_page.classList.remove("hidden");
		online_tour_game_setup();
	}
}

const onlineTour_matchmaking_popup = html`
	<div id="onlineTour_matchmaking_popup" class="bg-gray-950 flex h-screen p-20 justify-center hidden fixed inset-0 text-white inter-font">
		<div id="onlineTour_matchmaking_popup_screen" class="w-full h-[80vh] flex flex-col justify-between items-center relative">

			<!-- Leave Tournament X Button -->
			<button id="onlineTour_exit_matchmaking" class="absolute top-4 right-4 w-6 h-6 bg-yellow-400 rounded flex items-center justify-center hover:bg-yellow-300">
				<i class="fas fa-times text-black text-xl"></i>
			</button>

			<div id="onlineTour_matchmaking_header" class="text-center mb-6">
				<h1 id="onlineTour_mm_title" class="text-5xl font-bold">Online Tournament Bracket</h1>
			</div>

			<div class="flex justify-center w-full mb-8">

				<div class="flex items-center">
					<!-- left side -->
					<div id="onlineTour_matchmaking_leftside" class="flex flex-col space-y-8">
						<div id="onlineTour_p1_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
						<div id="onlineTour_p2_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
					</div>
					
					<!-- winner 1 -->
					<div id="onlineTour_matchmaking_winner1" class="flex flex-col mx-4">
						<div class="w-[40px] h-[15px] border-r-2 border-t-2 mb-[15px]"></div>
						<div id="onlineTour_winner1_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
						<div class="w-[40px] h-[15px] border-r-2 border-b-2 mt-[15px]"></div>
					</div>

					<!-- final winner -->
					<div class="mx-2 relative">
						<i class="fas fa-trophy absolute -top-8 left-1/2 -translate-x-1/2 text-2xl"></i>
						<div id="onlineTour_matchmaking_finalwinner" class="border-2 rounded-lg w-40 py-4 text-center border-yellow-400 font-bold">?</div>
					</div>

					<!-- winner2 -->
					<div id="onlineTour_matchmaking_winner2" class="flex flex-col items-end mx-4">
						<div class="w-[40px] h-[15px] border-l-2 border-t-2 mb-[15px]"></div>
						<div id="onlineTour_winner2_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
						<div class="w-[40px] h-[15px] border-l-2 border-b-2 mt-[15px]"></div>
					</div>

					<!-- right side -->
					<div id="onlineTour_matchmaking_rightside" class="flex flex-col space-y-8">
						<div id="onlineTour_p3_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
						<div id="onlineTour_p4_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
					</div>
				</div>

				<!-- loser bracket -->
				<div class="h-30 border mx-6"></div>
				<div class="flex flex-col items-center relative">
					<div id="onlineTour_losersbracket_text" class="absolute text-xl -top-10">Loser's Bracket</div>
						<div class="flex items-center">
							<div class="flex flex-col space-y-8">
								<div id="onlineTour_loser1_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
								<div id="onlineTour_loser2_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
							</div>
						<div class="flex flex-col mx-3">
							<div class="w-[40px] h-[15px] border-r-2 border-t-2 mb-[15px]"></div>
							<div id="onlineTour_loser_final" class="border rounded-lg w-40 py-2 text-center">?</div>
							<div class="w-[40px] h-[15px] border-r-2 border-b-2 mt-[15px]"></div>
						</div>
					</div>
				</div>
			</div>

			<!-- Tournament status -->
			<div id="onlineTour_status_section" class="text-center bg-white/20 w-2/3 rounded-xl pt-6 pb-12">
				<h1 id="onlineTour_tournamentstatus_text" class="text-2xl font-bold mb-4">Tournament Status</h1>
				<div id="onlineTour_mm_status" class="text-xl mb-4">Waiting for players...</div>
				<div id="onlineTour_player_list" class="text-lg">
					<div><div id="onlineTour_playersjoined_text">Players joined:</div> <span id="onlineTour_player_count">0/4</span></div>
				</div>
			</div>

			<!-- current battle -->
			<div id="onlineTour_matchmaking_currentbattle" class="text-center bg-white/20 w-2/3 rounded-xl pt-6 pb-12 hidden">
				<h1 id="onlineTour_currentbattle_text" class="text-2xl font-bold mb-10">Current Battle</h1>
				<section class="flex items-center justify-center">
					<div id="onlineTour_p1_matchmaking_name" class="text-5xl font-bold"></div>
					<div class="w-1/4 pixel-font text-5xl text-yellow-400">VS</div>
					<div id="onlineTour_p2_matchmaking_name" class="text-5xl font-bold"></div>
				</section>
			</div>

			<!-- rankings display -->
			<div id="onlineTour_matchmaking_rankingdiv" class="hidden">
				<h1 id="onlineTour_mm_finalrankings_text" class="text-2xl border-b-2 pb-2">🏆 Final Rankings 🏆</h1>
				<div class="flex flex-col items-center my-8">
					<div>
					<div class="flex items-center gap-5 py-2">
						<span class="prize-1">1</span>
						<span id="onlineTour_ranking_1st" class="text-xl font-medium"></span>
					</div>
					<div class="flex items-center gap-5 py-2">
						<span class="prize-2">2</span>
						<span id="onlineTour_ranking_2nd" class="text-xl font-medium"></span>
					</div>
					<div class="flex items-center gap-5 py-2">
						<span class="prize-3">3</span>
						<span id="onlineTour_ranking_3rd" class="text-xl font-medium"></span>
					</div>
					<div class="flex items-center gap-5 py-2">
						<span class="prize-4">4</span>
						<span id="onlineTour_ranking_4th"  class="text-xl font-medium"></span>
					</div>
					</div>
				</div>

				<div id="onlineTour_rankings_optional_msg" class="mb-2"></div>
			</div>
			
			<!-- buttons -->
			<button id="onlineTour_open_game" class="button-primary hidden">Start Battle</button>
			<button id="onlineTour_close_finalwinner_popup" class="hidden button-primary">Back to Menu</button>
		</div>
	</div>
`

export const online_tour_game_popup = `
	<div id="onlineTour_registration" class="bg-gray-950 flex h-screen p-20 justify-center hidden fixed inset-0 text-white inter-font">
		<div class="w-full h-[80vh] flex flex-col justify-center items-center">
			<h1 id="onlineTour_title" class="text-5xl font-bold mb-8">Join Online Tournament</h1>
			
			<div class="text-center mb-8 bg-white/20 rounded-xl p-8">
				<p id="onlineTour_p1" class="text-xl mb-4">Ready to compete in the online tournament?</p>
				<p id="onlineTour_p2" class="text-lg mb-4">You will be matched against 3 other players</p>
			</div>

			<div class="flex gap-4">
				<button id="onlineTour_main_start_button" class="button-primary">
					Join Tournament
				</button>
				<button id="onlineTour_main_close_button" class="button-secondary">
					Cancel
				</button>
			</div>
		</div>
	</div>

	${onlineTour_matchmaking_popup}
`;