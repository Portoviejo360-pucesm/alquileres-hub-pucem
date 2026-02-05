import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Prisma automatically uses DATABASE_URL from environment variables
const prisma = new PrismaClient();

console.log('Prisma Client instantiated successfully!');
console.log('Using DATABASE_URL from environment:', process.env.DATABASE_URL ? 'Found' : 'Not found');
