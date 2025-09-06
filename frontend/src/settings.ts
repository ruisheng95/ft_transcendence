import { pf_config_popup, pf_config_setup } from "./config_profile";
import { hide_all_main_pages } from "./pong_modes.ts";
import { WS } from "./class/WS.ts";
import { add_history } from "./spa-navigation.ts";
import { handle_language_change, translate_text } from "./language.ts";
import { clean_invalid_string } from "./friends.ts";

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);

//settings

export function settings_setup ()
{
	const settings_button = document.querySelector<HTMLButtonElement>("#settings_button");
    const settings_popup  = document.querySelector<HTMLButtonElement>("#settings_popup");

	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`);

	const input_pfp = document.querySelector<HTMLInputElement>("#avatar_input");
	const pfp_img_preview = document.querySelector<HTMLImageElement>("#avatar_img");
	const pfp_button = document.querySelector<HTMLImageElement>("#avatar_button");
	const name_input = document.querySelector<HTMLInputElement>("#username_input");
	const name_lock = document.querySelector<HTMLInputElement>("#username_lock");

	const save_pf_config = document.querySelector<HTMLButtonElement>("#edit_profile");
	const error_display = document.querySelector<HTMLDivElement>("#show_error");
	const header_pfp = document.querySelector<HTMLImageElement>("#header_img");
	const header_name = document.querySelector<HTMLDivElement>("#header_name");
	const language_radios = document.querySelectorAll<HTMLInputElement>('.radio-language');

	if(!language_radios || !settings_popup || !error_display || !header_pfp || !header_name || !name_input || !save_pf_config || !pf_config_popup || !pfp_button || !input_pfp || !pfp_img_preview || !settings_button || !name_lock)
		throw new Error("Error pf_config stuff not found");

	name_lock.addEventListener("click", () => {
		name_input.disabled = !name_input.disabled;
		
		name_input.classList.toggle("bg-gray-300", name_input.disabled);
		name_input.classList.toggle("bg-white", !name_input.disabled);
		name_lock.classList.toggle("fa-lock", name_input.disabled);
		name_lock.classList.toggle("fa-unlock", !name_input.disabled);
	});

	settings_button.addEventListener("click", () => {
		open_settings_page();
		add_history("settings");
	});

	name_input.addEventListener("input", () => {
		//check for invalid chars
		const input_str = name_input.value;

		if(input_str.length === 0)
			return;
		
		if(!/^[a-zA-Z0-9_]+$/.test(input_str))
		{
			error_display.classList.remove("hidden");
			error_display.innerText = translate_text("Alphabets, numbers or '_' only");
			name_input.value = clean_invalid_string(input_str);
		}
		else if(input_str.length > 20)
		{
			error_display.classList.remove("hidden");
			error_display.innerText = translate_text("input name too long");
			name_input.value = input_str.substring(0, input_str.length - 1);
		}
		else
			error_display.innerText = "";
	});

	socket.addEventListener('message', (event) => {

		//console.log(event.data);
		const response = JSON.parse(event.data);
		if (response.type === 'modify_profile_status')
		{
			if (response.status === "success")
			{	
				name_input.disabled = false;
				name_lock.click();
				if (response.name)
				{
					header_name.innerHTML = `<h1 class="text-white text-[18px] pl-[1vw]">${response.name}</h1>`;
					localStorage.setItem("current_username", response.name);
				}
				if (response.pfp)
					header_pfp.src = response.pfp;
			}
			else
				error_display.innerText = translate_text(response.error_msg);
		}
	});

	pfp_button.addEventListener("click", () => { input_pfp.click();});

	input_pfp.addEventListener("change", () => {
		
		error_display.innerHTML = "";

		if(!input_pfp.files) throw new Error("files not found");
		const file = input_pfp.files[0];

		//max file size
		const max_file_size = 5 * 1024 * 1024;
		if(file.size > max_file_size)
		{
			error_display.classList.remove("hidden");
			error_display.innerText = translate_text("File too big ( > 5MB )");
			input_pfp.value = "";
			return;
		}

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
				error_display.innerText = "Error: Please choose an image file only";
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
		// add_history("");
	});
	
	language_radios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            if (target.checked)
                handle_language_change(target.value);
        });
    });

	pf_config_setup();
}

export function open_settings_page()
{
	const settings_button = document.querySelector<HTMLButtonElement>("#settings_button");
    const settings_popup  = document.querySelector<HTMLButtonElement>("#settings_popup");
	const error_display = document.querySelector<HTMLDivElement>("#show_error");
	const name_input = document.querySelector<HTMLInputElement>("#username_input");
	const pfp_img_preview = document.querySelector<HTMLImageElement>("#avatar_img");
	const name_lock = document.querySelector<HTMLInputElement>("#username_lock");
	const header_pfp = document.querySelector<HTMLImageElement>("#header_img");
	const header_name = document.querySelector<HTMLDivElement>("#header_name");

	if(!settings_button || !settings_popup || !error_display || !name_input || !pfp_img_preview
		|| !name_lock || !header_pfp || !header_name)
		throw new Error("open settings page elements not found");

	hide_all_main_pages();
	settings_popup.classList.remove("hidden");
	settings_button.classList.add("bg-yellow-400");
	settings_button.querySelector<HTMLDivElement>("i")?.classList.add("text-black");
	error_display.innerText = "";
	name_input.value = header_name.innerText;
	pfp_img_preview.src = header_pfp.src;
	name_input.disabled = false;
	name_lock.click();

	//set the correct language radio button
    const currentLanguage = localStorage.getItem("current_language") || "english";
    const languageRadios = document.querySelectorAll<HTMLInputElement>('.radio-language');
    
    languageRadios.forEach(radio => {
        radio.checked = (radio.value === currentLanguage);
    });
}

export const settings_popup = html`

	<div id="settings_popup" class="hidden h-[90vh] inter-font text-white bg-gray-950">
		
		<!-- this id=pf_config_button used by others, will break if remove -->
		<button id="pf_config_button" class="border hidden">Link to pf_config (original)</button>
		
		<!-- Setting Layout -->
		<div class="px-20 pt-20 grid grid-cols-2 gap-20 h-4/6">
			
			<!-- Edit Profile -->
			<section>
				<!-- Subtitle -->
				<div class="pl-4 space-x-3 mb-2">
					<i class="fas fa-user text-4xl"></i>
					<span id="settings_profile_text" class="text-2xl font-bold">Profile</span>
				</div>
				
				<!-- Config Setting -->
				<div class="border border-gray-600 h-full rounded-xl flex flex-col items-center justify-center space-y-12">

					<!-- Avatar -->
					<div class="relative">
						
						<!-- Display Img -->
						<input type="file" id="avatar_input" accept="image/*" class="hidden">
						<img id="avatar_img" class="w-32 h-32 border-2 rounded-full object-cover" src="" alt="avatar">
						
						<!-- Button to change Avatar -->
						<button  id="avatar_button" class="absolute bottom-0 right-0 w-9 h-9 bg-yellow-400 rounded-full border-4 border-gray-950">
							<i class="fas fa-pen text-sm text-black"></i>
						</button>
					</div>

					<!-- Username Input -->
					<div class="relative w-4/6 text-center text-black">
						<input
							class="bg-gray-300 w-full px-6 py-3 rounded-full text-center font-semibold outline-none focus:ring-2 focus:ring-yellow-400"
							value="John Lennon" 
							type="text"
							maxlength="21"
							id="username_input"
							disabled
							>
						<i id="username_lock" class="fas fa-lock p-4 rounded-full absolute top-1/2 right-0 transform -translate-y-1/2 cursor-pointer hover:bg-gray-400/20"></i>
					</div>	
				
					<!-- Error Message -->
					<p id="show_error" class="h-8 err-msg"></p>
					<!-- Edit Button -->
					<button id="edit_profile" class="button-primary">Edit</button>

				</div>
			</section>

			<!-- Edit Language -->
			<section>
				<!-- Subtitle -->
				<div class="pl-4 space-x-3 mb-2">
					<i class="fas fa-language text-4xl"></i>
					<span id="settings_language_text" class="text-2xl font-bold">Language</span>
				</div>
				
				<!-- Config Setting -->
				<div class="border border-gray-600 h-full rounded-xl p-12 space space-y-12">

					<!-- English -->
					<label class="group flex items-center space-x-3 cursor-pointer">
						<input class="radio-language"
							type="radio"
							name="language" 
							value="english"  >
						<span class="text-2xl">English</span>
					</label>

				
					<!-- Malay -->
					<label class="group flex items-center space-x-3 cursor-pointer">
						<input class="radio-language"
							type="radio"
							name="language" 
							value="malay" >
						<span class="text-2xl">Malay</span>
					</label>

					<!-- Mandrin -->
					<label class="group flex items-center space-x-3 cursor-pointer">
						<input class="radio-language"
							type="radio"
							name="language" 
							value="chinese" >
						<span class="text-2xl">华语</span>
					</label>

				</div>
			</section>
		</div>
		
	</div>

	${pf_config_popup}
`
