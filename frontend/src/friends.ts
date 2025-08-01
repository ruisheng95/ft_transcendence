/* eslint-disable @typescript-eslint/no-explicit-any */

import { add_history } from "./spa-navigation";

//add fren

import { WS } from "./class/WS.ts";

export function add_friends_setup()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`)
	const add_friends_button = document.querySelector<HTMLButtonElement>("#add_friends_button");
	const add_friends_popup = document.querySelector<HTMLButtonElement>("#add_friends_popup");
	const close_add_friends = document.querySelector<HTMLButtonElement>("#close_add_friends");
	const addfriend_search_bar = document.querySelector<HTMLInputElement>("#addfriend_search_bar");
	const player_list_div = document.querySelector<HTMLDivElement>("#players_list");
	const error_div = document.querySelector<HTMLDivElement>("#add_error");

	if(!error_div || !player_list_div || !addfriend_search_bar || !add_friends_button || !add_friends_popup || !close_add_friends)
		throw new Error("Error add_friends buttons not found");

	//clear error div
	error_div.innerHTML = "";

	add_friends_button.addEventListener("click", () => {
		add_friends_popup.classList.remove("hidden");
		add_history("add_friend");
	});
	
	close_add_friends.addEventListener("click", () => {
		add_friends_popup.classList.add("hidden");
		add_history("");
	});
	
	socket.addEventListener("message", (message) => {
		const msg_obj = JSON.parse(message.data);
		//console.log(msg_obj);
		if(msg_obj.type === "matching_server_players")
			display_player_list(msg_obj);
	});

	addfriend_search_bar.addEventListener("input", () => {

		if(!error_div) throw new Error("error div not found");
		const input_str = addfriend_search_bar.value;
		const valid_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";

		if(input_str.length === 0)
			return;
		
		if(!valid_chars.includes(input_str[input_str.length - 1]))
		{
			player_list_div.innerHTML = "";
			player_list_div.classList.add("hidden");
			error_div.classList.remove("hidden");
			error_div.innerHTML = `<h1 class="text-[13px] text-red-500">Alphabets, numbers or '_' only</h1>`;
			addfriend_search_bar.value = input_str.substr(0, input_str.length - 1);
		}

		if (input_str.length >= 5)
			socket.send(JSON.stringify({type: "get_server_players", name: addfriend_search_bar.value}));
		else
			player_list_div.classList.add("hidden");
	});

	function display_player_list(msg_obj : any)
	{
		if(!error_div || !player_list_div) throw new Error("display player list stuff not found");
		if(msg_obj.error_msg)
		{
			player_list_div.innerHTML = "";
			player_list_div.classList.add("hidden");
			error_div.classList.remove("hidden");
			error_div.innerHTML = `<h1 class="text-[13px] text-red-500">${msg_obj.error_msg}</h1>`;
			if(addfriend_search_bar)
				addfriend_search_bar.value = "";
			return;
		}

		error_div.classList.add("hidden");
		player_list_div.classList.remove("hidden");
		const player_list = msg_obj.players;

		let name = "";
		if(addfriend_search_bar)
			name = addfriend_search_bar.value;

		let list_html = "";
		for(const player of player_list)
		{
			if(player.username.startsWith(name))
			{
				list_html += `<div class="flex items-center justify-between p-2 mt-1 border-b border-gray-700  gap-2 w-[100%]">`;
				list_html += `<img src="${player.pfp ? player.pfp : "/src/defaultpfp.png"}" class="flex w-8 h-8 rounded-full mr-3"></img>`;
				list_html += `<h3 class="text-white flex">${player.username}</h3>`;
				list_html += `<button id="add_button" class="border border-white text-white text-sm ml-auto px-4 py-1" data-username="${player.username}">Add</button>`;
				list_html += `</div>`;
			}
		}


		player_list_div.innerHTML = list_html;

		const add_buttons = document.querySelectorAll('#add_button');
		for(const button of add_buttons)
			button.addEventListener("click", handle_add_friend);
	}

	function handle_add_friend(event : Event)
	{
		const button = event.target as HTMLButtonElement; //this gives the button object cuz idk how to parse it into the ft rip
		const added_name = button.dataset.username; //get the stored username in the data field
		const send_obj = {
			type: "add_friend_name",
			name: added_name
		}

		socket.send(JSON.stringify(send_obj));

		button.classList.remove("border-white");
		button.classList.add("border-gray-500");
		button.innerText = "Added";
		button.classList.remove("text-white");
		button.classList.add("text-gray-500");
		button.removeEventListener("click", handle_add_friend);
	}
}


export const add_friends_popup = `
	<div id="add_friends_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="add_friends_screen" class="relative bg-black h-[70vh] w-[35vw] flex flex-col items-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold my-[4vh]">Add Friends:</h1>

			<div class="w-[80%]">
				<input id="addfriend_search_bar" type="text" placeholder="Search for friends..." class="w-full px-4 py-2 border border-white text-white">
				</input>
			</div>
			
			<div id="add_error"></div>
			<div id="player_list_container" class="border border-gray-300 w-[80%] h-[50%] mt-3">
				<div id="players_list" class="overflow-y-auto hide-scrollbar flex flex-col items-center flex-1 w-[100%] h-[100%] hidden"></div>
			</div>

			<button id="close_add_friends" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">close</button>
		</div>
	</div>
`


//remove_frens
export function remove_friends_setup()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`)
	const remove_friends_button = document.querySelector<HTMLButtonElement>("#remove_friends_button");
	const remove_friends_popup = document.querySelector<HTMLDivElement>("#remove_friends_popup");
	const close_remove_friends = document.querySelector<HTMLButtonElement>("#close_remove_friends");
	const friends_list_div = document.querySelector<HTMLDivElement>("#friends_list");
	const removefriend_search_bar = document.querySelector<HTMLInputElement>("#removefriend_search_bar");

	if(!removefriend_search_bar || !remove_friends_button || !remove_friends_popup || !close_remove_friends)
		throw new Error("Error remove_friends buttons not found");

	close_remove_friends.addEventListener("click", () => {
		remove_friends_popup.classList.add("hidden");
		add_history("");
	});

	remove_friends_button.addEventListener("click", () => { 
		remove_friends_popup.classList.remove("hidden")
		socket.send(JSON.stringify({type: "get_player_friends"})); //get friends list
		add_history("remove_friend");
	});


	let player_friends_obj : any;
	socket.addEventListener("message", (message) => {
		const msg_obj = JSON.parse(message.data);
		//console.log(msg_obj);
		if(msg_obj.type === "player_friends")
		{
			player_friends_obj = msg_obj;
			display_friends_list("");
		}
		else if(msg_obj.type === "rf_input_validation")
			handle_validation_result(msg_obj)
	});

	removefriend_search_bar.addEventListener("input", () => {
		verify_input(removefriend_search_bar.value);
	})

	function verify_input(input : string)
	{
		socket.send(JSON.stringify({type: "verify_rf_input", input: input}));
	}

	function display_friends_list(input : string)
	{
		let list_html = "";
		const frens_list = player_friends_obj.friends;

		for(const friend of frens_list)
		{
			if(friend.username.startsWith(input))
			{
				list_html += `<div class="flex items-center justify-between p-2 mt-1 border-b border-gray-700  gap-2 w-[100%]">`;
				list_html += `<img src="${friend.pfp ? friend.pfp : "/src/defaultpfp.png"}" class="flex w-8 h-8 rounded-full mr-3"></img>`;
				list_html += `<h3 class="text-white flex">${friend.username}</h3>`;
				list_html += `<button id="remove_button" class="border border-white text-white text-sm ml-auto px-4 py-1" data-username="${friend.username}">Remove</button>`;
				list_html += `</div>`;
			}
		}
		if(friends_list_div)
		{
			friends_list_div.classList.remove("hidden");
			friends_list_div.innerHTML = list_html;
		}

		const add_buttons = document.querySelectorAll('#remove_button');
		for(const button of add_buttons)
			button.addEventListener("click", handle_remove_friend);
	}

	function handle_remove_friend(event : Event)
	{
		const button = event.target as HTMLButtonElement; //this gives the button object cuz idk how to parse it into the ft rip
		const remove_name = button.dataset.username; //get the stored username in the data field
		const send_obj = {
			type: "remove_friend_name",
			name: remove_name
		}

		socket.send(JSON.stringify(send_obj));

		button.classList.remove("border-white");
		button.classList.add("border-gray-500");
		button.innerText = "Removed";
		button.classList.remove("text-white");
		button.classList.add("text-gray-500");
		button.removeEventListener("click", handle_remove_friend);
	}

	function handle_validation_result(msg_obj : any)
	{
		const error_div = document.querySelector<HTMLDivElement>("#rem_error");
		if(!error_div) throw new Error("Error div not found");
		if(msg_obj.error_msg != "")
		{
			error_div.classList.remove("hidden");
			error_div.innerHTML = `<h1 class="text-[13px] text-red-500">${msg_obj.error_msg}</h1>`;
			if(friends_list_div)
				friends_list_div.classList.add("hidden");
			if(removefriend_search_bar)
				removefriend_search_bar.value = "";
			return;
		}

		error_div.classList.add("hidden");
		display_friends_list(msg_obj.input);
	}
}

export const remove_friends_popup = `
	<div id="remove_friends_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="remove_friends_screen" class="relative bg-black h-[70vh] w-[35vw] flex flex-col items-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold my-[4vh]">Remove Friends:</h1>

			<div class="w-[80%]">
				<input id="removefriend_search_bar" type="text" placeholder="Search for friends..." class="w-full px-4 py-2 border border-white text-white">
				</input>
			</div>

			<div id="rem_error" class="hidden"></div>

			<div id="friends_list_container" class="border border-gray-300 w-[80%] h-[50%] mt-3">
				<div id="friends_list" class="overflow-y-auto hide-scrollbar flex flex-col items-center flex-1 w-[100%] h-[100%]"></div>
			</div>

			<button id="close_remove_friends" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">close</button>
		</div>
	</div>
`
