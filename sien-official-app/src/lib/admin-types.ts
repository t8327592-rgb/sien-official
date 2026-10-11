import type { Order, BusinessContact, Plan, Option, Portfolio } from "@prisma/client";

type SerializedDate<T> = T extends Date ? Date | string : T;
type BrowserRecord<T> = { [K in keyof T]: SerializedDate<T[K]> };
export type OrderRecord = BrowserRecord<Order>;
export type BusinessRecord = BrowserRecord<BusinessContact>;
export type PlanInput = Partial<Omit<Plan, "price" | "orderIndex">> & { price?: number | string | null; orderIndex?: number | string };
export type OptionInput = Partial<Omit<Option, "orderIndex">> & { orderIndex?: number | string };
export type PortfolioInput = Partial<Omit<Portfolio, "orderIndex">> & { orderIndex?: number | string };
