# CSV Compiler

A web-based tool to compile multiple CSV files with identical or different column structures into a single master CSV file.

## Features

- **Smart Column Merging**: Automatically detects and merges columns from different CSV files
- **Flexible Structure**: Handles CSV files with different column structures
- **Web Interface**: Simple drag-and-drop interface for file uploads
- **Data Preservation**: Missing columns are filled with empty values, no data loss
- **Download Results**: Instantly download the compiled CSV file

## How It Works

1. Upload multiple CSV files (identical or different column structures)
2. The first file's headers are used as the base structure
3. Additional columns from other files are automatically detected and added
4. Missing data is filled with empty values to maintain data integrity
5. Download the compiled result as a single CSV file

## Project Structure

```
CSV Compiler/
├── server.js              # Express server
├── csvCompiler.js          # Core CSV compilation logic
├── package.json            # Dependencies and scripts
├── public/                 # Static web files
│   ├── index.html         # Main web interface
│   ├── style.css          # Styling
│   └── script.js          # Client-side JavaScript
├── uploads/               # Temporary file uploads (auto-created)
├── output/                # Compiled CSV outputs (auto-created)
└── test-files/            # Sample CSV files for testing
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Step 3: Access the Web Interface

Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Via Web Interface

1. **Open your browser** and go to `http://localhost:3000`
2. **Upload CSV files** by:
   - Dragging and dropping files onto the upload area, OR
   - Clicking the upload area and selecting files
3. **Review uploaded files** in the file list
4. **Click "Compile CSV Files"** to process
5. **Download the result** using the download button

### Via Command Line (Advanced)

You can also use the CSV compiler programmatically:

```javascript
const CSVCompiler = require('./csvCompiler');
const path = require('path');

async function compileCSVs() {
    const compiler = new CSVCompiler();
    const files = [
        'path/to/file1.csv',
        'path/to/file2.csv',
        'path/to/file3.csv'
    ];
    
    const result = await compiler.compileCSVFiles(files, 'output.csv');
    console.log(result);
}

compileCSVs();
```

## Example

### Input Files

**employees1.csv:**
```csv
name,age,department,salary
John Doe,30,Engineering,75000
Jane Smith,28,Marketing,65000
```

**employees2.csv:**
```csv
name,age,department,location
Alice Brown,32,Sales,New York
Charlie Wilson,29,HR,Chicago
```

**employees3.csv:**
```csv
name,age,department,salary,experience_years
David Lee,27,Engineering,70000,5
Sarah Davis,31,Marketing,68000,7
```

### Output

**compiled.csv:**
```csv
name,age,department,salary,location,experience_years
John Doe,30,Engineering,75000,,
Jane Smith,28,Marketing,65000,,
Alice Brown,32,Sales,,New York,
Charlie Wilson,29,HR,,Chicago,
David Lee,27,Engineering,70000,,5
Sarah Davis,31,Marketing,68000,,7
```

## Error Handling

The application includes comprehensive error handling:

- **File validation**: Only CSV files are accepted
- **Server errors**: Graceful error messages for compilation failures
- **Network errors**: Client-side error handling for network issues
- **Large files**: Built-in file size limits

## Development

### Running Tests

Create test CSV files in the `test-files/` directory and run:

```bash
node test-compiler.js
```

### Project Structure

- **Backend**: Node.js with Express for file handling and CSV processing
- **Frontend**: Vanilla JavaScript with modern CSS for the web interface
- **Dependencies**:
  - `express`: Web server
  - `multer`: File upload handling  
  - `csv-parser`: CSV parsing
  - `csv-writer`: CSV output generation

## Port Configuration

By default, the server runs on port 3000. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Security Notes

- Uploaded files are temporarily stored and automatically cleaned up
- Only CSV files are accepted for processing
- File size limits are enforced to prevent abuse

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port using `PORT=3001 npm start`
2. **Permission errors**: Ensure the application has write permissions for the `uploads/` and `output/` directories
3. **CSV parsing errors**: Ensure your CSV files are properly formatted with consistent delimiters

### Getting Help

If you encounter issues:
1. Check the server console for error messages
2. Verify your CSV files are properly formatted
3. Ensure Node.js and npm are properly installed

## License

MIT License - Feel free to use and modify as needed.