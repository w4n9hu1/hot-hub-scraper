const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

console.log('Seeding the database...');

const directoryPath = path.join(__dirname, '../data');
const processFilePath = path.join(directoryPath, 'process.txt');

let processedFiles = [];
if (fs.existsSync(processFilePath)) {
    const processedContent = fs.readFileSync(processFilePath, 'utf-8');
    processedFiles = processedContent.split('\n').filter(Boolean);
}

const files = fs.readdirSync(directoryPath).sort();
const weiboHotFiles = files
    .filter(file => file.startsWith('weibo_hot') && file.endsWith('.json') && !processedFiles.includes(file));

function convertCSTtoUTC(cstDateStr) {
    const date = new Date(cstDateStr + ' GMT+0800');
    return date.toISOString();
}

console.log('Found files:', weiboHotFiles);

async function processFile(file) {
    const filePath = path.join(directoryPath, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);


    for (const dataEntry of jsonData) {
        const { time, hots } = dataEntry;
        const utcTime = convertCSTtoUTC(time);
        let insertQuery = `INSERT INTO wb_hot (rank, title, hot, tag, icon, created_at) VALUES `;
        const values = [];

        hots.forEach((hot, index) => {
            const placeholderStartIndex = index * 6 + 1;
            insertQuery += `($${placeholderStartIndex}, $${placeholderStartIndex + 1}, $${placeholderStartIndex + 2}, $${placeholderStartIndex + 3}, $${placeholderStartIndex + 4}, $${placeholderStartIndex + 5}),`;

            values.push(
                hot.rank,
                hot.topic,
                hot.score,
                hot.tag,
                '',
                utcTime
            );
        });
        insertQuery = insertQuery.slice(0, -1);


        try {
            const client = await pool.connect();
            await client.query(insertQuery, values);
            client.release();
            console.log(`Data from time ${time} inserted successfully.`);
        } catch (err) {
            console.error(`Error inserting data for time ${time}:`, err);
        }
    }


    fs.appendFileSync(processFilePath, file + '\n');
    console.log(`Processed file: ${file}`);
}

async function processAllFiles() {
    for (const file of weiboHotFiles) {
        await processFile(file);
    }
    console.log('All files processed.');
}

processAllFiles().catch(err => console.error('Error processing files:', err));