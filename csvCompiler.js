const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

class CSVCompiler {
  constructor() {
    this.allHeaders = new Set();
    this.compiledData = [];
  }

  async compileCSVFiles(filePaths, outputPath) {
    try {
      // First pass: collect all unique headers
      for (const filePath of filePaths) {
        const headers = await this.getHeaders(filePath);
        headers.forEach(header => this.allHeaders.add(header));
      }

      const headersArray = Array.from(this.allHeaders);
      
      // Second pass: process each file and collect data
      for (const filePath of filePaths) {
        const data = await this.processFile(filePath, headersArray);
        this.compiledData.push(...data);
      }

      // Write compiled data to output file
      await this.writeCompiledCSV(outputPath, headersArray);
      
      return {
        success: true,
        message: `Successfully compiled ${filePaths.length} files into ${outputPath}`,
        totalRows: this.compiledData.length,
        totalColumns: headersArray.length,
        headers: headersArray
      };
    } catch (error) {
      throw new Error(`Compilation failed: ${error.message}`);
    }
  }

  async getHeaders(filePath) {
    return new Promise((resolve, reject) => {
      const headers = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headerList) => {
          headers.push(...headerList);
        })
        .on('data', () => {
          // We only need the first row to get headers
        })
        .on('end', () => {
          resolve(headers);
        })
        .on('error', reject);
    });
  }

  async processFile(filePath, allHeaders) {
    return new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Create a new row with all headers, filling missing columns with empty strings
          const normalizedRow = {};
          allHeaders.forEach(header => {
            normalizedRow[header] = row[header] || '';
          });
          data.push(normalizedRow);
        })
        .on('end', () => {
          resolve(data);
        })
        .on('error', reject);
    });
  }

  async writeCompiledCSV(outputPath, headers) {
    const csvWriter = createCsvWriter({
      path: outputPath,
      header: headers.map(h => ({ id: h, title: h }))
    });

    await csvWriter.writeRecords(this.compiledData);
  }

  reset() {
    this.allHeaders.clear();
    this.compiledData = [];
  }
}

module.exports = CSVCompiler;