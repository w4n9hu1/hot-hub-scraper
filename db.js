const { Client } = require('pg');

async function insertData(hots) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('Connected to the database');

        const currentTime = new Date().toISOString();
        const insertQuery = `
            INSERT INTO public.wb_hot (rank, title, hot, tag, icon, created_at)
            VALUES ${hots.map((item, index) =>
            `(${item.rank}, '${item.title}', ${item.hot}, '${item.tag}', '${item.icon}', '${currentTime}')`
        ).join(', ')}`;

        await client.query(insertQuery);
        console.log('Data inserted successfully');
    } catch (e) {
        throw e;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

module.exports = { insertData };

