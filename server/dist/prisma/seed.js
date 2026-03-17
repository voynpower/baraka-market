"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const products = [
        {
            name: 'iPhone 15 Pro',
            category: 'phones',
            price: 999,
            oldPrice: 1199,
            badge: 'Yangi',
            mainImage: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800',
            description: 'Titan dizayn, A17 Pro chip va professional kamera tizimi.',
            images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800'],
            specs: [
                { icon: 'fa-microchip', val: 'A17 Pro' },
                { icon: 'fa-camera', val: '48MP' }
            ]
        },
        {
            name: 'MacBook Pro M3',
            category: 'laptops',
            price: 1999,
            oldPrice: 2499,
            badge: 'Chegirma',
            badgeClass: 'sale',
            mainImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800',
            description: 'Professional ishlar va ijod uchun yaratilgan qudrat.',
            images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800'],
            specs: [
                { icon: 'fa-microchip', val: 'M3 Pro' },
                { icon: 'fa-memory', val: '18GB' }
            ]
        }
    ];
    console.log('Seeding products...');
    for (const product of products) {
        await prisma.product.create({
            data: product,
        });
    }
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map