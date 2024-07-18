# College Placement Circular Tracker

Automated web service for tracking company placement circulars for a college, utilizing NextJS, Cheerio, and Resend to ensure real-time updates and email notifications.

## Features

- **Automated Circular Retrieval**: Fetches circular links from the college website using Cheerio.
- **Real-time Updates**: Updates MongoDB with new circulars and sends email notifications using Resend.
- **Email Notifications**: Sends structured email notifications with circular details to specified recipients.

## Technologies Used

- **NextJS**: React framework for server-side rendering and routing.
- **Cheerio**: Fast, flexible, and lean implementation of jQuery core for parsing HTML.
- **Resend**: API for sending transactional emails.
- **MongoDB**: NoSQL database for storing circular data.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/ramzanshareef/college-placement-circular-tracker.git
   cd college-placement-circular-tracker
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a .env file in the root directory based on following
```env
WEBSITE_URL
RESEND_API_KEY
EMAIL_SENDER
EMAIL_RECIPIENT
MONGODB_URI
CRON_SECRET
```

## Usage

The "College Placement Circular Tracker" is designed to automate the tracking of company placement circulars for a college. It can be used in the following ways:

- **College Placement Offices**: Use this tool to monitor and manage incoming placement circulars from various companies efficiently.
- **Students**: Stay updated with the latest placement opportunities directly through email notifications.
- **Administrators**: Monitor the circular tracking process and ensure smooth operation of the automated system.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (git checkout -b feature/YourFeature)
3. Commit your changes (git commit -m 'Add some feature')
4. Push to the branch (git push origin feature/YourFeature)
5. Open a pull request

## Contact

For any inquiries or feedback, please reach out to:
- **Name**: Mohd Ramzan Shareef
- **Email**: mail.ramzanshareef@gmail.com
- **GitHub**: [ramzanshareef](https://github.com/ramzanshareef)
