import "server-only";
import { Layer, ManagedRuntime } from "effect";
import { DatabaseLive } from "@/app/server/features/shared/database";
import { AuthServiceLive } from "@/app/server/features/auth/auth.service";
import { ProductRepositoryLive } from "@/app/server/features/product/product.repository";
import { ProductServiceLive } from "@/app/server/features/product/product.service";
import { CartRepositoryLive } from "@/app/server/features/cart/cart.repository";
import { CartServiceLive } from "@/app/server/features/cart/cart.service";
import { OrderRepositoryLive } from "@/app/server/features/order/order.repository";
import { CheckoutServiceLive } from "@/app/server/features/checkout/checkout.service";

/**
 * Composition root. Domain services are fully provided so route handlers
 * and server actions only need `runtime.runPromise(...)`.
 */
const Repositories = Layer.mergeAll(
  ProductRepositoryLive,
  CartRepositoryLive,
  OrderRepositoryLive,
).pipe(Layer.provide(DatabaseLive));

const ProductSvc = ProductServiceLive.pipe(Layer.provide(Repositories));

const CartSvc = CartServiceLive.pipe(
  Layer.provide(Repositories),
  Layer.provide(AuthServiceLive),
);

const CheckoutSvc = CheckoutServiceLive.pipe(
  Layer.provide(Repositories),
  Layer.provide(CartSvc),
  Layer.provide(AuthServiceLive),
);

const AppLayer = Layer.mergeAll(
  DatabaseLive,
  AuthServiceLive,
  Repositories,
  ProductSvc,
  CartSvc,
  CheckoutSvc,
);

export const runtime = ManagedRuntime.make(AppLayer);
