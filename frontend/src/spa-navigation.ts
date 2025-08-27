
/// important note:
// the online game front back fr have damn alot of bugs and rly hard to handle all cases cuz of the socket open close thing, might wanna remove it in the future completely,
// have to see evaluator whether is strict on this ornot

//prev_url will always include gameindex cuz i using location.pathname
let front_navigation_disabled = false;
let back_navigation_disabled = false;
let prev_url = "";

import { vs_AI_spa_nav} from "./vs_AI";
import { exported_stop_game_ft } from "./game-local-display_game";
import { open_local1v1, open_local2v2, open_localTour, open_localxox } from "./game-local-pre_game";
import { open_pong_modes } from "./pong_modes";
import { open_settings_page } from "./settings";
import { open_friend_page } from "./friends";
import { open_playerstats_page } from "./player_stats";
import { online_1v1_play } from "./game-online-1v1";
import { WS } from "./class/WS";
import { open_xox_modes } from "./xox_dashboard";
import { xox_online_play } from "./game-online-xox";

export function add_history(path : string)
{
	//console.log("Add history called = Path: ", path);
	history.pushState({ page: path }, path, `${path}`);
	prev_url = path;
}

export function add_prev_url_to_history()
{
	console.log("prev url: ", prev_url);
	history.pushState({ page: prev_url }, prev_url, `${prev_url}`);
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

	//cleanup ws-online socket
	const socket = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online`);
	socket?.close();
	WS.removeInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online`);

	//cleanup ws-online-xox socket
	const socket_xox = WS.getInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online-xox`);
	socket_xox?.close();
	WS.removeInstance(`${import.meta.env.VITE_SOCKET_URL}/ws-online-xox`);

	display_other_pages(event.state.page);
});

function rmv_all_pgs_except_index()
{
	const playerstats_popup = document.querySelector<HTMLDivElement>("#playerstats_popup");
	const settings_popup = document.querySelector<HTMLDivElement>("#settings_popup");
	const pong_modes_popup = document.querySelector<HTMLDivElement>("#pong_modes_popup");
	const friends_popup = document.querySelector<HTMLDivElement>("#friends_popup");
	
	const vs_AI_winner_popup = document.querySelector<HTMLDivElement>("#vs_AI_winner_popup");
	
	const registration_1v1 = document.querySelector<HTMLDivElement>("#local1v1_registration");
	const local1v1_winner_popup = document.querySelector<HTMLDivElement>("#local1v1_winner_popup");

	const registration_2v2 = document.querySelector<HTMLDivElement>("#local2v2_registration");
	const local2v2_winner_popup = document.querySelector<HTMLDivElement>("#local2v2_winner_popup");

	const registration_tournament = document.querySelector<HTMLDivElement>("#localTour_registration");
	const localTour_matchmaking_popup = document.querySelector<HTMLDivElement>("#localTour_matchmaking_popup");

	const online1v1_winner_popup = document.querySelector<HTMLDivElement>("#online_1v1_winner_popup");
	const online_game_popup = document.querySelector<HTMLDivElement>("#online_game_popup");
	const online1v1_matchmaking_popup = document.querySelector<HTMLDivElement>("#online1v1_matchmaking_popup");

	const xox_popup  = document.querySelector<HTMLButtonElement>("#xox_dashboard_popup");
	const xox_game_popup = document.querySelector<HTMLDivElement>("#xox_game_popup");
	const registration_xox = document.querySelector<HTMLDivElement>("#localxox_registration");
	const xox_matchmaking_popup = document.querySelector<HTMLDivElement>("#onlinexox_matchmaking_popup");


	const exit_mm = document.querySelector<HTMLButtonElement>("#online1v1_exit_matchmaking");

	if(!pong_modes_popup || !registration_1v1 || !local1v1_winner_popup || !friends_popup
		|| !registration_2v2 || !local2v2_winner_popup
		|| !registration_tournament || !localTour_matchmaking_popup
		|| !vs_AI_winner_popup
		|| !playerstats_popup || !settings_popup
		|| !online1v1_winner_popup || !online_game_popup || !online1v1_matchmaking_popup || !exit_mm
		|| !xox_popup || !xox_game_popup || !registration_xox || !xox_matchmaking_popup)
		throw new Error("remove all pages elements not found");

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
	friends_popup.classList.add("hidden");

	online1v1_winner_popup.classList.add("hidden");
	online1v1_matchmaking_popup.classList.add("hidden");

	xox_popup.classList.add("hidden");
	xox_game_popup.classList.add("hidden");
	registration_xox.classList.add("hidden");
	xox_matchmaking_popup.classList.add("hidden");
}

function display_other_pages(path : string)
{
	const playerstats_popup = document.querySelector<HTMLDivElement>("#playerstats_popup");
	const settings_popup = document.querySelector<HTMLDivElement>("#settings_popup");

	const vs_AI_game_button = document.querySelector<HTMLButtonElement>("#vs_AI_game_button");
	const logout_button = document.querySelector<HTMLButtonElement>("#logout_button");


	if(!logout_button
		|| !playerstats_popup || !settings_popup
		|| !vs_AI_game_button) throw new Error("display othar pages elements not found");

	rmv_all_pgs_except_index();
	
	switch(path)
	{
		case "/playerstats":
			open_playerstats_page(); break;
		case "settings":
			open_settings_page(); break;
		case "vs_AI_game":
			vs_AI_spa_nav(); break;
		case "/pong/local1v1":
			open_local1v1(); break;
		case "/pong/local2v2":
			open_local2v2(); break;
		case "/pong/localtournament":
			open_localTour(); break;
		case "/pong":
			open_pong_modes(); break;
		case "/pong/online1v1":
			online_1v1_play(); break;
		case "/friends":
			open_friend_page(); break;
		case "/tic_tac_toe":
			open_xox_modes(); break;
		case "/tic_tac_toe/localgame":
			open_localxox(); break;
		case "/tic_tac_toe/onlinegame":
			xox_online_play(); break;
		case "login": 
			logout_button.click(); break;
	}
}