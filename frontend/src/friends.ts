/* eslint-disable @typescript-eslint/no-explicit-any */

// import { add_history } from "./spa-navigation";

//add fren

import { WS } from "./class/WS.ts";
import { hide_all_main_pages } from "./pong_modes.ts";


//friends page
export const friends_popup = `
	<div id="friends_popup" class="hidden bg-gray-950 bg-opacity-90">
		<main class="flex">
			<!-- Friend List --------------------------------------------->
			<aside class="w-1/3 border-r border-gray-700 py-3 pl-6 pr-2">
				<div id="players_friends_list" class="h-[87vh] space-y-2 overflow-y-scroll">
				</div>
			</aside>

			<!-- Search Friend --------------------------------------------->
			<section class="mx-auto w-1/3 mt-12">
				<!-- Search Bar -->
				<div class="w-full relative flex items-center mb-2">
					<i class="fas fa-search text-gray-400 text-xl absolute pl-5"></i>
					<input id="addfriend_search_bar" class="bg-white text-black w-full text-lg text-black pl-14 pr-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400" 
						type="text" 
						placeholder="Search friend's name"
						maxlength="24">
				</div>

				<div id="addfriend_error_div"></div>
				
				<!-- Search Result -->
				<div id="addfriend_players_list" class="h-[72vh] overflow-y-auto px-4 w-full text-white">
				</div>

			</section>
		</main>
	</div>
`;


export function friends_page_setup()
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`);

	const open_friends_page_button = document.querySelector<HTMLButtonElement>("#display_friends_page_button");
	const friends_popup = document.querySelector<HTMLDivElement>("#friends_popup");

	const addfriend_search_bar = document.querySelector<HTMLInputElement>("#addfriend_search_bar");
	const error_div = document.querySelector<HTMLDivElement>("#addfriend_error_div");

	const player_list_div = document.querySelector<HTMLDivElement>("#addfriend_players_list");

	if(!friends_popup || !open_friends_page_button || !addfriend_search_bar || !error_div || !player_list_div) throw new Error("friends page setup elements not found");

	open_friends_page_button.addEventListener("click", () => {
		hide_all_main_pages();
		friends_popup.classList.remove("hidden");
		open_friends_page_button.classList.add("bg-yellow-400");
		open_friends_page_button.querySelector<HTMLDivElement>("i")?.classList.add("text-black");
		addfriend_search_bar.value = "";
		player_list_div.innerHTML = "";
		if(socket.readyState == WebSocket.OPEN)
			socket.send(JSON.stringify({ type: "get_player_friends" })); //get friends list
	})

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
			addfriend_search_bar.value = input_str.substring(0, input_str.length - 1);
		}
		else
			error_div.innerHTML = "";

		if (input_str.length >= 5)
			socket.send(JSON.stringify({type: "get_server_players", name: addfriend_search_bar.value}));
		else
			player_list_div.classList.add("hidden");
	});

	socket.addEventListener("message", (message : MessageEvent) => {
		const msg_obj = JSON.parse(message.data);
		console.log(msg_obj);
		if(msg_obj.type === "player_friends")
			display_friends_list(msg_obj);
		else if(msg_obj.type === "matching_server_players")
			display_server_players_list(msg_obj);
		else if(msg_obj.type === "add_friend_response" && msg_obj.success == true
				|| msg_obj.type === "remove_friend_response" && msg_obj.success == true)
			socket.send(JSON.stringify({ type: "get_player_friends" })); //get friends list
	});
}

function display_friends_list(msg_obj : any)
{
    const player_friends_list_div = document.querySelector<HTMLDivElement>("#players_friends_list");

    if(!player_friends_list_div) throw new Error("display friends list elements not found");

    let friendsHTML = '';

    for(const friend of msg_obj.friends) {
        const statusColor = friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500';
        const profileImage = friend.pfp ? friend.pfp : "/src/defaultpfp.png";

        friendsHTML += `
            <div class="flex items-center justify-between py-2">
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <img class="w-14 h-14 rounded-full object-cover" src="${profileImage}" alt="friend">
                        <div class="absolute bottom-0 right-0 w-5 h-5 rounded-full ${statusColor} border-4 border-gray-950"></div>
                    </div>    
                    <span class="font-semibold text-white">${friend.username}</span>
                </div>

                <button class="remove_friend_btn w-7 h-7 bg-yellow-400 rounded flex items-center justify-center mr-6" data-username="${friend.username}">
                    <i class="fas fa-times text-black text-lg"></i>
                </button>
            </div>
        `;
    }

    player_friends_list_div.innerHTML = friendsHTML;

    const removeButtons = document.querySelectorAll('.remove_friend_btn');
    for(const button of removeButtons) {
        button.addEventListener("click", (event) => {
            const btn = event.currentTarget as HTMLButtonElement;
            const username = btn.dataset.username;
            const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`);
            socket.send(JSON.stringify({
                type: "remove_friend_name",
                name: username
            }));
        });
    }
}

function display_server_players_list(msg_obj : any)
{
	const player_list_div = document.querySelector<HTMLDivElement>("#addfriend_players_list");
	const error_div = document.querySelector<HTMLDivElement>("#addfriend_error_div");
	const addfriend_search_bar = document.querySelector<HTMLInputElement>("#addfriend_search_bar");

	if(!player_list_div || !error_div) throw new Error("display server players elements not found");

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

	let name = "";
	if(addfriend_search_bar)
		name = addfriend_search_bar.value;

	let list_html = "";
	for(const player of msg_obj.players)
	{
		if(player.username.startsWith(name))
		{
			list_html += `
				<div class="flex items-center justify-between py-4 px-2 border-b border-gray-700">
					<span>${player.username}</span>
					<button class="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black text-lg" id="add_button" data-username="${player.username}">
						+
					</button>
				</div>
			`;
		}
	}

	player_list_div.innerHTML = list_html;

	const add_buttons = document.querySelectorAll('#add_button');
	for(const button of add_buttons)
		button.addEventListener("click", handle_add_friend);
}

function handle_add_friend(event : Event)
{
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`);
	const button = event.target as HTMLButtonElement;
	const added_name = button.dataset.username;
	const send_obj = {
		type: "add_friend_name",
		name: added_name
	}

	socket.send(JSON.stringify(send_obj));

	button.classList.add("hidden");
	button.removeEventListener("click", handle_add_friend);
}