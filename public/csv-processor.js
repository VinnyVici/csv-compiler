class CSVProcessor {
  constructor() {
    this.allHeaders = new Set();
    this.compiledData = [];
  }

  async processFiles(files) {
    try {
      this.reset();
      
      // First pass: collect all unique headers
      for (const file of files) {
        const headers = await this.getHeaders(file);
        headers.forEach(header => this.allHeaders.add(header));
      }

      const headersArray = Array.from(this.allHeaders);
      
      // Second pass: process each file and collect data
      for (const file of files) {
        const data = await this.processFile(file, headersArray);
        this.compiledData.push(...data);
      }
      
      return {
        success: true,
        message: `Successfully compiled ${files.length} files`,
        totalRows: this.compiledData.length,
        totalColumns: headersArray.length,
        headers: headersArray,
        data: this.compiledData
      };
    } catch (error) {
      throw new Error(`Compilation failed: ${error.message}`);
    }
  }

  async getHeaders(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n');
          if (lines.length > 0) {
            const headers = this.parseCSVLine(lines[0]);
            resolve(headers);
          } else {
            resolve([]);
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async processFile(file, allHeaders) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            resolve([]);
            return;
          }

          const headers = this.parseCSVLine(lines[0]);
          const data = [];

          for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const row = {};
            
            // Map values to headers
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            // Create normalized row with all headers
            const normalizedRow = {};
            allHeaders.forEach(header => {
              normalizedRow[header] = row[header] || '';
            });
            
            data.push(normalizedRow);
          }

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  generateCSV(data, headers) {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          let value = row[header] || '';
          // Escape quotes and wrap in quotes if necessary
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = '"' + value.replace(/"/g, '""') + '"';
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }

  downloadCSV(data, headers, filename = 'compiled-data.csv') {
    const csvContent = this.generateCSV(data, headers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  reset() {
    this.allHeaders.clear();
    this.compiledData = [];
  }
}