import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDatabase } from "@/backend/common/database/db";
import { env } from "@/backend/common/config/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDatabase();

    return NextResponse.json(
      {
        success: true,
        data: {
          status: "ok",
          app: env.appName,
          database: mongoose.connection.readyState === 1 ? "connected" : "connecting",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Service unhealthy",
        data: {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 503 },
    );
  }
}
