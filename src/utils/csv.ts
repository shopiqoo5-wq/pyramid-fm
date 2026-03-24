export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return resolve([]);
      
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) return resolve([]);
      
      const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
      
      const result = [];
      
      for (let i = 1; i < lines.length; i++) {
        // Handle commas inside quotes
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!row) continue;
        
        const obj: any = {};
        headers.forEach((header, index) => {
          let val = row[index] ? row[index].trim() : '';
          // Remove wrapping quotes if present
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
          }
          obj[header] = val;
        });
        result.push(obj);
      }
      resolve(result);
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const exportToCSV = (filename: string, rows: any[]) => {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        const val = row[header];
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return val;
      }).join(',')
    )
  ].join('\n');

  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
  const link = document.createElement("a");
  link.href = encodedUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
