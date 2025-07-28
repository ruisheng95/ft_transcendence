//pf config

const session = localStorage.getItem("session") || "";
const socket = new WebSocket(
  `ws://localhost:3000/ws_profile?session=${session}`
);

export function pf_config_setup()
{
	const pf_config_button = document.querySelector<HTMLButtonElement>("#pf_config_button");
	const pf_config_popup = document.querySelector<HTMLButtonElement>("#pf_config_popup");
	const close_pf_config = document.querySelector<HTMLButtonElement>("#close_pf_config");
	const input_pfp = document.querySelector<HTMLInputElement>("#input_pfp");
	const file_name_display = document.querySelector<HTMLSpanElement>("#file_name");
	const pfp_img_preview = document.querySelector<HTMLImageElement>("#pfp_img");
	const pfp_button = document.querySelector<HTMLImageElement>("#pfp_preview");
	const pfp_empty = document.querySelector<HTMLDivElement>("#pfp_empty");
	const save_pf_config = document.querySelector<HTMLButtonElement>("#save_pf_config");
	const name_input = document.querySelector<HTMLInputElement>("#name_input");
	const error_display = document.querySelector<HTMLDivElement>("#error_display");

	const header_pfp = document.querySelector<HTMLImageElement>("#header_img");
	const header_name = document.querySelector<HTMLDivElement>("#header_name");


	if(!error_display || !header_pfp || !header_name || !name_input || !save_pf_config || !pf_config_button || !pf_config_popup || !close_pf_config || !pfp_button || !input_pfp || !file_name_display || !pfp_img_preview || !pfp_empty)
		throw new Error("Error pf_config stuff not found");

	pf_config_button.addEventListener("click", () => {
		error_display.innerHTML = "";
		name_input.value = "";
		pf_config_popup.classList.remove("hidden");
	});
	close_pf_config.addEventListener("click", () => {pf_config_popup.classList.add("hidden");});

	pfp_button.addEventListener("click", () => { input_pfp.click();});

	//REMEMBER TO UNCOMMENT THIS FOR NEW PLAYER CONFIG TO POPUP (commented this cuz very mafan during testing)
	// if(localStorage.getItem("new_player_flag") === "true")
	// {
	// 	pf_config_button.click();
	// 	close_pf_config.classList.add("hidden");
	// 	localStorage.setItem("new_player_flag", "false");
	// }

	socket.addEventListener('message', (event) => {

		console.log(event.data);
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
		file_name_display.innerHTML = `<p>${file.name}</p>`;

		const imageUrl = URL.createObjectURL(file);
		pfp_img_preview.src = imageUrl;
		pfp_img_preview.classList.remove("hidden");
		pfp_empty.classList.add("hidden");
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
				error_display.innerHTML = `<p class="text-red-500">Error: Please choose an image file only!</p>`;
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
	});
}


export const pf_config_popup = `
	<div id="pf_config_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="pf_config_screen" class="relative bg-black h-[70vh] w-[35vw] flex flex-col items-center border border-2 border-white">
			<h1 class="text-white text-[30px] font-semibold my-[5vh]">profile config:</h1>

			<div id="profile_form" class="flex flex-col items-center justify-center gap-4">

				<div id="pfp_part" class="flex flex-col items-center gap-3">
					<label class="text-white text-[18px]">Profile Picture:</label>
					<input type="file" id="input_pfp" accept="image/*" class="hidden">
					<button type="button" id="pfp_preview" class="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
						<div id="pfp_empty" class="text-white">input file</div>
						<img id="pfp_img" class="hidden w-full h-full object-cover" src="" alt="Profile preview">
					</button>
					<div id="file_name" class="text-white text-[18px]"></div>
				</div>

				<div id="name_part" class="flex gap-2">
					<label class="text-white text-[18px]" class="flex">Name:</label>
					<input type="text" id="name_input" class="flex px-2 py-1 bg-black border border-white text-white">
				</div>
				<div id="error_display"></div>
				<button type="button" id="close_pf_config" class="text-white border border-white absolute bottom-4 left-4 w-[5vw] h-[5vh]">close</button>
				<button type="button" id="save_pf_config" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">save</button>
			</div>
		</div>
	</div>
`

// in the pfp config above need to hide the <input> and do a custom button instead then link the custom button to the input using js cuz the input button very hard to style
// im not rly gud at ts so i trying use the arrow ft so my code doesnt look so cpp lmao