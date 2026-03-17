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
exports.CreateProductDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateProductDto {
    name;
    category;
    price;
    oldPrice;
    badge;
    badgeClass;
    mainImage;
    images;
    description;
    specs;
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'iPhone 15 Pro' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'phones' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 999 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1199, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "oldPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Yangi', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "badge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'sale', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "badgeClass", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://images.unsplash.com/...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "mainImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['url1', 'url2'], required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Detailed product description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: [{ icon: 'fa-microchip', val: 'A17' }], required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "specs", void 0);
//# sourceMappingURL=create-product.dto.js.map