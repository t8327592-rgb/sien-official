import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { autumnSale } from "@/config/autumn-sale";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function SaleImage() {
  if (!autumnSale.enabled) notFound();
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: 76, width: "100%", height: "100%", background: "#fff7ed", color: "#0f172a" }}>
      <div style={{ fontSize: 28, letterSpacing: "0.14em", color: "#9a3412" }}>SIEN-OFFICIAL / VOCAL MIX</div>
      <div style={{ display: "flex", fontSize: 64, fontWeight: 700, marginTop: 32 }}>{autumnSale.name}</div>
      <div style={{ display: "flex", fontSize: 182, fontWeight: 800, color: "#c2410c", lineHeight: 1.1 }}>{autumnSale.discount}% OFF</div>
      <div style={{ fontSize: 28, letterSpacing: "0.10em", marginTop: 30 }}>ALL MIX PLANS &amp; OPTIONS</div>
    </div>,
    size,
  );
}
