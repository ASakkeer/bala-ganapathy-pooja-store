import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { requireDatabaseUrl } from "@/server/env";
import * as schema from "@/server/db/schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let client: ReturnType<typeof postgres> | undefined;
let db: Database | undefined;

export function getDb(): Database {
  if (!db) {
    client = postgres(requireDatabaseUrl(), { max: 10 });
    db = drizzle(client, { schema });
  }

  return db;
}
