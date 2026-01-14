import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Create Supabase client for storage operations
export const supabaseStorage = createClient(
    config.supabaseUrl,
    config.supabaseServiceRoleKey
);

/**
 * Upload a file to Supabase Storage
 * @param file - File buffer
 * @param filename - Unique filename
 * @param mimeType - File MIME type
 * @returns Public URL of uploaded file
 */
export async function uploadFileToStorage(
    file: Buffer,
    filename: string,
    mimeType: string
): Promise<string> {
    const { data, error } = await supabaseStorage.storage
        .from(config.supabaseStorageBucket)
        .upload(filename, file, {
            contentType: mimeType,
            upsert: false,
        });

    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseStorage.storage
        .from(config.supabaseStorageBucket)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param filename - Filename to delete
 */
export async function deleteFileFromStorage(filename: string): Promise<void> {
    const { error } = await supabaseStorage.storage
        .from(config.supabaseStorageBucket)
        .remove([filename]);

    if (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
    }
}

/**
 * Generate a unique filename for uploads
 * @param originalName - Original filename
 * @returns Unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
}
