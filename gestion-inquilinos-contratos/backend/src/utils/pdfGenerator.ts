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
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const diez_veinte = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    const entero = Math.floor(num);
    const decimal = Math.round((num - entero) * 100);

    if (entero === 0) return 'CERO';
    if (entero >= 1000000) return 'NUMERO DEMASIADO GRANDE'; // Simplified for this context

    let letras = '';

    const miles = Math.floor(entero / 1000);
    const resto = entero % 1000;

    if (miles > 0) {
        if (miles === 1) letras += 'MIL ';
        else letras += convertGroup(miles) + ' MIL ';
    }

    if (resto > 0 || miles === 0) {
        letras += convertGroup(resto);
    }

    function convertGroup(n: number): string {
        let output = '';
        if (n === 100) return 'CIEN';

        const c = Math.floor(n / 100);
        const d = Math.floor((n % 100) / 10);
        const u = n % 10;

        if (c > 0) output += centenas[c] + ' ';

        if (d === 1 && u >= 0) {
            output += diez_veinte[u];
            return output;
        } else if (d > 0) {
            output += decenas[d];
            if (u > 0) output += ' Y ' + unidades[u];
        } else if (u > 0) {
            output += unidades[u];
        }
        return output.trim();
    }

    return `${letras.toUpperCase()} CON ${decimal}/100`;
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
                'VALOR_ARRIENDO_EN PALABRAS': numeroALetras(data.propiedad.precio),
                'VALOR_DE_ARRIENDO_EN_NUMEROS': data.propiedad.precio.toFixed(2),
                'NUMERO_CUENTA': 'XXXXXXXXXX',
                'NOMBRE_BANCO': 'BANCO GENÉRICO',
                'DURACION_TEXTO': duracionDias < 30
                    ? `${duracionDias} días`
                    : (duracionAnios > 0
                        ? `${duracionAnios} año${duracionAnios > 1 ? 's' : ''}${duracionMeses > 0 ? ` y ${duracionMeses} mes${duracionMeses > 1 ? 'es' : ''}` : ''}`
                        : `${duracionMeses} mes${duracionMeses > 1 ? 'es' : ''}`),
                // Fix for typo in markdown template (VALOS instead of VALOR)
                'VALOS_MONETARIO_DE_GARANTIA_EN_PALABRAS': numeroALetras(data.propiedad.precio),
                'VALOS_MONETARIO_DE_GARANTIA_EN_NUMEROS': data.propiedad.precio.toFixed(2),
                'NUMERO_DE_CEDULA': data.arrendador.cedula,
                'NUMERO_CED': data.arrendatario.cedula
            };

            // Apply replacements
            // Apply replacements safely
            // Use regex with word boundaries to avoid replacing substrings in other keys, but handle keys with spaces explicitly
            Object.keys(replacements).forEach(key => {
                // Escape special regex characters in the key
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                // If key has special characters or spaces that confuse \b, we might need a simpler approach
                // But \b works on [a-zA-Z0-9_]. Spaces are non-word characters. 
                // "VALOR_ARRIENDO_EN PALABRAS" -> \bV...s\b.  Space matches non-word boundary? No.
                // "EN " -> N is word, space is non-word. \b matches between N and space.
                // So \bKEY\b works for "VALOR...EN PALABRAS" if it is surrounded by non-word chars in the text.
                // However, strictly, let's allow flexibility.

                const pattern = escapedKey.replace(/ /g, '\\s+');

                // Use the pattern. If it had spaces originally, we use the flexible pattern without \b constraint on the inside space
                const regex = key.includes(' ')
                    ? new RegExp(pattern, 'g') // No \b for multi-word keys to be safe
                    : new RegExp(`\\b${escapedKey}\\b`, 'g');

                if (content.match(regex)) {
                    console.log(`[PDF] Replacing key: ${key} with value: ${replacements[key]}`);
                } else {
                    // Debug: Check why it's not matching if we expect it to
                    if (key.includes('VALOR_ARRIENDO')) {
                        console.log(`[PDF] WARNING: Key ${key} NOT FOUND in content. Regex used: ${pattern}`);
                    }
                }

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

            let lastNonEmptyLine = '';

            lines.forEach((line, lineIndex) => {
                const trimmedLine = line.trim();

                if (trimmedLine.includes('CONTRATO DE ARRENDAMIENTO')) return;

                // Handle empty lines explicitly for spacing
                if (trimmedLine === '') {
                    if (lineIndex < lines.length - 1) {
                        // Check if the previous line was a signature header. If so, reduce spacing DRASTICALLY.
                        if (lastNonEmptyLine.includes('EL ARRENDADOR') || lastNonEmptyLine.includes('EL ARRENDATARIO')) {
                            doc.moveDown(0.1); // Minimal space between Title and Name
                        } else {
                            doc.moveDown(0.5); // Normal paragraph spacing
                        }
                    }
                    return;
                }

                lastNonEmptyLine = trimmedLine;

                // Indent list items
                const indent = trimmedLine.startsWith('-') ? 20 : 0;

                // Parse for **bold** markers
                // Filter out empty parts so we don't try to print empty strings which might mess up 'continued' logic
                const parts = trimmedLine.split(/(\*\*.*?\*\*)/g).filter(p => p !== '');

                // Clean simple render without complex space shifting to debug justification issue
                // The large gap suggests the 'justify' might still be implicitly active or the space shifting created a weird chunk.
                // Let's rely on standard left alignment.

                doc.text('', { indent, continued: true, align: 'justify' });

                parts.forEach((part, index) => {
                    const isLastPart = index === parts.length - 1;
                    const isLastLine = lineIndex === lines.length - 1;
                    // Keep continued true if it's not the last part OR if it's the last line (to avoid final LF)
                    const shouldContinue = !isLastPart || isLastLine;

                    // Handle leading space explicitly because pdfkit + justify can be tricky with it
                    // Check if we need to inject a space 'manually'
                    const hasLeadingSpace = part.startsWith(' ');
                    const textContent = hasLeadingSpace ? part.slice(1) : part;

                    if (hasLeadingSpace) {
                        // Print a distinct space to ensure it's not eaten
                        doc.text(' ', { continued: true, align: 'justify', indent: 0 });
                    }

                    if (part.startsWith('**') && part.endsWith('**')) {
                        // Bold text (usually doesn't start with space based on markdown split, but generic handling)
                        const text = part.slice(2, -2); // Remove **
                        doc.font('Helvetica-Bold').text(text, { continued: shouldContinue, align: 'justify', indent: 0 });
                    } else {
                        // Normal text
                        // Use textContent (stripped of leading space we just handled)
                        if (textContent.length > 0) {
                            doc.font('Helvetica').text(textContent, { continued: shouldContinue, align: 'justify', indent: 0 });
                        } else if (shouldContinue && !hasLeadingSpace) {
                            // Empty string part? Should be filtered out but just in case
                        }
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
