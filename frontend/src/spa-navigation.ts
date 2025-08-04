
//prev_url will always include gameindex cuz i using location.pathname
let prev_url = "";
let navigation_disabled = false;

import { vs_AI_spa_nav} from "./vs_AI";
import { exported_stop_game_ft } from "./game-local-display_game";

export function add_history(path : string)
{
	//console.log("Add history called = Path: ", path);
	prev_url = location.pathname;
	history.pushState({ page: path }, path, `/index/${path}`);
}

export function terminate_history()
{
	//console.log("Terminate history called = Prev url: ", prev_url);
	history.pushState({page : prev_url}, prev_url, prev_url);

	if(prev_url === "/index/")
        rmv_all_pgs_except_index();
    else
	{
		const url = prev_url.substring("/index/".length, prev_url.length);
        display_other_pages(url);
	}
}

export function disable_navigation()
{
	navigation_disabled = true;
}

export function enable_navigation()
{
	navigation_disabled = false;
}

window.addEventListener("popstate", (event) => {
	if (navigation_disabled)
	{
		history.go(1);
		return;
	}
	//console.log("user changed history");
	//console.log("Current URL:", location.pathname);

	//very sus part
	if(location.pathname == "/index/")
		rmv_all_pgs_except_index();
	else
		display_other_pages(event.state.page); //parse in event state page not locationpathname cuz that one will have /index in front
});

function rmv_all_pgs_except_index()
{
	const history_popup = document.querySelector<HTMLDivElement>("#help_popup");
	const playerstats_popup = document.querySelector<HTMLDivElement>("#playerstats_popup");
	const settings_popup = document.querySelector<HTMLDivElement>("#settings_popup");
	const pf_config_popup = document.querySelector<HTMLButtonElement>("#pf_config_popup");
	
	const vs_AI_winner_popup = document.querySelector<HTMLDivElement>("#vs_AI_winner_popup");
	const local_play_menus_popup = document.querySelector<HTMLDivElement>("#local_play_menus_popup");
	
	const registration_1v1 = document.querySelector<HTMLDivElement>("#local1v1_registration");
	const local1v1_winner_popup = document.querySelector<HTMLDivElement>("#local1v1_winner_popup");

	const registration_2v2 = document.querySelector<HTMLDivElement>("#local2v2_registration");
	const local2v2_winner_popup = document.querySelector<HTMLDivElement>("#local2v2_winner_popup");

	const registration_tournament = document.querySelector<HTMLDivElement>("#localTour_registration");
	const localTour_matchmaking_popup = document.querySelector<HTMLDivElement>("#localTour_matchmaking_popup");

	const add_friends_popup = document.querySelector<HTMLButtonElement>("#add_friends_popup");
	const remove_friends_popup = document.querySelector<HTMLDivElement>("#remove_friends_popup");

	const online_play_menus_popup = document.querySelector<HTMLDivElement>("#online_play_menus_popup");
	const online1v1_winner_popup = document.querySelector<HTMLDivElement>("#online_1v1_winner_popup");

	if(!remove_friends_popup || !add_friends_popup
		|| !registration_1v1 || !local1v1_winner_popup
		|| !registration_2v2 || !local2v2_winner_popup
		|| !registration_tournament || !localTour_matchmaking_popup
		|| !local_play_menus_popup || !vs_AI_winner_popup || !history_popup
		|| !playerstats_popup || !settings_popup
		|| !pf_config_popup || !online_play_menus_popup || !online1v1_winner_popup) throw new Error("display gameindexhtml elements not found");

	history_popup.classList.add("hidden");
	playerstats_popup.classList.add("hidden");
	settings_popup.classList.add("hidden");
	pf_config_popup.classList.add("hidden");
	local_play_menus_popup.classList.add("hidden");

	registration_1v1.classList.add("hidden");
	local1v1_winner_popup.classList.add("hidden");

	registration_2v2.classList.add("hidden");
	local2v2_winner_popup.classList.add("hidden");

	registration_tournament.classList.add("hidden");
	localTour_matchmaking_popup.classList.add("hidden");
	
	exported_stop_game_ft();
	vs_AI_winner_popup.classList.add("hidden");

	add_friends_popup.classList.add("hidden");
	remove_friends_popup.classList.add("hidden");

	online_play_menus_popup.classList.add("hidden");
	online1v1_winner_popup.classList.add("hidden");
}

function display_other_pages(path : string)
{
	const history_popup = document.querySelector<HTMLDivElement>("#help_popup");
	const playerstats_popup = document.querySelector<HTMLDivElement>("#playerstats_popup");
	const settings_popup = document.querySelector<HTMLDivElement>("#settings_popup");
	const pf_config_popup = document.querySelector<HTMLButtonElement>("#pf_config_popup");

	const vs_AI_game_button = document.querySelector<HTMLButtonElement>("#vs_AI_game_button");
	const game_popup = document.querySelector<HTMLDivElement>("#game_popup");

	const local_play_menus_popup = document.querySelector<HTMLDivElement>("#local_play_menus_popup");
	const registration_1v1 = document.querySelector<HTMLDivElement>("#local1v1_registration");
	const registration_2v2 = document.querySelector<HTMLDivElement>("#local2v2_registration");
	const registration_tournament = document.querySelector<HTMLDivElement>("#localTour_registration");

	const add_friends_popup = document.querySelector<HTMLButtonElement>("#add_friends_popup");
	const remove_friends_popup = document.querySelector<HTMLDivElement>("#remove_friends_popup");

	const online_play_menus_popup = document.querySelector<HTMLDivElement>("#online_play_menus_popup");
	const logout_button = document.querySelector<HTMLButtonElement>("#logout_button")

	if(!remove_friends_popup || !add_friends_popup || !logout_button
		|| !registration_1v1 || !registration_2v2 || !registration_tournament
		|| !local_play_menus_popup || !game_popup || !history_popup
		|| !playerstats_popup || !settings_popup || !pf_config_popup
		|| !vs_AI_game_button || !online_play_menus_popup) throw new Error("display gameindexhtml elements not found");

	//console.log("PATH: ", path);

	rmv_all_pgs_except_index();
	
	switch(path)
	{
		case "help":
			history_popup.classList.remove("hidden"); break;
		case "playerstats":
			playerstats_popup.classList.remove("hidden"); break;
		case "settings":
			settings_popup.classList.remove("hidden"); break;
		case "profile_config":
			pf_config_popup.classList.remove("hidden"); break;
		case "vs_AI_game":
			vs_AI_spa_nav(); break;
		case "localgame":
			local_play_menus_popup.classList.remove("hidden"); break;
		case "localgame/1v1":
			registration_1v1.classList.remove("hidden"); break;
		case "localgame/2v2":
			registration_2v2.classList.remove("hidden"); break;
		case "localgame/tournament":
			registration_tournament.classList.remove("hidden"); break;
		case "add_friend":
			add_friends_popup.classList.remove("hidden"); break;
		case "remove_friend":
			remove_friends_popup.classList.remove("hidden"); break;
		case "onlinegame":
			online_play_menus_popup.classList.remove("hidden"); break;
		case "login": 
			logout_button.click(); //idk if this will be stable lol can remove if theres bug
	}
}