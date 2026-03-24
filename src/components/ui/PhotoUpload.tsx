import React, { useState, useRef } from 'react';
import { LuX, LuCamera } from 'react-icons/lu';

interface PhotoUploadProps {
  onUpload: (url: string) => void;
  previewUrl?: string;
  maxSize?: number; // in MB
  label?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onUpload, previewUrl, maxSize = 5, label = 'Click or drag photo to upload' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`File size exceeds ${maxSize}MB limit.`);
      return;
    }
    setUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const mockUrl = URL.createObjectURL(file);
      onUpload(mockUrl);
      setUploading(false);
    }, 1500);
  };

  return (
    <div 
      style={{ 
        border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`, 
        borderRadius: 'var(--radius-md)', 
        padding: '2rem', 
        textAlign: 'center',
        background: isDragging ? 'var(--surface-hover)' : 'var(--surface)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative'
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if(file) handleFile(file); }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => { const file = e.target.files?.[0]; if(file) handleFile(file); }} />
      
      {uploading ? (
        <div style={{ padding: '1rem' }} className="text-muted">
          <div style={{ margin: '0 auto 1rem', width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          Uploading image...
        </div>
      ) : previewUrl ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-sm)' }} />
          <button 
            style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => { e.stopPropagation(); onUpload(''); }}
          >
            <LuX size={14} />
          </button>
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)' }}>
          <LuCamera size={32} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>{label}</p>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Supports JPG, PNG (Max {maxSize}MB)</p>
        </div>
      )}
    </div>
  );
};
