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
};

export default root;
