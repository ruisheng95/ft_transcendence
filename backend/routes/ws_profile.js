// current to do list:
// JWT token processing and profile initialisation
// getting and sending player profile JSON object
// getting and sending player frens JSON
// storing the name and pfp after profile config
// check for duplicate names for profile config
// send server player list for addfrens
// rmb to send back the friends list whenever it changes

const root = async function (fastify) {
  const emailToWebsocketMap = {};
  fastify.get(
    "/ws_profile",
    { websocket: true, onRequest: fastify.verify_session },
    async (connection, request) => {
    connection.on("message", recv_msg);
    init_websocket_session();
    refresh_all_friend_list();
      //functions

      function recv_msg(message) {
        const message_obj = JSON.parse(message.toString());
        if (Object.keys(message_obj).length !== 0) {
          request.log.info(message_obj, "Received:");
        }

        if (message_obj.type === "get_player_profile")
          send_player_profile();
        else if (message_obj.type === "get_player_friends")
          send_fren_list();
        else if (message_obj.type === "modify_profile")
          modify_profile(message_obj);
        else if (message_obj.type === "get_server_players")
          send_server_players_for_addfrens(message_obj.name);
        else if (message_obj.type === "add_friend_name")
          add_friend(message_obj.name);
        else if (message_obj.type === "remove_friend_name")
          remove_friend(message_obj.name);
        else if (message_obj.type === "logout") 
          logout();
		    else if (message_obj.type === "get_playerstats")
          send_playerstats();
        else if (message_obj.type === "get_xoxstats")
          send_xoxstats();
        else if (message_obj.type === "add_xox_match")
          add_xox_match(message_obj);
      }

      function add_xox_match(message_obj)
      {
          const email = fastify.get_email_by_session(request);

          try {
            const stmt = fastify.betterSqlite3.prepare(`
            INSERT INTO XOX (email, left_name, left_result, right_name, right_result)
            VALUES (?, ?, ?, ?, ?)
          `);

          stmt.run(
              email,
              message_obj.left_name,
              message_obj.left_result,
              message_obj.right_name,
              message_obj.right_result,
            );

            const ret_obj = {
                type: "add_xox_match_status",
                status: "success",
            };

            connection.send(JSON.stringify(ret_obj));

          } catch (err) {

            console.error("DB Error:", err.message);
            const ret_obj = {
                type: "add_xox_match_status",
                status: "success",
            };

            connection.send(JSON.stringify(ret_obj));
          }
          
      }

      function send_xoxstats()
      {
        const email = fastify.get_email_by_session(request);
        const HISTORY = fastify.betterSqlite3
          .prepare("SELECT date, left_name, left_result, right_name, right_result FROM XOX WHERE email = ?")
          .all(email);
        
        let left_win = 0;
        let right_win = 0;
        let tie = 0;
        let total = 0;

  
        for (const entry of HISTORY) {
            if (entry.left_result === 2)
                left_win++;
            else if (entry.right_result === 2)
                right_win++
            else
                tie++;
            total++;                    
        }
    
        const left_rate = Math.trunc((left_win / total) * 100) || 0;
        const right_rate = Math.trunc((right_win / total) * 100) || 0;

        const ret_obj = {
              type: "xoxstats_info",
              tie, total,
              left_win, left_rate,
              right_win, right_rate,
              history: HISTORY
            };
        
        //console.log(ret_obj);
        connection.send(JSON.stringify(ret_obj));
      }

	  function send_playerstats()
	  {
        const email = fastify.get_email_by_session(request);

        //get stats
            const { RATING, WINNING_STREAK, TOTAL_WIN, TOTAL_LOSE } = fastify.betterSqlite3
              .prepare("SELECT RATING, WINNING_STREAK, TOTAL_WIN, TOTAL_LOSE FROM USER WHERE EMAIL = ?")
              .get(email);

        //get history
        let HISTORY = fastify.betterSqlite3
              .prepare(`SELECT date, match_type,
          user1_email, user1_result, user2_email, user2_result,
          user3_email, user3_result, user4_email, user4_result
          FROM PONG_MATCH WHERE user1_email = ? OR user2_email = ? OR
          user3_email = ? OR user4_email = ?`)
              .all(email, email, email, email);

        function get_username_from_email(email)
        {
          const { USERNAME } = fastify.betterSqlite3
          .prepare("SELECT USERNAME FROM USER WHERE EMAIL = ?")
          .get(email);

          return USERNAME;
        }

        for (const entry of HISTORY) //add them names
        {
          if(entry.user1_email) entry.user1_name = get_username_from_email(entry.user1_email);
          if(entry.user2_email) entry.user2_name = get_username_from_email(entry.user2_email);
          if(entry.user3_email) entry.user3_name = get_username_from_email(entry.user3_email);
          if(entry.user4_email) entry.user4_name = get_username_from_email(entry.user4_email);
        } 

        //return obj
            const ret_obj = {
              type: "playerstats_info",
              rating: RATING,
              winning_streak: WINNING_STREAK,
          total_win: TOTAL_WIN,
          total_lose: TOTAL_LOSE,
          history: HISTORY
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

      function get_friend_list_data(userEmail) {
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
                email: row.FRIEND_EMAIL,
            };
        });
          return friends;
      }

      function send_fren_list() {
          const userEmail = fastify.get_email_by_session(request);
          const friends = get_friend_list_data(userEmail);
          
          const friends_obj = {
              type: "player_friends",
              friends: friends,
          };
          
          connection.send(JSON.stringify(friends_obj));
          // console.log('Sent friend list:', friends_obj);
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
              // console.log('Player data from DB:', player);
              return {
                username: player.USERNAME,
                pfp: player.AVATAR,
              };
            });

        const ret_obj = {
            type: "matching_server_players",
            players: availablePlayers,
        };

        // console.log('Final object being sent:', JSON.stringify(ret_obj, null, 2));
        connection.send(JSON.stringify(ret_obj));
        // console.log(`Found ${availablePlayers.length} matching players for search: "${search_input_name}"`);
        // console.log('Sending to frontend:', ret_obj); 

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
        // console.log("added friend name: ", add_friend_name);
        
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
            
            const updatedFriends = get_friend_list_data(userEmail);

            const success_obj = {
                type: "add_friend_response",
                success: true,
                message: `Successfully added ${add_friend_name} as friend`,
                friends: updatedFriends
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
          console.log("remove friend name: ", remove_friend_name);
          
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

              const updatedFriends = get_friend_list_data(userEmail);
              
              const success_obj = {
                  type: "remove_friend_response",
                  success: true,
                  message: `Successfully removed ${remove_friend_name} from friends`,
                  friends: updatedFriends
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

      function refresh_all_friend_list(is_logout) {
        const email = fastify.get_email_by_session(request);

        const emailsToNotify = [
          email,
          ...get_friend_list_data(email)
            .filter((friend) => friend.status === "online")
            .map((friend) => friend.email),
        ];
        if (is_logout) {
          // Remove first email, no need to notify logged out email
          emailsToNotify.shift();
        }
        for (const innerEmail of emailsToNotify) {
          const friends = get_friend_list_data(innerEmail);
          if (is_logout) {
            // Notify friends that user is offline now
            friends.forEach((friend) => {
              if (friend.email === email) {
                friend.status = "offline";
              }
            });
          }
          const friends_obj = {
            type: "player_friends",
            friends: friends,
          };
          const connection = emailToWebsocketMap[innerEmail];
          connection.send(JSON.stringify(friends_obj));
        }
      }
    
      function logout() {
        refresh_all_friend_list(true);
        const session = request.query.session;
        delete fastify.conf.session[session];
        delete emailToWebsocketMap[fastify.get_email_by_session(request)];
      }

      /**
       * Check if have duplicate session (and remove old session)
       * And add websocket into emailToWebsocketMap
       */
      function init_websocket_session() {
        const oldConnection =
          emailToWebsocketMap[fastify.get_email_by_session(request)];
        if (oldConnection) {
          oldConnection.close();
        }
        emailToWebsocketMap[fastify.get_email_by_session(request)] = connection;
      }
    }
  );
};

export default root;