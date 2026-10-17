
import { NextResponse } from "next/server";
import prisma from "../../../src/lib/prisma";

export async function GET() {
  try {
    const [
      totalLeads,
      totalOpportunities,
      openOpportunities,
      wonOpportunities,
      lostOpportunities,
      readyToConvert,
    ] = await Promise.all([
      prisma.lead.count(),

      prisma.opportunity.count(),

      prisma.opportunity.count({
        where: { status: "OPEN" },
      }),

      prisma.opportunity.count({
        where: { status: "WON" },
      }),

      prisma.opportunity.count({
        where: { status: "LOST" },
      }),

      prisma.lead.count({
        where: {
          warmth: "Ready Now",
          convertedAt: null,
          opportunity: { is: null },
        },
      }),
    ]);

    return NextResponse.json({
      totalLeads,
      totalOpportunities,
      openOpportunities,
      wonOpportunities,
      lostOpportunities,
      readyToConvert,
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return NextResponse.json(
      { message: "Could not load dashboard statistics." },
      { status: 500 }
    );
  }
}
