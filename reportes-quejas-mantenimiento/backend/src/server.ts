import app from './app';
import { config } from './config';
import { prisma } from './config';

async function main() {
    try {
        // Check DB connection
        await prisma.$connect();
        console.log('Database connected successfully');

        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
}

main();
