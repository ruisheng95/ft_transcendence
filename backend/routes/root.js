import { OAuth2Client } from "google-auth-library";

const root = async function (fastify) {
  fastify.get("/", async function () {
    fastify.betterSqlite3
      .prepare("UPDATE TEST SET COUNT = COUNT + 1 WHERE ID = 1")
      .run();
    const { count } = fastify.betterSqlite3
      .prepare("SELECT count FROM TEST WHERE ID = 1")
      .get();
    return { root: count };
  });

  fastify.post("/session", async function (request) {
    const token = request.body.token;
    try {
      if (!token) {
        throw new Error("No token");
      }
      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience:
          "313465714569-nq8gfim6in2iki8htj3t326vhbunl23a.apps.googleusercontent.com",
      });
      const payload = ticket.getPayload();

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
