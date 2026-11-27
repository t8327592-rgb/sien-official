import type { Order, OrderTrack, Prisma } from "@prisma/client";
import { revenueAtDelivery } from "./order-revenue";

export function completeTrackOrder(order: Order, deliveredAt: Date, price = order.price): Prisma.OrderUpdateManyMutationInput {
  const revenue = revenueAtDelivery({ ...order, price }, deliveredAt);
  return {
    status: "COMPLETED", deliveredAt,
    ...(revenue ? { ...revenue, autoTrackRevenue: true, confirmedAt: order.confirmedAt ?? new Date(), financeVersion: { increment: 1 } } : {}),
  };
}

export function updateOrderFromTracks(order: Order, tracks: Pick<OrderTrack, "status" | "deliveredAt">[]): Prisma.OrderUpdateInput {
  const delivered = tracks.flatMap(track => track.status === "COMPLETED" && track.deliveredAt ? [track.deliveredAt.getTime()] : []);
  if (tracks.length === order.trackCount && delivered.length === tracks.length) {
    return order.status === "COMPLETED" ? { updatedAt: new Date() } : completeTrackOrder(order, new Date(Math.max(...delivered)));
  }
  if (order.status === "COMPLETED") {
    return {
      status: "WORKING", deliveredAt: null,
      ...(order.autoTrackRevenue ? { revenueAt: null, autoTrackRevenue: false, financeVersion: { increment: 1 } } : {}),
    };
  }
  return order.status === "PENDING" && tracks.some(track => track.status !== "PENDING") ? { status: "WORKING" } : { updatedAt: new Date() };
}
