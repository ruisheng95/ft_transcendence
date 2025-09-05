
import { xox_online_play } from "./game-online-xox.ts";
import { hide_all_main_pages } from "./pong_modes.ts";
import { WS } from "./class/WS.ts";
import { add_history } from "./spa-navigation.ts";
import { translate_text } from "./language.ts";

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
		open_xox_modes();
		add_history("/tic_tac_toe");
	});

	xox_online_button.addEventListener("click", () => {
		xox_online_play();
		add_history("/tic_tac_toe-online");
	});
}

export function open_xox_modes()
{
	const xox_button = document.querySelector<HTMLButtonElement>("#xox_button");
	const xox_popup  = document.querySelector<HTMLButtonElement>("#xox_dashboard_popup");
	const xox_online_button = document.querySelector<HTMLButtonElement>("#online_xox_button");

	if(!xox_button || !xox_popup || !xox_online_button)
		throw new Error("Error pf_config stuff not found");
	
	hide_all_main_pages();
	xox_popup.classList.remove("hidden");
	xox_button.classList.add("bg-yellow-400");
	xox_button.querySelector<HTMLDivElement>("i")?.classList.add("text-black");
	fetch_data();
}

export function click_xox_modes_button()
{
	const xox_button = document.querySelector<HTMLButtonElement>("#xox_button");
	xox_button?.click();
}

function resultStatus(status: number)
{
	switch (status){
		case 1: return `<span class="text-red-500">${translate_text("Lose")}</span>`;
		case 2: return `<span class="text-green-500">${translate_text("Win")}</span>`
		default: return `<span class="text-blue-300">${translate_text("Tie")}</span>`;
	}
}

export function fetch_data()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`);

	if(socket.readyState === WebSocket.OPEN)
		socket.send(JSON.stringify( {type: "get_xoxstats" }));

	socket.addEventListener("message", (event) => {
		const data = JSON.parse(event.data);
		const history_div = document.querySelector<HTMLDivElement>("#xox_history");
		const stat_div = document.querySelector<HTMLDivElement>("#xox_stats");
			
		if (!history_div || !stat_div)
			throw new Error("Insert playerstats elements not found");

		if (data.type === "xoxstats_info")
		{
			stat_div.innerHTML = html`
				<!-- Total Matches -->
				<div class="bg-white/20 rounded-lg px-4 py-2">
					<div class="flex items-center font-semibold mb-2">
						<i class="fas fa-gamepad text-yellow-400 text-2xl mr-3"></i>
						<div id="xox_matches_text"> ${translate_text("Matches")} </div>
					</div>
					<div class="text-5xl font-bold text-end">${data.total}</div>
				</div>

				<!-- Total Ties -->
				<div class="bg-white/20 rounded-lg px-4 py-2">
					<div class="flex items-center font-semibold mb-2">
						<i class="fa-solid fa-circle-exclamation text-yellow-400 text-2xl mr-3"></i>
						<div id="xox_ties_text"> ${translate_text("Ties")} </div>
					</div>
					<div class="text-5xl font-bold text-end">${data.tie}</div>
				</div>

				<!-- Total Wins -->
				<div class="bg-white/20 rounded-lg px-4 py-2">
					<div class="flex items-center font-semibold mb-2">
						<i class="fas fa-face-laugh-squint text-yellow-400 text-2xl mr-3"></i>
						<div id="xox_wins_text"> ${translate_text("Wins")} </div>
					</div>
					<div class="text-5xl font-bold text-end">${data.win}</div>
				</div>

				<!-- Total Loses -->
				<div class="bg-white/20 rounded-lg px-4 py-2">
					<div class="flex items-center font-semibold mb-2">
						<i class="fas fa-face-sad-cry text-yellow-400 text-2xl mr-3"></i>
						<div id="xox_loses_text">${translate_text("Loses")}</div>
					</div>
					<div class="text-5xl font-bold text-end">${data.lose}</div>
				</div>

				<!-- Win Rate -->
				<div class="bg-white/20 rounded-xl px-4 py-2 col-span-2">
					<div class="flex items-center font-semibold mb-4">
						<i class="fas fa-balance-scale text-yellow-400 text-2xl mr-3"></i>
						<div id="xox_winrate_text">${translate_text("Win Rate")}</div>
					</div>
					<div class="mb-4 w-full bg-red-500 rounded-full h-4">
						<div class="bg-green-500 h-4 rounded-full" style="width: ${data.win_rate}%"></div>
					</div>
					<div class="text-2xl font-semibold text-end">${data.win_rate}%</div>
				</div>
			`

			if (data.history.length === 0)
			{
				history_div.innerHTML = html`
					<div class="flex flex-col w-full h-full justify-center items-center text-gray-400">
						<span class="text-xl">${translate_text("No match history yet")}</span>
					</div>
				`;
			}
			else
			{
				let historyList = '';
				for(let i = data.history.length - 1; i >= 0; i--)
				{
					historyList += html`
						<div class="bg-white/20 rounded-lg px-4 py-2 grid grid-cols-[2fr_4fr_4fr_1fr] gap-4 items-center">
							<span>${data.history[i].date}</span>
							<span>${data.history[i].left}</span>
							<span>${data.history[i].right}</span>
							${resultStatus(data.history[i].result)}
						</div>
					`;
				}
				history_div.innerHTML = historyList;
			}

		}
	});
}


export const xox_popup = html`

	<div id="xox_dashboard_popup" class="hidden h-[90vh] inter-font py-8 px-12 text-white">
		
		<main class="flex w-full h-full gap-8">

			<!-- History Section -->
			<div class="w-7/12">
				<h2 class="text-xl font-bold mb-6 flex items-center">
					<i class="fa fa-history mr-3"></i>
					<div id="xox_match_history_text"> Match History </div>
				</h2>

				<!-- Table Header -->
				<div class="grid grid-cols-[2fr_4fr_4fr_1fr] gap-4 pr-9 px-4 mb-1 font-semibold">
					<span id="xox_date_text">Date</span>
					<span id="xox_leftplayer_text">Left Player</span>
					<span id="xox_rightplayer_text">Right Player</span>
					<span id="xox_result_text">Result</span>
				</div>
				
				<!-- Table Entry -->
				<div id="xox_history" class="h-[73vh] overflow-y-scroll pr-2 space-y-3"></div>
			</div>
			
			<!-- Stats Section -->
			<div class="w-5/12 flex flex-col">
					
				<h2 class="text-xl font-bold flex items-center mb-6">
					<i class="fa-solid fa-chart-pie mr-3"></i>
					<div id="xox_stats_text"> Statistics </div>
				</h2>

				<section id="xox_stats" class="grid grid-cols-2 gap-4 px-12 mb-6"></section>

				<!-- 1 vs 1 -->
				<div class="flex flex-col items-center col-span-2 space-y-2">
					<p id="xox_play_text" class="text-center text-2xl pixel-font">PLAY</p>
					<button id="online_xox_button" class="py-4 cursor-pointer rounded-xl font-semibold text-xl text center border-2 border-yellow-400 hover:bg-yellow-400/20 transition duration-200 w-3/4 tracking-widest">Online</button>
					<button id="local_xox_button" class="py-4 cursor-pointer rounded-xl font-semibold text-xl text center border-2 border-yellow-400 hover:bg-yellow-400/20 transition duration-200 w-3/4 tracking-widest">Local play</button>
				</div>

			</div>

		</main>
	</div>
`