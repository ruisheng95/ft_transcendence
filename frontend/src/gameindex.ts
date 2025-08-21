/* eslint-disable @typescript-eslint/no-explicit-any */


//notes
//only init - ing the webpage after i recv JSON of profile from socket

const html = (strings: TemplateStringsArray, ...values: unknown[]) => 
  String.raw({ raw: strings }, ...values);


import "./gameindex.css";
import { playerstats_setup, playerstats_popup } from "./player_stats.ts";
import { settings_setup, settings_popup } from "./settings.ts";

import {friends_popup, friends_page_setup } from "./friends.ts";

// import { local_play_game_setup, local_play_game_popup } from "./game.ts";
import { vs_AI_game_setup, vs_AI_game_popup } from "./vs_AI.ts";

import {local_play_menus_setup, local_play_menus_popup} from "./game-local-pre_game.ts"
import { online_play_menus_setup} from "./game-online-pre_game.ts";

import { game_popup } from "./game-local-display_game.ts";
import { online_game_popup } from "./game-online-1v1.ts";


import { add_history } from "./spa-navigation.ts";

import { WS } from "./class/WS.ts";
import { pong_modes_popup, pong_modes_setup } from "./pong_modes.ts";

import DOMPurify from 'dompurify';
import { handle_language_change } from "./language.ts";

export function index_init()
{
    let websocketKeepAliveTimeout: number | undefined = undefined;
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`);

	socket.addEventListener("message", process_msg_from_socket);
	socket.addEventListener("close", () => {
		// if (!event.wasClean) {
		// 	display_login_page();
		// }
		display_login_page();
		clearInterval(websocketKeepAliveTimeout);
	});
	socket.addEventListener("open", () => {
		socket.send(JSON.stringify({ type: "get_player_profile" }));
		websocketKeepAliveTimeout = setInterval(() => {
			socket.send("{}");
			// WebSocket will auto logout if no data is sent in 1 minute. Set send empty message of interval of every 10 seconds
		}, 10000);
	});

	//
	//push the main gameindex to history, since all my verification of tokens is done before this, i can check if the history has this index page to verify if a person is logged in
	//
	//
	let player: any;
	// let friends_obj: any;

	function process_msg_from_socket(message: MessageEvent) {
	// console.log("JSON obj recv to frontend");
	// console.log(message.data);
	const msg_obj = JSON.parse(message.data);

	if (msg_obj.type == "player_profile") {
		init_player(msg_obj);

	} 
	// else if (msg_obj.type == "player_friends" || msg_obj.type === "add_friend_response") {
	// 	init_friends(msg_obj);
	// }
	}

	// setInterval( async () => {
	// 	socket.send(JSON.stringify({ type: "get_player_friends" })); //get friends list
	// }, 1000);

	function init_player(msg_obj: any) {
	player = msg_obj;

	if(player.username.includes('@'))
		localStorage.setItem("new_player_flag", "true");

	localStorage.setItem("current_username", player.username);
	main_ft();
	handle_language_change(`${localStorage.getItem("current_language")}`);

	add_history("/pong"); //temporarily add /gameindex.html/ to history cuz wanna have the popstate effect
	// socket.send(JSON.stringify({ type: "get_player_friends" })); //get friends list
	}

	// function init_friends(msg_obj: object) {
	// friends_obj = msg_obj;
	// modify_friends_list();
	// }

	//main logic

	function main_ft() {
	const game = document.querySelector<HTMLButtonElement>("#index");
	const app = document.querySelector<HTMLDivElement>("#app");

	if (!game) throw new Error("Game element not found");
	if (!player) throw new Error("Player element not found");

	game.classList.remove("hidden");
	app?.classList.add("hidden");

	//right sec (fren lists, empty until we get frens list from socket)
	// const right_sec = `
	// 		<div id="right_sec" class="hidden flex flex-col border-2 border-white border w-[200px] h-[450px] bg-black">
	// 			<h1 class="text-white text-[20px] font-bold text-center mb-[10px]"> Friends </h1>
				
	// 			<div id="friends_list_div" class="flex-1 overflow-y-auto hide-scrollbar p-[10px]">
	// 			</div>
	// 			<div id="fren_buttons" class="flex w-full">
	// 				<button id="add_friends_button" class="flex-1 text-white text-[14px] border-white border-1 p-[3px]">Add friend</button>
	// 				<button id="remove_friends_button" class="flex-1 text-white text-[14px] p-[3px] border-white border-1">Remove friend </button>
	// 			</div>
	// 		</div>
	// 	`;

//header sec - simplified version
	const header_sec = html`
	<div id="header_sec" class="inter-font">
		<div class="text-white flex items-center justify-between w-full h-[10vh] bg-gray-950 border-b border-gray-700 px-4">
			
			<!-- User Profile Section -->
			<div class="flex space-x-4 items-center">
				<img id="header_img" src="${player.pfp ? player.pfp : "/src/defaultpfp.png"}" 
					class="w-14 h-14 object-cover rounded-full border-2 border-white">
				<span id="header_name" class="text-xl font-semibold">${player.username}</span>
			</div>

			<!-- Navigation Section -->
			<div class="flex">
				
				<!-- Game Section -->
				<div class="border-l border-gray-700 py-1 px-3">
					<div id = "header_game" class="text-sm tracking-widest mb-1">Game</div>
					<div class="flex items-center space-x-2">

						<!-- Pong -->
						<button id="pong_modes_button" class="relative group px-3 py-2 rounded-lg bg-yellow-400">
							<i class="fas fa-table-tennis text-xl text-black"></i>
							<span id="header_pong" class="absolute opacity-0 -bottom-11 left-1/2 -translate-x-1/2 text-sm py-1 px-3 bg-white/20 group-hover:opacity-100 transition-opacity rounded-lg  ">Pong</span>
						</button>

						<!-- XOX -->
						<button class="relative group px-3 py-2 rounded-lg">
							<i class="fas fa-th text-xl"></i>
							<span id="header_tic_tac_toe" class="absolute opacity-0 -bottom-11 left-1/2 -translate-x-1/2 text-sm py-1 px-3 bg-white/20 group-hover:opacity-100 transition-opacity rounded-lg   whitespace-nowrap">Tic-Tac-Toe</span>
						</button>

					</div>
				</div>

				<!-- Menu Selection -->
				<div class="border-l border-gray-700 py-1 px-3">
					<div id = "header_menu" class="text-sm tracking-widest mb-1">Menu</div>
					<div class="flex items-center space-x-2">

						<!-- Friends -->
						<button id ="display_friends_page_button" class="relative group px-3 py-2 rounded-lg">
							<i class="fas fa-users text-xl"></i>
							<span id="header_friends" class="absolute opacity-0 -bottom-11 left-1/2 -translate-x-1/2 text-sm py-1 px-3 bg-white/20 group-hover:opacity-100 transition-opacity rounded-lg  ">Friends</span>
						</button>

						<!-- Settings -->
						<button id="settings_button" class="relative group px-3 py-2 rounded-lg">
							<i class="fas fa-cog text-xl"></i>
							<span id="header_settings" class="absolute opacity-0 -bottom-11 left-1/2 -translate-x-1/2 text-sm py-1 px-3 bg-white/20 group-hover:opacity-100 transition-opacity rounded-lg  ">Settings</span>
						</button>

						<!-- Logout -->
						<button id="logout_button" class="relative group px-3 py-2 rounded-lg">
							<i class="fas fa-sign-out-alt text-xl"></i>
							<span id="header_logout" class="absolute opacity-0 -bottom-11 left-1/2 -translate-x-1/2 text-sm py-1 px-3 bg-white/20 group-hover:opacity-100 transition-opacity rounded-lg  ">Logout</span>
						</button>

					</div>
				</div>
			</div>
		</div>
	</div>
	`;



	game.innerHTML = DOMPurify.sanitize(`
		<div id = "screen" class = "min-h-screen bg-black">
			${header_sec}
			${pong_modes_popup}
			${friends_popup}

			${playerstats_popup}
			${settings_popup}

			${local_play_menus_popup}
			${vs_AI_game_popup}
				
			${game_popup}
			${online_game_popup}

			</div>
		`);

	pong_modes_setup();
	playerstats_setup();
	settings_setup();


	local_play_menus_setup();
	online_play_menus_setup();
	vs_AI_game_setup();

	friends_page_setup();

	document
		.querySelector<HTMLButtonElement>("#logout_button")
		?.addEventListener("click", () => {
		socket.send(JSON.stringify({ type: "logout" }));
		socket.close();
		WS.removeInstance(`${import.meta.env.VITE_SOCKET_URL}/ws_profile`)
		localStorage.removeItem("session");
		// window.location.href = "/index.html";
		display_login_page();
		});
	}


	// function modify_friends_list()
	// {
	// let online_frens = "";
	// let offline_frens = "";

	// let i = 0;
	// while (i < friends_obj.friends.length) {
	// 	const friend = friends_obj.friends[i];
	// 	const display_name =
	// 	friend.username.length > 15
	// 		? friend.username.substring(0, 15) + "..."
	// 		: friend.username;

	// 	const friend_html = `
	// 			<div class="flex items-center text-white text-[14px] w-full h-[35px] px-[5px] py-[2px]">
	// 				<img src="${
	// 		friend.pfp ? friend.pfp : "/src/defaultpfp.png"
	// 		}" class="w-[20px] h-[20px]">
	// 				<h1 class="text-white ml-[5px]">${display_name}</h1>
	// 				<div class="ml-auto w-[8px] h-[8px] rounded-full ${
	// 		friend.status === "online" ? "bg-green-400" : "bg-gray-500"
	// 		}"></div>
	// 			</div>
	// 		`;

	// 	if (friend.status === "online") online_frens += friend_html;
	// 	else offline_frens += friend_html;

	// 	i++;
	// }

	// const friends_list_div = document.querySelector<HTMLDivElement>("#friends_list_div");
	// if(!friends_list_div) throw new Error("modify frens elements not found");

	// friends_list_div.innerHTML = `
	// <div id="online_frens" class="mb-[15px]">
	// 	<h2 class="text-white text-[16px] mb-[5px]"> Online: </h2>
	// 	<div class="w-full border-b-1 border-white mb-[10px]"></div>
	// 		<div class="space-y-[5px]">
	// 			${online_frens}
	// 	</div>
	// </div>
					
	// <div id="offline_frens" class="mb-[15px]">
	// 	<h2 class="text-white text-[16px] mb-[5px]"> Offline: </h2>
	// 	<div class="w-full border-b-1 border-white mb-[10px]"></div>
	// 		<div class="space-y-[5px]">
	// 			${offline_frens}
	// 	</div>
	// </div>`
	// }
}

export function display_login_page()
{
	const index = document.querySelector<HTMLDivElement>("#index");
	const login = document.querySelector<HTMLDivElement>("#app");

	if(!index || !login) throw new Error("display login page elements not found");

	index.classList.add("hidden");
	login.classList.remove("hidden");
	if(location.pathname != "/login")
		history.pushState({ page: "login" }, "login", `/login`);
}

export function removeAllEventListenersFromButton(button: HTMLButtonElement): HTMLButtonElement
{
    const newButton = button.cloneNode(true) as HTMLButtonElement;
    button.parentNode?.replaceChild(newButton, button);
    return newButton;
}