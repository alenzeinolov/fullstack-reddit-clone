import { MikroORM } from "@mikro-orm/core";
import path from "path";
// import { DEBUG } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export default {
  entities: [Post, User],
  dbName: "reddit",
  type: "postgresql",
  debug: true,
  migrations: {
    path: path.join(__dirname, "migrations"),
    pattern: /^[\w-]+\d+\.[jt]s$/,
  },
} as Parameters<typeof MikroORM.init>[0];
