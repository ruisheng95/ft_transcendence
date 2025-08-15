//pf config

import { WS } from "./class/WS.ts";
import { add_history } from "./spa-navigation.ts";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

export function pf_config_setup()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`);
	const pf_config_button = document.querySelector<HTMLButtonElement>("#pf_config_button");
	const pf_config_popup = document.querySelector<HTMLButtonElement>("#pf_config_popup");
	const close_pf_config = document.querySelector<HTMLButtonElement>("#close_pf_config");
	const input_pfp = document.querySelector<HTMLInputElement>("#input_pfp");
	const pfp_img_preview = document.querySelector<HTMLImageElement>("#pfp_img");
	const pfp_button = document.querySelector<HTMLImageElement>("#pfp_preview");
	const save_pf_config = document.querySelector<HTMLButtonElement>("#save_pf_config");
	const name_input = document.querySelector<HTMLInputElement>("#name_input");
	const error_display = document.querySelector<HTMLDivElement>("#error_display");

	const header_pfp = document.querySelector<HTMLImageElement>("#header_img");
	const header_name = document.querySelector<HTMLDivElement>("#header_name");

	const settings_popup = document.querySelector<HTMLButtonElement>("#settings_popup");

	if(!settings_popup || !error_display || !header_pfp || !header_name || !name_input || !save_pf_config || !pf_config_button || !pf_config_popup || !close_pf_config || !pfp_button || !input_pfp || !pfp_img_preview)
		throw new Error("Error pf_config stuff not found");

	pf_config_button.addEventListener("click", () => {
		error_display.innerText = "";
		name_input.value = "";
		pf_config_popup.classList.remove("hidden");
		settings_popup.classList.add("hidden");
		add_history("profile_config");
	});
	close_pf_config.addEventListener("click", () => {
		pf_config_popup.classList.add("hidden");
		add_history("");
	});

	pfp_button.addEventListener("click", () => { input_pfp.click();});

	name_input.addEventListener("input", () => {
		//check for invalid chars
		const input_str = name_input.value;
		const valid_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";

		if(input_str.length === 0)
			return;
		
		if(!valid_chars.includes(input_str[input_str.length - 1]))
		{
			error_display.classList.remove("hidden");
			error_display.innerText = "Alphabets, numbers or '_' only";
			name_input.value = input_str.substring(0, input_str.length - 1);
		}
		else if(input_str.length > 30)
		{
			error_display.classList.remove("hidden");
			error_display.innerText = "Search too long";
			name_input.value = input_str.substring(0, input_str.length - 1);
		}
		else
			error_display.innerText = "";
	});

	//REMEMBER TO UNCOMMENT THIS FOR NEW PLAYER CONFIG TO POPUP (commented this cuz very mafan during testing)
	if(localStorage.getItem("new_player_flag") === "true")
	{
		pf_config_button.click();
		close_pf_config.classList.add("hidden");
		localStorage.setItem("new_player_flag", "false");
	}

	socket.addEventListener('message', (event) => {

		//console.log(event.data);
		const response = JSON.parse(event.data);
		if (response.type === 'modify_profile_status')
		{
			if (response.status === "success")
			{
				pf_config_popup.classList.add("hidden");
				close_pf_config.classList.remove("hidden"); // cuz i hid the button if new player, so after they succesfully login can add back dy
				if (response.name)
				{
					header_name.innerHTML = `<h1 class="text-white text-[18px] pl-[1vw]">${response.name}</h1>`;
					localStorage.setItem("current_username", response.name);
				}
				if (response.pfp)
					header_pfp.src = response.pfp;
			}
			else
				error_display.innerHTML = `<p class="text-red-500"> Error: ${response.error_msg}</p>`;
		}
	});

	input_pfp.addEventListener("change", () => {
		
		if(!input_pfp.files) throw new Error("files not found");
		const file = input_pfp.files[0];

		const imageUrl = URL.createObjectURL(file);
		pfp_img_preview.src = imageUrl;
		pfp_img_preview.classList.remove("hidden");
		//pfp_empty.classList.add("hidden");
		});

	save_pf_config.addEventListener("click", async () => {

		interface send_obj_type
		{
			type: string;
			name: string | null;
			pfp: string | null;
		}

		const send_obj : send_obj_type =
		{
			type : "modify_profile",
			name: null,
			pfp: null
		};
		
		if (input_pfp.files && input_pfp.files.length > 0)
		{
        	const file = input_pfp.files[0]; //get file
			
			if (!file.type.startsWith('image/')) //checks the MIME type for image files only
			{
				error_display.innerText = "Error: Please choose an image file only!";
				return;
			}
			
			const buffer = await file.arrayBuffer(); // get the binary data of the file (useless one cannot read or modify)
            const bytes = new Uint8Array(buffer); // convert this to Unicode (smth like ascii but more numbers) [255, 216, 255, 224, 0, 16, ...]
            
            let binaryString = '';
            for (const byte of bytes)
    			binaryString += String.fromCharCode(byte); //convert this unicode to actual characters "ÿØÿà..." (mostly weird characters)

            const base64 = btoa(binaryString); // convert to base64 string
            const dataURL = `data:${file.type};base64,${base64}`; //conver to dataurl to store, later can display immediately
			send_obj.pfp = dataURL;
		}

		if(name_input.value)
		{
			if(name_input.value == localStorage.getItem("current_username")) //temporary fix to ensure that if the name input is the same as the current name then still can save
				send_obj.name = null;
			else
				send_obj.name = name_input.value;
		}

		socket.send(JSON.stringify(send_obj)); //send to backend to verify the pf config shit
		add_history("");
	});
}


export const pf_config_popup = html`
	
	<div id="pf_config_popup" class="flex justify-center items-center h-screen hidden fixed bg-black inset-0 inter-font text-white">
		
		<section id="pf_config_screen" class="relative h-3/4 w-1/2 border-2 rounded-xl flex flex-col items-center justify-center space-y-16">
			<h2 class="text-2xl font-bold">Registration Form</h2>

			<!-- Avatar -->
			<div id="pfp_part" class="relative">

				<!-- Diplay Image -->
				<input type="file" id="input_pfp" accept="image/*" class="hidden">
				<img id="pfp_img" class="w-32 h-32 border-2 rounded-full object-cover" src="/src/defaultpfp.png" alt="avatar">
				
				<!-- Button to change Avatar -->
				<button id="pfp_preview" type="button" 
					class="absolute bottom-0 right-0 w-9 h-9 bg-yellow-400 rounded-full border-4 border-gray-950">
					<i class="fas fa-pen text-sm text-black"></i>
				</button>
			</div>
			
			<!-- Name -->
			<input id="name_input" class="bg-gray-100 w-1/2 text-black px-6 py-3 rounded-full text-center font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
				placeholder="Input username" type="text" maxlength="30">

			<!-- Error -->
			<div id="error_display" class="h-8 err-msg"></div>
			
			<!-- Button -->
			<button type="button" id="close_pf_config" class="absolute top-6 right-6 button-remove">
				<i class="fas fa-times text-black text-xl"></i>
			</button>
			<button type="button" id="save_pf_config" class="button-primary">Register</button>
		

		</section>
	</div>
`

// in the pfp config above need to hide the <input> and do a custom button instead then link the custom button to the input using js cuz the input button very hard to style
// im not rly gud at ts so i trying use the arrow ft so my code doesnt look so cpp lmao