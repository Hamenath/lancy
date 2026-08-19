import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('by-email')
  @ApiOperation({ summary: 'Get user details by email' })
  async findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }
}
