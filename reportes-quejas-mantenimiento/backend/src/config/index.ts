import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
    'DATABASE_URL',
    //JWT SECRET
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
];

requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`❌ Error: La variable de entorno ${envVar} es obligatoria en el archivo .env`);
        process.exit(1);
    }
});

export const prisma = new PrismaClient();

export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // JWT Configuration (from external auth module)
    jwtSecret: process.env.JWT_SECRET!,

    // Supabase Configuration
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,

    // File Upload Configuration
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,image/webp').split(','),
    supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'incident-attachments',

    // Email Configuration
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    emailFrom: process.env.EMAIL_FROM || 'noreply@portoviejo360.com',
};
