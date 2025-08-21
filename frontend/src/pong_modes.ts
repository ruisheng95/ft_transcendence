import { add_history } from "./spa-navigation";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

export function hide_all_main_pages()
{
	const pong_modes_popup = document.querySelector<HTMLDivElement>("#pong_modes_popup");
	const friends_popup = document.querySelector<HTMLDivElement>("#friends_popup");
	const settings_popup = document.querySelector<HTMLDivElement>("#settings_popup");
	const playerstats_popup = document.querySelector<HTMLDivElement>("#playerstats_popup");
	const xox_popup  = document.querySelector<HTMLButtonElement>("#xox_dashboard_popup");

	const xox_button = document.querySelector<HTMLButtonElement>("#xox_button");
	const pong_button = document.querySelector<HTMLButtonElement>("#pong_modes_button");
	const friends_button = document.querySelector<HTMLButtonElement>("#display_friends_page_button");
	const settings_button = document.querySelector<HTMLButtonElement>("#settings_button");

	if(!pong_modes_popup || !friends_popup || !settings_popup || 
		!pong_button || !friends_button || !settings_button || !playerstats_popup ||
		!xox_popup || !xox_button) 
		throw new Error("hide main pages elements not found");

	pong_modes_popup.classList.add("hidden");
	friends_popup.classList.add("hidden");
	settings_popup.classList.add("hidden");
	playerstats_popup.classList.add("hidden");
	xox_popup.classList.add("hidden");

	pong_button.classList.remove("bg-yellow-400");
	pong_button.querySelector<HTMLDivElement>("i")?.classList.remove("text-black");

	friends_button.classList.remove("bg-yellow-400");
	friends_button.querySelector<HTMLDivElement>("i")?.classList.remove("text-black");

	settings_button.classList.remove("bg-yellow-400");
	settings_button.querySelector<HTMLDivElement>("i")?.classList.remove("text-black");

	xox_button.classList.remove("bg-yellow-400");
	xox_button.querySelector<HTMLDivElement>("i")?.classList.remove("text-black");
}

export function pong_modes_setup()
{
	const pong_modes_button = document.querySelector<HTMLButtonElement>("#pong_modes_button");
	const pong_modes_popup = document.querySelector<HTMLDivElement>("#pong_modes_popup");

	if(!pong_modes_button || !pong_modes_popup) throw new Error("pong modes setup elements not found");

	pong_modes_button.addEventListener("click", () => {
		open_pong_modes();
		add_history("/pong");
	})
}

export function open_pong_modes()
{
	const pong_modes_button = document.querySelector<HTMLButtonElement>("#pong_modes_button");
	const pong_modes_popup = document.querySelector<HTMLDivElement>("#pong_modes_popup");
	
	if(!pong_modes_button || !pong_modes_popup) throw new Error("open pong modes elements not found");
	
	hide_all_main_pages();
	pong_modes_popup.classList.remove("hidden");
	pong_modes_button.classList.add("bg-yellow-400");
	pong_modes_button.querySelector<HTMLDivElement>("i")?.classList.add("text-black");
}

export const pong_modes_popup = html`
	<div id="pong_modes_popup" class="text-white h-[90vh] w-full bg-gray-950 flex flex-col inter-font">
		
		<!-- Game Selection Grid -->
		<div class="py-20 px-12 grid gap-8 grid-cols-4 justify-center">
			
			<!-- 1 vs 1 -->
			<div class="bg-white/20 rounded-xl p-8 space-y-4">
				<div class="h-60 flex flex-col items-center text-center space-y-4">
					<img class="w-20 h-20 object-cover" src="/1vs1.png" alt="game-type">
					<h2 id="pong1v1_title" class="text-3xl font-bold">1 vs 1</h2>
					<p id="pong1v1_desc" class="text-lg">Classic 1-on-1 clash outplay your rival in a  duel</p>
				</div>
				<button id="online_1v1_button" class="button-secondary tracking-widest w-full">Online</button>
				<button id="local_1v1_button" class="button-secondary tracking-widest w-full">Local Play</button>
			</div>

			<!-- 2 vs 2 -->
			<div class="bg-white/20 rounded-xl p-8 space-y-4">
				<div class="h-60 flex flex-col items-center text-center space-y-4">
					<img class="w-20 h-20 object-cover" src="/2vs2.png" alt="game-type">
					<h2 id="pong2v2_title" class="text-3xl font-bold">2 vs 2</h2>
					<p id="pong2v2_desc" class="text-lg">Team up with a friend and crush the competition</p>
				</div>
				<button id="online_2v2_button" class="button-secondary tracking-widest w-full">Online</button>
				<button id="local_2v2_button" class="button-secondary tracking-widest w-full">Local Play</button>
			</div>

			<!-- Tournament -->
			<div class="bg-white/20 rounded-xl p-8 space-y-4">
				<div class="h-60 flex flex-col items-center text-center space-y-4">
					<img class="w-20 h-20 object-cover" src="/tournament.png" alt="game-type">
					<h2 id="pongTour_title" class="text-3xl font-bold">Tournament</h2>
					<p id="pongTournament_desc" class="text-lg">Climb the bracket. Each player competes in 2 rounds to determine the winner</p>
				</div>
				<button id="online_tournament_button" class="button-secondary tracking-widest w-full">Online</button>
				<button id="local_tournament_button" class="button-secondary tracking-widest w-full">Local Play</button>
			</div>
			
			<!-- Practice -->
			<div class="bg-white/20 rounded-xl p-8 space-y-4">
				<div class="h-60 flex flex-col items-center text-center space-y-4">
					<img class="w-20 h-20 object-cover" src="/bot.png" alt="game-type">
					<h2 id="pong_vs_AI_title" class="text-3xl font-bold">Practice</h2>
					<p id="vs_AI_desc" class="text-lg">Train up and sharpen your skills by battling the AI</p>
				</div>
				<button id="vs_AI_game_button" class="button-secondary tracking-widest w-full">vs AI</button>
			</div>
		</div>
	
		<div class="group fixed bottom-12 right-12 duration-200 transition-opacity text-white">
			<button id="playerstats_button"
				class="flex items-center font-semibold text-xl mb-1">
				<span id="playerstats_button_text" class="pr-4">Player stats</span>
				<i class="fas fa-chevron-right text-yellow-400 text-2xl"></i>
				<i class="fas fa-chevron-right text-yellow-400 text-2xl"></i>
			</button>
			<div class="h-1 opacity-0 group-hover:opacity-100 bg-yellow-400 w-full"></div>
		</div>
		
	</div>
`;