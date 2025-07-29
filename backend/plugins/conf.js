import fp from "fastify-plugin";
import "dotenv/config";

function localConfig(fastify, options, done) {
  fastify.decorate("conf", {});
  fastify.conf.session = {};
  // eslint-disable-next-line no-undef
  fastify.conf.env = process.env;
  fastify.decorate("get_email_by_session", function (request) {
    const session = request.query.session;
    return fastify.conf.session[session];
  });
  fastify.decorate("verify_session", function (request, reply, done) {
    const session = request.query.session;
    if (!fastify.conf.session[session]) {
      request.log.error(session, "Session not found");
      done(new Error("Invalid session"));
    } else {
      done();
    }
  });
  done();
}

export default fp(localConfig);
