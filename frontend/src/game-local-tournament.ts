
import "./gamestyle.css";
import { local_tour_manager } from "./game-local-tournament2.ts";

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

const localTour_matchmaking_popup = `
	<div id="localTour_matchmaking_popup" class="flex flex-col justify-center items-center hidden fixed bg-black bg-opacity-90 inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="localTour_matchmaking_popup_screen" class="bg-black border border-2 border-white w-[70%] h-[70%] flex flex-col justify-center items-center">

			<div id="localTour_matchmaking_header" class="text-center mb-6">
				<h1 class="text-[40px] text-white">TOURNAMENT BRACKET</h1>
			</div>

			<div class="flex justify-center w-full mb-8">

				<div class="flex items-center">
					<!-- left side -->
					<div id="localTour_matchmaking_leftside" class="flex flex-col space-y-8">
						<div id="localTour_p1_bracket" class="text-white text-[18px] w-[100px] h-[35px] border border-white flex items-center justify-center"></div>
						<div id="localTour_p2_bracket" class="text-white text-[18px] w-[100px] h-[35px] border border-white flex items-center justify-center"></div>
					</div>
					
					<!-- winner 1 -->
					<div id="localTour_matchmaking_winner1" class="flex flex-col items-center mx-4">
						<div class="w-[30px] h-[15px] border-r-2 border-t-2 border-white mb-[15px]"></div>
						<div id="localTour_winner1_bracket" class="text-white text-[16px] w-[80px] h-[30px] border border-white flex items-center justify-center">?</div>
						<div class="w-[30px] h-[15px] border-r-2 border-b-2 border-white mt-[15px]"></div>
					</div>

					<!-- final winner -->
					<div class="mx-6">
						<div id="localTour_matchmaking_finalwinner" class="text-white text-[20px] w-[100px] h-[40px] border-2 border-white flex items-center justify-center font-bold">?</div>
					</div>

					<!-- winner2 -->
					<div id="localTour_matchmaking_winner2" class="flex flex-col items-center mx-4">
						<div class="w-[30px] h-[15px] border-l-2 border-t-2 border-white mb-[15px]"></div>
						<div id="localTour_winner2_bracket" class="text-white text-[16px] w-[80px] h-[30px] border border-white flex items-center justify-center">?</div>
						<div class="w-[30px] h-[15px] border-l-2 border-b-2 border-white mt-[15px]"></div>
					</div>

					<!-- right side -->
					<div id="localTour_matchmaking_rightside" class="flex flex-col space-y-8">
						<div id="localTour_p3_bracket" class="text-white text-[18px] w-[100px] h-[35px] border border-white flex items-center justify-center">P3</div>
						<div id="localTour_p4_bracket" class="text-white text-[18px] w-[100px] h-[35px] border border-white flex items-center justify-center">P4</div>
					</div>
				</div>

				<!-- loser bracket -->
				<div class="ml-12 border-l-2 border-white pl-6 flex flex-col items-center">
					<div class="text-white text-[16px] mb-2 text-center">Loser's Bracket</div>
						<div class="flex items-center">
							<div class="flex flex-col gap-2">
								<div id="localTour_loser1_bracket" class="text-white text-[14px] w-[70px] h-[25px] border border-white flex items-center justify-center">?</div>
								<div id="localTour_loser2_bracket" class="text-white text-[14px] w-[70px] h-[25px] border border-white flex items-center justify-center">?</div>
							</div>
						<div class="flex flex-col items-center mx-3">
							<div class="w-[20px] h-[10px] border-r-2 border-t-2 border-white mb-[5px]"></div>
							<div id="localTour_loser_final" class="text-white text-[14px] w-[70px] h-[25px] border-1 border-white flex items-center justify-center">?</div>
							<div class="w-[20px] h-[10px] border-r-2 border-b-2 border-white mt-[5px]"></div>
						</div>
					</div>
				</div>
			</div>

			<!-- current battle -->
			<div id="localTour_matchmaking_currentbattle" class="text-center">
				<h1 class="text-[30px] text-white">Current Battle:</h1>
				<div id="localTour_p1_matchmaking_name" class="text-[25px] font-bold mb-2 text-white"></div>
				<h1 class="text-[30px] text-white">VS</h1>
				<div id="localTour_p2_matchmaking_name" class="text-[25px] font-bold mb-6 text-white"></div>
			</div>

			<!-- rankings display -->
			<div id="localTour_matchmaking_rankingdiv" class="text-center hidden">
				<h1 class="text-[30px] text-white mb-2">🏆 Final Rankings 🏆</h1>
				<div class="p-3 border border-white mb-4">
					<div id="localTour_ranking_1st" class="text-white text-[18px] mb-1"></div>
					<div id="localTour_ranking_2nd" class="text-white text-[18px] mb-1"></div>
					<div id="localTour_ranking_3rd" class="text-white text-[18px] mb-1"></div>
					<div id="localTour_ranking_4th" class="text-white text-[18px]"></div>
				</div>
			</div>
			
			<!-- buttons -->
			<button id="localTour_open_game" class="border-2 border-white text-white px-4 py-2 text-[18px]">START MATCH</button>
			<button id="localTour_close_finalwinner_popup" class="hidden border-2 border-white text-white px-4 py-2 mt-[5px] text-[18px]">Close Tournament</button>
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
