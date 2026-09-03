import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import ProductClient from '../../ProductClient';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id, 10);

  if (isNaN(productId)) {
    notFound();
  }

  const rawProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: true,
      category: true,
    },
  });

  if (!rawProduct) {
    notFound();
  }

  // Obtenemos una prenda recomendada distinta a la actual
  const crossSellRaw = await prisma.product.findFirst({
    where: {
      id: { not: productId },
    },
    include: {
      variants: true,
    },
  });

  const productData = {
    id: rawProduct.id,
    title: rawProduct.title,
    slug: rawProduct.slug,
    description: rawProduct.description,
    basePrice: Number(rawProduct.basePrice),
    compositionCare: '100% Algodón peinado de alto gramaje. Lavar con agua fría.',
    shippingReturns: 'Envíos a todo el país en 2 a 4 días hábiles.',
    variants: rawProduct.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      colorName: v.colorName,
      colorHex: v.colorHex,
      stock: v.stock,
      images: v.images,
    })),
  };

  let crossSellData = null;
  if (crossSellRaw && crossSellRaw.variants.length > 0) {
    const v = crossSellRaw.variants[0];
    crossSellData = {
      id: crossSellRaw.id,
      title: crossSellRaw.title,
      price: Number(crossSellRaw.basePrice),
      image: v.images[0] || '',
      size: v.size,
      color: v.colorName,
    };
  }

  return <ProductClient product={productData} crossSell={crossSellData} />;
}