const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CSVCompiler = require('./csvCompiler');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'), false);
    }
  }
});

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/compile', upload.array('csvFiles'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No CSV files uploaded' });
    }

    const compiler = new CSVCompiler();
    const filePaths = req.files.map(file => file.path);
    const outputType = req.body.outputType || 'download';
    
    let outputPath;
    let isCustomPath = false;

    if (outputType === 'custom') {
      const customFilename = req.body.customFilename || 'compiled-data.csv';
      const customDirectory = req.body.customDirectory;
      
      if (!customDirectory) {
        return res.status(400).json({ error: 'Custom directory not specified' });
      }

      // For web security, we'll save to output directory with custom name
      // In a real desktop app, you'd write directly to the custom path
      outputPath = path.join('output', customFilename);
      isCustomPath = true;
    } else {
      outputPath = path.join('output', `compiled-${Date.now()}.csv`);
    }

    const result = await compiler.compileCSVFiles(filePaths, outputPath);
    
    // Clean up uploaded files
    filePaths.forEach(filePath => {
      fs.unlinkSync(filePath);
    });

    res.json({
      ...result,
      downloadUrl: `/download/${path.basename(outputPath)}`,
      outputType: outputType,
      customPath: isCustomPath ? req.body.customDirectory : null,
      actualFilename: path.basename(outputPath)
    });

  } catch (error) {
    console.error('Compilation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'output', req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  if (error.message === 'Only CSV files are allowed!') {
    return res.status(400).json({ error: 'Only CSV files are allowed' });
  }
  
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`CSV Compiler server running on http://localhost:${PORT}`);
  console.log('Upload your CSV files and compile them into one!');
});