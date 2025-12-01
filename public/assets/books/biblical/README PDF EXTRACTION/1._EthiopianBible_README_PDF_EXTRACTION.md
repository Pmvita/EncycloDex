# PDF Text Extraction Setup

This directory contains a Python script to extract text from PDF files, specifically set up for extracting text from the Ethiopian Bible PDFs.

## Quick Start

### 1. Set Up Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Extract Text from PDFs

**Option A: Using Python directly (with venv activated)**
```bash
# Activate virtual environment first
source venv/bin/activate

# Extract text from Ethiopian Bible.pdf
python extract_pdf_text.py "Ethiopian Bible.pdf"

# Extract text from 112_books_Apocrypha.pdf
python extract_pdf_text.py "112_books_Apocrypha.pdf"

# Specify custom output file
python extract_pdf_text.py "Ethiopian Bible.pdf" "ethiopian_bible_text.txt"

# Deactivate when done
deactivate
```

**Option B: Using the convenience script (automatically handles venv)**
```bash
# Extract text from Ethiopian Bible.pdf
./extract_pdf.sh "Ethiopian Bible.pdf"

# Extract text from 112_books_Apocrypha.pdf
./extract_pdf.sh "112_books_Apocrypha.pdf"

# Specify custom output file
./extract_pdf.sh "Ethiopian Bible.pdf" "ethiopian_bible_text.txt"
```

## Recreating the Virtual Environment

If you need to delete and recreate the virtual environment:

```bash
# 1. Deactivate current venv (if active)
deactivate

# 2. Remove the old virtual environment
rm -rf venv

# 3. Create a new virtual environment
python3 -m venv venv

# 4. Activate the new virtual environment
source venv/bin/activate

# 5. Upgrade pip (recommended)
pip install --upgrade pip

# 6. Install dependencies
pip install -r requirements.txt
```

## Usage

The script will:
- Extract text from all pages of the PDF
- Save the extracted text to a `.txt` file (same name as PDF, but with `.txt` extension)
- Show progress for large PDFs (updates every 50 pages)
- Handle errors gracefully

### Command Line Options

```bash
python extract_pdf_text.py <pdf_file> [output_file]
```

- `pdf_file`: Path to the PDF file to extract text from (required)
- `output_file`: Optional path for the output text file. If not specified, uses the PDF filename with `.txt` extension

## Libraries Used

- **pdfplumber**: Primary library for text extraction (better quality)
- **PyPDF2**: Fallback library (included as alternative)

## Troubleshooting

### If pdfplumber fails:
The script will automatically fall back to PyPDF2 if available. You can also install PyPDF2 explicitly:

```bash
pip install PyPDF2
```

### If you get encoding errors:
The script uses UTF-8 encoding. If you encounter issues, the PDF might have special characters that need different handling.

### For very large PDFs:
The extraction process may take several minutes for large PDFs. The script shows progress every 50 pages.

## Notes

- The extracted text files will be saved in the same directory as the PDFs
- Large PDFs may produce very large text files
- Some PDFs (especially scanned images) may not extract text well if they don't have embedded text layers

