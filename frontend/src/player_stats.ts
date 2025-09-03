import { add_history } from "./spa-navigation";
import { WS } from "./class/WS";
import { translate_text } from "./language";
import { click_pong_modes_button } from "./pong_modes";
//player stats
export function playerstats_setup ()
{
	const playerstats_button = document.querySelector<HTMLButtonElement>("#playerstats_button");
	const playerstats_popup = document.querySelector<HTMLButtonElement>("#playerstats_popup");
	const close_playerstats = document.querySelector<HTMLButtonElement>("#close_playerstats");

	const pong_modes_popup = document.querySelector<HTMLDivElement>("#pong_modes_popup");

	if(!playerstats_button || !playerstats_popup || !pong_modes_popup || !close_playerstats)
		throw new Error("Error playerstats buttons not found");

	playerstats_button.addEventListener("click", () => {
		open_playerstats_page();
		add_history("/playerstats");
	});

	close_playerstats.addEventListener("click", () => {
		playerstats_popup.classList.add("hidden");
		pong_modes_popup.classList.remove("hidden");
		click_pong_modes_button();
	});
}

export function open_playerstats_page()
{
	const playerstats_popup = document.querySelector<HTMLButtonElement>("#playerstats_popup");
	const pong_modes_popup = document.querySelector<HTMLDivElement>("#pong_modes_popup");

	if(!playerstats_popup || !pong_modes_popup) throw new Error("open playerstats page elements not found");

	playerstats_popup.classList.remove("hidden");
	pong_modes_popup.classList.add("hidden");
	insert_playerstats_and_history_main();
}

let added_listener_flag = false;
function insert_playerstats_and_history_main()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`);

	if(socket.readyState === WebSocket.OPEN)
		socket.send(JSON.stringify( {type: "get_playerstats" }));
	else
		socket.addEventListener("open", () => { socket.send(JSON.stringify( {type: "get_playerstats" })) }, { once: true });

	if(added_listener_flag === true)
		return;

	added_listener_flag = true;
	socket.addEventListener("message", (event) => {
		const msg_obj = JSON.parse(event.data);

		if(msg_obj.type === "playerstats_info")
		{
			const rating = msg_obj.rating;
			const winstreak = msg_obj.winning_streak;
			const total_wins = msg_obj.total_win;
			const total_loss = msg_obj.total_lose;
			const total_matches = msg_obj.history.length;
			const winrate = total_matches != 0 ? Math.round((total_wins / total_matches) * 100) : 0;
			
			function getOrdinalSuffix(num: number): string {
				const j = num % 10;
				if (j == 1) {
					return "st";
				}
				if (j == 2) {
					return "nd";
				}
				if (j == 3) {
					return "rd";
				}
				return "th";
			}

			function getPlacementColor(placement: number): string {
				switch(placement) {
					case 1: return "text-yellow-400";
					case 2: return "text-gray-300";
					case 3: return "text-orange-400";
					case 4: return "text-blue-400";
					case -1: return "text-gray-400";
					case -2: return "text-red-400";
					default: return "text-gray-400";
				}
			}

			const rating_div = document.querySelector<HTMLDivElement>("#playerstats_rating");
			const winstreak_div = document.querySelector<HTMLDivElement>("#playerstats_winstreak");
			const total_matches_div = document.querySelector<HTMLDivElement>("#playerstats_total_matches");
			const total_wins_div = document.querySelector<HTMLDivElement>("#playerstats_total_wins");
			const total_loss_div = document.querySelector<HTMLDivElement>("#playerstats_total_loss");
			const winrate_div = document.querySelector<HTMLDivElement>("#playerstats_winrate");
			const winrate_bar = document.querySelector<HTMLDivElement>("#playerstats_winrate_bar");

			if(!winrate_div || !winrate_bar || !rating_div || !winstreak_div || !total_matches_div || !total_wins_div || !total_loss_div) 
				throw new Error("Insert playerstats elements not found");

			rating_div.innerHTML = `${rating}`;
			winstreak_div.innerHTML = `${winstreak}`;
			total_matches_div.innerHTML = `${total_matches}`;
			total_wins_div.innerHTML = `${total_wins}`;
			total_loss_div.innerHTML = `${total_loss}`;
			winrate_div.innerHTML = `${winrate}%`;
			winrate_bar.style.width = `${winrate}%`;

			//history
			let history = `<div class="h-[73vh] overflow-y-scroll pr-2 space-y-3">`;

			if(msg_obj.history.length == 0)
			{
				history += `
					<div class="flex flex-col w-full h-full justify-center items-center text-gray-400">
						<span class="text-xl">${translate_text("No match history yet")}</span>
					</div>`;
			}
			else
			{
				for(let i = msg_obj.history.length - 1; i >= 0; i--)
				{
					const entry = msg_obj.history[i];
					let user_result = '';
					let result_color = '';
					const username = localStorage.getItem("current_username");
					const isTournament = entry.match_type === "Tournament";

					// tournament - show placement
					// others - win/loss
					if(entry.user1_name == username)
					{
						if(isTournament) {
							const placement = entry.user1_result;
							if(placement != -1 && placement != -2)
							{
								user_result = `${placement}${getOrdinalSuffix(placement)} place`;
								result_color = getPlacementColor(placement);
							}
							else
							{
								user_result = placement === -1 ? "invalid" : "disconnected";
								result_color = getPlacementColor(placement);
							}
						} else {
							user_result = entry.user1_result == 1 ? "Win" : "Loss";
							result_color = entry.user1_result == 1 ? "text-green-500" : "text-red-500";
						}
					}

					if(entry.user2_name == username)
					{
						if(isTournament) {
							const placement = entry.user2_result;
							if(placement != -1 && placement != -2)
							{
								user_result = `${placement}${getOrdinalSuffix(placement)} place`;
								result_color = getPlacementColor(placement);
							}
							else
							{
								user_result = placement === -1 ? "invalid" : "disconnected";
								result_color = getPlacementColor(placement);
							}
						} else {
							user_result = entry.user2_result == 1 ? "Win" : "Loss";
							result_color = entry.user2_result == 1 ? "text-green-500" : "text-red-500";
						}
					}

					if(entry.user3_name && entry.user3_name == username)
					{
						if(isTournament) {
							const placement = entry.user3_result;
							if(placement != -1 && placement != -2)
							{
								user_result = `${placement}${getOrdinalSuffix(placement)} place`;
								result_color = getPlacementColor(placement);
							}
							else
							{
								user_result = placement === -1 ? "invalid" : "disconnected";
								result_color = getPlacementColor(placement);
							}
						} else {
							user_result = entry.user3_result == 1 ? "Win" : "Loss";
							result_color = entry.user3_result == 1 ? "text-green-500" : "text-red-500";
						}
					}
					
					if(entry.user4_name && entry.user4_name == username)
					{
						if(isTournament) {
							const placement = entry.user4_result;
							if(placement != -1 && placement != -2)
							{
								user_result = `${placement}${getOrdinalSuffix(placement)} place`;
								result_color = getPlacementColor(placement);
							}
							else
							{
								user_result = placement === -1 ? "invalid" : "disconnected";
								result_color = getPlacementColor(placement);
							}
						} else {
							user_result = entry.user4_result == 1 ? "Win" : "Loss";
							result_color = entry.user4_result == 1 ? "text-green-500" : "text-red-500";
						}
					}
					
					history += `
						<!-- Entry -->
						<div class="bg-white/20 rounded-lg px-4 py-2 grid grid-cols-[2fr_2fr_3fr_1fr] gap-4 items-center">
							<span>${entry.date}</span>
							<span>${entry.match_type}</span>
							<div class="flex space-x-1 relative">
								<div class="relative group">
									<img class="w-10 h-10 rounded-full object-cover" src="${entry.user1_avatar ? entry.user1_avatar : "/defaultpfp.png"}" alt="player">
									<span class="tooltip-2">${entry.user1_name}</span>
								</div>
								<div class="relative group">
									<img class="w-10 h-10 rounded-full object-cover" src="${entry.user2_avatar ? entry.user2_avatar : "/defaultpfp.png"}" alt="player">
									<span class="tooltip-2">${entry.user2_name}</span>
								</div>
								${entry.user3_name ? `
								<div class="relative group">
									<img class="w-10 h-10 rounded-full object-cover" src="${entry.user3_avatar ? entry.user3_avatar : "/defaultpfp.png"}" alt="player">
									<span class="tooltip-2">${entry.user3_name}</span>
								</div>` : ""}
								${entry.user3_name ? `
								<div class="relative group">
									<img class="w-10 h-10 rounded-full object-cover" src="${entry.user4_avatar ? entry.user4_avatar : "/defaultpfp.png"}" alt="player">
									<span class="tooltip-2">${entry.user4_name}</span>
								</div>` : ""}
							</div>
							<span class="${result_color} font-semibold">${user_result}</span>
						</div>`;
				}
			}

			history += "</div>";
			const history_div = document.querySelector<HTMLDivElement>("#playerstats_history");
			if(!history_div) throw new Error("history div not found");
			history_div.innerHTML = history;
		}
	});
}

export const playerstats_popup = `
	<div id="playerstats_popup" class="flex flex-col w-full h-full justify-center items-center hidden bg-transparent">
		<div id="playerstats_screen" class="relative w-full h-full flex flex-col text-white">

			<!-- content inserted here -->
			<main class="py-8 px-12 flex w-full gap-8">
				<!-- Stats -->
				<div class="w-5/12">
					<h2 class="text-xl font-bold mb-6 flex items-center">
						<i class="fa-solid fa-chart-pie mr-3"></i>
						<div id="playerstats_satistics">Statistics</div>
					</h2>

					<div class="grid grid-cols-2 grid-rows-3 gap-4">

						<!-- Rating -->
						<div class="bg-white/20 rounded-lg px-4 py-2">
							<div class="flex items-center mb-2">
								<i class="fas fa-star text-yellow-400 text-2xl mr-3"></i>
								<span id="playerstats_rating_header" class="font-semibold">Rating</span>
							</div>
							<div id="playerstats_rating" class="text-5xl font-bold text-end">
							</div>
						</div>

						<!-- Winning Streak -->
						<div class="bg-white/20 rounded-lg px-4 py-2">
							<div class="flex items-center mb-2">
								<i class="fas fa-fire text-yellow-400 text-2xl mr-3"></i>
								<span id="playerstats_winstreak_header" class="font-semibold">Winning Streak</span>
							</div>
							<div id="playerstats_winstreak" class="text-5xl font-bold text-end">
							</div>
						</div>

						<!-- Total Matches -->
						<div class="bg-white/20 rounded-lg px-4 py-2">
							<div class="flex items-center mb-2">
								<i class="fas fa-gamepad text-yellow-400 text-2xl mr-3"></i>
								<span id="playerstats_total_matches_header" class="font-semibold">Total Matches</span>
							</div>
							<div id="playerstats_total_matches" class="text-5xl font-bold text-end">
							</div>
						</div>

						<!-- Total Wins -->
						<div class="bg-white/20 rounded-lg px-4 py-2">
							<div class="flex items-center mb-2">
								<i class="fas fa-face-laugh-squint text-yellow-400 text-2xl mr-3"></i>
								<span id="playerstats_total_wins_header" class="font-semibold">Total Wins</span>
							</div>
							<div id="playerstats_total_wins" class="text-5xl font-bold text-end">
							</div>
						</div>

						<!-- Total Loses -->
						<div class="bg-white/20 rounded-lg px-4 py-2">
							<div class="flex items-center mb-2">
								<i class="fa-solid fa-face-sad-cry text-yellow-400 text-2xl mr-3"></i>
								<span id="playerstats_total_loss_header" class="font-semibold">Total Loses</span>
							</div>
							<div id="playerstats_total_loss" class="text-5xl font-bold text-end">
							</div>
						</div>
						
						<!-- Win Rate -->
						<div class="bg-white/20 rounded-lg px-4 py-2 col-span-2">
							<div class="flex items-center mb-4">
								<i class="fas fa-balance-scale text-yellow-400 text-2xl mr-3"></i>
								<span id="playerstats_total_winrate_header" class="font-semibold">Win Rate</span>
							</div>
							<div class="mb-4 w-full bg-red-500 rounded-full h-4">
								<div id="playerstats_winrate_bar" class="bg-green-500 h-4 rounded-l-full"></div>
							</div>
							<div id="playerstats_winrate" class="text-2xl font-semibold text-end"></div>
						</div>

					</div>
				</div>
				
				<!-- History Section -->
				<div class="w-7/12">
					<h2 class="text-xl font-bold mb-6 flex items-center">
						<i class="fa fa-history mr-3"></i>
						<div id="playerstats_match_history">Match History</div>
					</h2>

					<!-- Table Header -->
					<div class="grid grid-cols-[2fr_2fr_3fr_1fr] gap-4 pr-9 px-4 mb-1 font-semibold">
						<span id="playerstats_date">Date</span>
						<span id="playerstats_match_type">Match Type</span>
						<span id="playerstats_players">Players</span>
						<span id="playerstats_result">Result</span>
					</div>
					
					<!-- Table Entry -->
					<div id="playerstats_history"></div>
				</div>
			</main>

			<footer class="group fixed bottom-12 left-12 duration-200 transition-opacity">
				<button id="close_playerstats"
					class="flex items-center font-semibold text-xl mb-1">
					<i class="fas fa-chevron-left text-yellow-400 text-2xl"></i>
					<i class="fas fa-chevron-left text-yellow-400 text-2xl"></i>
					<span id="playerstats_game_selection_footer" class="pl-4">Game Selection</span>
				</button>
				<div class="h-1 opacity-0 group-hover:opacity-100 bg-yellow-400 w-full"></div>
			</footer>
		</div>
	</div>
`