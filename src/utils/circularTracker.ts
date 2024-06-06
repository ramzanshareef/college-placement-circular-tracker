import mongoose from 'mongoose';
import cheerio from 'cheerio';
import { Resend } from 'resend';

const websiteUrl = process.env.WEBSITE_URL as string;
const resendApiKey = process.env.RESEND_API_KEY as string;
const emailSender = process.env.EMAIL_SENDER as string;
const emailRecipient = process.env.EMAIL_RECIPIENT as string;
const mongodbUri = process.env.MONGODB_URI as string;

const resend = new Resend(resendApiKey);

// MongoDB schema and model
const circularSchema = new mongoose.Schema({
    companyName: String,
    link: String,
    date: String,
}, { collection: 'circulars' });

const Circular = mongoose.models.Circular || mongoose.model('Circular', circularSchema);

interface CircularInterface {
    companyName: string;
    link: string;
    date: string;
}

mongoose.connect(mongodbUri);

const readExistingDataFromMongoDB = async (): Promise<CircularInterface[]> => {
    try {
        return await Circular.find({});
    } catch (error) {
        console.error('Error reading existing data:', error);
        return [];
    }
};

const arraysAreEqual = (arr1: CircularInterface[], arr2: CircularInterface[], key: keyof CircularInterface): boolean => {
    const getKey = (obj: CircularInterface) => obj[key];
    return arr1.map(getKey).join() === arr2.map(getKey).join();
};

const fetchAndSendTop10Companies = async (): Promise<void> => {
    try {
        const response = await fetch(websiteUrl);
        const html = await response.text();
        const $ = cheerio.load(html);
        const data: CircularInterface[] = [];
        const dateRegex = /(\d{2})\.(\d{2})\.(\d{4})/;
        $('div[dir="ltr"] ul a').each((index, element) => {
            const circular = $(element).text();
            const link = $(element).attr('href');
            const date = circular.match(dateRegex)?.[0] || "No date found";
            data.push({
                companyName: circular,
                link: link || "No link found",
                date: date
            });
        });
        const top10Companies = data.slice(0, 10);
        await sendEmailNotification(top10Companies);
        console.log('Top 10 companies email sent');
    } catch (error) {
        console.error('Error:', error);
    }
};

const fetchDataAndSaveToMongoDBIfNeeded = async (): Promise<void> => {
    const existingData = await readExistingDataFromMongoDB();
    try {
        const response = await fetch(websiteUrl);
        const html = await response.text();
        const $ = cheerio.load(html);
        const data: CircularInterface[] = [];
        const dateRegex = /(\d{2})\.(\d{2})\.(\d{4})/;
        $('div[dir="ltr"] ul a').each((index, element) => {
            const circular = $(element).text();
            const link = $(element).attr('href');
            const date = circular.match(dateRegex)?.[0] || "No date found";
            data.push({
                companyName: circular,
                link: link || "No link found",
                date: date
            });
        });
        if (!arraysAreEqual(existingData, data, 'companyName')) {
            await Circular.deleteMany({});
            await Circular.insertMany(data);
            console.log('MongoDB collection updated');
            await sendEmailNotification(data.slice(0, 10)); // Send email with top 10 companies
        } else {
            console.log('No update found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const sendEmailNotification = async (data: CircularInterface[]): Promise<void> => {
    const htmlContent = `
        <html>
        <body>
            <h2 style="color: #4CAF50;">Top 10 New Company Circulars</h2>
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
                            <td style="border: 1px solid #ddd; padding: 8px;">${item.companyName}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;"><a href="${item.link}">${item.link}</a></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${item.date}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    try {
        await resend.emails.send({
            from: emailSender,
            to: emailRecipient,
            subject: 'Top 10 New Company Circulars',
            html: htmlContent,
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const circularTracker = async (): Promise<void> => {
    // Check if MongoDB has data
    const existingData = await readExistingDataFromMongoDB();
    if (existingData.length === 0) {
        // If MongoDB has no data, fetch and send top 10 companies
        await fetchAndSendTop10Companies();
    } else {
        // If MongoDB has data, continue with regular functionality
        await fetchDataAndSaveToMongoDBIfNeeded();
    }
};