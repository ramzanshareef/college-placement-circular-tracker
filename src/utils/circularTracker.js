import fs from 'fs';
import cheerio from 'cheerio';
import XLSX from 'xlsx';
import fetch from 'node-fetch';
import Resend from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const websiteUrl = process.env.WEBSITE_URL;
const excelFilePath = process.env.EXCEL_FILE_PATH;
const resendApiKey = process.env.RESEND_API_KEY;
const emailRecipient = process.env.EMAIL_RECIPIENT;

const resend = new Resend(resendApiKey);

const readExistingDataFromExcel = () => {
    try {
        const workbook = XLSX.readFile(excelFilePath);
        const worksheet = workbook.Sheets['Circulars'];
        return XLSX.utils.sheet_to_json(worksheet);
    } catch (error) {
        console.error('Error reading existing data:', error);
        return [];
    }
};

const arraysAreEqual = (arr1, arr2, key) => {
    const getKey = obj => obj[key];
    return arr1.map(getKey).join() === arr2.map(getKey).join();
};

const fetchDataAndSaveToExcelIfNeeded = async () => {
    const existingData = readExistingDataFromExcel();
    try {
        const response = await fetch(websiteUrl);
        const html = await response.text();
        const $ = cheerio.load(html);
        const data = [];
        const dateRegex = /(\d{2})\.(\d{2})\.(\d{4})/;
        $('div[dir="ltr"] ul a').each((index, element) => {
            const circular = element.children[0]?.data;
            const link = element.attribs.href;
            const date = circular?.match(dateRegex)?.[0] || "No date found";
            data.push({
                "Company Name": circular,
                "Link": link || "No link found",
                "Date": date
            });
        });
        if (!arraysAreEqual(existingData, data, 'Company Name')) {
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Circulars');
            XLSX.writeFile(workbook, excelFilePath);
            console.log('Excel file updated:', excelFilePath);
            await sendEmailNotification(data);
        } else {
            console.log('No update found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const sendEmailNotification = async (data) => {
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
                            <td style="border: 1px solid #ddd; padding: 8px;">${item['Company Name']}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;"><a href="${item.Link}">${item.Link}</a></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${item.Date}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    try {
        await resend.sendEmail({
            from: 'your-email@example.com',
            to: emailRecipient,
            subject: 'New Company came for Placement',
            html: htmlContent,
            attachments: [
                {
                    filename: 'PlacementCirculars.xlsx',
                    path: excelFilePath
                }
            ]
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const createExcelFileIfNeeded = () => {
    if (!fs.existsSync(excelFilePath)) {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Circulars');
        XLSX.writeFile(workbook, excelFilePath);
        console.log('Excel file created:', excelFilePath);
    }
};

const circularTracker = async () => {
    createExcelFileIfNeeded();
    await fetchDataAndSaveToExcelIfNeeded();
    return {
        status: 200,
        message: 'Process completed successfully.'
    }
};

export default circularTracker;