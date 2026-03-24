import React, { useState } from 'react';
import { useStore } from '../../store';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui';
import { LuUpload, LuCheck, LuInfo } from 'react-icons/lu';
import { parseCSV } from '../../utils/csv';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
  const { addProduct, products } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError('');
    
    try {
      const data = await parseCSV(selectedFile);
      setParsedData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV');
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setIsProcessing(true);

    try {
      // Simulate network wait
      await new Promise(r => setTimeout(r, 1000));
      
      let importedCount = 0;
      
      parsedData.forEach(row => {
        // Basic validation
        if (!row.name || !row.sku) return;
        
        // Check if SKU exists
        if (products.some(p => p.sku === row.sku)) return;

        addProduct({
          name: row.name,
          sku: row.sku,
          category: row.category || 'General',
          basePrice: Number(row.basePrice) || 0,
          uom: row.uom || 'Piece',
          description: row.description || '',
          imageUrl: row.imageUrl || 'https://images.unsplash.com/photo-1584820927498-cafe8c160826?w=200&h=200&fit=crop',
          gstRate: Number(row.gstRate) || 18,
          hsnCode: row.hsnCode || '0000',
          active: row.active ? String(row.active).toLowerCase() === 'true' : true
        });
        
        importedCount++;
      });
      
      alert(`Successfully imported ${importedCount} products.`);
      onClose();
      setFile(null);
      setParsedData([]);
      
    } catch (error) {
      console.error(error);
      setError('Import failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Products"
      footer={
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="ghost" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button variant="primary" onClick={handleImport} disabled={parsedData.length === 0 || isProcessing} isLoading={isProcessing}>
            Import {parsedData.length > 0 ? `${parsedData.length} rows` : ''}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '450px', padding: '1rem 0' }}>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.6 }}>
          Synchronize large datasets via CSV. 
          The master template must include: <span style={{ color: 'var(--primary)', fontWeight: 800 }}>name, sku, category, basePrice, uom, description, imageUrl, gstRate, hsnCode</span>.
        </p>

        <div className="input-group">
          <label className="input-label">Select Source File</label>
          <div style={{ 
            border: '2px dashed var(--border)', 
            borderRadius: '20px', 
            padding: '3rem 1.5rem', 
            textAlign: 'center',
            background: 'rgba(var(--primary-rgb), 0.05)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
            onClick={() => document.getElementById('csv-upload')?.click()}
            className="hover-lift"
          >
            <input 
              type="file" 
              id="csv-upload" 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--success)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuCheck size={32} />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>{file.name}</span>
                {parsedData.length > 0 && <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.7 }}>{parsedData.length} Valid Logical Entities Detected</span>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuUpload size={32} />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Dispatch CSV Matrix Here</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.6 }}>Drag and drop or click to browse local directory</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 700, border: '1px solid var(--danger)' }}>
            <LuInfo size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BulkImportModal;
