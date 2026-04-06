import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { getPaginationOffset } from '../../utils/pagination';

export class UsersService {
  async listUsers(page: number, limit: number) {
    const offset = getPaginationOffset(page, limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return { users, total };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async createUser(data: { name: string; email: string; password: string; role?: 'VIEWER' | 'ANALYST' | 'ADMIN' }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'VIEWER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateUser(id: string, data: { name?: string; role?: 'VIEWER' | 'ANALYST' | 'ADMIN'; status?: 'ACTIVE' | 'INACTIVE' }) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async deactivateUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return updated;
  }
}

export const usersService = new UsersService();
