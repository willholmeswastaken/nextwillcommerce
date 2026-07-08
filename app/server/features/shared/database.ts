import "server-only";
import { Context, Data, Effect, Layer } from "effect";
import { db, type Database } from "@/lib/db";

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class DatabaseService extends Context.Tag("DatabaseService")<
  DatabaseService,
  Database
>() {}

export const DatabaseLive = Layer.succeed(DatabaseService, db);

/** Run a promise against an already-resolved database handle (no R requirement). */
export const tryDb = <A>(fn: () => Promise<A>) =>
  Effect.tryPromise({
    try: fn,
    catch: (cause) =>
      new DatabaseError({
        message: cause instanceof Error ? cause.message : "Database error",
        cause,
      }),
  });
