
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "../../../src/lib/prisma";
import { auth } from "../../../src/lib/auth";

async function checkAdmin(): Promise<Response | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { message: "Please log in first." },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Administrator access required." },
      { status: 403 }
    );
  }

  return null;
}

export async function GET() {
  try {
    const items = await prisma.catalogItem.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Catalog fetch error:", error);

    return NextResponse.json(
      { message: "Could not fetch catalog items." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const permission = await checkAdmin();

  if (permission) {
    return permission;
  }

  try {
    const data = await request.json();

    const name =
      typeof data.name === "string" ? data.name.trim() : "";

    const type =
      typeof data.type === "string" ? data.type.trim() : "";

    if (
      !name ||
      name.length > 100 ||
      !["Product", "Service"].includes(type)
    ) {
      return NextResponse.json(
        {
          message:
            "Enter a name (up to 100 characters) and choose Product or Service.",
        },
        { status: 400 }
      );
    }

    const item = await prisma.catalogItem.create({
      data: { name, type },
    });

    return NextResponse.json(
      {
        message: "Catalog item created successfully.",
        item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Catalog create error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "This catalog item already exists for that type.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Could not create catalog item." },
      { status: 500 }
    );
  }
}


export async function PATCH(request: Request) {
  const permission = await checkAdmin();

  if (permission) {
    return permission;
  }

  try {
    const data = await request.json();
    const id = Number(data.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "A valid item ID is required." },
        { status: 400 }
      );
    }

    const existingItem = await prisma.catalogItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { message: "Catalog item not found." },
        { status: 404 }
      );
    }

    const updateData: {
      name?: string;
      type?: string;
      isActive?: boolean;
    } = {};

    // Keep the existing activate/deactivate feature.
    if (data.isActive !== undefined) {
      if (typeof data.isActive !== "boolean") {
        return NextResponse.json(
          { message: "Status must be true or false." },
          { status: 400 }
        );
      }

      updateData.isActive = data.isActive;
    }

    // Allow administrators to edit the item name.
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        return NextResponse.json(
          { message: "Item name must be text." },
          { status: 400 }
        );
      }

      const name = data.name.trim();

      if (!name || name.length > 100) {
        return NextResponse.json(
          { message: "Name must contain 1–100 characters." },
          { status: 400 }
        );
      }

      updateData.name = name;
    }

    // Allow administrators to change Product or Service.
    if (data.type !== undefined) {
      if (!["Product", "Service"].includes(data.type)) {
        return NextResponse.json(
          { message: "Type must be Product or Service." },
          { status: 400 }
        );
      }

      updateData.type = data.type;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "Provide a name, type, or status to update." },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.catalogItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Catalog item updated successfully.",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Catalog update error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "An item with that name and type already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Could not update catalog item." },
      { status: 500 }
    );
  }
}
