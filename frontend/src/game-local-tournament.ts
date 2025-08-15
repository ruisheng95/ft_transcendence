
import "./gamestyle.css";
import { local_tour_manager } from "./game-local-tournament2.ts";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

// local_tour_game
export function local_tour_game_setup()
{
	const local_tour_start_button = document.querySelector<HTMLButtonElement>("#local_tour_main_start_button"); // changed to start button
	const localTour_regist_page = document.querySelector<HTMLDivElement>("#localTour_registration");

	const p1_name_input_element = document.querySelector<HTMLInputElement>("#localTour_p1_name_input");
	const p2_name_input_element = document.querySelector<HTMLInputElement>("#localTour_p2_name_input");
	const p3_name_input_element = document.querySelector<HTMLInputElement>("#localTour_p3_name_input");
	const p4_name_input_element = document.querySelector<HTMLInputElement>("#localTour_p4_name_input");
	

	if (!localTour_regist_page || !p1_name_input_element || !p2_name_input_element || !p3_name_input_element || !p4_name_input_element || !local_tour_start_button)
		throw new Error("Error local_tour_game buttons not found");

	p1_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	p2_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	p3_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	p4_name_input_element.addEventListener("input", (event : Event) => {
		verify_name_input(event);
	});

	local_tour_start_button.addEventListener("click", () => {

		console.log("Entered here");

		if(!p1_name_input_element || !p2_name_input_element || !p3_name_input_element || !p4_name_input_element)
			throw new Error("Error: localTour elements not found");

		const p1_name = p1_name_input_element.value;
		const p2_name = p2_name_input_element.value;
		const p3_name = p3_name_input_element.value;
		const p4_name = p4_name_input_element.value;
		const player_names = [p1_name, p2_name, p3_name, p4_name];
		
		//generate random numbers
		let rand_p1 = 0;
		let rand_p2 = 0;
		let rand_p3 = 0;
		let rand_p4 = 0;

		rand_p1 = Math.floor(Math.random() * 4);
		while (rand_p2 == 0 || rand_p2 == rand_p1)
			rand_p2 = Math.floor(Math.random() * 4);
		for (let i = 0; i <= 3; i++)
		{
			if (i != rand_p1 && i != rand_p2 && rand_p3 == 0)
				rand_p3 = i;
			else if(i != rand_p1 && i != rand_p2 && rand_p3 != 0 && i != rand_p3)
				rand_p4 = i;
		}

		localTour_regist_page.classList.add("hidden");
		local_tour_manager(player_names[rand_p1], player_names[rand_p2], player_names[rand_p3], player_names[rand_p4]);
	});

}

const localTour_matchmaking_popup = html`
	<div id="localTour_matchmaking_popup" class="bg-black flex h-screen p-20 justify-center hidden fixed inset-0 text-white inter-font">
		<div id="localTour_matchmaking_popup_screen" class="w-full h-[80vh] flex flex-col justify-between items-center">

			<div id="localTour_matchmaking_header" class="text-center mb-6">
				<h1 class="text-5xl font-bold">Tournament Bracket</h1>
			</div>

			<div class="flex justify-center w-full mb-8">

				<div class="flex items-center">
					<!-- left side -->
					<div id="localTour_matchmaking_leftside" class="flex flex-col space-y-8">
						<div id="localTour_p1_bracket" class="border rounded-lg w-40 py-2 text-center"></div>
						<div id="localTour_p2_bracket" class="border rounded-lg w-40 py-2 text-center"></div>
					</div>
					
					<!-- winner 1 -->
					<div id="localTour_matchmaking_winner1" class="flex flex-col mx-4">
						<div class="w-[40px] h-[15px] border-r-2 border-t-2 mb-[15px]"></div>
						<div id="localTour_winner1_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
						<div class="w-[40px] h-[15px] border-r-2 border-b-2 mt-[15px]"></div>
					</div>

					<!-- final winner -->
					<div class="mx-2 relative">
						<i class="fas fa-trophy absolute -top-8 left-1/2 -translate-x-1/2 text-2xl"></i>
						<div id="localTour_matchmaking_finalwinner" class="border-2 rounded-lg w-40 py-4 text-center border-yellow-400 font-bold">?</div>
					</div>

					<!-- winner2 -->
					<div id="localTour_matchmaking_winner2" class="flex flex-col items-end mx-4">
						<div class="w-[40px] h-[15px] border-l-2 border-t-2 mb-[15px]"></div>
						<div id="localTour_winner2_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
						<div class="w-[40px] h-[15px] border-l-2 border-b-2 mt-[15px]"></div>
					</div>

					<!-- right side -->
					<div id="localTour_matchmaking_rightside" class="flex flex-col space-y-8">
						<div id="localTour_p3_bracket" class="border rounded-lg w-40 py-2 text-center">P3</div>
						<div id="localTour_p4_bracket" class="border rounded-lg w-40 py-2 text-center">P4</div>
					</div>
				</div>

				<!-- loser bracket -->
				<div class="h-30 border mx-6"></div>
				<div class="flex flex-col items-center relative">
					<div class="absolute text-xl -top-10">Loser's Bracket</div>
						<div class="flex items-center">
							<div class="flex flex-col space-y-8">
								<div id="localTour_loser1_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
								<div id="localTour_loser2_bracket" class="border rounded-lg w-40 py-2 text-center">?</div>
							</div>
						<div class="flex flex-col mx-3">
							<div class="w-[40px] h-[15px] border-r-2 border-t-2 mb-[15px]"></div>
							<div id="localTour_loser_final" class="border rounded-lg w-40 py-2 text-center">?</div>
							<div class="w-[40px] h-[15px] border-r-2 border-b-2 mt-[15px]"></div>
						</div>
					</div>
				</div>
			</div>

			<!-- current battle -->
			<div id="localTour_matchmaking_currentbattle" class="text-center bg-white/20 w-2/3 rounded-xl pt-6 pb-12">
				<h1 class="text-2xl font-bold mb-10">Current Battle</h1>
				<section class="flex items-center justify-center">
					<div id="localTour_p1_matchmaking_name" class="text-5xl font-bold"></div>
					<div class="w-1/4 pixel-font text-5xl text-yellow-400">VS</div>
					<div id="localTour_p2_matchmaking_name" class="text-5xl font-bold"></div>
				</section>
			</div>

			<!-- rankings display -->
			<div id="localTour_matchmaking_rankingdiv" class="hidden">
				<h1 class="text-2xl border-b-2 pb-2">🏆 Final Rankings 🏆</h1>
				<div class="flex flex-col items-center my-8">
					<div>
					<div class="flex items-center gap-5 py-2">
						<span class="prize-1">1</span>
						<span id="localTour_ranking_1st" class="text-xl font-medium"></span>
					</div>
					<div class="flex items-center gap-5 py-2">
						<span class="prize-2">2</span>
						<span id="localTour_ranking_2nd" class="text-xl font-medium"></span>
					</div>
					<div class="flex items-center gap-5 py-2">
						<span class="prize-3">3</span>
						<span id="localTour_ranking_3rd" class="text-xl font-medium"></span>
					</div>
					<div class="flex items-center gap-5 py-2">
						<span class="prize-4">4</span>
						<span id="localTour_ranking_4th"  class="text-xl font-medium"></span>
					</div>
					</div>
				</div>
			</div>
			
			<!-- buttons -->
			<button id="localTour_open_game" class="button-primary">Start Battle</button>
			<button id="localTour_close_finalwinner_popup" class="hidden button-primary">Close Tournament</button>
		</div>
	</div>
`

export const local_tour_game_popup = `

	${localTour_matchmaking_popup}
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

		const localTour_error_msg_div = document.querySelector<HTMLDivElement>("#localTour_error_msg");
		if(!localTour_error_msg_div) throw new Error("localTour errordiv not found");

		for (const input_char of input)
		{
			if (valid_chars.includes(input_char))
				clean_input += input_char;
			else
				invalid_char = true;

		}

		if(input.length > 9)
		{
			localTour_error_msg_div.innerText = "Input too long";
			clean_input = clean_input.substring(0, 9);
		}
		else if (invalid_char == true)
			localTour_error_msg_div.innerText = "Numbers, alphabets and '_' only";
		else
			localTour_error_msg_div.innerText = "";

		target.value = clean_input;
	}
}
