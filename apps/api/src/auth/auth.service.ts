import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User, UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthResponse, SafeUser } from "./types/auth-response";

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly users: UsersService
  ) {}

  getStatus() {
    return {
      ready: true,
      available: ["register", "login", "refresh", "logout", "me"],
      next: ["admin-seed", "frontend-auth-ui"]
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    const existingUser = await this.users.findByEmail(email);

    if (existingUser) {
      throw new ConflictException("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        phone: dto.phone?.trim(),
        passwordHash,
        role: UserRole.CUSTOMER,
        customer: { create: {} }
      }
    });

    return this.createAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.users.findByEmail(email);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    return this.createAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true }
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException("Refresh token is invalid or expired.");
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() }
    });

    return this.createAuthResponse(session.user);
  }

  async logout(refreshToken: string) {
    await this.prisma.session.updateMany({
      where: {
        refreshToken,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });

    return { success: true };
  }

  private async createAuthResponse(user: User): Promise<AuthResponse> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: this.getRefreshExpiryDate()
      }
    });

    return {
      user: this.toSafeUser(user),
      accessToken,
      refreshToken
    };
  }

  private signAccessToken(user: User) {
    return this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role
      },
      {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.config.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "15m"
      }
    );
  }

  private signRefreshToken(user: User) {
    return this.jwt.signAsync(
      {
        sub: user.id,
        tokenType: "refresh"
      },
      {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d"
      }
    );
  }

  private getRefreshExpiryDate() {
    const expiresIn = this.config.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d";
    const daysMatch = expiresIn.match(/^(\d+)d$/);
    const hoursMatch = expiresIn.match(/^(\d+)h$/);
    const minutesMatch = expiresIn.match(/^(\d+)m$/);
    const now = Date.now();

    if (daysMatch) return new Date(now + Number(daysMatch[1]) * 24 * 60 * 60 * 1000);
    if (hoursMatch) return new Date(now + Number(hoursMatch[1]) * 60 * 60 * 1000);
    if (minutesMatch) return new Date(now + Number(minutesMatch[1]) * 60 * 1000);

    return new Date(now + 7 * 24 * 60 * 60 * 1000);
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}
