import { OAuth2Client } from "google-auth-library";

const root = async function (fastify) {
  fastify.post("/session", async function (request) {
    const token = request.body.token;
    try {
      let payload = undefined;
      if (!token) {
        if (fastify.conf.env.ENV !== "dev") {
          throw new Error("No token");
        }
        // Dummy sign in
        const playerEmails = Object.values(fastify.conf.session);
        let i = 1;
        let email;
        while (!email) {
          if (!playerEmails.includes(`friend${i}@example.com`)) {
            email = `friend${i}@example.com`;
          }
          i++;
        }
        payload = {};
        payload.email = email;
      } else {
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience:
            "313465714569-nq8gfim6in2iki8htj3t326vhbunl23a.apps.googleusercontent.com",
        });
        payload = ticket.getPayload();
      }

      const { count } = fastify.betterSqlite3
        .prepare("SELECT COUNT(*) AS count FROM USER WHERE EMAIL = ?")
        .get(payload.email.toLowerCase());

      if (!count) {
        fastify.betterSqlite3
          .prepare(
            `INSERT INTO USER (EMAIL, USERNAME, AVATAR, RATING, WINNING_STREAK, TOTAL_WIN, TOTAL_LOSE) 
            VALUES (?,?,?,0,0,0,0)`
          )
          .run(
            payload.email.toLowerCase(),
            payload.email.toLowerCase(),
            payload.picture
          );
      }

      // Remove duplicate session here
      const sessionArray = Object.keys(fastify.conf.session);
      for (const key of sessionArray) {
        if (fastify.conf.session[key] === payload.email.toLowerCase()) {
          delete fastify.conf.session[key];
        }
      }

      const session = crypto.randomUUID();
      fastify.conf.session[session] = payload.email.toLowerCase();
      return { session };
    } catch (error) {
      request.log.error(error, "[POST] /session verifyIdToken error");
      throw error;
    }
  });
};

export default root;
