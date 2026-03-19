"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createOrderDto) {
        return this.prisma.$transaction(async (tx) => {
            const items = Array.isArray(createOrderDto.items) ? createOrderDto.items : JSON.parse(createOrderDto.items);
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.id },
                });
                if (!product) {
                    console.error(`[ORDER ERROR] Product not found: ID ${item.id}`);
                    throw new common_1.BadRequestException(`Mahsulot topilmadi: ID ${item.id}`);
                }
                if (product.stock < item.quantity) {
                    console.warn(`[ORDER ERROR] Out of stock: ${product.name} (Available: ${product.stock}, Requested: ${item.quantity})`);
                    throw new common_1.BadRequestException(`${product.name} uchun yetarli zahira yo'q (Mavjud: ${product.stock})`);
                }
                await tx.product.update({
                    where: { id: item.id },
                    data: {
                        stock: { decrement: item.quantity },
                    },
                });
            }
            return tx.order.create({
                data: {
                    customerName: createOrderDto.customerName,
                    customerPhone: createOrderDto.customerPhone,
                    customerAddress: createOrderDto.customerAddress,
                    totalAmount: createOrderDto.totalAmount,
                    paymentMethod: createOrderDto.paymentMethod,
                    items: createOrderDto.items,
                    userId: createOrderDto.userId,
                },
            });
        });
    }
    async findAll() {
        return this.prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.order.update({
            where: { id },
            data: { status },
        });
    }
    async getStats() {
        try {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const todayOrders = await this.prisma.order.findMany({
                where: { createdAt: { gte: startOfToday } },
            });
            const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            const last7DaysOrders = await this.prisma.order.findMany({
                where: { createdAt: { gte: sevenDaysAgo } },
                orderBy: { createdAt: 'asc' },
            });
            const dailyTrend = {};
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                dailyTrend[key] = 0;
            }
            last7DaysOrders.forEach(o => {
                const key = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (dailyTrend[key] !== undefined)
                    dailyTrend[key] += o.totalAmount;
            });
            const totalOrdersCount = await this.prisma.order.count();
            const totalProductsCount = await this.prisma.product.count();
            return {
                todayRevenue: todayRevenue || 0,
                todayOrdersCount: todayOrders.length || 0,
                totalOrdersCount: totalOrdersCount || 0,
                totalProductsCount: totalProductsCount || 0,
                chartData: Object.entries(dailyTrend).map(([date, value]) => ({ date, value })),
            };
        }
        catch (error) {
            console.error('[STATS ERROR]', error);
            throw error;
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map