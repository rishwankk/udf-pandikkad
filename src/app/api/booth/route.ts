import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BoothStatus from "@/models/BoothStatus";
import { getBoothByNumber } from "@/lib/boothData";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const booth = searchParams.get("booth");

    if (booth) {
      const number = parseInt(booth);
      const status = await BoothStatus.findOne({ booth: number });
      if (!status) {
        const boothInfo = getBoothByNumber(number);
        if (!boothInfo) {
          return NextResponse.json({ error: "Booth not found" }, { status: 404 });
        }
        return NextResponse.json({
          booth: number,
          boothName: boothInfo.boothName,
          observer: boothInfo.observer,
          contact: boothInfo.contact,
          ward: boothInfo.ward || "",
          flex: { status: "", extraRequest: false },
          poster: { status: "", extraRequest: false },
          round1: { status: "" },
          round2: { status: "" },
          round3: { status: "" },
          kudumbaYogamDate: "",
          expectedLead: 0,
          lastUpdated: null,
          entryTime: new Date(),
        });
      }
      return NextResponse.json(status);
    }

    const all = await BoothStatus.find({}).sort({ booth: 1 });
    return NextResponse.json(all);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { booth, ...updateData } = body;

    if (!booth) {
      return NextResponse.json({ error: "Booth number required" }, { status: 400 });
    }

    const boothInfo = getBoothByNumber(booth);
    if (!boothInfo) {
      return NextResponse.json({ error: "Booth not found" }, { status: 404 });
    }

    const existing = await BoothStatus.findOne({ booth });

    if (!existing) {
      const newStatus = await BoothStatus.create({
        booth,
        boothName: boothInfo.boothName,
        observer: boothInfo.observer,
        contact: boothInfo.contact,
        ward: boothInfo.ward || "",
        ...updateData,
        entryTime: new Date(),
        lastUpdated: new Date(),
      });
      return NextResponse.json(newStatus, { status: 201 });
    }

    const updated = await BoothStatus.findOneAndUpdate(
      { booth },
      { ...updateData, lastUpdated: new Date() },
      { new: true }
    );
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
