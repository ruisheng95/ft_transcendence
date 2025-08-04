// current to do list:
// JWT token processing and profile initialisation
// getting and sending player profile JSON object
// getting and sending player frens JSON
// storing the name and pfp after profile config
// check for duplicate names for profile config
// send server player list for addfrens
// rmb to send back the friends list whenever it changes

const root = async function (fastify) {
  fastify.get(
    "/ws_profile",
    { websocket: true, onRequest: fastify.verify_session },
    async (connection, request) => {
      connection.on("message", recv_msg);
      //functions

      function recv_msg(message) {
        const message_obj = JSON.parse(message.toString());
        request.log.info(message_obj, "Received:");

        if (message_obj.type === "get_player_profile") send_player_profile();
        else if (message_obj.type === "get_player_friends") send_fren_list();
        else if (message_obj.type === "modify_profile")
          modify_profile(message_obj);
        else if (message_obj.type === "get_server_players")
          send_server_players_for_addfrens(message_obj.name);
        else if (message_obj.type === "add_friend_name")
          add_friend(message_obj.name);
        else if (message_obj.type === "remove_friend_name")
          remove_friend(message_obj.name);
        else if (message_obj.type === "logout") logout();
		else if (message_obj.type === "verify_rf_input")
			check_remove_fren_input(message_obj.input);
		else if (message_obj.type === "get_playerstats")
			send_playerstats();
      }

	  function send_playerstats()
	  {
		const email = fastify.get_email_by_session(request);
        const { RATING, WINNING_STREAK, TOTAL_WIN, TOTAL_LOSE } = fastify.betterSqlite3
          .prepare("SELECT RATING, WINNING_STREAK, TOTAL_WIN, TOTAL_LOSE FROM USER WHERE EMAIL = ?")
          .get(email);
        const ret_obj = {
          type: "playerstats_info",
          rating: RATING,
          winning_streak: WINNING_STREAK,
		  total_win: TOTAL_WIN,
		  total_lose: TOTAL_LOSE
        };
        connection.send(JSON.stringify(ret_obj));
	  }

      function send_player_profile() {
        const email = fastify.get_email_by_session(request);
        const { USERNAME, AVATAR } = fastify.betterSqlite3
          .prepare("SELECT EMAIL, USERNAME, AVATAR FROM USER WHERE EMAIL = ?")
          .get(email);
        const player_profile = {
          type: "player_profile",
          username: USERNAME,
          pfp: AVATAR,
        };
        connection.send(JSON.stringify(player_profile));
      }

      function send_fren_list() {
        const userEmail = fastify.get_email_by_session(request);
      
        const friendRows = fastify.betterSqlite3
          .prepare("SELECT FRIEND_EMAIL FROM FRIEND_LIST WHERE USER_EMAIL = ?")
          .all(userEmail);

        const onlineEmails = new Set(Object.values(fastify.conf.session));

        const friends = friendRows.map(row => {
          const friend = fastify.betterSqlite3
            .prepare("SELECT USERNAME, AVATAR FROM USER WHERE EMAIL = ?")
            .get(row.FRIEND_EMAIL);
          
          const isOnline = onlineEmails.has(row.FRIEND_EMAIL);
      
          return {
            username: friend.USERNAME,
            pfp: friend.AVATAR,
            status: isOnline ? "online" : "offline",
          };
        });
      
        const friends_obj = {
          type: "player_friends",
          friends: friends,
        };
      
        connection.send(JSON.stringify(friends_obj));
        //console.log(friends_obj);
      }
      

      function send_server_players_for_addfrens(search_input_name) {
        let error_str = "";
        if(search_input_name != "")
        {
          error_str = check_valid_input_for_search(search_input_name);
          if(error_str != "")
          {
            const ret_obj = {
              type: "matching_server_players",
              error_msg: error_str
            }
            connection.send(JSON.stringify(ret_obj));
            return;
          }
        }

        try {
        const userEmail = fastify.get_email_by_session(request);
        
        if (!userEmail) {
            const ret_obj = {
                type: "matching_server_players",
                error_msg: "Invalid session"
            }
            connection.send(JSON.stringify(ret_obj));
            return;
        }

        let allMatchingPlayers;
        
        if (search_input_name === "") {
            allMatchingPlayers = fastify.betterSqlite3
                .prepare("SELECT EMAIL, USERNAME, AVATAR FROM USER WHERE EMAIL != ?")
                .all(userEmail);
        } else {
            allMatchingPlayers = fastify.betterSqlite3
                .prepare("SELECT EMAIL, USERNAME, AVATAR FROM USER WHERE USERNAME LIKE ? AND EMAIL != ?")
                .all(search_input_name + '%', userEmail);
        }

        const currentFriends = fastify.betterSqlite3
            .prepare("SELECT FRIEND_EMAIL FROM FRIEND_LIST WHERE USER_EMAIL = ?")
            .all(userEmail);
        
        const friendEmails = new Set(currentFriends.map(friend => friend.FRIEND_EMAIL));

        const availablePlayers = allMatchingPlayers
            .filter(player => !friendEmails.has(player.EMAIL))
            .map(player => {
              console.log('Player data from DB:', player);
              return {
                username: player.USERNAME,
                pfp: player.AVATAR,
              };
            });

        const ret_obj = {
            type: "matching_server_players",
            players: availablePlayers,
        };

        console.log('Final object being sent:', JSON.stringify(ret_obj, null, 2));
        connection.send(JSON.stringify(ret_obj));
        console.log(`Found ${availablePlayers.length} matching players for search: "${search_input_name}"`);
        console.log('Sending to frontend:', ret_obj); 

        } catch (error) {
            console.error('Error fetching server players:', error);
            const ret_obj = {
                type: "matching_server_players",
                error_msg: "Database error occurred"
            }
            connection.send(JSON.stringify(ret_obj));
        }
      }

      function modify_profile(message_obj) {
        //console.log(message_obj);

        const name = message_obj.name;
        const pfp = message_obj.pfp;

        let error_str = "";

        if (name !== null && name !== undefined && name !== "") {
            error_str = check_valid_input_for_update(name);
        } else if (name === "" || (name === null && (pfp === null || pfp === undefined))) {
            error_str = "please provide either a name or avatar to update";
        }

        if (error_str != "") {
          const ret_obj = {
            type: "modify_profile_status",
            status: "failure",
            error_msg: error_str,
            name: message_obj.name,
            pfp: message_obj.pfp,
          };
          connection.send(JSON.stringify(ret_obj));
        } else {

          const email = fastify.get_email_by_session(request);

          try {
            // console.log("Updating user:", email);

            const currentUser = fastify.betterSqlite3
                .prepare("SELECT USERNAME, AVATAR FROM USER WHERE EMAIL = ?")
                .get(email);

            if (!currentUser) {
                throw new Error("User not found");
            }

            const newUsername = name || currentUser.USERNAME;
            const newAvatar = (pfp !== null && pfp !== undefined) ? pfp : currentUser.AVATAR;

            // console.log("Current data:", currentUser);
            // console.log("New data:", { username: newUsername, avatar: newAvatar });

            const stmt = fastify.betterSqlite3.prepare(
                `UPDATE USER SET USERNAME = ?, AVATAR = ? WHERE EMAIL = ?`
            );
            stmt.run(newUsername, newAvatar, email);

            const ret_obj = {
                type: "modify_profile_status",
                status: "success",
                error_msg: "",
                name: newUsername,
                pfp: newAvatar,
            };

            connection.send(JSON.stringify(ret_obj));

          } catch (err) {
              console.error("DB Error:", err.message);

              const ret_obj = {
                  type: "modify_profile_status",
                  status: "failure",
                  error_msg: "server error",
                  name: name,
                  pfp: pfp,
              };

              connection.send(JSON.stringify(ret_obj));
          }
        }
      }

      function check_valid_input_for_update(name) {
        if (name.length < 5) return "name must be minimum 5 characters";

        if (name.length > 30) return "name must be maximum 30 characters";

        for (let i = 0; i < name.length; i++) {
          const code = name.charCodeAt(i);
          if (
            !(
              (
                (code >= 48 && code <= 57) || // nums 0-9
                (code >= 65 && code <= 90) || // big chars A-Z
                (code >= 97 && code <= 122) || // small chars a-z
                code === 95
              ) // underscore _
            )
          )
            return "only letters, numbers, and '_' allowed";
        }

        try {
          const stmt = fastify.betterSqlite3.prepare(`SELECT EMAIL FROM USER WHERE USERNAME = ?`);
          const result = stmt.get(name);
          if (result) {
            return "username already exists";
          }
        } catch (err) {
          console.error("Error checking duplicate username:", err);
          return "internal server error";
        }

        return "";
      }

      function check_valid_input_for_search(name) {
        if (name.length < 1) return "search input too short";
        if (name.length > 30) return "search input too long";

        for (let i = 0; i < name.length; i++) {
          const code = name.charCodeAt(i);
          if (
            !(
              (code >= 48 && code <= 57) ||
              (code >= 65 && code <= 90) ||
              (code >= 97 && code <= 122) ||
              code === 95
            )
          ) {
            return "invalid character in search input";
          }
        }

        return "";
      }


      function add_friend(add_friend_name) {
        //console.log("added friend name: ", add_friend_name);
        
        try {
            const userEmail = fastify.get_email_by_session(request);
            
            if (!userEmail) {
                const error_obj = {
                    type: "add_friend_response",
                    success: false,
                    error_msg: "Invalid session"
                };
                connection.send(JSON.stringify(error_obj));
                return;
            }
            
            const friendProfile = fastify.betterSqlite3
                .prepare("SELECT EMAIL FROM USER WHERE USERNAME = ?")
                .get(add_friend_name);
            
            if (!friendProfile) {
                const error_obj = {
                    type: "add_friend_response",
                    success: false,
                    error_msg: "User not found"
                };
                connection.send(JSON.stringify(error_obj));
                return;
            }
            
            const friendEmail = friendProfile.EMAIL;
            
            const existingFriendship = fastify.betterSqlite3
                .prepare("SELECT * FROM FRIEND_LIST WHERE USER_EMAIL = ? AND FRIEND_EMAIL = ?")
                .get(userEmail, friendEmail);
            
            if (existingFriendship) {
                const error_obj = {
                    type: "add_friend_response",
                    success: false,
                    error_msg: "Already friends with this user"
                };
                connection.send(JSON.stringify(error_obj));
                return;
            }
            
            const insertFriend = fastify.betterSqlite3.prepare(
                "INSERT INTO FRIEND_LIST (USER_EMAIL, FRIEND_EMAIL) VALUES (?, ?)"
            );
            
            insertFriend.run(userEmail, friendEmail);
            insertFriend.run(friendEmail, userEmail);
            
            console.log(`Added friendship: ${userEmail} <-> ${friendEmail}`);
            
            const success_obj = {
                type: "add_friend_response",
                success: true,
                message: `Successfully added ${add_friend_name} as friend`,
                friend_username: add_friend_name
            };
            connection.send(JSON.stringify(success_obj));
            
        } catch (error) {
            console.error('Error adding friend:', error);
            const error_obj = {
                type: "add_friend_response",
                success: false,
                error_msg: "Database error occurred"
            };
            connection.send(JSON.stringify(error_obj));
        }
    }

      function remove_friend(remove_friend_name) {
          //console.log("remove friend name: ", remove_friend_name);
          
          try {
              const userEmail = fastify.get_email_by_session(request);
              
              if (!userEmail) {
                  const error_obj = {
                      type: "remove_friend_response",
                      success: false,
                      error_msg: "Invalid session"
                  };
                  connection.send(JSON.stringify(error_obj));
                  return;
              }
              
              const friendProfile = fastify.betterSqlite3
                  .prepare("SELECT EMAIL FROM USER WHERE USERNAME = ?")
                  .get(remove_friend_name);
              
              if (!friendProfile) {
                  const error_obj = {
                      type: "remove_friend_response",
                      success: false,
                      error_msg: "User not found"
                  };
                  connection.send(JSON.stringify(error_obj));
                  return;
              }
              
              const friendEmail = friendProfile.EMAIL;
              
              const existingFriendship = fastify.betterSqlite3
                  .prepare("SELECT * FROM FRIEND_LIST WHERE USER_EMAIL = ? AND FRIEND_EMAIL = ?")
                  .get(userEmail, friendEmail);
              
              if (!existingFriendship) {
                  const error_obj = {
                      type: "remove_friend_response",
                      success: false,
                      error_msg: "You are not friends with this user"
                  };
                  connection.send(JSON.stringify(error_obj));
                  return;
              }
              
              const removeFriend = fastify.betterSqlite3.prepare(
                  "DELETE FROM FRIEND_LIST WHERE USER_EMAIL = ? AND FRIEND_EMAIL = ?"
              );
              
              removeFriend.run(userEmail, friendEmail);
              removeFriend.run(friendEmail, userEmail);
              
              console.log(`Removed friendship: ${userEmail} <-> ${friendEmail}`);
              
              const success_obj = {
                  type: "remove_friend_response",
                  success: true,
                  message: `Successfully removed ${remove_friend_name} from friends`,
                  removed_friend: remove_friend_name
              };
              connection.send(JSON.stringify(success_obj));
              
          } catch (error) {
              console.error('Error removing friend:', error);
              const error_obj = {
                  type: "remove_friend_response",
                  success: false,
                  error_msg: "Database error occurred"
              };
              connection.send(JSON.stringify(error_obj));
          }
      }

	  function check_remove_fren_input(input) {

		let error_str = "";
		for (let i = 0; i < input.length; i++) {
          const code = input.charCodeAt(i);
          if (
            !(
              (
                (code >= 48 && code <= 57) || // nums 0-9
                (code >= 65 && code <= 90) || // big chars A-Z
                (code >= 97 && code <= 122) || // small chars a-z
                code === 95
              ) // underscore _
            )
          )
            error_str = "only letters, numbers, and '_' allowed";
        }

		if(error_str != "")
		{
			const ret_obj = {
				type: "rf_input_validation",
				error_msg: error_str,
				input: input
			}
			connection.send(JSON.stringify(ret_obj));
		}
		else
		{
			const ret_obj = {
				type: "rf_input_validation",
				error_msg: "",
				input: input
			}
			connection.send(JSON.stringify(ret_obj));
		}
	  }
    
      function logout() {
        const session = request.query.session;
        delete fastify.conf.session[session];
      }
    }
  );
};

export default root;