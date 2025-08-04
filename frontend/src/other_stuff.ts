import { add_history} from "./spa-navigation";
import { WS } from "./class/WS";

//help
export function help_setup()
{
	const help_button = document.querySelector<HTMLButtonElement>("#help_button");
	const help_popup = document.querySelector<HTMLButtonElement>("#help_popup");
	const close_help = document.querySelector<HTMLButtonElement>("#close_help");

	if(!help_button || !help_popup || !close_help)
		throw new Error("Error help buttons not found");

	help_button.addEventListener("click", () => {
		help_popup.classList.remove("hidden")
		add_history("help");
	});
	close_help.addEventListener("click", () => {
		help_popup.classList.add("hidden")
		add_history("");
	});
}


export const help_popup = `
	<div id="help_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="help_screen" class="relative bg-black h-[70vh] w-[35vw] flex flex-col items-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold my-[5vh]">help:</h1>
			<button id="close_help" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">close</button>
		</div>
	</div>
`

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
			const rating = msg_obj.rating;
			const winstreak = msg_obj.winning_streak;
			const total_wins = msg_obj.total_win;
			const total_loss = msg_obj.total_lose;
			const winrate = total_wins + total_loss != 0 ? (total_wins / (total_wins + total_loss)) * 100 : 0;

			playerstats_div.innerHTML = `
			<div class="flex flex-col items-center justify-center text-white gap-3">
				<div>rating: ${rating}</div>
				<div>winstreak: ${winstreak}</div>
				<div>total wins: ${total_wins}</div>
				<div>total loss: ${total_loss}</div>
				<div>winrate: ${winrate}%</div>
			</div>`
		}
	});
}


export const playerstats_popup = `
	<div id="playerstats_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="playerstats_screen" class="relative bg-black h-[70vh] w-[35vw] flex flex-col items-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold my-[5vh]">playerstats:</h1>
			<div id="playerstats_infos"></div>
			<button id="close_playerstats" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">close</button>
		</div>
	</div>
`

//settings

export function settings_setup ()
{
	const settings_button = document.querySelector<HTMLButtonElement>("#settings_button");
    const settings_popup = document.querySelector<HTMLButtonElement>("#settings_popup");
    const close_settings = document.querySelector<HTMLButtonElement>("#close_settings");

	if(!settings_button || !settings_popup || !close_settings)
		throw new Error("Error settings buttons not found");

	settings_button.addEventListener("click", () => {
		settings_popup.classList.remove("hidden");
		add_history("settings");
	});
	close_settings.addEventListener("click", () => {
		settings_popup.classList.add("hidden");
		add_history("");
	});
}


export const settings_popup = `
	<div id="settings_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="settings_screen" class="relative bg-black h-[70vh] w-[35vw] flex flex-col items-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold my-[5vh]">settings:</h1>
			<div id="option_blocks" class="flex flex-col gap-[3vh] w-[20vw]">
				<div id="block" class="flex">
					<h1 class="text-white text-[20px]">Modify profile:</h1>
					<button id="setting1" class="text-white border border-white ml-auto">setting1</button>
				</div>
				<div id="block" class="flex">
					<h1 class="text-white text-[20px]">settings 2:</h1>
					<button id="setting1" class="text-white border border-white ml-auto">setting2</button>
				</div>
			</div>
			<button id="close_settings" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">close</button>
		</div>
	</div>
`
