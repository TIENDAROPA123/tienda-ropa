import { PrismaClient } from '@prisma/client';
import AdminClientView from './AdminClientView';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const rawProducts = await prisma.product.findMany({
    include: {
      variants: true,
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const initialProducts = rawProducts.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    basePrice: Number(p.basePrice),
    category: p.category ? { name: p.category.name } : undefined,
    variants: p.variants.map((v) => ({
      id: v.id,
      size: v.size,
      stock: v.stock,
      images: v.images,
    })),
  }));

  return <AdminClientView initialProducts={initialProducts} />;
}