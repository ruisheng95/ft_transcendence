"use strict";

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    fastify.betterSqlite3
      .prepare(
        "UPDATE TEST SET COUNT = COUNT + 1 WHERE ID = 1"
      )
      .run();
    const { count } = fastify.betterSqlite3.prepare("SELECT count FROM TEST WHERE ID = 1").get();
    return { root: count };
  });
};
