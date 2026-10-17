
import { NextResponse } from "next/server";
import prisma from "../../../../src/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "Invalid lead ID." },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { opportunity: true },
    });

    if (!lead) {
      return NextResponse.json(
        { message: "Lead not found." },
        { status: 404 }
      );
    }

    if (lead.opportunity) {
      return NextResponse.json(
        {
          message:
            "This lead cannot be deleted because it has already been converted into an opportunity.",
        },
        { status: 409 }
      );
    }

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Lead deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);

    return NextResponse.json(
      { message: "Could not delete lead." },
      { status: 500 }
    );
  }
}
