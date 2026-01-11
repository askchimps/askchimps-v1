import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateHistoryDto } from './create-history.dto';

export class BulkCreateHistoryDto {
  @ApiProperty({
    description: 'Array of history records to create',
    type: [CreateHistoryDto],
    example: [
      {
        tableName: 'leads',
        recordId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        fieldName: 'firstName',
        action: 'UPDATE',
        trigger: 'USER_ACTION',
        oldValue: 'Arjun',
        newValue: 'Arjun Kumar',
        userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        reason: 'Customer requested update',
      },
      {
        tableName: 'leads',
        recordId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        fieldName: 'status',
        action: 'UPDATE',
        trigger: 'USER_ACTION',
        oldValue: 'New',
        newValue: 'Contacted',
        userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        reason: 'Customer requested update',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateHistoryDto)
  records: CreateHistoryDto[];
}

