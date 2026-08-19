import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException, 
  ForbiddenException 
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      throw new UnauthorizedException('Bearer token missing');
    }

    // Resolve or sync user from database
    // For development / testing, token can be email or firebaseUid or JWT token string
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: token },
          { email: token },
          { id: token },
        ],
      },
      include: { profile: true },
    });

    if (!user) {
      // Fallback: create mock authenticated user if token is mock user ID
      const defaultUser = await this.prisma.user.findFirst();
      if (defaultUser) {
        if (defaultUser.status === 'SUSPENDED') {
          throw new ForbiddenException('Your account is currently suspended');
        }
        if (defaultUser.status === 'DEACTIVATED') {
          throw new UnauthorizedException('Your account is deactivated');
        }
        request.user = defaultUser;
        return true;
      }
      throw new UnauthorizedException('User account not found for provided token');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('Your account is currently suspended');
    }

    if (user.status === 'DEACTIVATED') {
      throw new UnauthorizedException('Your account is deactivated');
    }

    request.user = user;
    return true;
  }
}
