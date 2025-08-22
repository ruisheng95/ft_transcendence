
import { hide_all_main_pages } from "./pong_modes.ts";
import { WS } from "./class/WS.ts";
import { add_history } from "./spa-navigation.ts";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);


export function xox_setup ()
{
	const xox_button = document.querySelector<HTMLButtonElement>("#xox_button");
	const xox_popup  = document.querySelector<HTMLButtonElement>("#xox_dashboard_popup");

	if(!xox_button || !xox_popup)
		throw new Error("Error pf_config stuff not found");

	xox_button.addEventListener("click", () => {
		hide_all_main_pages();
		xox_popup.classList.remove("hidden");
		xox_button.classList.add("bg-yellow-400");
		xox_button.querySelector<HTMLDivElement>("i")?.classList.add("text-black");
		fetch_data();
		add_history("tic_tac_toe");
	});
}

function resultStatus(status: number)
{
	switch (status){
		case 1: return `<span class="text-red-500">Lose</span>`;
		case 2: return `<span class="text-green-500">Win</span>`
		default: return `<span class="text-blue-300">Tie</span>`;
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

		if(data.type === "xoxstats_info")
		{

			stat_div.innerHTML = html`
				<!-- Total Matches -->
				<div class="bg-white/20 rounded-lg px-4 py-2">
					<div class="flex items-center font-semibold mb-2">
						<i class="fas fa-face-laugh-squint text-yellow-400 text-2xl mr-3"></i>
						Total Match
					</div>
					<div class="text-5xl font-bold text-end">${data.total}</div>
				</div>

				<!-- Total Ties -->
				<div class="bg-white/20 rounded-lg px-4 py-2">
					<div class="flex items-center font-semibold mb-2">
						<i class="fas fa-face-sad-cry text-yellow-400 text-2xl mr-3"></i>
						Total Ties
					</div>
					<div class="text-5xl font-bold text-end">${data.tie}</div>
				</div>

				<!-- More stats -->
				<div class="bg-white/20 rounded-xl p-4 col-span-2 space-y-4">
					<!-- Left Player -->
					<h3 class="font-bold text-xl text-center">
						<i class="fa-solid fa-left-long text-fuchsia-500"></i> 
						Left Player
					</h3>
					<div class="flex justify-between px-2">
						<span>Total Win: ${data.left_win}</span>
						<span>Rate: ${data.left_rate}%</span>
					</div>
					<div class="mb-8 w-full bg-red-500 rounded-full h-4">
						<div class="bg-green-500 h-4 rounded-l-full" style="width:  ${data.left_rate}%"></div>
					</div>

					<!-- Right Player -->
					<div class="w-full bg-red-500 rounded-full h-4">
						<div class="bg-green-500 h-4 rounded-l-full" style="width:  ${data.right_rate}%"></div>
					</div>
					<div class="flex justify-between px-2">
						<span>Total Win:  ${data.right_win}</span>
						<span>Rate: ${data.right_rate}%</span>
					</div>
					<h3 class="font-bold text-xl text-center">
						<i class="fa-solid fa-right-long text-blue-500"></i>
						Right Player 
					</h3>
				</div>
			`

			if (data.history.length === 0)
			{
				history_div.innerHTML = html`
					<div class="flex flex-col w-full h-full justify-center items-center text-gray-400">
						<span class="text-xl">No match history yet</span>
					</div>
				`;
			}
			else
			{
				let historyList = '';
				for(let i = data.history.length - 1; i >= 0; i--)
				{
					historyList += html`
						<div class="bg-white/20 rounded-lg px-4 py-2 grid grid-cols-[2fr_3fr_1fr_3fr_1fr] gap-4 items-center">
							<span>${data.history[i].date}</span>
							<span>${data.history[i].left_name}</span>
							${resultStatus(data.history[i].left_result)}
							<span>${data.history[i].right_name}</span>
							${resultStatus(data.history[i].right_result)}
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
					Match History
				</h2>

				<!-- Table Header -->
				<div class="grid grid-cols-[2fr_3fr_1fr_3fr_1fr] gap-4 pr-9 px-4 mb-1 font-semibold">
					<span>Date</span>
					<span>Left Player</span>
					<span>Result</span>
					<span>Right Player</span>
					<span>Right</span>
				</div>
				
				<!-- Table Entry -->
				<div id="xox_history" class="h-[73vh] overflow-y-scroll pr-2 space-y-3"></div>
			</div>
			
			<!-- Stats Section -->
			<div class="w-5/12 h-11/12 flex flex-col justify-between">
					
				<h2 class="text-xl font-bold flex items-center">
					<i class="fa-solid fa-chart-pie mr-3"></i>
					Statistics
				</h2>
				
				<section id="xox_stats" class="grid grid-cols-2 gap-4 px-12"></section>

				<button id="local_xox_button" class="mx-12 h-1/6 text-3xl tracking-widest font-bold pixel-font flex items-center rounded-2xl justify-center border-2 border-yellow-400 hover:bg-yellow-400/20 transition duration-200 ">
					Play
				</button>
			</div>

		</main>
	</div>
`
