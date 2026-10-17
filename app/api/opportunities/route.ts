
import { NextResponse } from "next/server";
import prisma from "../../../src/lib/prisma";

export async function GET() {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: {
        lead: true,
        catalogItem: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("Error fetching opportunities:", error);

    return NextResponse.json(
      { message: "Could not fetch opportunities." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const leadId = Number(data.leadId);
    const dealAmount = Number(data.dealAmount);
    const marginPercent = Number(data.expectedMarginPercent);
    const productOrService = String(data.productOrService ?? "").trim();
    const selectedType = String(data.selectedType ?? "");

    // Validate the selected type.
    if (selectedType !== "Product" && selectedType !== "Service") {
      return NextResponse.json(
        { message: "Select a valid product or service type." },
        { status: 400 }
      );
    }

    // Validate required fields and numeric values.
    if (
      !Number.isInteger(leadId) ||
      leadId <= 0 ||
      !productOrService ||
      !Number.isFinite(dealAmount) ||
      dealAmount <= 0 ||
      !Number.isFinite(marginPercent) ||
      marginPercent < 0 ||
      marginPercent > 100
    ) {
      return NextResponse.json(
        {
          message:
            "Enter a valid lead, product/service, deal amount, and margin percentage (0–100).",
        },
        { status: 400 }
      );
    }

    // Find the exact active catalog item of the selected type.
    const catalogItem = await prisma.catalogItem.findFirst({
      where: {
        name: productOrService,
        type: selectedType,
        isActive: true,
      },
    });

    if (!catalogItem) {
      return NextResponse.json(
        {
          message:
            "This item is unavailable, inactive, or does not match the selected type.",
        },
        { status: 400 }
      );
    }

    // Confirm the lead exists and has not already been converted.
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { opportunity: true },
    });

    if (!lead) {
      return NextResponse.json(
        { message: "Lead not found." },
        { status: 404 }
      );
    }

    if (lead.opportunity || lead.convertedAt) {
      return NextResponse.json(
        { message: "This lead has already been converted." },
        { status: 409 }
      );
    }

    const expectedMarginAmount =
      (dealAmount * marginPercent) / 100;

    // Create the opportunity and update the lead together.
    const opportunity = await prisma.$transaction(async (tx) => {
      const created = await tx.opportunity.create({
        data: {
          leadId,
          catalogItemId: catalogItem.id,
          productOrService: catalogItem.name,
          dealAmount,
          expectedMarginPercent: marginPercent,
          expectedMarginAmount,
        },
        include: {
          catalogItem: true,
          lead: true,
        },
      });

      await tx.lead.update({
        where: { id: leadId },
        data: { convertedAt: new Date() },
      });

      return created;
    });

    return NextResponse.json(
      {
        message: "Lead converted into an opportunity successfully!",
        opportunity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating opportunity:", error);

    return NextResponse.json(
      { message: "Could not create opportunity." },
      { status: 500 }
    );
  }
}
