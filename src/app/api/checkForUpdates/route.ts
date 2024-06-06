import { circularTracker, sendNoNewCircularsEmail } from "@/utils/circularTracker";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    let p1 = Promise.all([circularTracker()]);
    p1.then(() => {
        return NextResponse.json({ message: 'Done' });
    });
}