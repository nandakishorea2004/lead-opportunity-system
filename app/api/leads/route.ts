
import { NextResponse } from "next/server";
import prisma from "../../../src/lib/prisma";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

const allowedNextSteps = [
  "Send Pricing",
  "Call Tomorrow",
  "Book a Meeting",
  "Just a Note",
];

const allowedWarmth = ["Curious", "Interested", "Ready Now"];

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error fetching leads:", error);

    return NextResponse.json(
      { message: "Could not fetch leads." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const personName =
      typeof data.personName === "string" ? data.personName.trim() : "";
    const companyName =
      typeof data.companyName === "string" ? data.companyName.trim() : "";
    const email =
      typeof data.email === "string" ? data.email.trim() : "";
    const mobile =
      typeof data.mobile === "string" ? data.mobile.trim() : "";
    const requirement =
      typeof data.requirement === "string"
        ? data.requirement.trim()
        : "";

    if (!personName || !companyName || !email || !mobile || !requirement) {
      return NextResponse.json(
        {
          message:
            "Person name, company, mobile number, email, and requirement are required.",
        },
        { status: 400 }
      );
    }

    // Validate international numbers such as +91..., +1..., +44...
    // The form should send the complete number in international format.
    const phone = parsePhoneNumberFromString(mobile);

    if (!phone || !phone.isValid()) {
      return NextResponse.json(
        {
          message:
            "Enter a valid mobile number with its international country code, for example +919876543210.",
        },
        { status: 400 }
      );
    }

    // Basic server-side email validation.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const nextStep = allowedNextSteps.includes(data.nextStep)
      ? data.nextStep
      : "Call Tomorrow";

    const warmth = allowedWarmth.includes(data.warmth)
      ? data.warmth
      : "Curious";

    const lead = await prisma.lead.create({
      data: {
        personName,
        companyName,
        mobile: phone.number,
        email,
        requirement,
        nextStep,
        warmth,
      },
    });

    return NextResponse.json(
      { message: "Lead saved successfully!", lead },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving lead:", error);

    return NextResponse.json(
      { message: "Could not save lead to the database." },
      { status: 500 }
    );
  }
}
