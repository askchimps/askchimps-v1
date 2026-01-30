import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto): Promise<UserEntity> {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
        });

        return new UserEntity(user);
    }

    async findAll(): Promise<UserEntity[]> {
        const users = await this.prisma.user.findMany({
            where: { isActive: true },
        });

        return users.map((user) => new UserEntity(user));
    }

    async findOne(id: string): Promise<UserEntity> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user || !user.isActive) {
            throw new NotFoundException('User not found');
        }

        return new UserEntity(user);
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async update(
        id: string,
        updateUserDto: UpdateUserDto,
    ): Promise<UserEntity> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user || !user.isActive) {
            throw new NotFoundException('User not found');
        }

        // Check if email is being updated and if it already exists
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });

            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }

        // Hash password if it's being updated
        const dataToUpdate = { ...updateUserDto };
        if (updateUserDto.password) {
            dataToUpdate.password = await bcrypt.hash(
                updateUserDto.password,
                10,
            );
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });

        return new UserEntity(updatedUser);
    }

    async remove(id: string): Promise<UserEntity> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user || !user.isActive) {
            throw new NotFoundException('User not found');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });

        return new UserEntity(updatedUser);
    }
}
