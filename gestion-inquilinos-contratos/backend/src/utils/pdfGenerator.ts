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
        precioMensual: number;
        precioTotal: number;
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

    // Helper function to convert number to words (reusable for integer and decimals)
    function convertirNumero(n: number): string {
        if (n === 0) return 'CERO';

        let letras = '';
        const miles = Math.floor(n / 1000);
        const resto = n % 1000;

        if (miles > 0) {
            if (miles === 1) letras += 'MIL ';
            else letras += convertGroup(miles) + ' MIL ';
        }

        if (resto > 0 || miles === 0) {
            letras += convertGroup(resto);
        }
        return letras.trim();
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

    const parteEntera = convertirNumero(entero);
    const parteDecimal = convertirNumero(decimal);

    return `${parteEntera.toUpperCase()} DÓLARES CON ${parteDecimal.toUpperCase()} CENTAVOS DE LOS ESTADOS UNIDOS DE AMÉRICA`;
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
            const templatePath = path.join(__dirname, '../../assets/templates/Contrato-Arrendamiento.md');
            // Header Logo Path
            const logoPath = path.join(__dirname, '../../assets/images/Portoviejo360logo.png');

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

                // Monthly Rent
                'VALOR_ARRIENDO_EN PALABRAS': numeroALetras(data.propiedad.precioMensual),
                'VALOR_DE_ARRIENDO_EN_NUMEROS': data.propiedad.precioMensual.toFixed(2),

                // Total Contract Value
                'VALOR_TOTAL_EN_PALABRAS': numeroALetras(data.propiedad.precioTotal),
                'VALOR_TOTAL_EN_NUMEROS': data.propiedad.precioTotal.toFixed(2),

                'NUMERO_CUENTA': 'XXXXXXXXXX',
                'NOMBRE_BANCO': 'BANCO GENÉRICO',
                'DURACION_TEXTO': duracionDias < 30
                    ? `${duracionDias} días`
                    : (duracionAnios > 0
                        ? `${duracionAnios} año${duracionAnios > 1 ? 's' : ''}${duracionMeses > 0 ? ` y ${duracionMeses} mes${duracionMeses > 1 ? 'es' : ''}` : ''}`
                        : `${duracionMeses} mes${duracionMeses > 1 ? 'es' : ''}`),

                // Using Total Value for Warranty usually, or equivalent to 1 month? 
                // Let's use Monthly Price for Warranty as is standard
                'VALOS_MONETARIO_DE_GARANTIA_EN PALABRAS': numeroALetras(data.propiedad.precioMensual),
                'VALOS_MONETARIO_DE_GARANTIA_EN_NUMEROS': data.propiedad.precioMensual.toFixed(2),
                'NUMERO_DE_CEDULA': data.arrendador.cedula,
                'NUMERO_CED': data.arrendatario.cedula,
                'TRIM_NOMBRE_ARRENDADOR': data.arrendador.nombre,
                'TRIM_NOMBRE_ARRENDATARIO': data.arrendatario.nombre
            };

            // Apply replacements
            // Apply replacements safely
            Object.keys(replacements).forEach(key => {
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = escapedKey.replace(/ /g, '\\s+');
                const regex = key.includes(' ')
                    ? new RegExp(pattern, 'g')
                    : new RegExp(`\\b${escapedKey}\\b`, 'g');

                if (content.match(regex)) {
                    console.log(`[PDF] Replacing key: ${key} with value: ${replacements[key]}`);
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
            const lines = content.trim().split('\n');

            let lastNonEmptyLine = '';

            // Helper to fix UTF-8 for PDFKit standard fonts (WinAnsi)
            const encodeForPDF = (str: string): string => {
                // Manual mapping for Spanish characters to WinAnsi (Cp1252)
                return str
                    .replace(/á/g, '\xE1')
                    .replace(/é/g, '\xE9')
                    .replace(/í/g, '\xED')
                    .replace(/ó/g, '\xF3')
                    .replace(/ú/g, '\xFA')
                    .replace(/ñ/g, '\xF1')
                    .replace(/Á/g, '\xC1')
                    .replace(/É/g, '\xC9')
                    .replace(/Í/g, '\xCD')
                    .replace(/Ó/g, '\xD3')
                    .replace(/Ú/g, '\xDA')
                    .replace(/Ñ/g, '\xD1')
                    .replace(/ü/g, '\xFC')
                    .replace(/Ü/g, '\xDC')
                    .replace(/¿/g, '\xBF')
                    .replace(/¡/g, '\xA1')
                    .replace(/º/g, '\xBA')
                    .replace(/ª/g, '\xAA');
            };

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                const line = lines[lineIndex];
                const trimmedLine = line.trim();

                // Skip processing the signature lines in the normal flow
                // We detect them by the underscore line or the headers
                if (trimmedLine.startsWith('___') || trimmedLine.includes('EL ARRENDADOR') || trimmedLine.includes('TRIM_NOMBRE') || trimmedLine.includes('C.C. ')) {
                    // Check if it's the signature block context (near end of file)
                    if (lineIndex > lines.length - 10) continue;
                }

                if (trimmedLine.includes('CONTRATO DE ARRENDAMIENTO')) continue;

                if (trimmedLine === '') {
                    if (lineIndex < lines.length - 1) {
                        doc.moveDown(0.5);
                    }
                    continue;
                }

                lastNonEmptyLine = trimmedLine;

                // Indent list items
                const indent = trimmedLine.startsWith('-') ? 20 : 0;

                // Parse for **bold** markers
                const parts = trimmedLine.split(/(\*\*.*?\*\*)/g).filter(p => p !== '');

                doc.text('', { indent, continued: true, align: 'justify' });

                parts.forEach((part, index) => {
                    const isLastPart = index === parts.length - 1;
                    const isLastLine = lineIndex === lines.length - 1;
                    const shouldContinue = !isLastPart || isLastLine;

                    const hasLeadingSpace = part.startsWith(' ');
                    const rawText = hasLeadingSpace ? part.slice(1) : part;
                    const textContent = encodeForPDF(rawText);

                    if (hasLeadingSpace) {
                        doc.text(' ', { continued: true, align: 'justify', indent: 0 });
                    }

                    if (part.startsWith('**') && part.endsWith('**')) {
                        const text = part.slice(2, -2);
                        const boldContent = encodeForPDF(text);
                        doc.font('Helvetica-Bold').text(boldContent, { continued: shouldContinue, align: 'justify', indent: 0 });
                    } else {
                        if (textContent.length > 0) {
                            doc.font('Helvetica').text(textContent, { continued: shouldContinue, align: 'justify', indent: 0 });
                        }
                    }
                });

                doc.font('Helvetica');
                doc.moveDown(0.5); // Ensure spacing between paragraphs
            } // End of for loop through lines

            // CRITICAL FIX: Flush any pending 'continued' state from the last line
            doc.text('', { continued: false });

            // Draw Signatures Manually

            if (doc.y > 550) { // Check if enough space remains
                doc.addPage();
                doc.on('pageAdded', () => drawHeader());
            } else {
                doc.moveDown(6); // Increased spacing before signatures
            }

            const startSignatureY = doc.y;
            const leftColX = 50;
            const rightColX = 300;
            const colWidth = 200;

            // Draw Lines
            doc.moveTo(leftColX, startSignatureY).lineTo(leftColX + colWidth, startSignatureY).stroke();
            doc.moveTo(rightColX, startSignatureY).lineTo(rightColX + colWidth, startSignatureY).stroke();

            let currentTextY = startSignatureY + 25; // Increased spacing (was 15) below line

            // Header
            doc.font('Helvetica-Bold');
            doc.text('EL ARRENDADOR', leftColX, currentTextY, { width: colWidth, align: 'left', lineBreak: false });
            doc.text('EL ARRENDATARIO', rightColX, currentTextY, { width: colWidth, align: 'left', lineBreak: false });

            currentTextY += 25; // Manual spacing

            // Names
            doc.font('Helvetica');
            const nombreArrendador = encodeForPDF(data.arrendador.nombre);
            const nombreArrendatario = encodeForPDF(data.arrendatario.nombre);

            doc.text(nombreArrendador, leftColX, currentTextY, { width: colWidth, align: 'left', lineBreak: false });
            doc.text(nombreArrendatario, rightColX, currentTextY, { width: colWidth, align: 'left', lineBreak: false });

            currentTextY += 25;

            // IDs
            const cedulaArrendador = `C.C. ${data.arrendador.cedula}`;
            const cedulaArrendatario = `C.C. ${data.arrendatario.cedula}`;

            doc.text(cedulaArrendador, leftColX, currentTextY, { width: colWidth, align: 'left', lineBreak: false });
            doc.text(cedulaArrendatario, rightColX, currentTextY, { width: colWidth, align: 'left', lineBreak: false });

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
