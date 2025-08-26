import { OnlineTournament } from "../class/OnlineTournament.js";

// Create a single shared tournament manager instance
let tournamentManager = null;

const root = async function (fastify) {
    if (!tournamentManager)
        tournamentManager = new OnlineTournament(fastify);

    fastify.get("/ws-online-tournament", { websocket: true }, (connection, req) => {
        const session = req.query.session;
        const uid = req.query.uid;

        let playerInfo = {
            connection: connection,
            session:session,
            uid: uid,
            username: "", //get from db
            tournament_id: null,
            player_index: -1
        };

        let email;
        try {
            email = fastify.get_email_by_session(req);
            if (!email) {
                console.log(`Tournament: No email found for session: ${session}. Rejecting player.`);
                connection.close();
                return;
            } else {
                const user = fastify.betterSqlite3
                    .prepare("SELECT USERNAME FROM USER WHERE EMAIL = ?")
                    .get(email);

                // .get - returns object
                // user.Property - gets actual value
                if (user)
                    playerInfo.username = user.USERNAME;
                else {
                    console.log(`Tournament: No username found for email: ${email}. Rejecting player.`);
                    connection.close();
                    return;
                }
            }
        } catch(error) {
            console.error("Tournament: Error getting user info:", error);
            connection.close();
            return;
        }

        playerInfo.email = email;

        tournamentManager.addPlayer(playerInfo);

        connection.on("message", (message) => {
            try {
                const msg = JSON.parse(message.toString());

                if (msg.type === "start_match")
                    tournamentManager.handleStartMatch(playerInfo);
                else if (msg.type === "rejoin_tournament") {
                    const rejoinResult = tournamentManager.rejoinTournament(msg.tournament_id, playerInfo);
                    if (!rejoinResult) {
                        connection.send(JSON.stringify({
                            type: "rejoin_failed",
                            message: "Tournament not found or cannot rejoin"
                        }));
                    }
                }
                else if (msg.type === "game_result") {
                    tournamentManager.handleGameResult(
                        msg.tournament_id,
                        msg.match_id,
                        msg.winner_email,
                        msg.loser_email
                    )
                }
                // TESTING: test win button
                else if (msg.type === "test_game_result") {
                    console.log("Tournament: Received test game result - user wins");
                    const tournament = tournamentManager.getTournament(playerInfo.tournament_id);
                    if (tournament && tournament.current_match) {
                        const players = tournament.current_match.players;
                        const winner = players.find(p => p.session === playerInfo.session);
                        const loser = players.find(p => p.session !== playerInfo.session);
                        if (winner && loser) {
                        console.log(`Tournament: Test result - ${winner.username} wins, ${loser.username} loses`);
                        tournamentManager.handleGameResult(
                            tournament.id,
                            tournament.current_match.id,
                            winner.email,
                            loser.email 
                        );
                        } else {
                            console.error("Tournament: Could not find winner/loser players for test");
                        }
                    } else {
                        console.error("Tournament: No tournament or current match found for test");
                    }
                }
                //TESTING lose button
                else if (msg.type === "test_game_result_lose") {
                    console.log("Tournament: Received test game result - user loses");
                    const tournament = tournamentManager.getTournament(playerInfo.tournament_id);
                    if (tournament && tournament.current_match) {
                        const players = tournament.current_match.players;
                        const loser = players.find(p => p.session === playerInfo.session);
                        const winner = players.find(p => p.session !== playerInfo.session);
                        if (winner && loser) {
                            console.log(`Tournament: Test result - ${winner.username} wins, ${loser.username} loses`);
                            tournamentManager.handleGameResult(
                                tournament.id,
                                tournament.current_match.id,
                                winner.email,
                                loser.email
                            );
                        } else {
                            console.error("Tournament: Could not find winner/loser players for test");
                        }
                    } else {
                        console.error("Tournament: No tournament or current match found for test");
                    }
                }
            } catch(error) {
                console.error("Error: tournament processing: ", error);
            }
        });

        connection.on("close", () => {
            tournamentManager.removePlayer(playerInfo);
        })
    });
}

export default root;