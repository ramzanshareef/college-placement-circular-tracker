import { circularTracker } from "../../utils/circularTracker";

export default async function handler(req, res) {
    await circularTracker();
    res.status(200).end('Hello Cron!');
}