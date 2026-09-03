import { PrismaClient } from '@prisma/client';
import ProductClient from './ProductClient';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Obtenemos los productos de la base de datos
  const rawProducts = await prisma.product.findMany({
    include: {
      variants: true,
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Si aún no hay productos en la base de datos, mostramos un estado vacío amigable
  if (rawProducts.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">No hay prendas disponibles</h1>
          <p className="text-sm text-neutral-500">Pronto agregaremos nuevas colecciones al catálogo.</p>
        </div>
      </main>
    );
  }

  // Tomamos el producto más reciente como principal y convertimos basePrice a número
  const mainRaw = rawProducts[0];
  const productData = {
    id: mainRaw.id,
    title: mainRaw.title,
    slug: mainRaw.slug,
    description: mainRaw.description,
    basePrice: Number(mainRaw.basePrice),
    compositionCare: '100% Algodón peinado de alto gramaje. Lavar con agua fría.',
    shippingReturns: 'Envíos a todo el país en 2 a 4 días hábiles.',
    variants: mainRaw.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      colorName: v.colorName,
      colorHex: v.colorHex,
      stock: v.stock,
      images: v.images,
    })),
  };

  // Si hay más productos, usamos el segundo como recomendación (cross-sell)
  let crossSellData = null;
  if (rawProducts.length > 1) {
    const secondRaw = rawProducts[1];
    const firstVariant = secondRaw.variants[0];
    crossSellData = {
      id: secondRaw.id,
      title: secondRaw.title,
      price: Number(secondRaw.basePrice),
      image: firstVariant?.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
      size: firstVariant?.size || 'M',
      color: firstVariant?.colorName || 'Negro',
    };
  }

  return <ProductClient product={productData} crossSell={crossSellData} />;
}