import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, basePrice, imageUrl, categoryName, variants } = body;

    const slug = (categoryName || 'General')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: categoryName?.trim() || 'General', mode: 'insensitive' } },
          { slug },
        ],
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName?.trim() || 'General',
          slug: slug || `cat-${Date.now()}`,
        },
      });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description: description || '',
        basePrice: parseFloat(basePrice),
        imageUrl: imageUrl || '',
        categoryId: category.id,
        variants: {
          create: (variants || []).map((v: any) => ({
            size: v.size,
            stock: parseInt(v.stock, 10) || 0,
          })),
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/products:', error);
    return NextResponse.json({ error: error.message || 'Error al crear producto' }, { status: 500 });
  }
}