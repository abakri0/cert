import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { PDFDocument as PDFLib, rgb } from 'pdf-lib';
import * as fontkit from 'fontkit';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths for assets and output
const TEMPLATE_PATH = path.join(__dirname, 'template.pdf'); // ملف PDF كقالب
const SHAMEL_BOLD_PATH = path.join(__dirname, './shamel_bold.ttf');
const SHAMEL_LIGHT_PATH = path.join(__dirname, './shamel_light.ttf');
const CERTIFICATES_DIR = path.join(__dirname, 'certificates');

// Ensure output directory exists
if (!fs.existsSync(CERTIFICATES_DIR)) {
  fs.mkdirSync(CERTIFICATES_DIR);
}

/**
 * Generates a certificate PDF using a PDF template.
 */
async function generateCertificate(trainee) {
  const {
    trainee_name = 'Unnamed',
    trainee_program = 'Unknown Program',
    start_date = 'N/A',
    end_date = 'N/A',
    title = 'شهادة حضور',
    year_issue = '2024',
    date_issue = '01-01-2024',
    email = 'noemail@example.com',
  } = trainee;

  const outputPath = path.join(CERTIFICATES_DIR, `${email}.pdf`);

  try {
    // Load the template PDF
    const existingPdfBytes = fs.readFileSync(TEMPLATE_PATH);
    const pdfDoc = await PDFLib.load(existingPdfBytes);

    // Register fontkit
    pdfDoc.registerFontkit(fontkit);

    // Embed custom fonts
    const boldFont = await pdfDoc.embedFont(fs.readFileSync(SHAMEL_BOLD_PATH));
    const lightFont = await pdfDoc.embedFont(fs.readFileSync(SHAMEL_LIGHT_PATH));

    // Get the first page of the template
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Get page dimensions
    const { width, height } = firstPage.getSize();

    // Helper function to center text
    const getCenteredPosition = (text, font, size) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      const xPosition = (width - textWidth) / 2;
      return xPosition;
    };

    // Draw trainee's name in the center
    firstPage.drawText(trainee_name, {
      x: getCenteredPosition(trainee_name, boldFont, 30),
      y: height - 350,
      size: 30,
      font: boldFont,
      color: rgb(0.62, 0.45, 0.78),
    });

    // Draw trainee's program in the center
    firstPage.drawText(trainee_program, {
      x: getCenteredPosition(trainee_program, boldFont, 30),
      y: height - 510,
      size: 30,
      font: boldFont,
      color: rgb(0.77, 0.67, 0.86),
    });

    // Save the new PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    console.log(`Certificate generated for ${trainee_name} (${email})`);
  } catch (error) {
    console.error('Error generating certificate:', error);
  }
}

// Check if the script is being run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Load data from JSON file
  const jsonFilePath = path.join(__dirname, 'data.json');
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }

    const trainees = JSON.parse(data);

    if (trainees.length === 0) {
      console.log('No trainee data found.');
      return;
    }

    // Generate one certificate for preview
    const previewTrainee = trainees[0];
    generateCertificate(previewTrainee).then(() => {
      // Generate all certificates if approved
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('Is the generated certificate okay? (yes/no): ', (answer) => {
        if (answer.trim().toLowerCase() === 'yes') {
          trainees.forEach((trainee) => {
            generateCertificate(trainee);
          });
        }
        rl.close();
      });
    });
  });
}
