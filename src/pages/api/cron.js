import { circularTracker } from "../../utils/circularTracker";

export default async function handler(req, res) {
    await circularTracker();
    return res.status(200).json({ message: "Cron job ran successfully" });
}