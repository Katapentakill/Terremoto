// scraper.js

const puppeteer = require('puppeteer'); // Import Puppeteer for browser automation
const path = require('path'); // Import Node.js path module for handling file paths
const moveFiles = require('./moveFiles'); // Import custom moveFiles function

// Helper function to pause execution for a specified duration
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main function to execute the scraping process, taking parameters from a form
async function scraper({ fechaMin, fechaMax, latitudMin, latitudMax, longitudMin, longitudMax, profundidadMin, profundidadMax, magnitudMin, magnitudMax }) {
    console.log('Starting script...');

    const URL = "https://evtdb.csn.uchile.cl/events"; // URL of the website to scrape
    const userDataDir = path.resolve(__dirname, 'user-data'); // Directory to store user data

    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: false, // Launch browser in non-headless mode to see the actions
        executablePath: 'D:\\Programas Generales\\Google\\Chrome\\Application\\chrome.exe', // Path to Chrome executable
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-notifications',
            '--disable-popup-blocking'
        ],
        userDataDir: userDataDir // Specify user data directory for session persistence
    });

    console.log('Opening a new page...');
    const page = await browser.newPage(); // Open a new browser tab

    console.log(`Navigating to URL: ${URL}`);
    await page.goto(URL, { waitUntil: 'networkidle2' }); // Navigate to the target URL and wait until network activity is idle

    console.log('Page loaded. Waiting 2 seconds...');
    await wait(2000); // Wait for 2 seconds to ensure the page is fully loaded

    console.log('Clearing input fields...');
    await page.evaluate(() => {
        // Clear all input fields on the form
        document.querySelector('#id_min_date').value = '';
        document.querySelector('#id_max_date').value = '';
        document.querySelector('#id_min_lat').value = '';
        document.querySelector('#id_max_lat').value = '';
        document.querySelector('#id_min_lon').value = '';
        document.querySelector('#id_max_lon').value = '';
        document.querySelector('#id_min_depth').value = '';
        document.querySelector('#id_max_depth').value = '';
        document.querySelector('#id_min_mag').value = '';
        document.querySelector('#id_mag_max').value = '';
    });

    console.log('Filling out the form with provided values...');
    // Fill out the form fields with the values provided in the function parameters
    await page.type('#id_min_date', fechaMin);
    console.log(`Field 'id_min_date' filled with: ${fechaMin}`);
    await page.type('#id_max_date', fechaMax);
    console.log(`Field 'id_max_date' filled with: ${fechaMax}`);
    await page.type('#id_min_lat', latitudMin);
    console.log(`Field 'id_min_lat' filled with: ${latitudMin}`);
    await page.type('#id_max_lat', latitudMax);
    console.log(`Field 'id_max_lat' filled with: ${latitudMax}`);
    await page.type('#id_min_lon', longitudMin);
    console.log(`Field 'id_min_lon' filled with: ${longitudMin}`);
    await page.type('#id_max_lon', longitudMax);
    console.log(`Field 'id_max_lon' filled with: ${longitudMax}`);
    await page.type('#id_min_depth', profundidadMin);
    console.log(`Field 'id_min_depth' filled with: ${profundidadMin}`);
    await page.type('#id_max_depth', profundidadMax);
    console.log(`Field 'id_max_depth' filled with: ${profundidadMax}`);
    await page.type('#id_min_mag', magnitudMin);
    console.log(`Field 'id_min_mag' filled with: ${magnitudMin}`);
    await page.type('#id_mag_max', magnitudMax);
    console.log(`Field 'id_mag_max' filled with: ${magnitudMax}`);

    console.log('Clicking the "Search" button...');
    await page.click('input[type="submit"][name="filter"]'); // Click the search button to submit the form

    // Start a loop to process all event pages
    while (true) {
        console.log('Waiting 2 seconds before searching for event links...');
        await wait(2000); // Wait 2 seconds to ensure the search results are loaded

        console.log('Searching for event links...');
        // Extract event links and dates from the page
        const eventLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('tbody tr td.time a')).map(link => ({
                href: link.href,
                date: link.textContent.trim()
            }));
        });

        // If no more event links are found, exit the loop
        if (eventLinks.length === 0) {
            console.log('No more events found. Exiting loop...');
            break;
        }

        // Loop through each event link and process the data
        for (const { href, date } of eventLinks) {
            console.log(`Navigating to: ${href}`);
            console.log(`Event date: ${date}`);

            console.log('Waiting 2 seconds before navigating to the event...');
            await wait(2000); // Wait 2 seconds before navigating to the event link
            await page.goto(href, { waitUntil: 'networkidle2' }); // Navigate to the event page
            await wait(2000); // Wait 2 more seconds for the event page to load

            console.log('Searching for download links...');
            // Extract download links from the event page
            const downloadLinks = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a[download]')).map(link => ({
                    href: link.href,
                    name: link.getAttribute('download') || link.href.split('/').pop()
                }));
            });

            // If download links are found, process each one
            if (downloadLinks.length > 0) {
                // Format the event date to be used in the file naming
                const formattedDate = date.replace(/:/g, '_').replace(/\s+/g, '_');
                console.log(`Found ${downloadLinks.length} download links for date: ${formattedDate}`);

                // Loop through each download link and handle the download process
                for (const { href, name } of downloadLinks) {
                    if (href.includes('/write/')) {
                        console.log(`Preparing download from: ${href}`);
                        console.log(`File name: ${name}`);
                        console.log(`Event date: ${date}`);

                        // Simulate a click on the download link to start the download
                        await page.evaluate((href) => {
                            const link = document.createElement('a');
                            link.href = href;
                            link.download = '';
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        }, href);

                        console.log('Waiting 5 seconds after the download...');
                        await wait(5000); // Wait 5 seconds to ensure the download completes
                    } else {
                        console.log(`The link ${href} is not a '/write/' file and will not be downloaded.`);
                    }
                }

                // Move the downloaded files to the corresponding folder based on the event date
                console.log(`Moving files to the appropriate folder for date: ${formattedDate}`);
                await wait(10000); // Wait 10 seconds before moving files
                await moveFiles(formattedDate); // Call the moveFiles function to move the files
            }

            console.log('Navigating back to the previous page...');
            await page.goBack({ waitUntil: 'networkidle2' }); // Go back to the previous event listing page
            await wait(2000); // Wait 2 seconds after going back
        }

        console.log('Searching for the next page of events...');
        // Check if there is a next page in the event listing
        const nextPage = await page.evaluate(() => {
            const nextButton = document.querySelector('ul.pagination li.next a');
            return nextButton ? nextButton.href : null;
        });

        // If a next page is found, navigate to it; otherwise, exit the loop
        if (nextPage) {
            console.log(`Navigating to the next page: ${nextPage}`);
            await wait(2000); // Wait 2 seconds before navigating to the next page
            await page.goto(nextPage, { waitUntil: 'networkidle2' }); // Navigate to the next event page
        } else {
            console.log('No next page found. Exiting loop...');
            break;
        }
    }

    console.log('Closing the browser...');
    await browser.close(); // Close the browser
    console.log('Browser closed. Script completed.');
}

module.exports = scraper; // Export the scraper function for use in other files