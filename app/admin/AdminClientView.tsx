'use client';

import React, { useState } from 'react';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface ProductItem {
  id: number;
  title: string;
  description: string;
  basePrice: number;
  category?: { name: string };
  variants: { id: number; size: string; stock: number; images: string[] }[];
}

export default function AdminClientView({ initialProducts }: { initialProducts: ProductItem[] }) {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');
  const [productsList, setProductsList] = useState<ProductItem[]>(initialProducts);

  // Formulario nuevo
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [categoryName, setCategoryName] = useState('Pantalones');
  const [customCategory, setCustomCategory] = useState('');
  const [color, setColor] = useState('Negro');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: { enabled: boolean; stock: number } }>({
    S: { enabled: true, stock: 10 },
    M: { enabled: true, stock: 10 },
    L: { enabled: true, stock: 10 },
    XL: { enabled: false, stock: 0 },
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Edición
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [sz]: { enabled: !prev[sz]?.enabled, stock: prev[sz]?.stock || 10 },
    }));
  };

  const handleStockChange = (sz: string, val: number) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [sz]: { ...prev[sz], stock: val >= 0 ? val : 0 },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const activeSizes = Object.entries(selectedSizes)
        .filter(([_, data]) => data.enabled)
        .map(([size, data]) => ({ size, stock: data.stock }));

      if (activeSizes.length === 0) throw new Error('Selecciona al menos una talla con stock.');

      const finalCategory = categoryName === 'OTRA' ? customCategory.trim() : categoryName.trim();
      if (!finalCategory) throw new Error('Especifica la categoría.');

      let base64Image = '';
      if (imageFile) {
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
        });
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          basePrice,
          categoryName: finalCategory,
          color,
          imageUrl: base64Image,
          sizes: activeSizes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');

      setMessage({ type: 'success', text: `¡Prenda publicada con éxito!` });
      setTitle('');
      setDescription('');
      setBasePrice('');
      setImageFile(null);
      window.location.reload();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, productTitle: string) => {
    if (!confirm(`¿Seguro que deseas eliminar "${productTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar');
      setProductsList((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setEditTitle(p.title);
    setEditPrice(p.basePrice.toString());
    setEditDescription(p.description || '');
    setEditCategory(p.category?.name || 'Pantalones');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          basePrice: editPrice,
          description: editDescription,
          categoryName: editCategory,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar');
      alert('¡Producto modificado!');
      setEditingProduct(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '30px 15px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: activeTab === 'create' ? '#111827' : '#e5e7eb',
              color: activeTab === 'create' ? '#ffffff' : '#374151',
            }}
          >
            + Subir Nueva Prenda
          </button>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: activeTab === 'list' ? '#111827' : '#e5e7eb',
              color: activeTab === 'list' ? '#ffffff' : '#374151',
            }}
          >
            📋 Gestionar / Modificar Prendas ({productsList.length})
          </button>
        </div>

        {activeTab === 'create' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111827' }}>Subir Nueva Prenda</h1>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 20px 0' }}>Define sección y tallas múltiples.</p>

            {message && (
              <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#065f46' : '#991b1b' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Nombre</label>
                <input required type="text" placeholder="Ej: Pantalón Cargo Oversize" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Descripción</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Precio (Q)</label>
                  <input required type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Color</label>
                  <input type="text" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ backgroundColor: '#f9fafb', padding: '14px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Sección / Categoría</label>
                <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)} style={{ width: '100%', padding: '9px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#fff', marginBottom: categoryName === 'OTRA' ? '10px' : '0' }}>
                  <option value="Pantalones">Pantalones</option>
                  <option value="Sudaderas & Hoodies">Sudaderas & Hoodies</option>
                  <option value="Playeras & Tops">Playeras & Tops</option>
                  <option value="Accesorios">Accesorios</option>
                  <option value="OTRA">+ Crear nueva sección...</option>
                </select>
                {categoryName === 'OTRA' && (
                  <input required type="text" placeholder="Nombre de categoría..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} style={{ width: '100%', padding: '9px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Tallas y Stock</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {AVAILABLE_SIZES.map((sz) => {
                    const isChecked = !!selectedSizes[sz]?.enabled;
                    return (
                      <div key={sz} style={{ border: `1px solid ${isChecked ? '#111827' : '#e5e7eb'}`, padding: '8px', borderRadius: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '4px' }}>
                          <input type="checkbox" checked={isChecked} onChange={() => toggleSize(sz)} />
                          Talla {sz}
                        </label>
                        {isChecked && (
                          <input type="number" min="0" value={selectedSizes[sz]?.stock ?? 10} onChange={(e) => handleStockChange(sz, parseInt(e.target.value, 10))} style={{ width: '100%', padding: '4px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Foto</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} style={{ fontSize: '13px' }} />
              </div>

              <button type="submit" disabled={loading} style={{ padding: '14px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Guardando...' : 'Publicar Prenda'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'list' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Prendas en Inventario ({productsList.length})</h2>
              <button onClick={() => window.location.reload()} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', backgroundColor: '#fff' }}>Refrescar</button>
            </div>

            {productsList.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No hay prendas en la base de datos.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {productsList.map((p) => {
                  const img = p.variants[0]?.images?.[0] || '';
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#fafafa' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {img ? (
                          <img src={img} alt={p.title} style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                        ) : (
                          <div style={{ width: '50px', height: '60px', backgroundColor: '#e5e7eb', borderRadius: '6px' }} />
                        )}
                        <div>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{p.title}</h4>
                          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                            {p.category?.name || 'Sin categoría'} &bull; <strong style={{ color: '#111827' }}>Q{Number(p.basePrice).toFixed(2)}</strong>
                          </p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#9ca3af' }}>
                            Tallas: {p.variants.map((v) => `${v.size}(${v.stock})`).join(', ')}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Modificar
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {editingProduct && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', maxWidth: '450px', width: '100%' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>Modificar Prenda</h3>
              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Nombre</label>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Precio (Q)</label>
                  <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Categoría / Sección</label>
                  <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Descripción</label>
                  <textarea rows={2} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setEditingProduct(null)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button type="submit" style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#111827', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}