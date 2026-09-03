import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Catálogo de Ropa</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>Prendas disponibles en inventario</p>
        </header>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>No hay prendas disponibles en este momento.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {products.map((product) => {
              const firstVariant = product.variants[0];
              const imageUrl = firstVariant?.images?.[0] || '';
              const price = Number(product.basePrice).toFixed(2);

              return (
                <div
                  key={product.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.title}
                      style={{ width: '100%', height: '260px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '260px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      Sin foto
                    </div>
                  )}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {product.category?.name || 'General'}
                    </span>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '6px 0' }}>
                      {product.title}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px 0', flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {product.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                        Q{price}
                      </span>
                      {firstVariant && (
                        <span style={{ fontSize: '12px', backgroundColor: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', color: '#374151' }}>
                          Talla {firstVariant.size}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}