import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpiar datos previos
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 1. Crear Categoría
  const category = await prisma.category.create({
    data: {
      name: 'Sudaderas & Hoodies',
      slug: 'sudaderas-hoodies',
    },
  });

  // 2. Crear Producto Principal
  const hoodie = await prisma.product.create({
    data: {
      title: 'Sudadera Oversize Heavyweight Minimalist',
      slug: 'sudadera-oversize-heavyweight-minimalist',
      description:
        'Confeccionada con algodón afelpado de 400 GSM para una caída estructurada y máxima comodidad térmica durante todo el día.',
      basePrice: 54.0,
      categoryId: category.id,
      compositionCare:
        '100% Algodón peinado de alto gramaje (400 GSM). Lavar con agua fría.',
      shippingReturns:
        'Envíos de 2 a 4 días hábiles. Cambios gratis en 30 días.',
      variants: {
        create: [
          {
            sku: 'SUD-OV-BLK-S',
            size: 'S',
            colorName: 'Negro Carbón',
            colorHex: '#18181b',
            stock: 4,
            images: [
              'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
              'https://images.unsplash.com/photo-1578768079052-aa76e520028b?w=800&q=80',
            ],
          },
          {
            sku: 'SUD-OV-BLK-M',
            size: 'M',
            colorName: 'Negro Carbón',
            colorHex: '#18181b',
            stock: 8,
            images: [
              'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
            ],
          },
          {
            sku: 'SUD-OV-BLK-L',
            size: 'L',
            colorName: 'Negro Carbón',
            colorHex: '#18181b',
            stock: 0,
            images: [
              'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
            ],
          },
          {
            sku: 'SUD-OV-BLK-XL',
            size: 'XL',
            colorName: 'Negro Carbón',
            colorHex: '#18181b',
            stock: 2,
            images: [
              'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
            ],
          },
        ],
      },
    },
  });

  // 3. Crear Producto de Cross-sell (Gorro Beanie)
  const accessories = await prisma.category.create({
    data: {
      name: 'Accesorios',
      slug: 'accesorios',
    },
  });

  await prisma.product.create({
    data: {
      title: 'Gorro Beanie Tejido Ribbed',
      slug: 'gorro-beanie-tejido-ribbed',
      description: 'Tejido elástico de canalé suave para protección contra el frío.',
      basePrice: 18.0,
      categoryId: accessories.id,
      variants: {
        create: [
          {
            sku: 'ACC-BN-BLK',
            size: 'Única',
            colorName: 'Negro',
            colorHex: '#18181b',
            stock: 15,
            images: [
              'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&q=80',
            ],
          },
        ],
      },
    },
  });

  console.log('✅ Base de datos poblada exitosamente con productos y variantes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });