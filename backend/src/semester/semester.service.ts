import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SemesterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.semester.findMany({
      orderBy: [
        {
          tahunAjaran: 'desc',
        },
        {
          semester: 'asc',
        },
      ],
    });
  }

  async findOne(id: number) {
    return this.prisma.semester.findUnique({
      where: { id },
    });
  }

  async create(data: {
    tahunAjaran: string;
    semester: string;
  }) {
    return this.prisma.semester.create({
      data: {
        tahunAjaran: data.tahunAjaran,
        semester: data.semester,
      },
    });
  }
}