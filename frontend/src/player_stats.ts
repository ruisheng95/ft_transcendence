import { add_history } from "./spa-navigation";
import { WS } from "./class/WS";

//player stats
export function playerstats_setup ()
{
	const playerstats_button = document.querySelector<HTMLButtonElement>("#playerstats_button");
	const playerstats_popup = document.querySelector<HTMLButtonElement>("#playerstats_popup");
	const close_playerstats = document.querySelector<HTMLButtonElement>("#close_playerstats");

	if(!playerstats_button || !playerstats_popup || !close_playerstats)
		throw new Error("Error playerstats buttons not found");

	playerstats_button.addEventListener("click", () => {
		playerstats_popup.classList.remove("hidden");
		insert_playerstats_and_history_main();
		add_history("playerstats");
	});

	close_playerstats.addEventListener("click", () => {
		playerstats_popup.classList.add("hidden");
		add_history("");
	});
}

function insert_playerstats_and_history_main()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`);
	const playerstats_div = document.querySelector<HTMLDivElement>("#playerstats_infos");

	if(!playerstats_div) throw new Error("Insert players stats elements not found");

	playerstats_div.innerHTML = "";
	if(socket.readyState === WebSocket.OPEN)
		socket.send(JSON.stringify( {type: "get_playerstats" }));

	socket.addEventListener("message", (event) => {
		const msg_obj = JSON.parse(event.data);

		if(msg_obj.type === "playerstats_info")
		{
			//insert stats
			console.log(msg_obj);
			const rating = msg_obj.rating;
			const winstreak = msg_obj.winning_streak;
			const total_wins = msg_obj.total_win;
			const total_loss = msg_obj.total_lose;
			const winrate = total_wins + total_loss != 0 ? Math.round((total_wins / (total_wins + total_loss)) * 100) : 0;

			const stats = `
			<div class="flex flex-col items-center text-white gap-3 border-r p-5 h-[56vh] w-[10vw]">
				<div class="text-[3vh] underline font-semibold">Stats:</div>
				<div>rating: ${rating}</div>
				<div>winstreak: ${winstreak}</div>
				<div>total wins: ${total_wins}</div>
				<div>total loss: ${total_loss}</div>
				<div>winrate: ${winrate}%</div>
			</div>`

			//insert history
			let history = ""
			history += `
				<div class="flex flex-col items-center justify-center text-white">
				<div class="text-[3vh] underline font-semibold mb-3">History:</div>
				<div class="overflow-y-auto border border-white h-[50vh] w-[20vw] p-3 gap-3 flex flex-col items-center hide-scrollbar">`

			if(msg_obj.history.length == 0)
				history += `<div class="flex flex-col w-[100%] h-[100%] justify-center items-center">Empty history</div>`
			else
			{
				for(const entry of msg_obj.history)
				{
					history += `
						<div class="border border-white p-3 rounded">
							<div class="mb-2">Date: ${entry.date} | Type: ${entry.match_type}</div>
							<div class="flex flex-col gap-3">
								<div class="flex">
									${entry.user1_name} - 
									<div class="${entry.user1_result == 1 ? 'text-green-400' : 'text-red-400'}">${entry.user1_result == 1 ? 'Winner' : 'Loser'}</div>
								</div>
								
								<div class="flex">
									${entry.user2_name} - 
									<div class="${entry.user2_result == 1 ? 'text-green-400' : 'text-red-400'}">${entry.user2_result == 1 ? 'Winner' : 'Loser'}</div>
								</div>

								${entry.user3_name ? 
								`<div class="flex">
									${entry.user3_name} - 
									<div class="${entry.user3_result == 1 ? 'text-green-400' : 'text-red-400'}">${entry.user3_result == 1 ? 'Winner' : 'Loser'}</div>
									</div>` : ''}
								
								${entry.user4_name ? 
								`<div class="flex">
									${entry.user4_name} - 
									<div class="${entry.user4_result == 1 ? 'text-green-400' : 'text-red-400'}">${entry.user4_result == 1 ? 'Winner' : 'Loser'}</div>
								</div>` : ''}

							</div>
						</div>
					`;
				}
				history += `</div></div>`
			}

			playerstats_div.innerHTML = `
			<div class="flex gap-[10vh]">
				${stats}
				${history}
			</div>
			`
		}
	});
}


export const playerstats_popup = `
	<div id="playerstats_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="playerstats_screen" class="relative bg-black h-[80vh] w-[50vw] flex flex-col items-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold my-[5vh]">playerstats:</h1>
			<div id="playerstats_infos"></div>
			<button id="close_playerstats" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">close</button>
		</div>
	</div>
`