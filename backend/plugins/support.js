import fp from "fastify-plugin";

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

const plugin = fp(async function (fastify) {
  fastify.decorate("someSupport", function () {
    return "hugs";
  });
});

export default plugin;
