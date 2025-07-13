/* eslint-disable @typescript-eslint/no-explicit-any */

//add fren

const socket = new WebSocket("ws://localhost:3000/ws_profile");

export function add_friends_setup()
{
	const add_friends_button = document.querySelector<HTMLButtonElement>("#add_friends_button");
	const add_friends_popup = document.querySelector<HTMLButtonElement>("#add_friends_popup");
	const close_add_friends = document.querySelector<HTMLButtonElement>("#close_add_friends");
	const addfriend_search_bar = document.querySelector<HTMLInputElement>("#addfriend_search_bar");
	const player_list_div = document.querySelector<HTMLDivElement>("#players_list");

	if(!player_list_div || !addfriend_search_bar || !add_friends_button || !add_friends_popup || !close_add_friends)
		throw new Error("Error add_friends buttons not found");

	add_friends_button.addEventListener("click", () => {add_friends_popup.classList.remove("hidden")});
	close_add_friends.addEventListener("click", () => {add_friends_popup.classList.add("hidden")});
	socket.addEventListener("message", (message) => {
		const msg_obj = JSON.parse(message.data);
		console.log(msg_obj);
		if(msg_obj.type === "matching_server_players")
			display_player_list(msg_obj);
	});

	addfriend_search_bar.addEventListener("input", () => {
		if (addfriend_search_bar.value.length >= 5)
		{
			player_list_div.classList.remove("hidden");
			socket.send(JSON.stringify({type: "get_server_players", name: addfriend_search_bar.value}));
		}
		else
			player_list_div.classList.add("hidden");
	});

	function display_player_list(msg_obj : any)
	{
		const player_list = msg_obj.players;

		let name = "";
		if(addfriend_search_bar) {
			name = addfriend_search_bar.value;
		}

		let list_html = "";
		for(const player of player_list)
		{
			if(player.username.startsWith(name))
			{
				list_html += `<div class="flex items-center justify-between p-2 mt-1 border-b border-gray-700  gap-2 w-[100%]">`;
				list_html += `<img src="${player.pfp ? player.pfp : "/src/defaultpfp.png"}" class="flex w-8 h-8 rounded-full mr-3"></img>`;
				list_html += `<h3 class="text-white flex">${player.username}</h3>`;
				list_html += `<button id="add_button" class="border border-gray-500 text-white text-sm ml-auto px-4 py-1" data-username="${player.username}">Add</button>`;
				list_html += `</div>`;
			}
		}

		if(player_list_div)
			player_list_div.innerHTML = list_html;

		// const add_buttons = document.querySelectorAll('#add_button');
		// for(const button of add_buttons)
		// 	button.addEventListener("click", handle_add_friend);
	}

	// function handle_add_friend(event : Event)
	// {
		
	// }
}


export const add_friends_popup = `
	<div id="add_friends_popup" class="flex flex-col justify-center items-center hidden fixed bg-black inset-0" style="background-color: rgba(0,0,0,0.9)">
		<div id="add_friends_screen" class="relative bg-black h-[70vh] w-[35vw] flex flex-col items-center border border-2 border-white">
			<h1 class="text-white text-[40px] font-bold my-[5vh]">add friends:</h1>

			<div class="w-[80%]">
				<input 
					id="addfriend_search_bar" 
					type="text" 
					placeholder="Search for friends..." 
					class="w-full px-4 py-2 border border-white text-white"
				</input>
			</div>

			<div id="player_list_container" class="border border-gray-300 w-[80%] h-[50%] mt-3">
				<div id="players_list" class="overflow-y-auto hide-scrollbar flex flex-col items-center flex-1 w-[100%] h-[100%] hidden"></div>
			</div>

			<button id="close_add_friends" class="text-white border border-white absolute bottom-4 right-4 w-[5vw] h-[5vh]">close</button>
		</div>
	</div>
`
