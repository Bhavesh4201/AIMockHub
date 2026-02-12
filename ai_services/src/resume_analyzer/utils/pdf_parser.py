import io
from pypdf import PdfReader

def extract_text_from_pdf(pdf_input):
    
    try:
        if isinstance(pdf_input, bytes):
            # Handle binary data (e.g. from MongoDB)
            reader = PdfReader(io.BytesIO(pdf_input))
        else:
            reader = PdfReader(pdf_input)
        text = ""
        for page in reader.pages:
            # Handle cases where extraction might return None
            text += (page.extract_text() or "") + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

    