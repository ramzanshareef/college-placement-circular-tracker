import fs from "fs";
import cheerio from "cheerio";
import XLSX from "xlsx";
import { Resend } from "resend";
import { NextApiRequest, NextApiResponse } from "next";

const websiteUrl = process.env.WEBSITE_URL as string;
const excelFilePath = process.env.EXCEL_FILE_PATH as string;
const resendApiKey = process.env.RESEND_API_KEY as string;
const emailSender = process.env.EMAIL_SENDER as string;
const emailRecipient = process.env.EMAIL_RECIPIENT as string;

const resend = new Resend(resendApiKey);

interface Circular {
    "Company Name": string;
    "Link": string;
    "Date": string;
}

const readExistingDataFromExcel = (): Circular[] => {
    try {
        const workbook = XLSX.readFile(excelFilePath);
        const worksheet = workbook.Sheets["Circulars"];
        return XLSX.utils.sheet_to_json(worksheet);
    } catch (error) {
        console.error("Error reading existing data:", error);
        return [];
    }
};

const arraysAreEqual = (arr1: Circular[], arr2: Circular[], key: keyof Circular): boolean => {
    const getKey = (obj: Circular) => obj[key];
    return arr1.map(getKey).join() === arr2.map(getKey).join();
};

const fetchDataAndSaveToExcelIfNeeded = async (): Promise<void> => {
    const existingData = readExistingDataFromExcel();
    try {
        const response = await fetch(websiteUrl);
        const html = await response.text();
        const $ = cheerio.load(html);
        const data: Circular[] = [];
        const dateRegex = /(\d{2})\.(\d{2})\.(\d{4})/;
        $("div[dir=\"ltr\"] ul a").each((index, element) => {
            const circular = $(element).text();
            const link = $(element).attr("href");
            const date = circular.match(dateRegex)?.[0] || "No date found";
            data.push({
                "Company Name": circular,
                "Link": link || "No link found",
                "Date": date
            });
        });
        if (!arraysAreEqual(existingData, data, "Company Name")) {
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Circulars");
            XLSX.writeFile(workbook, excelFilePath);
            console.log("Excel file updated:", excelFilePath);
            await sendEmailNotification(data);
        } else {
            console.log("No update found.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

const sendEmailNotification = async (data: Circular[]): Promise<void> => {
    const htmlContent = `
        <html>
        <body>
            <h2 style="color: #4CAF50;">New Company Circulars Added</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px;">Company Name</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Link</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${item["Company Name"]}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;"><a href="${item.Link}">${item.Link}</a></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${item.Date}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </body>
        </html>
    `;

    try {
        await resend.emails.send({
            from: emailSender as string,
            to: emailRecipient as string,
            subject: "New Company came for Placement",
            html: htmlContent,
            attachments: [
                {
                    filename: "PlacementCirculars.xlsx",
                    path: excelFilePath
                }
            ]
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

const createExcelFileIfNeeded = (): void => {
    if (!fs.existsSync(excelFilePath)) {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Circulars");
        XLSX.writeFile(workbook, excelFilePath);
        console.log("Excel file created:", excelFilePath);
    }
};

const circularTracker = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    createExcelFileIfNeeded();
    await fetchDataAndSaveToExcelIfNeeded();
    res.status(200).json({ message: "Checked for updates" });
};

export default circularTracker;