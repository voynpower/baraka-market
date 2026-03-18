"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(email, pass) {
        console.log(`🔑 Admin login attempt: ${email}`);
        const admin = await this.prisma.admin.findUnique({
            where: { email },
        });
        if (!admin) {
            console.log(`❌ Admin not found: ${email}`);
            throw new common_1.UnauthorizedException('Email yoki parol noto\'g\'ri');
        }
        const isMatch = await bcrypt.compare(pass, admin.password);
        if (!isMatch) {
            console.log(`❌ Password mismatch for: ${email}`);
            throw new common_1.UnauthorizedException('Email yoki parol noto\'g\'ri');
        }
        const payload = { sub: admin.id, email: admin.email, role: 'ADMIN' };
        return {
            access_token: await this.jwtService.signAsync(payload),
            admin: { id: admin.id, email: admin.email, name: admin.name },
        };
    }
    async userRegister(data) {
        const hashedPassword = await bcrypt.hash(data.pass, 10);
        return this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
            },
        });
    }
    async userLogin(email, pass) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Email yoki parol noto\'g\'ri');
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Email yoki parol noto\'g\'ri');
        const payload = { sub: user.id, email: user.email, role: 'USER' };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: { id: user.id, email: user.email, name: user.name },
        };
    }
    async setupAdmin() {
        const hashedPassword = await bcrypt.hash('admin1234', 10);
        return this.prisma.admin.upsert({
            where: { email: 'admin@barakamarket.uz' },
            update: { password: hashedPassword },
            create: {
                email: 'admin@barakamarket.uz',
                password: hashedPassword,
                name: 'VoynPower Admin',
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map