require('dotenv').config();
const { chromium } = require('playwright');
const { insertData } = require('./db');

async function scrapeWbHotTopics(params) {
    const browser = await chromium.launch({
        // headless: false,
        // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    const page = await browser.newPage();
    await page.goto(process.env.WB_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#plc_main', { timeout: 20000 });

    const hots = await page.evaluate(() => {
        const items = document.querySelectorAll('#plc_main tbody tr');

        return Array.from(items).map(item => {
            const titleElement = item.querySelector('td[class*="td-02"] a');
            if (!titleElement || !titleElement.innerText.trim()) {
                return null;
            }
            const title = titleElement.innerText.trim();

            let rank = 0;
            let hot = 0;
            let tag = "";
            let icon = "";

            if (item.querySelector('td[class="td-01"]')) {
                tag = "top";
            } else {
                rankText = item.querySelector('td[class*="td-01"]').innerText.trim();
                rank = Number(rankText);
                if (isNaN(rank)) {
                    rank = 0;
                }
            }

            var hotSpanElement = item.querySelector('td[class*="td-02"] span');

            if (hotSpanElement) {
                const hotSpanText = hotSpanElement.innerText.trim();
                if (hotSpanText.includes(' ')) {
                    const parts = hotSpanText.split(' ', 2);
                    hot = Number(parts[1]);
                    tag = parts[0];
                } else {
                    hot = Number(hotSpanText);
                }
            }

            const iconElement = item.querySelector('td[class*="td-03"] i');
            if (iconElement) {
                icon = iconElement.innerText.trim();
            }

            return { rank, title, hot, tag, icon };
        }).filter(item => item !== null);
    });

    await browser.close();
    return hots;
}

async function main() {
    try {
        const hots = await scrapeWbHotTopics();
        if (hots.length) {
            await insertData(hots);
        }
    } catch (e) {
        console.error(e);
        throw e;
    }
}

main();