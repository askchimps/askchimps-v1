import { IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CreditOperation {
    INCREMENT = 'INCREMENT',
    DECREMENT = 'DECREMENT',
}

export class UpdateCreditsDto {
    @ApiProperty({
        description: 'Operation to perform on credits',
        enum: CreditOperation,
        example: CreditOperation.INCREMENT,
    })
    @IsEnum(CreditOperation)
    operation: CreditOperation;

    @ApiProperty({
        description: 'Amount to increment or decrement',
        example: 100.0,
        minimum: 0,
    })
    @IsNumber()
    amount: number;
}

