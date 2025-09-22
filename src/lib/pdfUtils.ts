export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Simple text extraction from PDF binary
  let text = '';
  let inTextObject = false;
  
  for (let i = 0; i < uint8Array.length - 5; i++) {
    // Look for text objects and streams
    const chars = String.fromCharCode(...uint8Array.slice(i, i + 5));
    
    if (chars === 'stream') {
      inTextObject = true;
      i += 5;
      continue;
    }
    
    if (chars === 'endst') {
      inTextObject = false;
      i += 8;
      continue;
    }
    
    if (inTextObject) {
      const char = String.fromCharCode(uint8Array[i]);
      if (char >= ' ' && char <= '~' && char !== '(' && char !== ')') {
        text += char;
      } else if (char === '\n' || char === '\r') {
        text += ' ';
      }
    }
  }
  
  // Clean and filter text
  const words = text
    .replace(/[^a-zA-Z0-9@.+\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(word => word.length > 1 && /[a-zA-Z]/.test(word));
  
  return words.length > 5 ? words.join(' ') : 'Please paste your resume content in the text area below.';
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    } else {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          resolve(content || `${file.name} uploaded successfully.`);
        };
        reader.onerror = () => resolve(`Error reading ${file.name}. Please paste content manually.`);
        reader.readAsText(file);
      });
    }
  } catch (error) {
    return 'Please paste your resume content in the text area below.';
  }
};