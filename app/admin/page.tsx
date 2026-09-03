'use client';

import React, { useState } from 'react';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [categoryName, setCategoryName] = useState('Pantalones');
  const [customCategory, setCustomCategory] = useState('');
  const [color, setColor] = useState('Negro');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Control de múltiples tallas y stock
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: { enabled: boolean; stock: number } }>({
    S: { enabled: true, stock: 10 },
    M: { enabled: true, stock: 10 },
    L: { enabled: true, stock: 10 },
    XL: { enabled: false, stock: 0 },
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [sz]: {
        enabled: !prev[sz]?.enabled,
        stock: prev[sz]?.stock || 10,
      },
    }));
  };

  const handleStockChange = (sz: string, val: number) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [sz]: {
        ...prev[sz],
        stock: val >= 0 ? val : 0,
      },
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

      if (activeSizes.length === 0) {
        throw new Error('Debes seleccionar al menos una talla con stock.');
      }

      const finalCategory = categoryName === 'OTRA' ? customCategory.trim() : categoryName.trim();
      if (!finalCategory) {
        throw new Error('Especifica la categoría para el producto.');
      }

      // Convertir archivo a base64 si se adjuntó
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
      if (!res.ok) throw new Error(data.error || 'Error al guardar la prenda');

      setMessage({ type: 'success', text: `¡Prenda publicada con ${activeSizes.length} tallas en categoría "${finalCategory}"!` });
      setTitle('');
      setDescription('');
      setBasePrice('');
      setImageFile(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 15px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px', maxWidth: '560px', width: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111827' }}>Panel de Administración</h1>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 24px 0' }}>Agrega categorías, tallas simultáneas y stock por prenda.</p>

        {message && (
          <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}` }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Nombre de la prenda</label>
            <input required type="text" placeholder="Ej: Pantalón Cargo Oversize" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Descripción</label>
            <textarea rows={3} placeholder="Detalles de corte, tela o ajustes..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Precio (Q)</label>
              <input required type="number" step="0.01" placeholder="150.00" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Color principal</label>
              <input type="text" placeholder="Ej: Negro" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Categoría o Sección */}
          <div style={{ backgroundColor: '#f9fafb', padding: '14px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Sección / Categoría</label>
            <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#fff', marginBottom: categoryName === 'OTRA' ? '10px' : '0' }}>
              <option value="Pantalones">Pantalones</option>
              <option value="Sudaderas & Hoodies">Sudaderas & Hoodies</option>
              <option value="Playeras & Tops">Playeras & Tops</option>
              <option value="Accesorios">Accesorios</option>
              <option value="OTRA">+ Crear nueva sección personalizada...</option>
            </select>

            {categoryName === 'OTRA' && (
              <input required type="text" placeholder="Escribe el nombre de la nueva categoría..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
            )}
          </div>

          {/* Selección de Tallas y Stock */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Tallas y Stock disponible</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {AVAILABLE_SIZES.map((sz) => {
                const isChecked = !!selectedSizes[sz]?.enabled;
                const stockVal = selectedSizes[sz]?.stock ?? 10;
                return (
                  <div key={sz} style={{ border: `1px solid ${isChecked ? '#111827' : '#e5e7eb'}`, backgroundColor: isChecked ? '#f8fafc' : '#fff', padding: '8px', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '6px' }}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggleSize(sz)} />
                      Talla {sz}
                    </label>
                    {isChecked && (
                      <input type="number" min="0" value={stockVal} onChange={(e) => handleStockChange(sz, parseInt(e.target.value, 10))} placeholder="Stock" style={{ width: '100%', padding: '4px 6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Foto de la prenda</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} style={{ fontSize: '13px' }} />
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '14px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
            {loading ? 'Guardando prenda...' : 'Publicar Prenda'}
          </button>
        </form>
      </div>
    </main>
  );
}