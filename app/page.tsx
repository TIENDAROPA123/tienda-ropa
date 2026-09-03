import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <span className="font-black text-xl tracking-wider uppercase">NOVA ATELIER</span>
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
          Colección Disponible ({products.length})
        </span>
      </header>

      {/* Grid de Catálogo */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Catálogo de Prendas</h1>
          <p className="text-sm text-neutral-500 mt-1">Selecciona cualquier prenda para ver tallas y realizar tu compra.</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
            <p className="text-neutral-500 text-sm">No hay prendas disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const firstVariant = product.variants[0];
              const imageUrl = firstVariant?.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80';
              const price = Number(product.basePrice).toFixed(2);

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col hover:border-black hover:shadow-md transition-all duration-200"
                >
                  <div className="aspect-[4/5] w-full bg-neutral-100 overflow-hidden relative">
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                      {product.category?.name || 'Colección'}
                    </span>
                    <h3 className="font-semibold text-sm text-neutral-900 mt-1 line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-neutral-100">
                      <span className="font-bold text-base text-neutral-900">Q{price}</span>
                      <span className="text-xs text-neutral-500 group-hover:text-black font-semibold flex items-center gap-1">
                        Ver prenda &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}