import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, basePrice, categoryId, size, color, stock, imageUrl } = body;

    const slug = title
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const prefix = title.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    const colPrefix = color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const sku = `${prefix}-${colPrefix}-${size.toUpperCase()}-${randomSuffix}`;

    const newProduct = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        basePrice: parseFloat(basePrice),
        categoryId: parseInt(categoryId, 10),
        variants: {
          create: [
            {
              sku,
              size,
              color,
              stock: parseInt(stock, 10),
              imageUrl,
            },
          ],
        },
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}