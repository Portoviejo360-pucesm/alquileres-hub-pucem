import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface ContractData {
    arrendador: {
        nombre: string;
        cedula: string;
    };
    arrendatario: {
        nombre: string;
        cedula: string;
    };
    propiedad: {
        direccion: string;
        descripcion: string;
        precio: number;
    };
    fechaInicio: Date;
    fechaFin: Date;
}

const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const numeroALetras = (num: number): string => {
    // Basic implementation or placeholder. For a real app, use a lib like 'numero-a-letras'
    // This is a simplified version or a placeholder to avoid adding deps just yet.
    return String(num);
};

export const generateContractPDF = (data: ContractData): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            // Increase top margin to make room for the header
            const doc = new PDFDocument({ margins: { top: 100, bottom: 50, left: 50, right: 50 } });
            const fileName = `contrato-${Date.now()}.pdf`;
            const uploadDir = path.join(__dirname, '../../uploads');
            const filePath = path.join(uploadDir, fileName);

            // Path to the markdown template
            const templatePath = path.join(__dirname, '../../../Contrato-Arrendamiento.md');
            // Header Logo Path
            const logoPath = path.join(__dirname, '../../../../front-alquileres-hub-pucem-main/public/Portoviejo360.png');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Function to draw header
            const drawHeader = () => {
                if (fs.existsSync(logoPath)) {
                    // Left aligned logo at the very top (inside the margin area)
                    // Margins are 50 (left/right).
                    doc.image(logoPath, 50, 30, { width: 120 });
                }
            };

            // Draw header on the first page
            drawHeader();

            // Draw header on subsequent pages
            doc.on('pageAdded', () => {
                drawHeader();
            });

            let content = '';
            if (fs.existsSync(templatePath)) {
                content = fs.readFileSync(templatePath, 'utf-8');
            } else {
                content = "ERROR: No se encontró la plantilla del contrato.";
            }

            const fechaActual = new Date();
            const duracionMs = data.fechaFin.getTime() - data.fechaInicio.getTime();
            const duracionDias = Math.ceil(duracionMs / (1000 * 60 * 60 * 24));
            const duracionMeses = Math.floor(duracionDias / 30); // Approx
            const duracionAnios = Math.floor(duracionDias / 365);

            // Replacements
            const replacements: { [key: string]: string } = {
                'CIUDAD': 'Portoviejo', // Default
                'DIAS': String(fechaActual.getDate()),
                'MES': meses[fechaActual.getMonth()],
                'ANIO': String(fechaActual.getFullYear()),
                'NOMBRE_ARRENDADOR': data.arrendador.nombre,
                'NOMBRE_ARRENDATARIO': data.arrendatario.nombre,
                'DIRECCION': data.propiedad.direccion,
                'CANTON': 'Portoviejo',
                'PROVINCIA': 'Manabí',
                'NUMERO_DE_METROS': 'N/A', // Not in DB
                'DESCRIPCION': data.propiedad.descripcion,
                'VALOR_ARRIENDO_EN_PALABRAS': numeroALetras(data.propiedad.precio).toUpperCase(), // Using numeral for now
                'VALOR_DE_ARRIENDO_EN_NUMEROS': data.propiedad.precio.toFixed(2),
                'NUMERO_CUENTA': 'XXXXXXXXXX',
                'NOMBRE_BANCO': 'BANCO GENÉRICO',
                'DURACION_TEXTO': duracionDias < 30
                    ? `${duracionDias} días`
                    : (duracionAnios > 0
                        ? `${duracionAnios} año${duracionAnios > 1 ? 's' : ''}${duracionMeses > 0 ? ` y ${duracionMeses} mes${duracionMeses > 1 ? 'es' : ''}` : ''}`
                        : `${duracionMeses} mes${duracionMeses > 1 ? 'es' : ''}`),
                'VALOS_MONETARIO_DE_GARANTIA_EN_PALABRAS': numeroALetras(data.propiedad.precio).toUpperCase(),
                'VALOS_MONETARIO_DE_GARANTIA_EN_NUMEROS': data.propiedad.precio.toFixed(2),
                'NUMERO_DE_CEDULA': data.arrendador.cedula,
                'NUMERO_CED': data.arrendatario.cedula
            };

            // Apply replacements
            // Apply replacements safely
            // Use regex with word boundaries to avoid replacing substrings in other keys (e.g. MES in DURACION...MESES)
            Object.keys(replacements).forEach(key => {
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                content = content.replace(regex, replacements[key]);
            });

            // Explicit cleanups
            content = content.replace(/[Ð]/g, '');
            content = content.replace(/[–—]/g, '-');

            doc.font('Helvetica').fontSize(11);

            // Title (Body)
            doc.fontSize(14).text('CONTRATO DE ARRENDAMIENTO', { align: 'center', underline: true });
            doc.moveDown();

            // Body
            // Use trim() to remove trailing whitespace from the file (prevents ghost page at end)
            // But do NOT filter internal empty lines, as they provide necessary vertical spacing (e.g. signatures).
            const lines = content.trim().split('\n');

            lines.forEach((line, lineIndex) => {
                const trimmedLine = line.trim();

                if (trimmedLine.includes('CONTRATO DE ARRENDAMIENTO')) return;

                // Handle empty lines explicitly for spacing (e.g. for signatures)
                if (trimmedLine === '') {
                    if (lineIndex < lines.length - 1) {
                        doc.moveDown(0.5); // Reduced from 1.5 to 0.5 to fix "too much space" issue
                    }
                    return;
                }

                // Indent list items
                const indent = trimmedLine.startsWith('-') ? 20 : 0;

                // Parse for **bold** markers
                // Filter out empty parts so we don't try to print empty strings which might mess up 'continued' logic
                const parts = trimmedLine.split(/(\*\*.*?\*\*)/g).filter(p => p !== '');

                // Clean simple render without complex space shifting to debug justification issue
                // The large gap suggests the 'justify' might still be implicitly active or the space shifting created a weird chunk.
                // Let's rely on standard left alignment.

                doc.text('', { indent, continued: true, align: 'left' });

                parts.forEach((part, index) => {
                    const isLastPart = index === parts.length - 1;
                    const isLastLine = lineIndex === lines.length - 1;
                    // Keep continued true if it's not the last part OR if it's the last line (to avoid final LF)
                    const shouldContinue = !isLastPart || isLastLine;

                    if (part.startsWith('**') && part.endsWith('**')) {
                        // Bold text
                        const text = part.slice(2, -2);
                        doc.font('Helvetica-Bold').text(text, { continued: shouldContinue, align: 'left', indent });
                    } else {
                        // Normal text
                        doc.font('Helvetica').text(part, { continued: shouldContinue, align: 'left', indent });
                    }
                });

                // End line (reset continued)
                doc.font('Helvetica'); // Reset to normal

                if (lineIndex < lines.length - 1) {
                    doc.moveDown(0.5);
                }
            });

            doc.end();

            stream.on('finish', () => {
                resolve(fileName); // Return filename, controller builds URL
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};
