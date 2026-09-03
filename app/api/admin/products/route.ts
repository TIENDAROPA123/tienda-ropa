import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, basePrice, categoryName, color, imageUrl, sizes } = body;

    if (!title || !basePrice || !categoryName || !sizes || sizes.length === 0) {
      return NextResponse.json({ error: 'Faltan campos obligatorios o tallas' }, { status: 400 });
    }

    // 1. Generar o buscar la categoría por nombre (ej. "Pantalones")
    const categorySlug = categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: categoryName.trim(), mode: 'insensitive' } },
          { slug: categorySlug }
        ]
      }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName.trim(),
          slug: categorySlug || `cat-${Date.now()}`,
        }
      });
    }

    // 2. Generar slug del producto
    const baseSlug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const uniqueSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    // 3. Preparar variantes para cada talla seleccionada
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

    // 4. Guardar producto con todas sus variantes
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

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}