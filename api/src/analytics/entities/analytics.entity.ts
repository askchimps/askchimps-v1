import { ApiProperty } from '@nestjs/swagger';

export class HourlyCount {
    @ApiProperty({ example: 9 })
    hour: number;

    @ApiProperty({ example: 45 })
    count: number;
}

export class DailyPickupRate {
    @ApiProperty({ example: '2024-01-15' })
    date: string;

    @ApiProperty({ example: 78.25 })
    rate: number;
}

export class DailyAvgDuration {
    @ApiProperty({ example: '2024-01-15' })
    date: string;

    @ApiProperty({ example: 245.67 })
    avgDuration: number;
}

export class AnalyticsData {
    @ApiProperty({ example: 156 })
    totalLeads: number;

    @ApiProperty({ example: 423 })
    totalCalls: number;

    @ApiProperty({ example: 89 })
    totalChats: number;

    @ApiProperty({ type: [HourlyCount] })
    mostActiveHoursForCalls: HourlyCount[];

    @ApiProperty({ type: [DailyPickupRate] })
    callPickupRatePerDay: DailyPickupRate[];

    @ApiProperty({ type: [DailyAvgDuration] })
    avgCallDurationPerDay: DailyAvgDuration[];

    @ApiProperty({ type: [HourlyCount] })
    chatCountByHoursPerDay: HourlyCount[];
}
