import "server-only";
import { Effect, Schema } from "effect";
import { runtime } from "@/app/server/runtime";
import {
  toActionError,
  type ActionResult,
  ValidationError,
} from "@/app/server/lib/errors";

export async function runEffect<A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Promise<A> {
  return runtime.runPromise(effect as Effect.Effect<A, E>);
}

export async function runAction<A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Promise<ActionResult<A>> {
  try {
    const data = await runtime.runPromise(effect as Effect.Effect<A, E>);
    return { success: true, data };
  } catch (error) {
    return toActionError(error);
  }
}

export function decodeInput<A, I>(
  schema: Schema.Schema<A, I>,
  input: unknown,
): Effect.Effect<A, ValidationError> {
  return Schema.decodeUnknown(schema)(input).pipe(
    Effect.mapError(
      (err) =>
        new ValidationError({
          message: String(err),
        }),
    ),
  );
}
