import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
        'SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar configurados en las variables de entorno'
    );
}

// Cliente de Supabase con service key para operaciones del servidor
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Bucket para almacenar documentos de verificación
export const VERIFICATION_DOCS_BUCKET = 'verification-documents';

// Bucket para almacenar fotos de propiedades
export const PROPERTY_PHOTOS_BUCKET = 'property-photos';
