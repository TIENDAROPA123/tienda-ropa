import { prisma } from '@/lib/prisma';
import ProductClient from './ProductClient';

export const revalidate = 0;

export default async function HomePage() {
  const dbProduct = await prisma.product.findUnique({
    where: { slug: 'sudadera-oversize-heavyweight-minimalist' },
    include: {
      variants: true,
    },
  });

  const dbCrossSell = await prisma.product.findUnique({
    where: { slug: 'gorro-beanie-tejido-ribbed' },
    include: {
      variants: true,
    },
  });

  if (!dbProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500">
        No se encontró el producto en la base de datos de Neon.
      </div>
    );
  }

  const product = {
    id: dbProduct.id,
    title: dbProduct.title,
    slug: dbProduct.slug,
    description: dbProduct.description,
    basePrice: Number(dbProduct.basePrice),
    compositionCare: dbProduct.compositionCare,
    shippingReturns: dbProduct.shippingReturns,
    variants: dbProduct.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      colorName: v.colorName,
      colorHex: v.colorHex,
      stock: v.stock,
      images: v.images,
    })),
  };

  const crossSell = dbCrossSell
    ? {
        id: dbCrossSell.id,
        title: dbCrossSell.title,
        price: Number(dbCrossSell.basePrice),
        image: dbCrossSell.variants[0]?.images[0] || '',
        size: dbCrossSell.variants[0]?.size || 'Única',
        color: dbCrossSell.variants[0]?.colorName || 'Negro',
      }
    : null;

  return <ProductClient product={product} crossSell={crossSell} />;
}