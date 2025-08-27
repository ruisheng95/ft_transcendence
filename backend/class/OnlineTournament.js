// # - private class
export class OnlineTournament {
    #fastify = null;
    #waitingPlayers = []; 
    #tournamentCounter = 0;
    #tournaments = new Map(); // store tournament_id -> tournament object

    constructor(fastify) {
        this.#fastify = fastify;
    }

    addPlayer(playerInfo) {
        const existingPlayer = this.#waitingPlayers.find(player => player.session === playerInfo.session);
        if (!existingPlayer) {
            this.#waitingPlayers.push(playerInfo);
        } else {
            // close old connection if still open
            // replace old connection with new one (reconnect player to game lobby)
            const index = this.#waitingPlayers.findIndex(player => player.session === playerInfo.session);
            if (index !== -1) {
                if (this.#waitingPlayers[index].connection.readyState === 1)
                    this.#waitingPlayers[index].connection.close();
            }
            this.#waitingPlayers[index] = playerInfo;
        }

        // send tournament status to frontend (for UI updates)
        this.#sendTournamentStatus();

        // send player index in tournament
        const playerIndex = this.#waitingPlayers.findIndex(player => player.session === playerInfo.session);
        const assignPlayerMsg = {
            type: "player_assigned",
            player_index: playerIndex,
            tournament_id: null
        };
        playerInfo.connection.send(JSON.stringify(assignPlayerMsg));

        // check if there are 4 players
        // if  4 players - start tournament
        if (this.#waitingPlayers.length >= 4)
            this.#startTournament();
    }

    handleStartMatch(playerInfo) {
        // .get - return the values (object) stored in associated tournament_id
        const current_tournament = this.#tournaments.get(playerInfo.tournament_id);
        if (!current_tournament || !current_tournament.current_match)
            return;

        // .some - return boolean
        //       - check existence only
        const isInMatch = current_tournament.current_match.players.some(player => player.session === playerInfo.session);
        if (!isInMatch)
            return;

        console.log(`Tournament: ${playerInfo.username} starting match ${current_tournament.current_match.type}`);

        // redirect to 1v1
        playerInfo.connection.send(JSON.stringify({
            type: "redirect_to_game",
            game_url: `/game/1v1?tournament=${current_tournament.id}&match=${current_tournament.current_match.id}`
        }));
    }

    rejoinTournament(tournament_id, playerInfo) {
        const current_tournament = this.#tournaments.get(tournament_id);
        if (!current_tournament)
            return false;

        const existingPlayer = current_tournament.players.find(p => p.session === playerInfo.session);
        if (!existingPlayer)
            return false;

        existingPlayer.connection = playerInfo.connection;
        playerInfo.tournament_id = tournament_id;

        // send current player assignment
        playerInfo.connection.send(JSON.stringify({
            type: "player_assigned",
            player_index: current_tournament.players.findIndex(p => p.session === playerInfo.session),
            tournament_id: tournament_id
        }));

        // send tournament state
        playerInfo.connection.send(JSON.stringify({
            type: "tournament_ready",
            players: current_tournament.players.map(p => p.username),
            player_emails: current_tournament.players.map(p => p.session)
        }));

        if (current_tournament.current_match) {
            playerInfo.connection.send(JSON.stringify({
                type: "match_ready",
                match_id: current_tournament.current_match.id,
                players: current_tournament.current_match.players.map(p => p.username),
                round: current_tournament.current_match.round
            }));
        }

        return true;
    }

    handleGameResult(tournament_id, match_id, winner_email, loser_email) {
        const current_tournament = this.#tournaments.get(tournament_id);
        if (!current_tournament || !current_tournament.current_match || current_tournament.current_match.id !== match_id)
            return;

        const winner = current_tournament.players.find(player => player.email === winner_email);
        const loser = current_tournament.players.find(player => player.email === loser_email);

        if (!winner || !loser) {
            console.log(`Tournament: Could not find players for result: ${winner_email} vs ${loser_email}`);
            return;
        }

        this.#processMatchResult(current_tournament, winner, loser);
    }

    removePlayer(playerInfo) {
        // handle disconnect in waiting lobby
        const waitingIndex = this.#waitingPlayers.findIndex(player => player.session === playerInfo.session);
        if (waitingIndex !== -1) {
            this.#waitingPlayers.splice(waitingIndex, 1);
            this.#sendTournamentStatus();
            return;
        }

        // handle disconnect during active tournament
        if (playerInfo.tournament_id) {
            const tournament = this.#tournaments.get(playerInfo.tournament_id);
            if (tournament) {
                // implement later
            }
        }
    }

    // TESTING
    getTournament(tournament_id) {
        return this.#tournaments.get(tournament_id);
    }

    #sendTournamentStatus() {
        const statusMsg = {
            type: "tournament_status",
            status: this.#waitingPlayers.length < 4 ? "Waiting for players" : "Tournament starting",
            players: this.#waitingPlayers.map(player => player.username),
            player_count: this.#waitingPlayers.length
        };
        
        // only send if connection is open
        this.#waitingPlayers.forEach(player => {
            if (player.connection.readyState === 1)
                player.connection.send(JSON.stringify(statusMsg));
        });
    }

    #startTournament() {
        this.#tournamentCounter++;
        const tournamentId = `tournament_${this.#tournamentCounter}`;

        // get the first 4 waiting players
        const tournamentPlayers = this.#waitingPlayers.splice(0,4);

        const tournament = {
            id: tournamentId,
            players: tournamentPlayers,
            rounds: {
                round1: {
                    players: [tournamentPlayers[0], tournamentPlayers[1]],
                    winner: null,
                    loser: null,
                    completed: false
                },
                round2: {
                    players: [tournamentPlayers[2], tournamentPlayers[3]],
                    winner: null,
                    loser: null,
                    completed: false
                },
                round3: {
                    players: [],
                    winner: null,
                    loser: null,
                    completed: false
                },
                round4 : {
                    players: [],
                    winner: null,
                    loser: null,
                    completed: false
                }
            },
            current_round: 1,
            current_match: null,
            status: "active",
            final_ranking: ["", "", "", ""]
        }

        this.#tournaments.set(tournamentId, tournament);

        tournamentPlayers.forEach((player, index) => {
            player.tournament_id = tournamentId;
            player.playerIndex = index;
        });

        const readyMsg = {
            type: "tournament_ready",
            tournament_id: tournamentId,
            players: tournamentPlayers.map(player => player.username),
            player_emails: tournamentPlayers.map(player => player.session)
        };

        tournamentPlayers.forEach(player => {
            if (player.connection.readyState === 1)
                player.connection.send(JSON.stringify(readyMsg));
        });

        setTimeout(() => {
            this.#startRound(tournament, 1);
        }, 3000);
    }

    #startRound(tournament, roundNumber) {
        let round;
        let roundKey = `round${roundNumber}`;

        switch(roundNumber) {
            case 1:
                round = tournament.rounds.round1;
                break;
            case 2:
                round = tournament.rounds.round2;
                break;
            case 3:
                round = tournament.rounds.round3;
                break;
            case 4:
                round = tournament.rounds.round4;
                break;
            default:
                console.log(`Error: invalid tournament round: ${roundNumber}`);
                return;
        }

        // make sure exactly 2 players are assigned
        if (!round || !round.players || round.players.length !== 2) {
            console.log(`Error: round ${roundNumber}: invalid number of players`);
            return;
        }

        tournament.current_round = roundNumber;
        tournament.current_match = {
            type: roundKey,
            round: roundNumber,
            players: round.players,
            id: `${tournament.id}_round${roundNumber}_${Date.now()}`
        }

        const matchMsg = {
            type: "match_ready",
            match_id: tournament.current_match.id,
            tournament_id: tournament.id,
            round: roundNumber,
            players: round.players.map(player => player.username)
        }

        // notify all players
        tournament.players.forEach(player => {
            if (player.connection.readyState === 1)
                player.connection.send(JSON.stringify(matchMsg));

        });
    }

    #processMatchResult(tournament, winner, loser) {
        if (!tournament.current_match)
            return;
    
        const match = tournament.current_match;
        const roundNumber = match.round;

        console.log(`Tournament: Round ${roundNumber} result: ${winner.username} defeats ${loser.username}`);

        // Update round results
        const round = tournament.rounds[`round${roundNumber}`];
        round.winner = winner;
        round.loser = loser;
        round.completed = true;

        const resultMsg = {
            type: "match_result",
            match_id: match.id,
            tournament_id: tournament.id,
            round: roundNumber,
            winner: winner.username,
            loser: loser.username
        }

        tournament.players.forEach(player => {
            if (player.connection.readyState === 1)
                player.connection.send(JSON.stringify(resultMsg));
        });

        this.#setupNextRound(tournament, roundNumber);

        tournament.current_match = null;
    }

    #setupNextRound(tournament, completedRound) {
        if (completedRound === 1) {
            setTimeout(() => {
                this.#startRound(tournament, 2);
            }, 3000);
        }
        else if (completedRound === 2) {
            tournament.rounds.round3.players = [
                tournament.rounds.round1.loser,
                tournament.rounds.round2.loser
            ];
            setTimeout(() => {
                this.#startRound(tournament, 3);
            }, 3000);
        }
        else if (completedRound === 3) {
            tournament.rounds.round4.players = [
                tournament.rounds.round1.winner,
                tournament.rounds.round2.winner
            ];
            setTimeout(() => {
                this.#startRound(tournament, 4);
            }, 3000);
        }
        else if (completedRound === 4)
            this.#completeTournament(tournament);
    }

    #completeTournament(tournament) {
        tournament.final_ranking = [
            tournament.rounds.round4.winner.username,
            tournament.rounds.round4.loser.username,
            tournament.rounds.round3.winner.username,
            tournament.rounds.round3.loser.username
        ];

        const completeMsg = {
            type: "tournament_complete",
            tournament_id: tournament.id,
            final_ranking: tournament.final_ranking
        };

        tournament.players.forEach(player => {
            if (player.connection.readyState === 1)
                player.connection.send(JSON.stringify(completeMsg));
        });

        this.#updateTournamentStats(tournament);
        this.#tournaments.delete(tournament.id);
    }

    #updateTournamentStats(tournament) {
        try {
            const firstPlace = tournament.rounds.round4.winner;
            const secondPlace = tournament.rounds.round4.loser;
            const thirdPlace = tournament.rounds.round3.winner;
            const fourthPlace = tournament.rounds.round3.loser;

            // 1st place
            // Rating: +15
            // Total win: +1
            // Streak: +1
            this.#fastify.betterSqlite3
                .prepare("UPDATE USER SET TOTAL_WIN = TOTAL_WIN + 1, WINNING_STREAK = WINNING_STREAK + 1, RATING = RATING + 15 WHERE EMAIL = ?")
                .run(firstPlace.email);

            // 2nd place
            // Rating: +10
            // Total win: +0
            // Streak: no changes
            this.#fastify.betterSqlite3
                .prepare("UPDATE USER SET RATING = RATING + 10 WHERE EMAIL = ?")
                .run(secondPlace.email);

            // 3rd place
            // Rating: +5
            // Total win: +0
            // Streak: no changes
            this.#fastify.betterSqlite3
                .prepare("UPDATE USER SET RATING = RATING + 5 WHERE EMAIL = ?")
                .run(thirdPlace.email);

            // 4th place
            // Rating: -5
            // Total lose: +1
            // Streak: reset to 0
            this.#fastify.betterSqlite3
                .prepare("UPDATE USER SET TOTAL_LOSE = TOTAL_LOSE + 1, WINNING_STREAK = 0, RATING = CASE WHEN RATING > 5 THEN RATING - 5 ELSE 0 END WHERE EMAIL = ?")
                .run(fourthPlace.email);

            const curr_date = new Date().toLocaleDateString();
            this.#fastify.betterSqlite3
                .prepare("INSERT INTO PONG_MATCH (date, match_type, user1_email, user1_result, user2_email, user2_result, user3_email, user3_result, user4_email, user4_result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                .run(
                curr_date, 
                "Tournament", 
                firstPlace.email, 1, 
                secondPlace.email, 2, 
                thirdPlace.email, 3,
                fourthPlace.email, 4
                );

            console.log(`Tournament: Stats updated successfully`);
        } catch(error) {
            console.error("Error updating tournament stats:", error);
        }
    }

}