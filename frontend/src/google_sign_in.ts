import { index_init } from "./gameindex";

const google_sign_in = document.querySelector<HTMLButtonElement>("#google_sign_in");

if (!google_sign_in) throw new Error("board element not found");

//setup stuffs
const client_id = "313465714569-nq8gfim6in2iki8htj3t326vhbunl23a.apps.googleusercontent.com" //the client id is like to tell google wat is using the google sign-in feature (in this case my ft_transcendence project in google cloud)
const uri = "http://localhost" // redirect link after auth


//div id = g_id_onload is for the google gsi script to determine where can it get the data-* infos for the login stuffs
//div id = g_id_signin is for the gsi script to get the data-* for the button
google_sign_in.innerHTML = `
<div id="g_id_onload"
	data-client_id="${client_id}"
	data-login_uri="${uri}"
	data-callback="handle_credential_response">
</div>
<div class="g_id_signin" data-type="standard" data-theme="filled_blue"></div>`


//need put window. cuz we defining a global function for the data-callback if not it cant see this function
// @ts-expect-error - Function is used in data-callback hence not detected by ts as its in the template string
window.handle_credential_response = function(response: google.accounts.id.CredentialResponse)
{
	fetch(`${import.meta.env.VITE_BACKEND_API_HOST}/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: response.credential,
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      localStorage.setItem("session", json.session);
    //   window.location.href = "/gameindex.html";
	index_init();
    });
};
// If session exist, redirect
if (localStorage.getItem("session")) {
//    window.location.href = "/gameindex.html";
index_init();
}

if (import.meta.env.VITE_ENV === "dev") {
  const dummySignInButton = document.createElement("button");
  dummySignInButton.textContent = "Dummy account sign in";
  dummySignInButton.style.backgroundColor = "lightblue"
  dummySignInButton.addEventListener("click", async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_API_HOST}/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((json) => {
        localStorage.setItem("session", json.session);
        // window.location.href = "/gameindex.html";
		index_init();
      });
  });
  google_sign_in.parentNode?.insertBefore(
    dummySignInButton,
    google_sign_in.nextSibling
  );
}
// wtf liddat oni oso need to do so much work just for ts ignore