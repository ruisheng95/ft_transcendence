//help
export function help_setup()
{
	const help_button = document.querySelector<HTMLButtonElement>("#help_button");
	const help_popup = document.querySelector<HTMLButtonElement>("#help_popup");
	const close_help = document.querySelector<HTMLButtonElement>("#close_help");

	if(!help_button || !help_popup || !close_help)
		throw new Error("Error help buttons not found");

	help_button.addEventListener("click", () => {help_popup.classList.remove("hidden")});
	close_help.addEventListener("click", () => {help_popup.classList.add("hidden")});
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

	playerstats_button.addEventListener("click", () => {playerstats_popup.classList.remove("hidden")});
	close_playerstats.addEventListener("click", () => {playerstats_popup.classList.add("hidden")});
}


export const playerstats_popup = `
	<div id="playerstats_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="playerstats_screen" class="relative bg-black h-[70vh] w-[35vw] flex flex-col items-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold my-[5vh]">playerstats:</h1>
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

	settings_button.addEventListener("click", () => {settings_popup.classList.remove("hidden")});
	close_settings.addEventListener("click", () => {settings_popup.classList.add("hidden")});
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
