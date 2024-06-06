import circularTracker from "@/utils/circularTracker";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(res: NextApiResponse) {
    await circularTracker();
}