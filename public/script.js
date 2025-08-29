class CSVCompilerApp {
    constructor() {
        this.files = [];
        this.csvProcessor = new CSVProcessor();
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.fileDropArea = document.getElementById('fileDropArea');
        this.fileInput = document.getElementById('fileInput');
        this.fileList = document.getElementById('fileList');
        this.compileBtn = document.getElementById('compileBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.errorSection = document.getElementById('errorSection');
        this.resultMessage = document.getElementById('resultMessage');
        this.resultStats = document.getElementById('resultStats');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Output filename element
        this.outputFilename = document.getElementById('outputFilename');
    }

    attachEventListeners() {
        // File drop area events
        this.fileDropArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileDropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileDropArea.classList.add('drag-over');
        });

        this.fileDropArea.addEventListener('dragleave', () => {
            this.fileDropArea.classList.remove('drag-over');
        });

        this.fileDropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileDropArea.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Compile button
        this.compileBtn.addEventListener('click', () => {
            this.compileFiles();
        });
    }

    handleFiles(fileList) {
        const csvFiles = Array.from(fileList).filter(file => 
            file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')
        );

        if (csvFiles.length === 0) {
            this.showError('Please select only CSV files.');
            return;
        }

        csvFiles.forEach(file => {
            if (!this.files.some(f => f.name === file.name && f.size === file.size)) {
                this.files.push(file);
            }
        });

        this.updateFileList();
        this.updateCompileButton();
        this.hideError();
        this.hideResults();
    }

    updateFileList() {
        if (this.files.length === 0) {
            this.fileList.innerHTML = '';
            return;
        }

        this.fileList.innerHTML = this.files.map((file, index) => `
            <div class="file-item">
                <div class="file-info">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"></path>
                    </svg>
                    <span>${file.name}</span>
                    <span class="file-size">(${this.formatFileSize(file.size)})</span>
                </div>
                <button class="remove-file" onclick="app.removeFile(${index})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFileList();
        this.updateCompileButton();
    }

    updateCompileButton() {
        this.compileBtn.disabled = this.files.length === 0;
    }

    async compileFiles() {
        if (this.files.length === 0) return;

        this.setLoading(true);
        this.hideError();
        this.hideResults();

        try {
            const result = await this.csvProcessor.processFiles(this.files);
            this.showResults(result);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    showResults(result) {
        this.resultMessage.textContent = result.message;
        
        const filename = this.outputFilename.value || 'compiled-data.csv';
        
        let statsHTML = `
            <div class="stat-item">
                <span class="stat-label">Files Processed:</span>
                <span class="stat-value">${this.files.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Rows:</span>
                <span class="stat-value">${result.totalRows.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Columns:</span>
                <span class="stat-value">${result.totalColumns}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Columns Found:</span>
                <span class="stat-value">${result.headers.join(', ')}</span>
            </div>
        `;

        this.resultStats.innerHTML = statsHTML;

        this.downloadBtn.onclick = () => {
            this.csvProcessor.downloadCSV(result.data, result.headers, filename);
        };

        this.resultsSection.style.display = 'block';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
    }

    hideError() {
        this.errorSection.style.display = 'none';
    }

    hideResults() {
        this.resultsSection.style.display = 'none';
    }

    setLoading(loading) {
        const buttonText = this.compileBtn.querySelector('span');
        const spinner = this.compileBtn.querySelector('.spinner');
        
        if (loading) {
            buttonText.textContent = 'Compiling...';
            spinner.style.display = 'block';
            this.compileBtn.disabled = true;
        } else {
            buttonText.textContent = 'Compile CSV Files';
            spinner.style.display = 'none';
            this.compileBtn.disabled = this.files.length === 0;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the app when DOM is loaded
const app = new CSVCompilerApp();