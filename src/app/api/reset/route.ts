import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BoothStatus from "@/models/BoothStatus";

// DELETE all booth records (dev/reset use only)
export async function DELETE() {
  try {
    await connectDB();
    await BoothStatus.deleteMany({});
    return NextResponse.json({ message: "All records cleared" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
