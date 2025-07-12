//pf config
// const socket = new WebSocket("ws://localhost:3000/ws_profile");

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

	const header_pfp = document.querySelector<HTMLImageElement>("#header_img");
	const header_name = document.querySelector<HTMLDivElement>("#header_name");


	if(!header_pfp || !header_name || !name_input || !save_pf_config || !pf_config_button || !pf_config_popup || !close_pf_config || !pfp_button || !input_pfp || !file_name_display || !pfp_img_preview || !pfp_empty)
		throw new Error("Error pf_config buttons not found");

	pf_config_button.addEventListener("click", () => {pf_config_popup.classList.remove("hidden");});
	close_pf_config.addEventListener("click", () => {pf_config_popup.classList.add("hidden");});

	pfp_button.addEventListener("click", () => { input_pfp.click();});
	
	input_pfp.addEventListener("change", (event: Event) => {
		
		const target = event.target as HTMLInputElement;

		if(!target || !target.files) throw new Error("target not found");
		const file = target.files[0];
		file_name_display.innerHTML = `<p>${file.name}</p>`;

		const imageUrl = URL.createObjectURL(file);
		pfp_img_preview.src = imageUrl;
		pfp_img_preview.classList.remove("hidden");
		pfp_empty.classList.add("hidden");
	});

	save_pf_config.addEventListener("click", () => {

		// interface send_obj_type
		// {
		// 	type: string;
		// 	name: string | null;
		// 	pfp: string | null;
		// }

		// let send_obj : send_obj_type =
		// {
		// 	type : "modify_profile",
		// 	name: null,
		// 	pfp: null
		// };

		////////////////////////////////
		//send the responses to backend
		////////////////////////////////

		///////////////////////////////
		//change the pfp and the name displayed in the index
		///////////////////////////////////

		//currently just store in frontend (still need to implement to backend)
		
		if(pfp_img_preview.src)
		{
			header_pfp.src = pfp_img_preview.src;
		}

		if(name_input.value)
			header_name.innerHTML = `<h1 class="text-white text-[18px] pl-[1vw]">${name_input.value}</h1>`
		pf_config_popup.classList.add("hidden");
	});
}


export const pf_config_popup = `
	<div id="pf_config_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="pf_config_screen" class="relative bg-black h-[70vh] w-[35vw] flex flex-col items-center border border-2 border-white">
			<h1 class="text-white text-[30px] font-semibold my-[5vh]">profile config:</h1>

			<form id="profile_form" class="flex flex-col items-center justify-center gap-4">

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

				<button type="button" id="close_pf_config" class="text-white border border-white absolute bottom-4 left-4 w-[5vw] h-[5vh]">close</button>
				<button type="button" id="save_pf_config" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">save</button>
			</form>
		</div>
	</div>
`
// in the pfp config above need to hide the <input> and do a custom button instead then link the custom button to the input using js cuz the input button very hard to style
// submit button must be type = 'button' not 'submit' cuz that will somehow add a '?' behind the url wts
// im not rly gud at ts so i trying use the arrow ft so my code doesnt look so cpp lmao