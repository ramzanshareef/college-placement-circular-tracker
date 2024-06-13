"use server";

import mongoose from "mongoose";

const mongodbUri = process.env.MONGODB_URI as string;

export default async function connectDB() {
    if (!mongoose.connections[0].readyState) {
        await mongoose.connect(mongodbUri).then(() => {
            console.log("Connected to DB");
        }).catch((err: Error) => {
            console.log("DB Connection Error = ", err.message);
        });
    }
}