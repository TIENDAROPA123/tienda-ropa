import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const { title, basePrice, description, categoryName } = body;

    let categoryId: number | undefined = undefined;

    if (categoryName) {
      const slug = categoryName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let category = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: categoryName.trim(), mode: 'insensitive' } },
            { slug },
          ],
        },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName.trim(),
            slug: slug || `cat-${Date.now()}`,
          },
        });
      }
      categoryId = category.id;
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(title && { title }),
        ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId }),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error en PUT /api/admin/products/[id]:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await prisma.productVariant.deleteMany({
      where: { productId },
    });

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en DELETE /api/admin/products/[id]:', error);
    return NextResponse.json({ error: error.message || 'Error al eliminar producto' }, { status: 500 });
  }
}