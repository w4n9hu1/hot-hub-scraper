# Hot Hub Scraper

Hot Hub Scraper is a Node.js application that scrapes hot topics from Weibo and stores them in a PostgreSQL database.

## UI

[hot-hub-web](https://github.com/w4n9hu1/hot-hub-web)

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/yourusername/hot-hub-scraper.git
    cd hot-hub-scraper
    ```

2. Install dependencies:

    ```sh
    npm ci
    ```

3. Install Playwright browsers:

    ```sh
    npx playwright install --with-deps
    ```

## Usage

1. Create a `.env` file based on the `.env.sample` file:

    ```sh
    cp .env.sample .env
    ```

2. Update the `.env` file with your PostgreSQL database URL and Weibo URL.

3. Run the scraper:

    ```sh
    npm start
    ```

4. Seed the database with historical data:

    ```sh
    npm run seed
    ```

## Database Schema

The database schema is defined in the [`scripts/wb_hot.sql`](scripts/wb_hot.sql) file:

```sql
CREATE TABLE IF NOT EXISTS wb_hot (
    id SERIAL PRIMARY KEY,
    rank INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    hot INT NOT NULL,
    tag VARCHAR(10),
    icon VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.