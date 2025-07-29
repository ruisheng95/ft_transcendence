import fp from "fastify-plugin";

function localConfig(fastify, options, done) {
  fastify.decorate("conf", {});
  fastify.conf.session = {};
  fastify.decorate("get_email_by_session", function (request) {
    const session = request.query.session;
    return fastify.conf.session[session];
  });
  fastify.decorate("verify_session", function (request, reply, done) {
    const session = request.query.session;
    if (!fastify.conf.session[session]) {
      // request.log.error(session, "Session not found");
      // done(new Error("Invalid session"));
      fastify.conf.session[session] = "abc@gmail.com";
      done();
    } else {
      done();
    }
  });
  done();
}

export default fp(localConfig);
