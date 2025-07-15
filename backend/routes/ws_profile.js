//currently import temp objects for frontend
import {
  temp_player_obj,
  temp_friends_obj,
  temp_server_players,
} from "./tempstuff.js";

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
    { websocket: true },
    async (connection, request) => {
      verify_session();
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
      }

      function send_player_profile() {
        const email = get_email_by_session();
        const { EMAIL, AVATAR } = fastify.betterSqlite3
          .prepare("SELECT EMAIL, USERNAME, AVATAR FROM USER WHERE EMAIL = ?")
          .get(email);
        const player_profile = {
          ...temp_player_obj,
          username: EMAIL,
          pfp: AVATAR,
        };
        connection.send(JSON.stringify(player_profile));
      }

      function send_fren_list() {
        /////////////////////////////////////////////////
        //get the players frens hereeeeee///////////////
        ///////////////////////////////////////////////

        //steps:
        //1) get the frenlist from database
        //2) put the info in the JSON obj like in the example at the top and send back
        //3) to do: create a handle to send the fren list whenever it changes (online status change / add / remove fren etc),
        // 		my frontend will accept whenever there is incoming fren list and modify accordingly

        const friends_obj = temp_friends_obj;
        connection.send(JSON.stringify(friends_obj));
        console.log(friends_obj);
      }

      function send_server_players_for_addfrens(search_input_name) {
        ////////////////////////////////////////////////////
        ///////get server players hereeeeee////////////////
        ///////////////////////////////////////////////////

        //	steps:
        //	1) get all players
        //	2) compare them wif the players current frens
        //	3) get the players that are not their current frens

        console.log("entered the mf function");
        const ret_obj = {
          type: "matching_server_players",
          players: [],
        };

        for (let i = 0; i < temp_server_players.length; i++) {
          if (temp_server_players[i].username.startsWith(search_input_name))
            ret_obj.players.push(temp_server_players[i]);
        }

        connection.send(JSON.stringify(ret_obj));
      }

      function modify_profile(message_obj) {
        console.log(message_obj);

        const name = message_obj.name;
        const pfp = message_obj.pfp;

        let error_str;

        if (name === null) error_str = "please enter a name";
        else error_str = check_valid_name(name);

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
          ///////////////////////////////////////
          ///////store pfp and name config///////
          ///////////////////////////////////////

          // JSON parsed to backend:
          // {
          //		type: "modify profile"
          //		name: "inserted name"
          //		pfp: "dataurl link" <- (dw just store this string i will handle the processing and rendering for now)
          // }

          //steps:
          // 1) find the profile associated wif the login email
          // 2) update the pfp and name in the Database

          pfp; //void this first if not compiler will complain

          const ret_obj = {
            type: "modify_profile_status",
            status: "success",
            error_msg: "",
            name: message_obj.name,
            pfp: message_obj.pfp,
          };

          connection.send(JSON.stringify(ret_obj));
        }
      }

      function check_valid_name(name) {
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

        /////////////////////////////////////////////////////////
        ///////////check for duplicate names hereeeee////////////
        /////////////////////////////////////////////////////////

        //steps:
        //1) get list of all the players in the game
        //2) compare

        return "";
      }

      function add_friend(add_friend_name) {
        //////////////////////////////////////////////
        //////process add fren hereee/////////////////
        ///////////////////////////////////////////////

        //steps:
        //1)find the profile of the name added in the database
        //2)add the profile to the frens list of the current player's profile

        console.log("added friend name: ", add_friend_name);
      }

      function remove_friend(remove_friend_name) {
        //////////////////////////////////////////////
        //////process remove fren hereee/////////////////
        ///////////////////////////////////////////////

        //steps:
        //1)find the current player profile in the frens table
        //2)remove the fren with the name
        console.log("remove friend name: ", remove_friend_name);
      }

      function verify_session() {
        const session = request.query.session;
        if (!fastify.conf.session[session]) {
          request.log.error(session, "Session not found");
          connection.send(JSON.stringify({ type: "session_error" }));
          connection.close();
        } else {
          connection.send(JSON.stringify({ type: "session_success" }));
        }
      }

      function get_email_by_session() {
        const session = request.query.session;
        return fastify.conf.session[session];
      }

      function logout() {
        const session = request.query.session;
        delete fastify.conf.session[session];
      }
    }
  );
};

export default root;
