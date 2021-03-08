import path from "path";
import { MikroORM } from "@mikro-orm/core";
// import { DEBUG } from "./constants";
import { Post } from "./entities/Post";

export default {
  entities: [Post],
  dbName: "reddit",
  type: "postgresql",
  debug: true,
  migrations: {
    path: path.join(__dirname, "migrations"),
    pattern: /^[\w-]+\d+\.[jt]s$/,
  },
} as Parameters<typeof MikroORM.init>[0];
