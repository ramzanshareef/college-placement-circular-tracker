import { circularTracker } from "../../utils/circularTracker";

export default async function handler(req, res) {
    // if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return res.status(401).end('Unauthorized');
    // }
    console.log("Hello World, I am from Cron");
    await circularTracker();
    res.status(200).end('Hello Cron!');
}

// import { circularTracker } from "@/utils/circularTracker";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//     try {
//         await circularTracker();
//         console.log("I am here");
//         return NextResponse.json({ message: 'Done' });
//     }
//     catch (e) {
//         console.error(e);
//         return NextResponse.json({ message: 'Error' });
//     }
// }