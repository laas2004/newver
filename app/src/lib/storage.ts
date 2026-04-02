import fs from 'fs';
import path from 'path';

// Base directory for uploaded files
const BASE_DIR = path.join(process.cwd(), '..'); // Go to project root

export function saveFile(domain: string, filename: string, buffer: Buffer): string {
  // Determine which folder to save to
  let folder = '';
  switch(domain) {
    case 'hr_law':
      folder = 'hr_law_data';
      break;
    case 'citizen_law':
      folder = 'citizen_law_data';
      break;
    case 'company_law':
      folder = 'company_law_data';
      break;
    default:
      folder = 'uploads';
  }
  
  const dirPath = path.join(BASE_DIR, folder);
  
  // Create folder if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const filePath = path.join(dirPath, filename);
  fs.writeFileSync(filePath, buffer);
  
  return filePath;
}

export function getFiles(domain: string): string[] {
  let folder = '';
  switch(domain) {
    case 'hr_law':
      folder = 'hr_law_data';
      break;
    case 'citizen_law':
      folder = 'citizen_law_data';
      break;
    case 'company_law':
      folder = 'company_law_data';
      break;
    default:
      return [];
  }
  
  const dirPath = path.join(BASE_DIR, folder);
  
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  
  return fs.readdirSync(dirPath).filter(f => f.endsWith('.pdf'));
}