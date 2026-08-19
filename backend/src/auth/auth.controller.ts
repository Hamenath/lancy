import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService, SyncUserDto } from './auth.service';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Sync or register authenticated user in backend database' })
  async syncUser(@Body() dto: SyncUserDto) {
    return this.authService.syncUser(dto);
  }
}
