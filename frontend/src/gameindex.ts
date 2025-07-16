/* eslint-disable @typescript-eslint/no-explicit-any */

import "./gameindex.css";
import { pf_config_setup, pf_config_popup } from "./config_profile.ts";
import { playerstats_setup, playerstats_popup } from "./other_stuff.ts";
import { settings_setup, settings_popup } from "./other_stuff.ts";
import { help_setup, help_popup } from "./other_stuff.ts";

import { add_friends_setup, add_friends_popup } from "./friends.ts";
import { remove_friends_setup, remove_friends_popup } from "./friends.ts";

import { localhost_game_setup, localhost_game_popup } from "./game.ts";
import { vs_AI_game_setup, vs_AI_game_popup } from "./vs_AI.ts";

const session = localStorage.getItem("session") || "";
const socket = new WebSocket(
  `ws://localhost:3000/ws_profile?session=${session}`
);
socket.addEventListener("message", process_msg_from_socket);
socket.addEventListener("close", (event) => {
  if (!event.wasClean) {
    window.location.href = "/index.html";
  }
});

let player: any;
let friends_obj: any;

function process_msg_from_socket(message: MessageEvent) {
  // console.log("JSON obj recv to frontend");
  // console.log(message.data);
  const msg_obj = JSON.parse(message.data);

  if (msg_obj.type == "player_profile") {
    init_player(msg_obj);
  } else if (msg_obj.type == "player_friends") {
    init_friends(msg_obj);
  } else if (msg_obj.type == "session_success") {
    socket.send(JSON.stringify({ type: "get_player_profile" }));
  } else if (msg_obj.type == "session_error") {
    window.location.href = "/index.html";
  }
}

function init_player(msg_obj: object) {
  player = msg_obj;
  socket.send(JSON.stringify({ type: "get_player_friends" })); //get friends list
}

function init_friends(msg_obj: object) {
  friends_obj = msg_obj;
  main_ft();
}

//main logic

function main_ft() {
  const game = document.querySelector<HTMLButtonElement>("#index");

  if (!game) throw new Error("Game element not found");
  if (!player) throw new Error("Player element not found");

  const enter_game_sec = `
			<div id="enter_game_sec" class="border-2 border-white border w-[500px] h-[450px] bg-black flex flex-col justify-center items-center gap-[20px]">
				<h1 class="text-white text-[25px] font-bold"> Enter game: </h1>
				<button id="localhost_game_button" type="button" class = "text-[20px] text-white border-1 w-[200px] h-[100px]">Localhost play</button>
				<button id="multiplayer" type="button" class = "text-[20px] text-white border-1 w-[200px] h-[100px]">Multiplayer</button>
				<button id="vs_AI_game_button" type="button" class = "text-[20px] text-white border-1 w-[200px] h-[100px]">vs_Ai</button>
			</div> `;

  //left sec
  const left_sec = `
		<div id="left_sec" class="flex flex-col border-2 border-white border w-[200px] h-[450px] bg-black justify-center items-center gap-[20px]">
			<h1 class="text-white text-[20px] font-bold"> Other stuffs: </h1>
			<button id="playerstats_button" class="flex flex-col items-center justify-center text-white text-[20px] border-1 w-[120px] h-[100px]">Player stats</button>
			<button id="settings_button" class="flex flex-col items-center justify-center text-white text-[20px] border-1 w-[120px] h-[100px]">Settings</button>
			<button id="help_button" class="flex flex-col items-center justify-center text-white text-[20px] border-1 w-[120px] h-[100px]">Help</button>
		</div>
	`;

  //right sec (fren lists)

  let online_frens = "";
  let offline_frens = "";

  let i = 0;
  while (i < friends_obj.friends.length) {
    const friend = friends_obj.friends[i];
    const display_name =
      friend.username.length > 15
        ? friend.username.substring(0, 15) + "..."
        : friend.username;

    const friend_html = `
			<div class="flex items-center text-white text-[14px] w-full h-[35px] px-[5px] py-[2px]">
				<img src="${
          friend.pfp ? friend.pfp : "/src/defaultpfp.png"
        }" class="w-[20px] h-[20px]">
				<h1 class="text-white ml-[5px]">${display_name}</h1>
				<div class="ml-auto w-[8px] h-[8px] rounded-full ${
          friend.status === "online" ? "bg-green-400" : "bg-gray-500"
        }"></div>
			</div>
		`;

    if (friend.status === "online") online_frens += friend_html;
    else offline_frens += friend_html;

    i++;
  }

  const right_sec = `
		<div id="right_sec" class="flex flex-col border-2 border-white border w-[200px] h-[450px] bg-black">
			<h1 class="text-white text-[20px] font-bold text-center mb-[10px]"> Friends </h1>
			
			<div class="flex-1 overflow-y-auto hide-scrollbar p-[10px]">
				<div id="online_frens" class="mb-[15px]">
					<h2 class="text-white text-[16px] mb-[5px]"> Online: </h2>
					<div class="w-full border-b-1 border-white mb-[10px]"></div>
					<div class="space-y-[5px]">
						${online_frens}
					</div>
				</div>
				
				<div id="offline_frens" class="mb-[15px]">
					<h2 class="text-white text-[16px] mb-[5px]"> Offline: </h2>
					<div class="w-full border-b-1 border-white mb-[10px]"></div>
					<div class="space-y-[5px]">
						${offline_frens}
					</div>
				</div>
			</div>
			<div id="fren_buttons" class="flex w-full">
				<button id="add_friends_button" class="flex-1 text-white text-[14px] border-white border-1 p-[3px]">Add friend</button>
				<button id="remove_friends_button" class="flex-1 text-white text-[14px] p-[3px] border-white border-1">Remove friend </button>
			</div>
		</div>
	`;

  //header sec - simplified version
  const header_sec = `
		<div id="header_sec">
			<div class="flex items-center w-[99vw] h-[10vh] bg-black border-b border-white">
				
				<img id ="header_img" src="${
          player.pfp ? player.pfp : "/src/defaultpfp.png"
        }" class="w-[40px] h-[40px] rounded-full border-2 border-white ml-[1vw]">
				<div id="header_name">
					<h1 class="text-white text-[18px] pl-[1vw]">${player.username}</h1>
				</div>
				
				<div id="buttons" class="flex ml-auto px-[10px] py-[5px] gap-[10px]">
					<button id="pf_config_button" class="text-white text-[14px] border border-white p-[3px]">Configure profile</button>
					<button id="logout_button" class="text-white text-[14px] border border-white p-[3px]">Logout</button>
				</div>
			
			</div>
			<div class="text-center bg-black pt-[4vh]">
				<h1 class="text-white text-[40px] font-bold">ft_transcendence menus :/</h1>
			</div>
		</div>
	`;

  game.innerHTML = `
		<div id = "screen" class = "min-h-screen bg-black">
			${header_sec}
			<div id = "sections" class = "flex justify-center pt-[50px] gap-[100px] pb-[50px]">
				${left_sec}
				${enter_game_sec}
				${right_sec}
			</div>
			${pf_config_popup}

			${playerstats_popup}
			${settings_popup}
			${help_popup}

			${add_friends_popup}
			${remove_friends_popup}

			${localhost_game_popup}
			${vs_AI_game_popup}

		</div>
	`;

  playerstats_setup();
  settings_setup();
  help_setup();

  pf_config_setup();

  add_friends_setup();
  remove_friends_setup();

  localhost_game_setup();
  vs_AI_game_setup();

  document
    .querySelector<HTMLButtonElement>("#logout_button")
    ?.addEventListener("click", () => {
      socket.send(JSON.stringify({ type: "logout" }));
      localStorage.removeItem("session");
      window.location.href = "/index.html";
    });
}
