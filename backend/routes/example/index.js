const root = async function (fastify) {
  fastify.get("/", async function () {
    return "this is an example";
  });
};

export default root;
