
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import "./gameindex.css";
import { startGame } from "./startgame.ts";

//////////////////////////////////////////////
//fetch the fren list and profile stuff here
//////////////////////////////////////////////

//temp profile JSON gotten from backend
const player =
{
	"id": "100",
	"username": "Player1",
	"pfp": null,
	"friends":
	[
		{
			"id": "101",
			"username": "Player2",
			"pfp": null, 
			"status": "online"
		},
		{
			"id": "102",
			"username": "Player3",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "103",
			"username": "Player4",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "104",
			"username": "Player5",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "105",
			"username": "Player6",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "106",
			"username": "Player8",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "106",
			"username": "Player9",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "106",
			"username": "Player10",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "106",
			"username": "Player11",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "106",
			"username": "Player12",
			"pfp": null, 
			"status": "offline"
		}
	]
}

const game = document.querySelector<HTMLButtonElement>("#game");

if(!game) throw new Error("Game element not found");

const enter_game_sec = `
		<div id="enter_game_sec" class="border-2 border-white border w-[500px] h-[450px] bg-black flex flex-col justify-center items-center gap-[20px]">
			<h1 class="text-white text-[25px] font-bold"> Enter game: </h1>
			<button id="entergame" type="button" class = "text-[20px] text-white border-1 w-[200px] h-[100px]">Singleplayer</button>
			<button id="multiplayer" type="button" class = "text-[20px] text-white border-1 w-[200px] h-[100px]">Multiplayer</button>
			<button id="vs_Ai" type="button" class = "text-[20px] text-white border-1 w-[200px] h-[100px]">vs_Ai</button>
		</div> `

//left sec
const left_sec = `
	<div id="left_sec" class="flex flex-col border-2 border-white border w-[200px] h-[450px] bg-black justify-center items-center gap-[20px]">
		<h1 class="text-white text-[20px] font-bold"> Player stuffs: </h1>
		<button class="flex flex-col items-center justify-center text-white text-[20px] border-1 w-[120px] h-[100px]">player profile</button>
		<button class="flex flex-col items-center justify-center text-white text-[20px] border-1 w-[120px] h-[100px]">settings</button>
		<button class="flex flex-col items-center justify-center text-white text-[20px] border-1 w-[120px] h-[100px]">stats</button>
	</div>
` 

//right sec (fren lists)

let online_frens = "";
let offline_frens = "";

let i = 0;
while (i < player.friends.length)
{
	const friend = player.friends[i];

	const friend_html = `
		<div class="flex items-center text-white text-[14px] w-full h-[35px] px-[5px] py-[2px] hover:bg-gray-800">
			<img src="${friend.pfp? friend.pfp : "/src/defaultpfp.png"}" class="w-[20px] h-[20px]">
			<h1 class="text-white ml-[5px]">${friend.username}</h1>
			<div class="ml-auto w-[8px] h-[8px] rounded-full ${friend.status === 'online' ? 'bg-green-400' : 'bg-gray-500'}"></div>
		</div>
	`;

	if (friend.status === "online")
		online_frens += friend_html;
	else
		offline_frens += friend_html;

    i++;
}

const right_sec = `
	<div id="right_sec" class="flex flex-col border-2 border-white border w-[200px] h-[450px] bg-black p-[10px]">
		<h1 class="text-white text-[20px] font-bold text-center mb-[10px]"> Friends </h1>
		
		<div class="flex-1 overflow-y-auto hide-scrollbar">
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
	</div>
` 

//header sec - simplified version
const header_sec = `
	<div id="header_sec">
		<div class="flex items-center w-[99vw] h-[10vh] bg-black border-b border-white">
			<img src="${player.pfp ? player.pfp : "/src/defaultpfp.png"}" class="w-[40px] h-[40px] rounded-full border-2 border-white ml-[1vw]">
			<h1 class="text-white text-[18px] pl-[1vw]">${player.username}</h1>
			<button class="ml-auto text-white text-[14px] px-[10px] py-[5px] border border-white">Logout</button>
		</div>
		<div class="text-center bg-black pt-[5vh]">
			<h1 class="text-white text-[40px] font-bold">ft_transcendence menus :/</h1>
		</div>
	</div>
`

game.innerHTML = `
	<div id = "screen" class = "min-h-screen bg-black">
		${header_sec}
		<div id = "sections" class = "flex justify-center pt-[50px] gap-[100px] pb-[50px]">
			${left_sec}
			${enter_game_sec}
			${right_sec}
		</div>
	</div>
`;

startGame(document.querySelector<HTMLButtonElement>("#entergame")!);