/* eslint-disable @typescript-eslint/no-explicit-any */

import { online_1v1_play } from "./game-online-1v1";
import { add_history } from "./spa-navigation";
import { terminate_history } from "./spa-navigation";

export function online_tour_manager()
{
    // check if tournament exists
    // make sure players return back to tournament bracket after a match
	const tournamentContext = localStorage.getItem("tournament_context");
	const preservedState = (window as any).tournamentState;

	if (tournamentContext && preservedState && preservedState.socket) {		
		// restore the preserved tournament state (tournament bracket page)
		const onlineTour_matchmaking_popup = preservedState.popup;
		
		// clean up temporary storage
		localStorage.removeItem("tournament_context");
		delete (window as any).tournamentState;
		
		// show the tournament popup again
		if (onlineTour_matchmaking_popup) {
			onlineTour_matchmaking_popup.classList.remove("hidden");
		}
		return;
	}
	
	let isReturningFromGame = false;
	let savedTournamentId = "";
	
	if (tournamentContext) {
		isReturningFromGame = true;
		const context = JSON.parse(tournamentContext);
		savedTournamentId = context.tournament_id; // onlyremove context after reconnecting
	}

	// Add unique ID to test using the same browser
	const sessionParam = localStorage.getItem("session") || "";
	const uniqueId = Date.now() + Math.random(); 
	const socketUrl = `${import.meta.env.VITE_SOCKET_URL}/ws-online-tournament?session=${sessionParam}&uid=${uniqueId}`;
	const socket = new WebSocket(socketUrl);
	
	const Tournament_state = {
		players : ["", "", "", ""],
		player_emails: ["", "", "", ""],
		match_winners: ["", ""],
		match_losers: ["", ""],
		current_round: 0,
		matches_done: 0,
		final_ranking:["", "", "", ""],
		current_players:["", ""],
		my_player_index: -1,
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
	socket.addEventListener("open", () => {
		// rejoin existing tournament after a match
		if (isReturningFromGame && savedTournamentId) {
			console.log(`Attempting to rejoin tournament ${savedTournamentId}`);
			socket.send(JSON.stringify({
				type: "rejoin_tournament",
				tournament_id: savedTournamentId
			}));
		}
	});

	socket.addEventListener("close", () => {
		console.log("Disconnected from online tournament server");
	});

	exit_tournament_button.addEventListener("click", () => {
		socket.close();
		onlineTour_matchmaking_popup.classList.add("hidden");
		terminate_history();
	});

	function process_msg_from_socket(message: MessageEvent)
	{
		const msg_obj = JSON.parse(message.data);
			
		if(msg_obj.type === "tournament_status") {
			update_matchmaking_status(msg_obj);
		}
		else if(msg_obj.type === "player_assigned") {
			Tournament_state.my_player_index = msg_obj.player_index;
			Tournament_state.tournament_id = msg_obj.tournament_id;
			
			// if rejoining after a match - clean up the context
			if (isReturningFromGame && savedTournamentId === msg_obj.tournament_id) {
				localStorage.removeItem("tournament_context");
				isReturningFromGame = false;
			}
		}
		else if(msg_obj.type === "tournament_ready") {
			Tournament_state.players = msg_obj.players;
			Tournament_state.player_emails = msg_obj.player_emails;
			Tournament_state.tournament_id = msg_obj.tournament_id;
			update_bracket_display();
			hide_status_show_bracket();
		}
		else if(msg_obj.type === "match_ready") {
			Tournament_state.current_match_id = msg_obj.match_id;
			Tournament_state.current_players = msg_obj.players;
			Tournament_state.current_round = msg_obj.round;
			show_current_battle(msg_obj.players);
		}
		else if(msg_obj.type === "match_result") {
			handle_match_end(msg_obj);
		}
		else if(msg_obj.type === "tournament_complete") {
			Tournament_state.final_ranking = msg_obj.final_ranking;
			make_final_ranking();
		}
		else if(msg_obj.type === "redirect_to_game") {
            // 1v1 match round
			start_online_game();
		}
		else if(msg_obj.type === "rejoin_failed") {
			localStorage.removeItem("tournament_context");
			isReturningFromGame = false;
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
				<div>Waiting for players</div>
				<div class="animate-pulse [animation-delay:0ms]">.</div>
				<div class="animate-pulse [animation-delay:300ms]">.</div>
				<div class="animate-pulse [animation-delay:600ms]">.</div>
			</div>
			`;
		}
		else if(msg_obj.status === "Tournament starting") {
			status_div.innerHTML = "Tournament starting! Preparing bracket...";
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
		
		if(!p1_name_display || !p2_name_display)
			return;

		p1_name_display.innerHTML = players[0];
		p2_name_display.innerHTML = players[1];

		const myEmail = localStorage.getItem("session") || "";
		
        // only battling player will see start button
		const isInMatch = Tournament_state.player_emails.some((email, index) => {
			const isMyEmail = email === myEmail;
			const playerName = Tournament_state.players[index];
			const isInCurrentMatch = players.includes(playerName);
			return isMyEmail && isInCurrentMatch;
		});

		handleStartBattleButton(isInMatch);
	}

	function handleStartBattleButton(shouldShow: boolean) {
		const startBattleButton = document.querySelector<HTMLButtonElement>("#onlineTour_open_game");
		if (!startBattleButton)
			return;
		
		if (shouldShow) {
			startBattleButton.classList.remove("hidden");
			
			// Clear any existing event listeners by cloning
			const newButton = startBattleButton.cloneNode(true) as HTMLButtonElement;
			startBattleButton.parentNode?.replaceChild(newButton, startBattleButton);
			
			newButton.addEventListener("click", () => {
				request_game_start();
			});
		} else {
			startBattleButton.classList.add("hidden");
		}
	}

	function request_game_start()
	{
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: "start_match",
				match_id: Tournament_state.current_match_id,
				tournament_id: Tournament_state.tournament_id
			}));
		}
	}

	function start_online_game()
	{
		if(onlineTour_matchmaking_popup)
			onlineTour_matchmaking_popup.classList.add("hidden");
		
		// Get the current match players and their emails
		const player1_name = Tournament_state.current_players[0];
		const player2_name = Tournament_state.current_players[1];
		
		// Find their emails in the player_emails array based on their names
		const player1_index = Tournament_state.players.indexOf(player1_name);
		const player2_index = Tournament_state.players.indexOf(player2_name);
		
		const player1_email = Tournament_state.player_emails[player1_index];
		const player2_email = Tournament_state.player_emails[player2_index];
		
		// Store tournament context AND the original socket reference
		localStorage.setItem("tournament_context", JSON.stringify({
			tournament_id: Tournament_state.tournament_id,
			current_match_id: Tournament_state.current_match_id,
			socket_url: `${import.meta.env.VITE_SOCKET_URL}/ws-online-tournament`,
			current_players: {
				player1: {
					name: player1_name,
					email: player1_email
				},
				player2: {
					name: player2_name,
					email: player2_email
				}
			},
			preserve_tournament_connection: true // Flag to indicate we should preserve the connection
		}));
		
		// Store a reference to the current tournament state and socket in a global variable
		// so we can restore it when coming back from the game
		(window as any).tournamentState = {
			socket: socket,
			state: Tournament_state,
			popup: onlineTour_matchmaking_popup
		};
		
		// Use the existing online 1v1 game but with tournament context
		online_1v1_play(); // Start the online 1v1 game
	}

	function handle_match_end(msg_obj: any)
	{
		const winner = msg_obj.winner;
		const loser = msg_obj.loser;
		const round = msg_obj.round;

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

		if (!winner1_bracket || !winner2_bracket || !finalwinner_name_display || !currentbattle_div
			|| !finalwinner_div || !open_game_button || !close_finalwinner_button || !onlineTour_matchmaking_popup || !loser1_bracket || !loser2_bracket || !loser_final || !ranking_1st || !ranking_2nd || !ranking_3rd || !ranking_4th || !status_section)
			return;

		winner1_bracket.innerHTML = "?";
		winner2_bracket.innerHTML = "?";
		finalwinner_name_display.innerHTML = "?";

		loser1_bracket.innerHTML = "?";
		loser2_bracket.innerHTML = "?";
		loser_final.innerHTML = "?";

		status_section.classList.remove("hidden");
		currentbattle_div.classList.add("hidden");
		finalwinner_div.classList.add("hidden");
		open_game_button.classList.add("hidden");
		close_finalwinner_button.classList.add("hidden");
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
		
		if(!current_open_game_button || !close_finalwinner_button || !finalwinner_name_display || !close_finalwinner_popup_button || !currentbattle_div || !finalwinner_div || !ranking_1st || !ranking_2nd || !ranking_3rd || !ranking_4th || !status_section)
			throw new Error("onlineTour winnerpage elements not found");

		// remove existing event listeners to avoid duplicates
		const newCloseButton = close_finalwinner_popup_button.cloneNode(true) as HTMLButtonElement;
		close_finalwinner_popup_button.parentNode?.replaceChild(newCloseButton, close_finalwinner_popup_button);
		
		newCloseButton.addEventListener("click", () =>{
			if(onlineTour_matchmaking_popup)
				onlineTour_matchmaking_popup.classList.add("hidden");
			socket.close();
			add_history("");
		});

		status_section.classList.add("hidden");
		currentbattle_div.classList.add("hidden");
		finalwinner_div.classList.remove("hidden");

		// hide start battle button
		current_open_game_button.classList.add("hidden");
		
        // hide leave tournament button
		if (exit_tournament_button) {
			exit_tournament_button.classList.add("hidden");
		}
		newCloseButton.classList.remove("hidden");

		finalwinner_name_display.innerHTML = Tournament_state.final_ranking[0];
		ranking_1st.innerText = Tournament_state.final_ranking[0];
		ranking_2nd.innerText = Tournament_state.final_ranking[1];
		ranking_3rd.innerText = Tournament_state.final_ranking[2];
		ranking_4th.innerText = Tournament_state.final_ranking[3];
	}
}