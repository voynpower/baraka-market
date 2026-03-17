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
exports.CreateOrderDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateOrderDto {
    customerName;
    customerPhone;
    customerAddress;
    totalAmount;
    paymentMethod;
    items;
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Azizbek' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+998901234567' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tashkent, Chilonzor' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "customerAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1999 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cash' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: [{ id: 1, name: 'iPhone 15 Pro', quantity: 1 }] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CreateOrderDto.prototype, "items", void 0);
//# sourceMappingURL=create-order.dto.js.map