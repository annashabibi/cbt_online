import {
  Controller,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('admin')
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('siswa')
  getSiswaDashboard(@Request() req: any) {
    return this.dashboardService.getSiswaDashboard(
      req.user.siswaId,
    );
  }
}