import { circularTracker } from "@/utils/circularTracker";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    await circularTracker();
    return NextResponse.json({ message: 'Done' });
}