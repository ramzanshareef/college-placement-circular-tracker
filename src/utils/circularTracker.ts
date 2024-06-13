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

const fetchDataAndSaveToMongoDBIfNeeded = async (): Promise<void> => {
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

        // Fetch existing data from MongoDB
        const existingData = await readExistingDataFromMongoDB();

        // Filter out circulars that are already in the database
        const newCirculars = data.filter(newCircular => {
            return !existingData.some(existingCircular => {
                return existingCircular.companyName === newCircular.companyName && existingCircular.link === newCircular.link;
            });
        });

        // Save new circulars to the database
        if (newCirculars.length > 0) {
            await Circular.insertMany(newCirculars);
            await sendEmailNotification(newCirculars.slice(0, 20));
        }
        else {
            console.log("No new circulars found.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


const sendEmailNotification = async (dataFrom: CircularInterface[]): Promise<void> => {
    const htmlContent = `
<html>
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
        <h2 style="color: #4CAF50; text-align: center; font-size: 2em; margin-bottom: 20px;">Check out the latest placement circulars! 🎉</h2>
        <table style="width: 100%; border-collapse: collapse; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); background-color: #fff;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 1em; background-color: #4CAF50; color: white; font-weight: bold;">Company Name</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 1em; background-color: #4CAF50; color: white; font-weight: bold;">Link</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 1em; background-color: #4CAF50; color: white; font-weight: bold;">Date</th>
                </tr>
            </thead>
            <tbody>
                ${dataFrom.map(item => `
                    <tr style="background-color: ${dataFrom.indexOf(item) % 2 === 0 ? '#f2f2f2' : '#fff'};">
                        <td style="border: 1px solid #ddd; padding: 12px;">${item.companyName}</td>
                        <td style="border: 1px solid #ddd; padding: 12px;"><a href="${item.link}" style="color: #4CAF50; text-decoration: none; font-weight: bold;">
                            View circular
                        </a></td>
                        <td style="border: 1px solid #ddd; padding: 12px;">${item.date}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </body>
</html>

    `;

    const { data, error } = await resend.emails.send({
        from: "My Placements Circular Tracker <" + emailSender + ">",
        to: emailRecipient,
        subject: dataFrom[0].companyName.match(/^(.*?)\sPlacement\sCircular/)?.[1] + ", " + dataFrom[1].companyName.match(/^(.*?)\sPlacement\sCircular/)?.[1] + " and more...",
        html: htmlContent,
    });

    if (error) {
        console.error('Error sending email:', error, resendApiKey);
    } else {
        console.log('Email sent:', data);
    }
};

export const circularTracker = async (): Promise<void> => {
    await fetchDataAndSaveToMongoDBIfNeeded();
};