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
                    // handle rejoin later
                }
                else if (msg.type === "game_result") {
                    tournamentManager.handleGameResult(
                        msg.tournament_id,
                        msg.match_id,
                        msg.winner_email,
                        msg.loser_email
                    )
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