import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface ContractData {
    arrendador: string;
    arrendatario: string;
    propiedad: string;
    fechaInicio: Date;
    fechaFin: Date;
    monto: number;
}

export const generateContractPDF = (data: ContractData): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const fileName = `contrato-${Date.now()}.pdf`;
            const uploadDir = path.join(__dirname, '../../uploads'); // Ensure this dir exists
            const filePath = path.join(uploadDir, fileName);

            // Create dir if not exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            doc.fontSize(20).text('CONTRATO DE ARRENDAMIENTO', { align: 'center' });
            doc.moveDown();

            doc.fontSize(12).text(`
                Conste por el presente documento, el Contrato de Arrendamiento que celebran:
                
                ARRENDADOR: ${data.arrendador}
                ARRENDATARIO: ${data.arrendatario}
                
                PROPIEDAD: ${data.propiedad}
                
                FECHA DE INICIO: ${data.fechaInicio.toDateString()}
                FECHA DE FIN: ${data.fechaFin.toDateString()}
                
                MONTO ACORDADO: $${data.monto.toFixed(2)}
                
                CLÁUSULAS:
                1. El arrendatario se compromete a pagar el monto acordado.
                2. El arrendador entrega la propiedad en buen estado.
                3. ... (Más cláusulas legales)
                
                Firmado digitalmente el ${new Date().toDateString()}.
            `);

            doc.end();

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};
