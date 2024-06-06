import circularTracker from "@/utils/circularTracker";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    await circularTracker();
}