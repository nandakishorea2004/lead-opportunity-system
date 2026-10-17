
import { NextResponse } from "next/server";
import prisma from "../../../../src/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const opportunityId = Number(id);

    if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
      return NextResponse.json(
        { message: "Invalid opportunity ID." },
        { status: 400 }
      );
    }

    let data: {
      status?: string;
      lossReason?: string | null;
    };

    try {
      data = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const status = data.status;
    const lossReason =
      typeof data.lossReason === "string" ? data.lossReason.trim() : "";

    if (status !== "WON" && status !== "LOST") {
      return NextResponse.json(
        { message: "Status must be WON or LOST." },
        { status: 400 }
      );
    }

    if (status === "LOST" && !lossReason) {
      return NextResponse.json(
        { message: "A loss reason is required." },
        { status: 400 }
      );
    }

    if (lossReason.length > 1000) {
      return NextResponse.json(
        { message: "Loss reason must be 1000 characters or fewer." },
        { status: 400 }
      );
    }

    const existing = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Opportunity not found." },
        { status: 404 }
      );
    }

    if (existing.status !== "OPEN") {
      return NextResponse.json(
        { message: "This opportunity already has a final status." },
        { status: 409 }
      );
    }

    const opportunity = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        status,
        lossReason: status === "LOST" ? lossReason : null,
      },
      include: {
        lead: true,
        catalogItem: true,
      },
    });

    return NextResponse.json({
      message:
        status === "WON"
          ? "Opportunity marked as Won."
          : "Opportunity marked as Lost.",
      opportunity,
    });
  } catch (error) {
    console.error("Error updating opportunity status:", error);

    return NextResponse.json(
      { message: "Could not update opportunity status." },
      { status: 500 }
    );
  }
}
