import React, { useState } from 'react';
import { useStore } from '../../store';
import type { ProductBundle } from '../../types';
import { LuPackagePlus, LuSearch, LuPlus, LuPen, LuTrash2, LuX } from 'react-icons/lu';
import { Card, Table, Button, Input } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

const AdminBundles: React.FC = () => {
  const { productBundles, products, addProductBundle, updateProductBundle, deleteProductBundle } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Partial<ProductBundle> | null>(null);

  // New/Edit State form
  const [bundleForm, setBundleForm] = useState<Partial<ProductBundle>>({
    name: '', description: '', sku: '', price: 0, items: [], active: true
  });
  
  // Temporary state for adding items to the current form
  const [newItemProductId, setNewItemProductId] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const filteredBundles = productBundles.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const openAddModal = () => {
    setEditingBundle(null);
    setBundleForm({ name: '', description: '', sku: '', price: 0, items: [], active: true });
    setNewItemProductId('');
    setNewItemQuantity(1);
    setIsModalOpen(true);
  };

  const openEditModal = (bundle: ProductBundle) => {
    setEditingBundle(bundle);
    setBundleForm({ ...bundle });
    setNewItemProductId('');
    setNewItemQuantity(1);
    setIsModalOpen(true);
  };

  const handleSaveBundle = () => {
    if (!bundleForm.name || !bundleForm.sku || !bundleForm.items?.length) {
      alert("Please provide a name, sku, and at least one item.");
      return;
    }

    if (editingBundle?.id) {
      updateProductBundle(editingBundle.id, bundleForm);
    } else {
      addProductBundle({
        name: bundleForm.name,
        description: bundleForm.description || '',
        sku: bundleForm.sku,
        price: bundleForm.price || 0,
        items: bundleForm.items,
        active: bundleForm.active ?? true
      });
    }
    setIsModalOpen(false);
  };

  const handleAddItemToBundle = () => {
    if (!newItemProductId || newItemQuantity <= 0) return;
    
    setBundleForm(prev => {
      const existingItem = prev.items?.find(i => i.productId === newItemProductId);
      let newItems = prev.items ? [...prev.items] : [];
      
      if (existingItem) {
        newItems = newItems.map(i => i.productId === newItemProductId ? { ...i, quantity: i.quantity + newItemQuantity } : i);
      } else {
        newItems.push({ productId: newItemProductId, quantity: newItemQuantity });
      }
      return { ...prev, items: newItems };
    });
    
    setNewItemProductId('');
    setNewItemQuantity(1);
  };

  const handleRemoveItemFromBundle = (productId: string) => {
    setBundleForm(prev => ({
      ...prev,
      items: prev.items?.filter(i => i.productId !== productId)
    }));
  };

  // Pre-calculate suggested price if needed
  const calculateBaseValue = () => {
    if (!bundleForm.items) return 0;
    return bundleForm.items.reduce((total, item) => {
      const p = products.find(prod => prod.id === item.productId);
      return total + ((p?.basePrice || 0) * item.quantity);
    }, 0);
  };

  const suggestedValue = calculateBaseValue();

  const columns = [
    { key: 'name', header: 'Bundle Name', render: (row: any) => <span className="font-medium text-main">{row.name}</span> },
    { key: 'sku', header: 'SKU', render: (row: any) => row.sku },
    { key: 'itemsCount', header: 'Included Items', render: (row: any) => `${row.items.length} products` },
    { key: 'price', header: 'Bundle Price', render: (row: any) => <span className="font-medium text-success">{formatPrice(row.price)}</span> },
    { key: 'status', header: 'Status', render: (row: any) => row.active ? <span className="status-badge success">Active</span> : <span className="status-badge">Inactive</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: any) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-icon" 
            title="Edit Bundle" 
            onClick={() => openEditModal(row)}
            style={{ padding: '0.4rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', cursor: 'pointer' }}
          >
            <LuPen size={16} color="var(--primary)" />
          </button>
          <button 
            className="btn-icon" 
            title="Delete Bundle" 
            onClick={() => { if(window.confirm('Delete this bundle?')) deleteProductBundle(row.id); }}
            style={{ padding: '0.4rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', cursor: 'pointer' }}
          >
            <LuTrash2 size={16} color="var(--danger)" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2><LuPackagePlus style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--primary)' }} />Starter Kits & Bundles</h2>
          <p className="text-muted">Assemble and price curated kits for clients.</p>
        </div>
        <div>
          <Button variant="primary" onClick={openAddModal}>
            <LuPlus size={18} style={{ marginRight: '0.5rem' }} /> Create Kit
          </Button>
        </div>
      </div>

      <Card style={{ padding: '1rem 1.5rem' }}>
        <div className="search-box" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <LuSearch size={20} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Search by bundle name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: '1rem', color: 'var(--text-main)' }}
          />
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {filteredBundles.length > 0 ? (
          <Table columns={columns as any} data={filteredBundles} />
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No bundles found.
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBundle ? "Edit Bundle" : "Create New Bundle"}
        footer={
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
              Individual Value: <strong style={{ textDecoration: 'line-through' }}>{formatPrice(suggestedValue)}</strong>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveBundle}>Save Bundle</Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Bundle Name" value={bundleForm.name || ''} onChange={e => setBundleForm({...bundleForm, name: e.target.value})} placeholder="e.g. New Office Setup Kit" />
            <Input label="Bundle SKU" value={bundleForm.sku || ''} onChange={e => setBundleForm({...bundleForm, sku: e.target.value})} placeholder="KIT-OFFICE-01" />
          </div>
          
          <Input label="Description" value={bundleForm.description || ''} onChange={e => setBundleForm({...bundleForm, description: e.target.value})} placeholder="What does this include and who is it for?" />
          
          <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Bundle Items</h4>
            
            {bundleForm.items && bundleForm.items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {bundleForm.items.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{product?.name || 'Unknown Product'}</span>
                        <span className="text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>({product?.sku})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="font-medium">Qty: {item.quantity}</span>
                        <button type="button" onClick={() => handleRemoveItemFromBundle(item.productId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center' }}>
                          <LuX size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Add Product to Kit</label>
                <select 
                  value={newItemProductId} 
                  onChange={e => setNewItemProductId(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                >
                  <option value="">-- Select a product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku}) - {formatPrice(p.basePrice)}</option>
                  ))}
                </select>
              </div>
              <div style={{ width: '100px' }}>
                <Input type="number" label="Qty" value={newItemQuantity} onChange={e => setNewItemQuantity(Number(e.target.value))} min={1} />
              </div>
              <Button type="button" variant="secondary" onClick={handleAddItemToBundle} disabled={!newItemProductId}>Add</Button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.25rem' }}>Final Bundle Price (₹)</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', opacity: 0.8 }}>What the client actually pays</span>
            </div>
            <input 
              type="number" 
              value={bundleForm.price || ''} 
              onChange={e => setBundleForm({...bundleForm, price: Number(e.target.value)})}
              placeholder={suggestedValue.toString()}
              style={{ width: '150px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', outline: 'none', fontSize: '1.25rem', fontWeight: 700, textAlign: 'right' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={bundleForm.active} onChange={e => setBundleForm({...bundleForm, active: e.target.checked})} />
            <span className="input-label" style={{ marginBottom: 0 }}>Bundle is active and visible in catalog</span>
          </label>

        </div>
      </Modal>

    </div>
  );
};

export default AdminBundles;
