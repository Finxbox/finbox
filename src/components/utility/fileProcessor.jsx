import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export async function processFiles(files) {
  const allData = [];
  
  for (const file of files) {
    try {
      const fileData = await readFile(file);
      allData.push(...fileData);
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
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(content);
          data = Array.isArray(json) ? json : (json.data || []);
        } else if (file.name.endsWith('.csv')) {
          const results = Papa.parse(content, {
            header: true,
            skipEmptyLines: true
          });
          data = results.data;
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(content, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(worksheet);
        } else {
          reject(new Error('Unsupported file format'));
          return;
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };
    
    // Use appropriate read method
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  });
}