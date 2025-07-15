import fp from "fastify-plugin";

function localConfig(fastify, options, done) {
  fastify.decorate("conf", {});
  fastify.conf.session = {};
  done();
}

export default fp(localConfig);
