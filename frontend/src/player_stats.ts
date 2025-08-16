import { add_history } from "./spa-navigation";
import { WS } from "./class/WS";

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
		playerstats_popup.classList.remove("hidden");
		pong_modes_popup.classList.add("hidden");
		insert_playerstats_and_history_main();
		add_history("playerstats");
	});

	close_playerstats.addEventListener("click", () => {
		playerstats_popup.classList.add("hidden");
		pong_modes_popup.classList.remove("hidden");
	});
}

function insert_playerstats_and_history_main()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`);

	if(socket.readyState === WebSocket.OPEN)
		socket.send(JSON.stringify( {type: "get_playerstats" }));

	socket.addEventListener("message", (event) => {
		const msg_obj = JSON.parse(event.data);

		if(msg_obj.type === "playerstats_info")
		{
			console.log(msg_obj);
			const rating = msg_obj.rating;
			const winstreak = msg_obj.winning_streak;
			const total_wins = msg_obj.total_win;
			const total_loss = msg_obj.total_lose;
			const total_matches = total_wins + total_loss;
			const winrate = total_matches != 0 ? Math.round((total_wins / total_matches) * 100) : 0;
			
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
			let history = `
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
				<div class="h-[73vh] overflow-y-scroll pr-2 space-y-3">`;

			if(msg_obj.history.length == 0)
			{
				history += `
					<div class="flex flex-col w-full h-full justify-center items-center text-gray-400">
						<span class="text-xl">No match history yet</span>
					</div>`;
			}
			else
			{
				for(let i = msg_obj.history.length - 1; i >= 0; i--)
				{
					const entry = msg_obj.history[i];
					let user_result = '';
					const username = localStorage.getItem("current_username");
					
					if(entry.user1_name == username)
					{
						if(entry.user1_result == 1)
							user_result = "Win";
						else 
							user_result = "Loss";
					}

					if(entry.user2_name == username)
					{
						if(entry.user2_result == 1)
							user_result = "Win";
						else 
							user_result = "Loss";
					}

					if(entry.user3_name && entry.user3_name == username)
					{
						if(entry.user3_result == 1)
							user_result = "Win";
						else 
							user_result = "Loss";
					}
					
					if(entry.user4_name && entry.user4_name == username)
					{
						if(entry.user4_result == 1)
							user_result = "Win";
						else 
							user_result = "Loss";
					}
					
					history += `
						<!-- Entry -->
						<div class="bg-white/20 rounded-lg px-4 py-2 grid grid-cols-[2fr_2fr_3fr_1fr] gap-4 items-center">
							<span>${entry.date}</span>
							<span>${entry.match_type}</span>
							<div class="flex space-x-1 relative">
								<div class="relative group">
									<img class="w-10 h-10 rounded-full object-cover" src="${entry.user1_avatar ? entry.user1_avatar : "/src/defaultpfp.png"}" alt="player">
									<span class="absolute opacity-0 -bottom-9 left-1/2 -translate-x-1/2 text-sm py-1 px-3 bg-white/20 group-hover:opacity-100 transition-opacity rounded-lg  ">${entry.user1_name}</span>
								</div>
								<div class="relative group">
									<img class="w-10 h-10 rounded-full object-cover" src="${entry.user2_avatar ? entry.user2_avatar : "/src/defaultpfp.png"}" alt="player">
									<span class="absolute opacity-0 -bottom-9 left-1/2 -translate-x-1/2 text-sm py-1 px-3 bg-white/20 group-hover:opacity-100 transition-opacity rounded-lg  ">${entry.user2_name}</span>
								</div>
								${entry.user3_name ? `
								<div class="relative group">
									<img class="w-10 h-10 rounded-full object-cover" src="${entry.user3_avatar ? entry.user3_avatar : "/src/defaultpfp.png"}" alt="player">
									<span class="absolute opacity-0 -bottom-9 left-1/2 -translate-x-1/2 text-sm py-1 px-3 bg-white/20 group-hover:opacity-100 transition-opacity rounded-lg  ">${entry.user3_name}</span>
								</div>` : ""}
								${entry.user3_name ? `
								<div class="relative group">
									<img class="w-10 h-10 rounded-full object-cover" src="${entry.user4_avatar ? entry.user4_avatar : "/src/defaultpfp.png"}" alt="player">
									<span class="absolute opacity-0 -bottom-9 left-1/2 -translate-x-1/2 text-sm py-1 px-3 bg-white/20 group-hover:opacity-100 transition-opacity rounded-lg  ">${entry.user4_name}</span>
								</div>` : ""}
							</div>
							<span class="${user_result == "Win" ? "text-green-500" : "text-red-500"} font-semibold">${user_result}</span>
						</div>`;
				}
			}

			history += `
				</div>`;

			const history_div = document.querySelector<HTMLDivElement>("#playerstats_history");
			if(!history_div) throw new Error("history div not found");
			history_div.innerHTML = history;
		}
	});
}

export const playerstats_popup = `
	<div id="playerstats_popup" class="flex flex-col w-full h-full justify-center items-center hidden bg-gray-950">
		<div id="playerstats_screen" class="relative bg-gray-950 w-full h-full flex flex-col text-white">

			<!-- content inserted here -->
			<main class="py-8 px-12 flex w-full gap-8">
				<!-- Stats -->
				<div class="w-5/12">
					<h2 class="text-xl font-bold mb-6 flex items-center">
						<i class="fa-solid fa-chart-pie mr-3"></i>
						Statistics
					</h2>

					<div class="grid grid-cols-2 grid-rows-3 gap-4">

						<!-- Rating -->
						<div class="bg-white/20 rounded-lg px-4 py-2">
							<div class="flex items-center mb-2">
								<i class="fas fa-star text-yellow-400 text-2xl mr-3"></i>
								<span class="font-semibold">Rating</span>
							</div>
							<div id="playerstats_rating" class="text-5xl font-bold text-end">
							</div>
						</div>

						<!-- Winning Streak -->
						<div class="bg-white/20 rounded-lg px-4 py-2">
							<div class="flex items-center mb-2">
								<i class="fas fa-fire text-yellow-400 text-2xl mr-3"></i>
								<span class="font-semibold">Winning Streak</span>
							</div>
							<div id="playerstats_winstreak" class="text-5xl font-bold text-end">
							</div>
						</div>

						<!-- Total Matches -->
						<div class="bg-white/20 rounded-lg px-4 py-2">
							<div class="flex items-center mb-2">
								<i class="fas fa-gamepad text-yellow-400 text-2xl mr-3"></i>
								<span class="font-semibold">Total Matches</span>
							</div>
							<div id="playerstats_total_matches" class="text-5xl font-bold text-end">
							</div>
						</div>

						<!-- Total Wins -->
						<div class="bg-white/20 rounded-lg px-4 py-2">
							<div class="flex items-center mb-2">
								<i class="fas fa-face-laugh-squint text-yellow-400 text-2xl mr-3"></i>
								<span class="font-semibold">Total Wins</span>
							</div>
							<div id="playerstats_total_wins" class="text-5xl font-bold text-end">
							</div>
						</div>

						<!-- Total Loses -->
						<div class="bg-white/20 rounded-lg px-4 py-2">
							<div class="flex items-center mb-2">
								<i class="fa-solid fa-face-sad-cry text-yellow-400 text-2xl mr-3"></i>
								<span class="font-semibold">Total Loses</span>
							</div>
							<div id="playerstats_total_loss" class="text-5xl font-bold text-end">
							</div>
						</div>
						
						<!-- Win Rate -->
						<div class="bg-white/20 rounded-lg px-4 py-2 col-span-2">
							<div class="flex items-center mb-4">
								<i class="fas fa-balance-scale text-yellow-400 text-2xl mr-3"></i>
								<span class="font-semibold">Win Rate</span>
							</div>
							<div class="mb-4 w-full bg-red-500 rounded-full h-4">
								<div id="playerstats_winrate_bar" class="bg-green-500 h-4 rounded-l-full"></div>
							</div>
							<div id="playerstats_winrate" class="text-2xl font-semibold text-end"></div>
						</div>

					</div>
				</div>
				
				<!-- History Section -->
				<div id="playerstats_history" class="w-7/12"></div>
			</main>

			<footer class="group fixed bottom-12 left-12 duration-200 transition-opacity">
				<button id="close_playerstats"
					class="flex items-center font-semibold text-xl mb-1">
					<i class="fas fa-chevron-left text-yellow-400 text-2xl"></i>
					<i class="fas fa-chevron-left text-yellow-400 text-2xl"></i>
					<span class="pl-4">Game Selection</span>
				</button>
				<div class="h-1 opacity-0 group-hover:opacity-100 bg-yellow-400 w-full"></div>
			</footer>
		</div>
	</div>
`