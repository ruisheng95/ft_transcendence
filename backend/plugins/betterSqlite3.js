import fp from "fastify-plugin";
import Database from "better-sqlite3";
import Postgrator from "postgrator";

function fastifyBetterSqlite3(fastify, options, done) {
  const db = new Database("database/data.db");
  // optional pragmas
  // db.prepare("PRAGMA foreign_keys = ON").run();
  // db.prepare("PRAGMA journal_mode = WAL").run();

  if (fastify.betterSqlite3) {
    done(new Error("plugin already registered"));
    return;
  }

  const execQuery = (query) => {
    return new Promise((resolve) => {
      const stm = db.prepare(query);
      try {
        const rows = stm.all();
        resolve({ rows });
      } catch (err) {
        if (err.message.indexOf("This statement does not return data") >= 0) {
          stm.run();
          resolve({ rows: [] });
        }
        throw err;
      }
    });
  };
  const execSqlScript = (sqlScript) => {
    return new Promise((resolve) => {
      db.exec(sqlScript);
      resolve();
    });
  };

  const postgrator = new Postgrator({
    migrationPattern: "./sql/*",
    driver: "sqlite3",
    betterSqlite3: true,
    execQuery,
    execSqlScript,
  });
  postgrator
    .migrate()
    .then(() => {
      fastify.decorate("betterSqlite3", db);
      fastify.addHook("onClose", (fastify, done) => {
        db.close();
        done();
      });
      done();
    })
    .catch((err) => {
      console.error("[ERROR] Postgrator initialization failed.");
      done(err);
    });
}

export default fp(fastifyBetterSqlite3, {
  name: "fastify-better-sqlite3",
});
