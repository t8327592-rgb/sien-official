import type { OrderSale } from "@/lib/admin-order-sales";

const yen = (value: number) => `¥${value.toLocaleString("ja-JP")}`;

export function OrderSaleNote({ sale, price }: { sale?: OrderSale; price: number | null }) {
  if (!sale) return null;

  const hasQuote = sale.price !== null && sale.normalTotal !== null;
  const isOriginalPrice = price === sale.price;
  return (
    <span className="mt-1 block whitespace-normal text-xs font-medium leading-relaxed text-orange-800">
      <span className="inline-block rounded bg-orange-50 px-1.5 py-0.5 font-bold" title={sale.name}>
        {hasQuote && !isOriginalPrice && "受付時 "}{sale.discount}% OFF{hasQuote ? "適用済み" : "対象"}
      </span>
      {sale.normalTotal !== null && sale.price !== null && (
        <span className="block text-slate-600">
          {isOriginalPrice
            ? `通常 ${yen(sale.normalTotal)}`
            : `通常 ${yen(sale.normalTotal)} → ${yen(sale.price)}`}
        </span>
      )}
    </span>
  );
}
