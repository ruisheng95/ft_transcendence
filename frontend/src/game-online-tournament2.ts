/* eslint-disable @typescript-eslint/no-explicit-any */

import { online_1v1_play } from "./game-online-1v1";
import { translate_text } from "./language";
import { click_pong_modes_button } from "./pong_modes";
import { disable_back_navigation, enable_back_navigation } from "./spa-navigation";
import { WS } from "./class/WS.ts";

// global flag to prevent multiple tournament managers
let tournamentManagerActive = false;
let onlineTour_back_nav_disabled = false;

export function online_tour_manager()
{
	// console.log(`entered online tour manager`);
	// console.log(`tournament manager status: ${tournamentManagerActive}`);

	if (tournamentManagerActive) {
        console.log(`tournament manager still active!!! status: ${tournamentManagerActive}`);
        return;
    }

	tournamentManagerActive = true;
	
	// Check if we have any existing tournament context
	const existingContext = localStorage.getItem("tournament_context");
	if (existingContext) {
		console.log(`Found existing tournament context:`, JSON.parse(existingContext));
	}
	
    // clear old tournament context
	localStorage.removeItem("tournament_context");

	const socketBase = `${import.meta.env.VITE_SOCKET_URL}/ws-online-tournament`;
	const socket = WS.getInstance(socketBase);
	// console.log(`Socket created:`, socket);
	// console.log(`Socket readyState:`, socket.readyState);
	
	const Tournament_state = {
		players : ["", "", "", ""],
		player_sessions: ["", "", "", ""],
		match_winners: ["", ""],
		match_losers: ["", ""],
		current_round: 0,
		matches_done: 0,
		final_ranking:["", "", "", ""],
		current_players:["", ""],
		tournament_id: "",
		current_match_id: ""
	}

	const onlineTour_matchmaking_popup = document.querySelector<HTMLDivElement>("#onlineTour_matchmaking_popup");
	const exit_tournament_button = document.querySelector<HTMLButtonElement>("#onlineTour_exit_matchmaking");
	const open_game_button = document.querySelector<HTMLButtonElement>("#onlineTour_open_game");
	const close_finalwinner_button = document.querySelector<HTMLButtonElement>("#onlineTour_close_finalwinner_popup");

	if(!onlineTour_matchmaking_popup || !exit_tournament_button)
		throw new Error("Online tournament popup elements not found");

	cleanup_previous_tournament();
	show_matchmaking_popup();

	socket.addEventListener("message", process_msg_from_socket);
	socket.addEventListener("open", handleSocketOpen);
	socket.addEventListener("close", handleSocketClose);

	exit_tournament_button.removeEventListener("click", handleExitTournament);
	exit_tournament_button.addEventListener("click", handleExitTournament);

	function process_msg_from_socket(message: MessageEvent)
	{
		const optional_msg_div = document.querySelector<HTMLDivElement>("#onlineTour_rankings_optional_msg");

		if(!optional_msg_div) throw new Error("onlinTour process msg socket elements not found");

		const msg_obj = JSON.parse(message.data);
		// console.log("RECVED FROM TOUR SOCKET: ", msg_obj);
			
		if(msg_obj.type === "tournament_status") {
			update_matchmaking_status(msg_obj);
		}
		else if(msg_obj.type === "tournament_ready") {
			Tournament_state.players = msg_obj.players;
			Tournament_state.player_sessions = msg_obj.player_sessions;
			Tournament_state.tournament_id = msg_obj.tournament_id;
			// console.log("Updated Tournament_state:", Tournament_state);
			update_bracket_display();
			hide_status_show_bracket();
			disable_back_navigation();
			onlineTour_back_nav_disabled = true;
		}
		else if(msg_obj.type === "match_ready") {
			Tournament_state.current_match_id = msg_obj.match_id;
			Tournament_state.current_players = msg_obj.players;
			Tournament_state.current_round = msg_obj.round;
			show_current_battle(msg_obj.players);
			
			// auto start the match 
			const mySession = localStorage.getItem("session") || "";
			const isInMatch = Tournament_state.player_sessions.some((session, index) => {
				const isMySession = session === mySession;
				const playerName = Tournament_state.players[index];
				const isInCurrentMatch = msg_obj.players.includes(playerName);
				return isMySession && isInCurrentMatch;
			});
			
			if (isInMatch) {
				setTimeout(() => {
					request_game_start();
				}, 3000);
			}
		}
		else if(msg_obj.type === "match_result") {
			handle_match_end(msg_obj);
		}
		else if(msg_obj.type === "tournament_complete") {
			Tournament_state.final_ranking = msg_obj.final_ranking;
			localStorage.removeItem("tournament_context");
			optional_msg_div.innerHTML = "";
			make_final_ranking();
		}
		else if(msg_obj.type === "redirect_to_game") {
			start_online_game();
		}
		else if(msg_obj.type === "player_dced") {
			Tournament_state.final_ranking = msg_obj.final_ranking;
			optional_msg_div.innerHTML = translate_text("Tournament ended: player disconnected (rating changes: +5 all, -10 leaver)");
			make_final_ranking();
			if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
				socket.close();
			}
			WS.removeInstance(socketBase);
			localStorage.removeItem("tournament_context");
			localStorage.setItem("tournament_cancelled", JSON.stringify({}));
			// const exist = localStorage.getItem("tournament_cancelled")
			// if (exist)
			// 	console.log(`1. tournament cancelled exist`);
			tournamentManagerActive = false;
		}
	}

	function update_matchmaking_status(msg_obj: any)
	{		
		const status_div = document.querySelector<HTMLDivElement>("#onlineTour_mm_status");
		const player_count_span = document.querySelector<HTMLSpanElement>("#onlineTour_player_count");
		
		if(!status_div || !player_count_span)
            return;

		const players = msg_obj.players || [];
		player_count_span.innerHTML = `${players.length}/4`;
		
		if(msg_obj.status === "Waiting for players") {
			status_div.innerHTML = `
			<div class="flex justify-center">
				<div>${translate_text("Waiting for players")}</div>
				<div class="animate-pulse [animation-delay:0ms]">.</div>
				<div class="animate-pulse [animation-delay:300ms]">.</div>
				<div class="animate-pulse [animation-delay:600ms]">.</div>
			</div>
			`;
		}
		else if(msg_obj.status === "Tournament starting") {
			status_div.innerHTML = translate_text("Tournament starting! Preparing bracket...");
		}
	}

	function update_bracket_display()
	{
		const p1_bracket = document.querySelector<HTMLDivElement>("#onlineTour_p1_bracket");
		const p2_bracket = document.querySelector<HTMLDivElement>("#onlineTour_p2_bracket");
		const p3_bracket = document.querySelector<HTMLDivElement>("#onlineTour_p3_bracket");
		const p4_bracket = document.querySelector<HTMLDivElement>("#onlineTour_p4_bracket");

		if(!p1_bracket || !p2_bracket || !p3_bracket || !p4_bracket)
            return;

		p1_bracket.innerHTML = Tournament_state.players[0] || "?";
		p2_bracket.innerHTML = Tournament_state.players[1] || "?";
		p3_bracket.innerHTML = Tournament_state.players[2] || "?";
		p4_bracket.innerHTML = Tournament_state.players[3] || "?";
	}

	function hide_status_show_bracket()
	{
		const status_section = document.querySelector<HTMLDivElement>("#onlineTour_status_section");
		const current_battle = document.querySelector<HTMLDivElement>("#onlineTour_matchmaking_currentbattle");
		
		if(status_section && current_battle) {
			status_section.classList.add("hidden");
			current_battle.classList.remove("hidden");
		}
	}

	function show_current_battle(players: string[])
	{		
		const p1_name_display = document.querySelector<HTMLDivElement>("#onlineTour_p1_matchmaking_name");
		const p2_name_display = document.querySelector<HTMLDivElement>("#onlineTour_p2_matchmaking_name");
		const currentbattle_div = document.querySelector<HTMLDivElement>("#onlineTour_matchmaking_currentbattle");
		
		if(!p1_name_display || !p2_name_display || !currentbattle_div)
			return;

		p1_name_display.innerHTML = players[0];
		p2_name_display.innerHTML = players[1];

		const mySession = localStorage.getItem("session") || "";
		
        // check if current user is in this match
		const isInMatch = Tournament_state.player_sessions.some((session, index) => {
			const isMySession = session === mySession;
			const playerName = Tournament_state.players[index];
			const isInCurrentMatch = players.includes(playerName);
			return isMySession && isInCurrentMatch;
		});

		// highlight if current player is in this match
		if (isInMatch) {
			currentbattle_div.classList.add("ring-4", "ring-yellow-400", "ring-opacity-75", "bg-yellow-400/10");
		} else {
			currentbattle_div.classList.remove("ring-4", "ring-yellow-400", "ring-opacity-75", "bg-yellow-400/10");
		}

		const startBattleButton = document.querySelector<HTMLButtonElement>("#onlineTour_open_game");
		if (startBattleButton) {
			if (isInMatch) {
				startBattleButton.textContent = translate_text("Starting match automatically...");
				startBattleButton.disabled = true;
				startBattleButton.classList.remove("hidden");
			} else {
				startBattleButton.classList.add("hidden");
			}
		}
	}

	function request_game_start()
	{
		if (socket.readyState === WebSocket.OPEN) {
			const startMessage = {
				type: "start_match"
				// match_id: Tournament_state.current_match_id,
				// tournament_id: Tournament_state.tournament_id
			}
			// console.log("Sending start match message:", startMessage);
			socket.send(JSON.stringify(startMessage));
		} else {
			console.log("Socket not open, current state:", socket.readyState);
		}
	}

	function start_online_game()
	{
		// if(onlineTour_matchmaking_popup)
		// 	onlineTour_matchmaking_popup.classList.add("hidden");
		
		const player1_name = Tournament_state.current_players[0];
		const player2_name = Tournament_state.current_players[1];
		
		const player1_index = Tournament_state.players.indexOf(player1_name);
		const player2_index = Tournament_state.players.indexOf(player2_name);
		
		const player1_session = Tournament_state.player_sessions[player1_index];
		const player2_session = Tournament_state.player_sessions[player2_index];
		
		localStorage.setItem("tournament_context", JSON.stringify({
			tournament_id: Tournament_state.tournament_id,
			current_match_id: Tournament_state.current_match_id,
			socket_url: socketBase,
			current_players: {
				player1: {
					name: player1_name,
					session: player1_session
				},
				player2: {
					name: player2_name,
					session: player2_session
				}
			},
		}));

		// use the existing online 1v1 game but with tournament context
		online_1v1_play();
	}

	function handle_match_end(msg_obj: any)
	{
		const winner = msg_obj.winner;
		const loser = msg_obj.loser;
		const round = msg_obj.round;

		// remove highlight
		const currentbattle_div = document.querySelector<HTMLDivElement>("#onlineTour_matchmaking_currentbattle");
		if (currentbattle_div) {
			currentbattle_div.classList.remove("ring-4", "ring-yellow-400", "ring-opacity-75", "bg-yellow-400/10");
		}

		if(round === 1) {
			Tournament_state.match_winners[0] = winner;
			Tournament_state.match_losers[0] = loser;
			updateBracketElement("#onlineTour_winner1_bracket", winner);
			updateBracketElement("#onlineTour_loser1_bracket", loser);
		} 
		else if(round === 2) {
			Tournament_state.match_winners[1] = winner;
			Tournament_state.match_losers[1] = loser;
			updateBracketElement("#onlineTour_winner2_bracket", winner);
			updateBracketElement("#onlineTour_loser2_bracket", loser);
		} 
		else if(round === 3) {
			Tournament_state.final_ranking[2] = winner;
			Tournament_state.final_ranking[3] = loser;
			updateBracketElement("#onlineTour_loser_final", winner);
		} 
		else if(round === 4) {
			Tournament_state.final_ranking[0] = winner;
			Tournament_state.final_ranking[1] = loser;
			updateBracketElement("#onlineTour_matchmaking_finalwinner", winner);
		}

		Tournament_state.matches_done++;
		
		// show popup again for next match/ final results
		if(onlineTour_matchmaking_popup)
			onlineTour_matchmaking_popup.classList.remove("hidden");
	}

	function updateBracketElement(selector: string, value: string)
	{
		const element = document.querySelector<HTMLDivElement>(selector);
		if(element) {
			element.innerHTML = value;
		}
	}

	function show_matchmaking_popup()
	{
		if(onlineTour_matchmaking_popup)
			onlineTour_matchmaking_popup.classList.remove("hidden");
	}

	function cleanup_previous_tournament()
	{
		const winner1_bracket = document.querySelector<HTMLDivElement>("#onlineTour_winner1_bracket");
		const winner2_bracket = document.querySelector<HTMLDivElement>("#onlineTour_winner2_bracket");
		const finalwinner_name_display = document.querySelector<HTMLDivElement>("#onlineTour_matchmaking_finalwinner");
		const currentbattle_div = document.querySelector<HTMLDivElement>("#onlineTour_matchmaking_currentbattle");
		const finalwinner_div = document.querySelector<HTMLDivElement>("#onlineTour_matchmaking_rankingdiv");
		const status_section = document.querySelector<HTMLDivElement>("#onlineTour_status_section");
		
		const loser1_bracket = document.querySelector<HTMLDivElement>("#onlineTour_loser1_bracket");
		const loser2_bracket = document.querySelector<HTMLDivElement>("#onlineTour_loser2_bracket");
		const loser_final = document.querySelector<HTMLDivElement>("#onlineTour_loser_final");
		
		const ranking_1st = document.querySelector<HTMLDivElement>("#onlineTour_ranking_1st");
		const ranking_2nd = document.querySelector<HTMLDivElement>("#onlineTour_ranking_2nd");
		const ranking_3rd = document.querySelector<HTMLDivElement>("#onlineTour_ranking_3rd");
		const ranking_4th = document.querySelector<HTMLDivElement>("#onlineTour_ranking_4th");

		const p1_bracket = document.querySelector<HTMLDivElement>("#onlineTour_p1_bracket");
		const p2_bracket = document.querySelector<HTMLDivElement>("#onlineTour_p2_bracket");
		const p3_bracket = document.querySelector<HTMLDivElement>("#onlineTour_p3_bracket");
		const p4_bracket = document.querySelector<HTMLDivElement>("#onlineTour_p4_bracket");

		if (!winner1_bracket || !winner2_bracket || !finalwinner_name_display || !currentbattle_div
			|| !finalwinner_div || !open_game_button || !close_finalwinner_button || !onlineTour_matchmaking_popup || !loser1_bracket || !loser2_bracket || !loser_final || !ranking_1st || !ranking_2nd || !ranking_3rd || !ranking_4th || !status_section || !p1_bracket || !p2_bracket || !p3_bracket || !p4_bracket)
			return;

		p1_bracket.innerHTML = "?";
		p2_bracket.innerHTML = "?";
		p3_bracket.innerHTML = "?";
		p4_bracket.innerHTML = "?";

		winner1_bracket.innerHTML = "?";
		winner2_bracket.innerHTML = "?";
		finalwinner_name_display.innerHTML = "?";

		loser1_bracket.innerHTML = "?";
		loser2_bracket.innerHTML = "?";
		loser_final.innerHTML = "?";

		Tournament_state.players = ["", "", "", ""];
		Tournament_state.player_sessions = ["", "", "", ""];
		Tournament_state.match_winners = ["", ""];
		Tournament_state.match_losers = ["", ""];
		Tournament_state.current_round = 0;
		Tournament_state.matches_done = 0;
		Tournament_state.final_ranking = ["", "", "", ""];
		Tournament_state.current_players = ["", ""];
		Tournament_state.tournament_id = "";
		Tournament_state.current_match_id = "";

		status_section.classList.remove("hidden");
		currentbattle_div.classList.add("hidden");
		finalwinner_div.classList.add("hidden");
		open_game_button.classList.add("hidden");
		close_finalwinner_button.classList.add("hidden");
		
		if (exit_tournament_button) {
			exit_tournament_button.classList.remove("hidden");
		}
		
		if (currentbattle_div) {
			currentbattle_div.classList.remove("ring-4", "ring-yellow-400", "ring-opacity-75", "bg-yellow-400/10");
		}
	}

	function make_final_ranking()
	{
		const close_finalwinner_popup_button = document.querySelector<HTMLButtonElement>("#onlineTour_close_finalwinner_popup");
		const currentbattle_div = document.querySelector<HTMLDivElement>("#onlineTour_matchmaking_currentbattle");
		const finalwinner_div = document.querySelector<HTMLDivElement>("#onlineTour_matchmaking_rankingdiv");
		const finalwinner_name_display = document.querySelector<HTMLDivElement>("#onlineTour_matchmaking_finalwinner");
		const status_section = document.querySelector<HTMLDivElement>("#onlineTour_status_section");

		const ranking_1st = document.querySelector<HTMLDivElement>("#onlineTour_ranking_1st");
		const ranking_2nd = document.querySelector<HTMLDivElement>("#onlineTour_ranking_2nd");
		const ranking_3rd = document.querySelector<HTMLDivElement>("#onlineTour_ranking_3rd");
		const ranking_4th = document.querySelector<HTMLDivElement>("#onlineTour_ranking_4th");
		
		// get new reference to the current button (might have been replaced during match)
		const current_open_game_button = document.querySelector<HTMLButtonElement>("#onlineTour_open_game");
		
		if(!current_open_game_button || !finalwinner_name_display || !close_finalwinner_popup_button || !currentbattle_div || !finalwinner_div || !ranking_1st || !ranking_2nd || !ranking_3rd || !ranking_4th || !status_section)
			throw new Error("onlineTour winnerpage elements not found");

		close_finalwinner_popup_button.removeEventListener("click", backToMenu);
		close_finalwinner_popup_button.addEventListener("click", backToMenu);

		status_section.classList.add("hidden");
		currentbattle_div.classList.add("hidden");
		finalwinner_div.classList.remove("hidden");

		// hide start battle button
		current_open_game_button.classList.add("hidden");
		
        // hide leave tournament button
		if (exit_tournament_button) {
			exit_tournament_button.classList.add("hidden");
		}
		// newCloseButton.classList.remove("hidden");
		close_finalwinner_popup_button?.classList.remove("hidden");

		finalwinner_name_display.innerHTML = Tournament_state.final_ranking[0];
		ranking_1st.innerText = Tournament_state.final_ranking[0];
		ranking_2nd.innerText = Tournament_state.final_ranking[1];
		ranking_3rd.innerText = Tournament_state.final_ranking[2];
		ranking_4th.innerText = Tournament_state.final_ranking[3];

		enable_back_navigation();
		onlineTour_back_nav_disabled = false;
	}

	window.removeEventListener("popstate", onlineTour_window_popstate);
	window.addEventListener("popstate", onlineTour_window_popstate);

	function onlineTour_window_popstate()
	{
		if(onlineTour_back_nav_disabled === true)
			return;
		// console.log(`popstate status before: ${tournamentManagerActive}`);
		socket.close();
		cleanupTournamentManager();
		// console.log(`popstate status after: ${tournamentManagerActive}`);
	}

	function handleSocketOpen() { console.log(`Connection established`); }

	function handleSocketClose() {
		console.log("Disconnected from online tournament server");
		WS.removeInstance(socketBase);
	}

	function handleExitTournament() {
		// console.log(`x status before: ${tournamentManagerActive}`);
		socket.close();
		cleanupTournamentManager();
		if (onlineTour_matchmaking_popup)
			onlineTour_matchmaking_popup.classList.add("hidden");
		// console.log(`x status after: ${tournamentManagerActive}`);
		click_pong_modes_button();
		enable_back_navigation();
		onlineTour_back_nav_disabled = false;
	}

	function backToMenu() {
		if(onlineTour_matchmaking_popup)
				onlineTour_matchmaking_popup.classList.add("hidden");
			// console.log(`backtomenu status before: ${tournamentManagerActive}`);
			socket.close();
			cleanupTournamentManager();
			// console.log(`backtomenu status after: ${tournamentManagerActive}`);
			console.log(`Completed tournament. Disconnecting...`);
			click_pong_modes_button();
	}

	function cleanupTournamentManager() {
		const close_finalwinner_popup_button = document.querySelector<HTMLButtonElement>("#onlineTour_close_finalwinner_popup");

		socket.removeEventListener("message", process_msg_from_socket);
		socket.removeEventListener("open", handleSocketOpen);
		socket.removeEventListener("close", handleSocketClose);

		if (exit_tournament_button)
			exit_tournament_button.removeEventListener("click", handleExitTournament);
		
		if (close_finalwinner_popup_button)
			close_finalwinner_popup_button?.removeEventListener("click", backToMenu);

		window.removeEventListener("popstate", onlineTour_window_popstate);

		WS.removeInstance(socketBase);
		tournamentManagerActive = false;
		localStorage.removeItem("tournament_context");
	}
}