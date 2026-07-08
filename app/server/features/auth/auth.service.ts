import "server-only";
import { Context, Effect, Layer } from "effect";
import { headers } from "next/headers";
import { auth, type Session } from "@/lib/auth";
import { Unauthorized } from "@/app/server/lib/errors";

export type AuthSession = Session;

export class AuthService extends Context.Tag("AuthService")<
  AuthService,
  {
    getSession: () => Effect.Effect<Session | null>;
    requireSession: () => Effect.Effect<Session, Unauthorized>;
  }
>() {}

export const AuthServiceLive = Layer.succeed(AuthService, {
  getSession: () =>
    Effect.tryPromise({
      try: async () =>
        auth.api.getSession({
          headers: await headers(),
        }),
      catch: (cause) =>
        cause instanceof Error ? cause : new Error("Failed to read session"),
    }).pipe(Effect.orElseSucceed(() => null)),

  requireSession: () =>
    Effect.gen(function* () {
      const session = yield* Effect.tryPromise({
        try: async () =>
          auth.api.getSession({
            headers: await headers(),
          }),
        catch: () => new Unauthorized({ message: "Not authenticated" }),
      }).pipe(
        Effect.mapError(
          () => new Unauthorized({ message: "Not authenticated" }),
        ),
      );

      if (!session) {
        return yield* Effect.fail(
          new Unauthorized({ message: "Not authenticated" }),
        );
      }
      return session;
    }),
});
