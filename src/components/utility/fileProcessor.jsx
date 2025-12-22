// components/utility/fileProcessor.jsx
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { detectBankFromData } from './financialUtils';

export async function processFiles(files) {
  const allData = [];
  let detectedBank = 'Unknown';
  
  for (const file of files) {
    try {
      const fileData = await readFile(file);
      
      // Detect bank from file data
      if (fileData.length > 0) {
        const bank = detectBankFromData(fileData);
        if (bank !== 'Unknown') {
          detectedBank = bank;
        }
        
        // Add bank info to each row
        const enhancedData = fileData.map(row => ({
          ...row,
          'BANK DETECTED': detectedBank
        }));
        
        allData.push(...enhancedData);
      } else {
        allData.push(...fileData);
      }
      
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      throw new Error(`Error processing file ${file.name}: ${error.message}`);
    }
  }
  
  return allData;
}

async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const content = e.target.result;
        let data = [];
        
        // Handle different file types
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.json')) {
          const json = JSON.parse(content);
          data = Array.isArray(json) ? json : (json.data || []);
        } else if (fileName.endsWith('.csv')) {
          const results = Papa.parse(content, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(), // Clean headers
            skipEmptyLines: 'greedy'
          });
          data = results.data;
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          const workbook = XLSX.read(content, { 
            type: 'binary',
            cellDates: true, // Parse dates
            cellStyles: true
          });
          
          // Try to find the right sheet (not always first one)
          let sheetName = workbook.SheetNames[0];
          
          // Look for sheet with transaction data
          for (const name of workbook.SheetNames) {
            const worksheet = workbook.Sheets[name];
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Check if sheet has meaningful data (more than 2 rows, some columns)
            if (sheetData.length > 2 && sheetData[0] && sheetData[0].length >= 3) {
              sheetName = name;
              break;
            }
          }
          
          const worksheet = workbook.Sheets[sheetName];
          
          // Try to detect header row
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          let headerRow = 0;
          
          // Look for row with date/amount keywords
          for (let i = 0; i < Math.min(rawData.length, 10); i++) {
            const row = rawData[i];
            if (Array.isArray(row)) {
              const rowString = row.join(' ').toLowerCase();
              if (rowString.includes('date') && 
                  (rowString.includes('amount') || rowString.includes('debit') || rowString.includes('credit'))) {
                headerRow = i;
                break;
              }
            }
          }
          
          // Convert with detected header row
          data = XLSX.utils.sheet_to_json(worksheet, { header: headerRow });
        } else {
          reject(new Error(`Unsupported file format: ${file.name}. Supported: JSON, CSV, XLSX, XLS`));
          return;
        }
        
        // Clean up empty rows
        data = data.filter(row => {
          if (!row || typeof row !== 'object') return false;
          
          // Check if row has any non-empty values
          const values = Object.values(row);
          return values.some(v => v !== null && v !== undefined && v !== '');
        });
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = function() {
      reject(new Error('Failed to read file. File might be corrupted or too large.'));
    };
    
    // Use appropriate read method based on file type
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  });
}

// Helper function to guess column types from data
export function guessColumnTypes(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {};
  }
  
  const firstRow = rows[0];
  const columnTypes = {};
  
  for (const [key, value] of Object.entries(firstRow)) {
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes('date')) {
      columnTypes[key] = 'date';
    } else if (keyLower.includes('desc') || keyLower.includes('narration') || keyLower.includes('particular')) {
      columnTypes[key] = 'particulars';
    } else if (keyLower.includes('debit') || keyLower.includes('dr') || keyLower.includes('withdrawal')) {
      columnTypes[key] = 'debit';
    } else if (keyLower.includes('credit') || keyLower.includes('cr') || keyLower.includes('deposit')) {
      columnTypes[key] = 'credit';
    } else if (keyLower.includes('balance')) {
      columnTypes[key] = 'balance';
    } else if (typeof value === 'number' && Math.abs(value) > 100) {
      // Guess numeric columns as amounts
      if (keyLower.includes('amt') || keyLower.includes('amount')) {
        columnTypes[key] = keyLower.includes('debit') ? 'debit' : 'credit';
      }
    }
  }
  
  return columnTypes;
}