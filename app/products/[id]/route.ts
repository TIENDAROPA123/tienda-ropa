import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawProducts = await prisma.product.findMany({
      include: {
        variants: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const products = rawProducts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      basePrice: Number(p.basePrice),
      category: p.category,
      variants: p.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        colorName: v.colorName,
        stock: v.stock,
        images: v.images,
      })),
    }));

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Error al listar productos:', error);
    return NextResponse.json({ error: error.message || 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, basePrice, categoryName, color, imageUrl, sizes } = body;

    if (!title || !basePrice || !categoryName || !sizes || sizes.length === 0) {
      return NextResponse.json({ error: 'Faltan campos obligatorios o tallas' }, { status: 400 });
    }

    const categorySlug = categoryName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: categoryName.trim(), mode: 'insensitive' } },
          { slug: categorySlug },
        ],
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName.trim(),
          slug: categorySlug || `cat-${Date.now()}`,
        },
      });
    }

    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const uniqueSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const prefix = title.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    const colPrefix = (color || 'GEN').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();

    const variantsData = sizes.map((item: { size: string; stock: number }) => {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const sku = `${prefix}-${colPrefix}-${item.size.toUpperCase()}-${randomSuffix}`;
      return {
        sku,
        size: item.size.toUpperCase(),
        colorName: color || 'General',
        colorHex: '#111827',
        stock: Number(item.stock) || 0,
        images: imageUrl ? [imageUrl] : [],
      };
    });

    const newProduct = await prisma.product.create({
      data: {
        title,
        slug: uniqueSlug,
        description: description || '',
        basePrice: parseFloat(basePrice),
        categoryId: category.id,
        variants: {
          create: variantsData,
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        ...newProduct,
        basePrice: Number(newProduct.basePrice),
      },
    });
  } catch (error: any) {
    console.error('Error al guardar prenda:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}