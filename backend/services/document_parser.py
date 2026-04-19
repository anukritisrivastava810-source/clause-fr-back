import pdfplumber
import docx
import io
import re

def parse_document_to_index(file_bytes: bytes, filename: str) -> list[dict]:
    """
    PageIndex structural parser.
    Instead of ripping text out randomly, it tracks the page number, 
    and groups text into hierarchical blocks to retain location context.
    Returns: list of dicts: {"page_context": str, "text": str}
    """
    lower_filename = filename.lower()
    structural_clauses = []
    
    if lower_filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                page_text = page.extract_text()
                if not page_text:
                    continue
                    
                # Split clauses by double newline roughly, retaining page context
                raw_clauses = re.split(r'\n{2,}|\n(?=\d+\.)', page_text)
                for c in raw_clauses:
                    c = c.strip()
                    if len(c) > 10:
                        structural_clauses.append({
                            "page_context": f"Page {page_num}",
                            "text": c
                        })
                        
    elif lower_filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(file_bytes))
        # Docx doesn't reliably have "pages", but we can use Heading/Paragraph structure
        current_heading = "Start of Document"
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
            
            # If it's a heading style, update context
            if getattr(para.style, "name", None) and "Heading" in para.style.name:
                current_heading = text
                continue
                
            if len(text) > 10:
                structural_clauses.append({
                    "page_context": f"Section: {current_heading}",
                    "text": text
                })
                
    elif lower_filename.endswith(".txt"):
        text = file_bytes.decode("utf-8")
        raw_clauses = re.split(r'\n{2,}|\n(?=\d+\.)', text)
        for c in raw_clauses:
            if len(c.strip()) > 10:
                structural_clauses.append({
                    "page_context": "Text Document",
                    "text": c.strip()
                })
    else:
        raise ValueError("Unsupported file type")
        
    return structural_clauses
