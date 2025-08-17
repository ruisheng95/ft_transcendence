
//prev_url will always include gameindex cuz i using location.pathname
let front_navigation_disabled = false;
let back_navigation_disabled = false;

import { vs_AI_spa_nav} from "./vs_AI";
import { exported_stop_game_ft } from "./game-local-display_game";
import { open_local1v1, open_local2v2, open_localTour } from "./game-local-pre_game";

export function add_history(path : string)
{
	//console.log("Add history called = Path: ", path);
	history.pushState({ page: path }, path, `${path}`);
}


export function disable_back_navigation()
{
	back_navigation_disabled = true;
}

export function enable_back_navigation()
{
	back_navigation_disabled = false;
}

export function disable_front_navigation()
{
	front_navigation_disabled = true;
}

export function enable_front_navigation()
{
	front_navigation_disabled = false;
}


window.addEventListener("popstate", (event) => {

	if (front_navigation_disabled)
	{
		history.back();
		return;
	}
	
	if(back_navigation_disabled)
	{
		history.go(1);
		return;
	}
	//console.log("user changed history");
	console.log("Current URL:", location.pathname);

	//very sus part
	if(location.pathname == "/index/")
		rmv_all_pgs_except_index();
	else
		display_other_pages(event.state.page); //parse in event state page not locationpathname cuz that one will have /index in front
});

function rmv_all_pgs_except_index()
{
	const playerstats_popup = document.querySelector<HTMLDivElement>("#playerstats_popup");
	const settings_popup = document.querySelector<HTMLDivElement>("#settings_popup");
	const pong_modes_popup = document.querySelector<HTMLDivElement>("#pong_modes_popup");
	
	const vs_AI_winner_popup = document.querySelector<HTMLDivElement>("#vs_AI_winner_popup");
	
	const registration_1v1 = document.querySelector<HTMLDivElement>("#local1v1_registration");
	const local1v1_winner_popup = document.querySelector<HTMLDivElement>("#local1v1_winner_popup");

	const registration_2v2 = document.querySelector<HTMLDivElement>("#local2v2_registration");
	const local2v2_winner_popup = document.querySelector<HTMLDivElement>("#local2v2_winner_popup");

	const registration_tournament = document.querySelector<HTMLDivElement>("#localTour_registration");
	const localTour_matchmaking_popup = document.querySelector<HTMLDivElement>("#localTour_matchmaking_popup");

	const online1v1_winner_popup = document.querySelector<HTMLDivElement>("#online_1v1_winner_popup");


	if(!pong_modes_popup || !registration_1v1 || !local1v1_winner_popup
		|| !registration_2v2 || !local2v2_winner_popup
		|| !registration_tournament || !localTour_matchmaking_popup
		|| !vs_AI_winner_popup
		|| !playerstats_popup || !settings_popup
		|| !online1v1_winner_popup) throw new Error("remove all pages elements not found");

	pong_modes_popup.classList.add("hidden");
	playerstats_popup.classList.add("hidden");
	settings_popup.classList.add("hidden");

	registration_1v1.classList.add("hidden");
	local1v1_winner_popup.classList.add("hidden");

	registration_2v2.classList.add("hidden");
	local2v2_winner_popup.classList.add("hidden");

	registration_tournament.classList.add("hidden");
	localTour_matchmaking_popup.classList.add("hidden");
	
	exported_stop_game_ft();
	vs_AI_winner_popup.classList.add("hidden");
}

function display_other_pages(path : string)
{
	const playerstats_popup = document.querySelector<HTMLDivElement>("#playerstats_popup");
	const settings_popup = document.querySelector<HTMLDivElement>("#settings_popup");
	const pong_modes_popup = document.querySelector<HTMLDivElement>("#pong_modes_popup");

	const vs_AI_game_button = document.querySelector<HTMLButtonElement>("#vs_AI_game_button");
	const logout_button = document.querySelector<HTMLButtonElement>("#logout_button");


	if(!logout_button || !pong_modes_popup
		|| !playerstats_popup || !settings_popup
		|| !vs_AI_game_button) throw new Error("display othar pages elements not found");

	console.log("PATH: ", path);

	rmv_all_pgs_except_index();
	
	switch(path)
	{
		case "playerstats":
			playerstats_popup.classList.remove("hidden"); break;
		case "settings":
			settings_popup.classList.remove("hidden"); break;
		case "vs_AI_game":
			vs_AI_spa_nav(); break;
		case "/pong/local1v1":
			open_local1v1(); break;
		case "/pong/local2v2":
			open_local2v2(); break;
		case "/pong/tournament":
			open_localTour(); break;
		case "/pong":
			pong_modes_popup.classList.remove("hidden"); break;
		case "login": 
			logout_button.click(); break;
	}
}