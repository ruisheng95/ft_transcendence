/* eslint-disable @typescript-eslint/no-explicit-any */

import { display_game } from "./game-local-display_game";
import { add_history } from "./spa-navigation";

export function local_tour_manager(p1_name: string, p2_name : string, p3_name : string, p4_name : string)
{
	p1_name = p1_name || "player1";
	p2_name = p2_name || "player2";
	p3_name = p3_name || "player3";
	p4_name = p4_name || "player4";

	
	const Tournament_state = {
		players : [p1_name, p2_name, p3_name, p4_name],
		match_winners: ["", ""],
		matches_done: 0,
		match_losers: ["", ""],
		final_ranking:["", "", "", ""],
		current_players:["", ""]
	}

	const game_popup = document.querySelector<HTMLDivElement>("#game_popup");
	const localTour_matchmaking_popup = document.querySelector<HTMLDivElement>("#localTour_matchmaking_popup");
	const open_game_button = document.querySelector<HTMLButtonElement>("#localTour_open_game");
	const close_finalwinner_button = document.querySelector<HTMLButtonElement>("#localTour_close_finalwinner_popup");

	cleanup_previous_tournament();
	display_next_matchmaking_popup();

	function display_next_matchmaking_popup()
	{
		if(Tournament_state.matches_done == 0) //first game
		{
			Tournament_state.current_players[0] = p1_name;
			Tournament_state.current_players[1] = p2_name;
			show_matchmaking_popup();
		}
		else if(Tournament_state.matches_done == 1) //second game
		{
			Tournament_state.current_players[0] = p3_name;
			Tournament_state.current_players[1] = p4_name;
			show_matchmaking_popup();
		}
		else if(Tournament_state.matches_done == 2) //third game (loser's bracket)
		{
			Tournament_state.current_players[0] = Tournament_state.match_losers[0];
			Tournament_state.current_players[1] = Tournament_state.match_losers[1];
			show_matchmaking_popup();
		}
		else if(Tournament_state.matches_done == 3) //fourth game (finals)
		{
			Tournament_state.current_players[0] = Tournament_state.match_winners[0];
			Tournament_state.current_players[1] = Tournament_state.match_winners[1];
			show_matchmaking_popup();
		}
		else
		{
			make_final_ranking();
			show_matchmaking_popup();
		}
	}

	function handle_game_end(msg_obj : any)
	{
		let winner = "";
		let loser = "";

		//put in winner and losers based on results
		if(msg_obj.winner == "leftplayer")
		{
			winner = Tournament_state.current_players[0];
			loser = Tournament_state.current_players[1];
		}		
		else
		{
			winner = Tournament_state.current_players[1];
			loser = Tournament_state.current_players[0];
		}

		if(game_popup)
			game_popup.classList.add("hidden");

		if(Tournament_state.matches_done == 0) //first game
		{
			Tournament_state.match_winners[0] = winner;
			Tournament_state.match_losers[0] = loser;
		}
		else if(Tournament_state.matches_done == 1) //second game
		{
			Tournament_state.match_winners[1] = winner;
			Tournament_state.match_losers[1] = loser;
		}
		else if(Tournament_state.matches_done == 2) // third game(losers bracket)
		{
			Tournament_state.final_ranking[2] = winner;
			Tournament_state.final_ranking[3] = loser;
		}
		else if(Tournament_state.matches_done == 3) //forth game (winner bracket)
		{
			Tournament_state.final_ranking[0] = winner;
			Tournament_state.final_ranking[1] = loser;
		}
		Tournament_state.matches_done++;
		display_next_matchmaking_popup();
	}

	function show_matchmaking_popup()
	{
		const p1_name_display = document.querySelector<HTMLDivElement>("#localTour_p1_matchmaking_name");
		const p2_name_display = document.querySelector<HTMLDivElement>("#localTour_p2_matchmaking_name");

		const p1_bracket = document.querySelector<HTMLDivElement>("#localTour_p1_bracket");
		const p2_bracket = document.querySelector<HTMLDivElement>("#localTour_p2_bracket");
		const p3_bracket = document.querySelector<HTMLDivElement>("#localTour_p3_bracket");
		const p4_bracket = document.querySelector<HTMLDivElement>("#localTour_p4_bracket");
		const winner1_bracket = document.querySelector<HTMLDivElement>("#localTour_winner1_bracket");
		const winner2_bracket = document.querySelector<HTMLDivElement>("#localTour_winner2_bracket");
		const loser1_bracket = document.querySelector<HTMLDivElement>("#localTour_loser1_bracket");
		const loser2_bracket = document.querySelector<HTMLDivElement>("#localTour_loser2_bracket");
		const loser_final = document.querySelector<HTMLDivElement>("#localTour_loser_final");

		const game_popup = document.querySelector<HTMLDivElement>("#game_popup");
		const p1_name_display_ingame = document.querySelector<HTMLDivElement>("#p1_name_display");
		const p2_name_display_ingame = document.querySelector<HTMLDivElement>("#p2_name_display");
		
		if(!p1_name_display_ingame || !p2_name_display_ingame || !game_popup || !open_game_button || !localTour_matchmaking_popup || !p1_name_display || !p2_name_display || !p1_bracket || !p2_bracket || !p3_bracket || !p4_bracket || !winner1_bracket || !winner2_bracket || !loser1_bracket || !loser2_bracket || !loser_final)
			throw new Error("localTour matchmaking elements not found");

		p1_bracket.innerHTML = Tournament_state.players[0];
		p2_bracket.innerHTML = Tournament_state.players[1];
		p3_bracket.innerHTML = Tournament_state.players[2];
		p4_bracket.innerHTML = Tournament_state.players[3];

		winner1_bracket.innerHTML = Tournament_state.match_winners[0] || "?";
		winner2_bracket.innerHTML = Tournament_state.match_winners[1] || "?";
		loser1_bracket.innerHTML = Tournament_state.match_losers[0] || "?";
		loser2_bracket.innerHTML = Tournament_state.match_losers[1] || "?";
		
		if(Tournament_state.matches_done > 2) {
			loser_final.innerHTML = Tournament_state.final_ranking[2] || "?";
		}

		p1_name_display.innerHTML = Tournament_state.current_players[0]
		p2_name_display.innerHTML = Tournament_state.current_players[1];

		localTour_matchmaking_popup.classList.remove("hidden");

		open_game_button.addEventListener("click", () => {
			p1_name_display_ingame.innerHTML = Tournament_state.current_players[0];
			p2_name_display_ingame.innerHTML = Tournament_state.current_players[1];
			localTour_matchmaking_popup.classList.add("hidden");
			game_popup.classList.remove("hidden");
			display_game(handle_game_end);
		});
	}

	function cleanup_previous_tournament()
	{
		const winner1_bracket = document.querySelector<HTMLDivElement>("#localTour_winner1_bracket");
		const winner2_bracket = document.querySelector<HTMLDivElement>("#localTour_winner2_bracket");
		const finalwinner_name_display = document.querySelector<HTMLDivElement>("#localTour_matchmaking_finalwinner");
		const currentbattle_div = document.querySelector<HTMLDivElement>("#localTour_matchmaking_currentbattle");
		const finalwinner_div = document.querySelector<HTMLDivElement>("#localTour_matchmaking_rankingdiv");
		const game_popup = document.querySelector<HTMLDivElement>("#game_popup");
		
		const loser1_bracket = document.querySelector<HTMLDivElement>("#localTour_loser1_bracket");
		const loser2_bracket = document.querySelector<HTMLDivElement>("#localTour_loser2_bracket");
		const loser_final = document.querySelector<HTMLDivElement>("#localTour_loser_final");
		
		const ranking_1st = document.querySelector<HTMLDivElement>("#localTour_ranking_1st");
		const ranking_2nd = document.querySelector<HTMLDivElement>("#localTour_ranking_2nd");
		const ranking_3rd = document.querySelector<HTMLDivElement>("#localTour_ranking_3rd");
		const ranking_4th = document.querySelector<HTMLDivElement>("#localTour_ranking_4th");

		if (!winner1_bracket || !winner2_bracket || !finalwinner_name_display || !currentbattle_div
			|| !finalwinner_div || !open_game_button || !close_finalwinner_button || !game_popup || !localTour_matchmaking_popup || !loser1_bracket || !loser2_bracket || !loser_final || !ranking_1st || !ranking_2nd || !ranking_3rd || !ranking_4th)
			throw new Error("One or more required elements are missing from the DOM");

		winner1_bracket.innerHTML = "?";
		winner2_bracket.innerHTML = "?";
		finalwinner_name_display.innerHTML = "?";

		loser1_bracket.innerHTML = "?";
		loser2_bracket.innerHTML = "?";
		loser_final.innerHTML = "?";

		currentbattle_div.classList.remove("hidden");
		finalwinner_div.classList.add("hidden");
		open_game_button.classList.remove("hidden");
		close_finalwinner_button.classList.add("hidden");
		game_popup.classList.add("hidden");
		localTour_matchmaking_popup.classList.add("hidden");
	}

	function make_final_ranking()
	{
		const close_finalwinner_popup_button = document.querySelector<HTMLButtonElement>("#localTour_close_finalwinner_popup");
		const currentbattle_div = document.querySelector<HTMLDivElement>("#localTour_matchmaking_currentbattle");
		const finalwinner_div = document.querySelector<HTMLDivElement>("#localTour_matchmaking_rankingdiv");
		const finalwinner_name_display = document.querySelector<HTMLDivElement>("#localTour_matchmaking_finalwinner");

		const ranking_1st = document.querySelector<HTMLDivElement>("#localTour_ranking_1st");
		const ranking_2nd = document.querySelector<HTMLDivElement>("#localTour_ranking_2nd");
		const ranking_3rd = document.querySelector<HTMLDivElement>("#localTour_ranking_3rd");
		const ranking_4th = document.querySelector<HTMLDivElement>("#localTour_ranking_4th");
		
		if(!open_game_button || !close_finalwinner_button || !open_game_button || !finalwinner_name_display || !close_finalwinner_popup_button || !currentbattle_div || !finalwinner_div || !ranking_1st || !ranking_2nd || !ranking_3rd || !ranking_4th)
			throw new Error("localTour winnerpage elements not found");

		close_finalwinner_popup_button.addEventListener("click", () =>{
			if(localTour_matchmaking_popup)
				localTour_matchmaking_popup.classList.add("hidden");
			add_history("");
		});

		currentbattle_div.classList.add("hidden");
		finalwinner_div.classList.remove("hidden");

		open_game_button.classList.add("hidden");
		close_finalwinner_button.classList.remove("hidden");

		finalwinner_name_display.innerHTML = Tournament_state.final_ranking[0];
		ranking_1st.innerHTML = `1st ${Tournament_state.final_ranking[0]}`;
		ranking_2nd.innerHTML = `2nd ${Tournament_state.final_ranking[1]}`;
		ranking_3rd.innerHTML = `3rd ${Tournament_state.final_ranking[2]}`;
		ranking_4th.innerHTML = `4th ${Tournament_state.final_ranking[3]}`;
	}
}