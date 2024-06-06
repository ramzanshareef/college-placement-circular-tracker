import { circularTracker } from "@/utils/circularTracker";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await circularTracker();
        console.log("I am here");
        return NextResponse.json({ message: 'Done' });
    }
    catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Error' });
    }
}