
export function hide_all_main_pages()
{
	const pong_modes_popup = document.querySelector<HTMLDivElement>("#pong_modes_popup");
	const friends_popup = document.querySelector<HTMLDivElement>("#friends_popup");

	if(!pong_modes_popup || !friends_popup) throw new Error("hide main pages elements not found");

	pong_modes_popup.classList.add("hidden");
	friends_popup.classList.add("hidden");
}

export function pong_modes_setup()
{
	const pong_modes_button = document.querySelector<HTMLButtonElement>("#pong_modes_button");
	const pong_modes_popup = document.querySelector<HTMLDivElement>("#pong_modes_popup");

	if(!pong_modes_button || !pong_modes_popup) throw new Error("pong modes setup elements not found");

	pong_modes_button.addEventListener("click", () => {
		hide_all_main_pages();
		pong_modes_popup.classList.remove("hidden");
	})
}

export const pong_modes_popup = `
	<div id="pong_modes_popup" class="text-white h-[90vh] w-full bg-gray-950 flex flex-col inter-font">
		
		<!-- Game Selection Grid -->
		<div class="py-20 px-12 grid gap-8 grid-cols-4 justify-center">
			
			<!-- 1 vs 1 -->
			<div class="bg-white/20 rounded-lg p-8 text-center space-y-4">
				<div class="h-60">
					<h2 class="text-3xl font-bold mb-6">1 vs 1</h2>
					<p>Classic 1-on-1 clash outplay your rival in a fast-paced duel</p>
				</div>
				<button id="online_1v1_button" class="w-full border-2 border-yellow-400 py-3 rounded-full font-medium text-white hover:bg-yellow-400 hover:text-black transition-colors duration-200">
					Online
				</button>
				<button id="local_1v1_button" class="w-full border-2 border-yellow-400 py-3 rounded-full font-medium text-white hover:bg-yellow-400 hover:text-black transition-colors duration-200">
					Local Play
				</button>
			</div>

			<!-- 2 vs 2 -->
			<div class="bg-white/20 rounded-lg p-8 text-center space-y-4">
				<div class="h-60">
					<h2 class="text-3xl font-bold mb-6">2 vs 2</h2>
					<p>Team up with a friend and crush the competition in thrilling 2v2 battles</p>
				</div>
				<button id="online_2v2_button" class="w-full border-2 border-yellow-400 py-3 rounded-full font-medium text-white hover:bg-yellow-400 hover:text-black transition-colors duration-200">
					Online
				</button>
				<button id="local_2v2_button" class="w-full border-2 border-yellow-400 py-3 rounded-full font-medium text-white hover:bg-yellow-400 hover:text-black transition-colors duration-200">
					Local Play
				</button>
			</div>

			<!-- Tournament -->
			<div class="bg-white/20 rounded-lg p-8 text-center space-y-4">
				<div class="h-60">
					<h2 class="text-3xl font-bold mb-6">Tournament</h2>
					<p>Climb the bracket and compete for glory. Each player competes in 2 rounds to determine the winner</p>
				</div>
				<button id="online_tournament_button" class="w-full border-2 border-yellow-400 py-3 rounded-full font-medium text-white hover:bg-yellow-400 hover:text-black transition-colors duration-200">
					Online
				</button>
				<button id="local_tournament_button" class="w-full border-2 border-yellow-400 py-3 rounded-full font-medium text-white hover:bg-yellow-400 hover:text-black transition-colors duration-200">
					Local Play
				</button>
			</div>
			
			<!-- Practice -->
			<div class="bg-white/20 rounded-lg p-8 text-center space-y-4">
				<div class="h-60">
					<h2 class="text-3xl font-bold mb-6">Practice</h2>
					<p>Train up and sharpen your skills by battling the AI</p>
				</div>
				<button id="vs_AI_game_button" class="w-full border-2 border-yellow-400 py-3 rounded-full font-medium text-white hover:bg-yellow-400 hover:text-black transition-colors duration-200">
					vs AI
				</button>
			</div>
		</div>
	
		<div class="group fixed bottom-12 right-12 duration-200 transition-opacity text-white">
			<button id="playerstats_button"
				class="flex items-center font-semibold text-xl mb-1">
				<span class="pr-4">Player stats</span>
				<i class="fas fa-chevron-right text-yellow-400 text-2xl"></i>
				<i class="fas fa-chevron-right text-yellow-400 text-2xl"></i>
			</button>
			<div class="h-1 opacity-0 group-hover:opacity-100 bg-yellow-400 w-full"></div>
		</div>
		
	</div>
`;