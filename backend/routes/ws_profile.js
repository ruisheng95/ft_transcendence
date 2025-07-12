const temp_player_obj =
{
	"type": "player_profile",
	"id": "100",
	"username": "Player1",
	"pfp": null,
}

const temp_friends_obj =
{
	"type": "player_friends",
	"friends":
	[
		{
			"id": "101",
			"username": "Player2",
			"pfp": null, 
			"status": "online"
		},
		{
			"id": "102",
			"username": "Player3",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "103",
			"username": "Player4",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "104",
			"username": "Player5",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "105",
			"username": "Player6",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "106",
			"username": "Player8",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "106",
			"username": "Player9",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "106",
			"username": "Player10",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "106",
			"username": "Player11",
			"pfp": null, 
			"status": "offline"
		},
		{
			"id": "106",
			"username": "Player12",
			"pfp": null, 
			"status": "offline"
		}
	]
}

const root = async function (fastify) {

  fastify.get("/ws_profile", { websocket: true }, (connection) => {
	
	connection.on("message", recv_msg);
	//connection.on('close', handle_close_socket);

	//functions

	function recv_msg(message) {
	  const message_obj = JSON.parse(message.toString());
	  console.log("Received:", message_obj);

	  if(message_obj.type == "google-sign-in JWT token")
		process_JWT_token(message_obj.JWT_token);
	  else if(message_obj.type === "get_player_profile")
		send_player_profile();
	  else if(message_obj.type === "get_player_friends")
		send_fren_list();
	//   else if(message_obj.type === "modify_profile")
	// 	modify_profile(message_obj);
	}
	
	function process_JWT_token(JWT_token)
	{
		console.log("Received: ", JWT_token);
		///////////////////////////////////////////////////
		//////////do the JWT token processing hereeeeeeeeee
		////////////////////////////////////////////////////

		//steps:
		// 1) check if token is legit
		// 2) check if a profile is already binded to the email in the database
		// 3) if not, initialise a profile
	}

	function send_player_profile()
	{
		/////////////////////////////////////////////////
		//get the player profile stuff hereeeee/////////
		////////////////////////////////////////////////

		//steps:
		//1) get the player details from database
		//2) put the info in the JSON obj like in the example at the top and send back
		const player_profile = temp_player_obj
		connection.send(JSON.stringify(player_profile));
	}
	
	function send_fren_list()
	{
		/////////////////////////////////////////////////
		//get the players frens hereeeeee///////////////
		///////////////////////////////////////////////

		//steps:
		//1) get the frenlist from database
		//2) put the info in the JSON obj like in the example at the top and send back
		//3) to do: create a handle to send the fren list whenever it changes (online status change / add / remove fren etc)
		const friends_obj = temp_friends_obj;
		connection.send(JSON.stringify(friends_obj));
		console.log(friends_obj);
	}

	// function modify_profile(message_obj)
	// {

	// }

	});
};

export default root;
