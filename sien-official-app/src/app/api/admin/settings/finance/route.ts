import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    
    if (data.targetMonthlySales === undefined) {
      return NextResponse.json({ error: "Missing targetMonthlySales" }, { status: 400 });
    }

    const updatedSetting = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: {
        targetMonthlySales: parseInt(data.targetMonthlySales, 10)
      },
      create: {
        id: "default",
        targetMonthlySales: parseInt(data.targetMonthlySales, 10)
      }
    });

    return NextResponse.json(updatedSetting);
  } catch (error) {
    console.error("Error updating target monthly sales:", error);
    return NextResponse.json(
      { error: "Failed to update target monthly sales" },
      { status: 500 }
    );
  }
}
