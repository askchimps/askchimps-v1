import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../common/decorators';

@ApiTags('User')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'user', version: '1' })
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
    constructor(private readonly UserService: UserService) {}

    @Public()
    @Post()
    @ApiOperation({
        summary: 'Create a new user',
        description:
            'Create a new user account. This endpoint is public and does not require authentication. Password will be hashed before storage.',
    })
    @ApiBody({
        type: CreateUserDto,
        description: 'User registration data',
        examples: {
            'Basic User': {
                value: {
                    email: 'john.doe@example.com',
                    password: 'StrongP@ssw0rd',
                    firstName: 'John',
                    lastName: 'Doe',
                },
            },
            'Minimal User': {
                value: {
                    email: 'user@example.com',
                    password: 'SecurePass123!',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
        schema: {
            example: {
                data: {
                    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    email: 'john.doe@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    isActive: true,
                    isSuperAdmin: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T10:30:00.000Z',
                },
                statusCode: 201,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data',
        schema: {
            example: {
                message: [
                    'email must be a valid email',
                    'password must be longer than or equal to 8 characters',
                ],
                error: 'Bad Request',
                statusCode: 400,
            },
        },
    })
    @ApiResponse({
        status: 409,
        description: 'User with this email already exists',
        schema: {
            example: {
                message: 'User with this email already exists',
                error: 'Conflict',
                statusCode: 409,
            },
        },
    })
    create(@Body() createUserDto: CreateUserDto) {
        return this.UserService.create(createUserDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all users',
        description:
            'Retrieve a list of all users. Requires authentication. Password field is excluded from response.',
    })
    @ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        schema: {
            example: {
                data: [
                    {
                        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                        email: 'john.doe@example.com',
                        firstName: 'John',
                        lastName: 'Doe',
                        isActive: true,
                        isSuperAdmin: false,
                        createdAt: '2024-01-15T10:30:00.000Z',
                        updatedAt: '2024-01-15T10:30:00.000Z',
                    },
                    {
                        id: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
                        email: 'jane.smith@example.com',
                        firstName: 'Jane',
                        lastName: 'Smith',
                        isActive: true,
                        isSuperAdmin: false,
                        createdAt: '2024-01-15T11:00:00.000Z',
                        updatedAt: '2024-01-15T11:00:00.000Z',
                    },
                ],
                statusCode: 200,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    findAll() {
        return this.UserService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get user by ID',
        description:
            'Retrieve a specific user by their ID. Requires authentication. Password field is excluded from response.',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'User retrieved successfully',
        schema: {
            example: {
                data: {
                    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    email: 'john.doe@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    isActive: true,
                    isSuperAdmin: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T10:30:00.000Z',
                },
                statusCode: 200,
                timestamp: '2024-01-15T10:30:00.000Z',
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
        schema: {
            example: {
                message: 'User not found',
                error: 'Not Found',
                statusCode: 404,
            },
        },
    })
    findOne(@Param('id') id: string) {
        return this.UserService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update user',
        description:
            'Update user information. All fields are optional. Requires authentication.',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiBody({
        type: UpdateUserDto,
        description: 'User update data. All fields are optional.',
        examples: {
            'Update Name': {
                value: {
                    firstName: 'Jonathan',
                    lastName: 'Doe',
                },
            },
            'Update Email': {
                value: {
                    email: 'newemail@example.com',
                },
            },
            'Update Password': {
                value: {
                    password: 'NewStrongP@ssw0rd',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully',
        schema: {
            example: {
                data: {
                    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    email: 'john.doe@example.com',
                    firstName: 'Jonathan',
                    lastName: 'Doe',
                    isActive: true,
                    isSuperAdmin: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T14:45:00.000Z',
                },
                statusCode: 200,
                timestamp: '2024-01-15T14:45:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({
        status: 409,
        description: 'Email already in use by another user',
        schema: {
            example: {
                message: 'Email already in use',
                error: 'Conflict',
                statusCode: 409,
            },
        },
    })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.UserService.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete user (soft delete)',
        description:
            'Soft delete a user by setting isActive to false. The user data is retained but the account is deactivated. Requires authentication.',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID (ULID format)',
        example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    })
    @ApiResponse({
        status: 200,
        description: 'User deleted successfully',
        schema: {
            example: {
                data: {
                    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
                    email: 'john.doe@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    isActive: false,
                    isSuperAdmin: false,
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T15:00:00.000Z',
                },
                statusCode: 200,
                timestamp: '2024-01-15T15:00:00.000Z',
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    remove(@Param('id') id: string) {
        return this.UserService.remove(id);
    }
}
