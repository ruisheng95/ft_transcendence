import { pf_config_popup, pf_config_setup } from "./config_profile";
import { add_history} from "./spa-navigation";

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

	pf_config_setup();
}


export const settings_popup = `
	<div id="settings_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="settings_screen" class="relative bg-black h-[70vh] w-[35vw] flex flex-col items-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold my-[5vh]">settings:</h1>
			<div id="option_blocks" class="flex flex-col gap-[3vh] w-[20vw]">
				<div id="block" class="flex">
					<h1 class="text-white text-[20px]">Modify profile:</h1>
					<button id="pf_config_button" class="text-white border border-white ml-auto">profile conf</button>
				</div>
				<div id="block" class="flex">
					<h1 class="text-white text-[20px]">settings 2:</h1>
					<button id="setting1" class="text-white border border-white ml-auto">setting2</button>
				</div>
			</div>
			<button id="close_settings" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">close</button>
		</div>
	</div>

	${pf_config_popup}
`
