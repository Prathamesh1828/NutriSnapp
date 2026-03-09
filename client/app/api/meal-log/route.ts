// FILE LOCATION: app/api/meal-log/route.ts
// Stores meal log entries in a local JSON file (data/meal-log.json)
// No database needed — works out of the box

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR  = path.join(process.cwd(), "data");
const LOG_FILE  = path.join(DATA_DIR, "meal-log.json");

// ── Helpers ───────────────────────────────────────────────────────────────────
async function readLog(): Promise<object[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(LOG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return []; // file doesn't exist yet — return empty
  }
}

async function writeLog(entries: object[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LOG_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

// ── GET /api/meal-log — fetch all entries ────────────────────────────────────
export async function GET() {
  try {
    const entries = await readLog();
    return NextResponse.json(entries);
  } catch (error) {
    console.error("[meal-log GET]", error);
    return NextResponse.json({ error: "Failed to read log" }, { status: 500 });
  }
}

// ── POST /api/meal-log — add a new entry ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const entry = await req.json();
    if (!entry || !entry.id) {
      return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
    }

    const entries = await readLog();
    // Prepend new entry so newest is first
    const updated = [entry, ...entries];
    await writeLog(updated);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[meal-log POST]", error);
    return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
  }
}

// ── DELETE /api/meal-log?id=xxx — remove one entry ───────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      // No id = clear all
      await writeLog([]);
      return NextResponse.json({ success: true });
    }

    const entries = await readLog();
    const updated = entries.filter((e: any) => e.id !== id);
    await writeLog(updated);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[meal-log DELETE]", error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}