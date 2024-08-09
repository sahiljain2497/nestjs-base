import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @HttpCode(HttpStatus.OK)
  @Get()
  healthCheck() {
    return 'OK';
  }
}
