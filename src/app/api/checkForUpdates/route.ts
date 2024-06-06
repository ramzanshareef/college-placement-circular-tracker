import circularTracker from "@/utils/circularTracker";
import { NextApiRequest, NextApiResponse } from "next";

export async function POST(request: NextApiRequest, response: NextApiResponse) {
    await circularTracker(request, response);
}