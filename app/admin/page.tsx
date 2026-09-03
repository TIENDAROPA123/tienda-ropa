'use client';

import React, { useState } from 'react';

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('Negro');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setMensaje('⚠️ Debes seleccionar una foto para la prenda.');
      return;
    }

    setLoading(true);
    setMensaje('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          basePrice,
          categoryId,
          size,
          color,
          stock,
          imageUrl,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(`✅ ¡Prenda guardada! SKU generado: ${data.variants?.[0]?.sku}`);
        setTitle('');
        setDescription('');
        setBasePrice('');
        setImageUrl('');
      } else {
        setMensaje(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setMensaje(`❌ Error de red: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 16px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '6px' }}>Panel de Administración</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Sube prendas: el SKU y la foto se configuran de forma automática.</p>

        {mensaje && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', backgroundColor: mensaje.startsWith('✅') ? '#ecfdf5' : '#fef2f2', color: mensaje.startsWith('✅') ? '#065f46' : '#991b1b', border: `1px solid ${mensaje.startsWith('✅') ? '#a7f3d0' : '#fecaca'}` }}>
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>Nombre de la prenda</label>
            <input
              type="text"
              required
              placeholder="Ej: Camiseta Boxy Fit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>Descripción</label>
            <textarea
              required
              rows={3}
              placeholder="Detalles de tela, corte, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>Precio</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>ID Categoría</label>
              <input
                type="number"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>Talla</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
              >
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="Única">Única</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>Color</label>
              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>Stock</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>Foto desde tu computadora</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ width: '100%', fontSize: '14px' }}
            />
            {imageUrl && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Vista previa:</span>
                <img
                  src={imageUrl}
                  alt="Vista previa"
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '12px',
              padding: '14px',
              backgroundColor: '#111827',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '15px',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Subiendo...' : 'Publicar Prenda'}
          </button>
        </form>
      </div>
    </div>
  );
}