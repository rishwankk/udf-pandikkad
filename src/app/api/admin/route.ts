import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BoothStatus from "@/models/BoothStatus";
import { boothData } from "@/lib/boothData";

export async function GET() {
  try {
    await connectDB();
    // Sort by most recently updated first so active wards appear at the top
    const all = await BoothStatus.find({}).sort({ lastUpdated: -1 });

    // Build station map with booth totals from boothData
    const stationMap: Record<string, {
      station: string;
      ward: string;
      total: number;           // total booths in this station
      updated: number;         // booths that have any update saved
      completed: number;       // booths where all 5 tasks = completed
      partial: number;         // booths with some progress
      pending: number;         // booths with no update yet
      lastUpdated: string | null;
      booths: (typeof all)[number][];
    }> = {};

    // Initialise station totals from the static data
    for (const b of boothData) {
      const station = b.boothName || "Unknown Station";
      if (!stationMap[station]) {
        stationMap[station] = { 
          station, 
          ward: b.ward || "Unknown",
          total: 0, updated: 0, completed: 0, partial: 0, pending: 0, 
          lastUpdated: null, booths: [] 
        };
      }
      stationMap[station].total++;
    }

    // Populate with DB records
    for (const status of all) {
      const station = status.boothName || "Unknown Station";
      if (!stationMap[station]) continue;

      stationMap[station].booths.push(status);
      stationMap[station].updated++;

      // Track latest update time per station
      const lu = status.lastUpdated ? new Date(status.lastUpdated).toISOString() : null;
      if (lu && (!stationMap[station].lastUpdated || lu > stationMap[station].lastUpdated!)) {
        stationMap[station].lastUpdated = lu;
      }

      const tasks = [
        status.flex?.status,
        status.poster?.status,
        status.round1?.status,
        status.round2?.status,
        status.round3?.status,
      ];
      const doneCount    = tasks.filter(t => t === "completed").length;
      const activeCount  = tasks.filter(t => t).length;

      if (doneCount === 5) {
        stationMap[station].completed++;
      } else if (activeCount > 0) {
        stationMap[station].partial++;
      }
    }

    // pending = total booths - booths that have any DB record
    for (const s of Object.values(stationMap)) {
      s.pending = s.total - s.updated;
    }

    // Sort: stations with most recent activity first, then alphabetical
    const sorted = Object.values(stationMap).sort((a, b) => {
      if (a.lastUpdated && b.lastUpdated) {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
      if (a.lastUpdated) return -1;
      if (b.lastUpdated) return 1;
      return a.station.localeCompare(b.station);
    });

    return NextResponse.json(sorted);
  } catch (error: any) {
    console.error("Admin API Error:", error.message);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
