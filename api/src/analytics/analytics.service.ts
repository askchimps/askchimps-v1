import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import {
    AnalyticsData,
    HourlyCount,
    DailyPickupRate,
    DailyAvgDuration,
} from './entities/analytics.entity';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) {}

    async getAnalytics(
        organisationId: string,
        startDate?: Date,
        endDate?: Date,
    ): Promise<AnalyticsData> {
        // Default to last 30 days if no dates provided
        const end = endDate || new Date();
        const start =
            startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Execute all queries in parallel
        const [
            totalLeads,
            totalCalls,
            totalChats,
            mostActiveHoursForCalls,
            callPickupRatePerDay,
            avgCallDurationPerDay,
            chatCountByHoursPerDay,
        ] = await Promise.all([
            this.getTotalLeads(organisationId, start, end),
            this.getTotalCalls(organisationId, start, end),
            this.getTotalChats(organisationId, start, end),
            this.getMostActiveHoursForCalls(organisationId, start, end),
            this.getCallPickupRatePerDay(organisationId, start, end),
            this.getAvgCallDurationPerDay(organisationId, start, end),
            this.getChatCountByHoursPerDay(organisationId, start, end),
        ]);

        return {
            totalLeads,
            totalCalls,
            totalChats,
            mostActiveHoursForCalls,
            callPickupRatePerDay,
            avgCallDurationPerDay,
            chatCountByHoursPerDay,
        };
    }

    private async getTotalLeads(
        organisationId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<number> {
        return this.prisma.lead.count({
            where: {
                organisationId,
                isDeleted: false,
                createdAt: { gte: startDate, lte: endDate },
            },
        });
    }

    private async getTotalCalls(
        organisationId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<number> {
        return this.prisma.call.count({
            where: {
                organisationId,
                isDeleted: false,
                createdAt: { gte: startDate, lte: endDate },
            },
        });
    }

    private async getTotalChats(
        organisationId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<number> {
        return this.prisma.chat.count({
            where: {
                organisationId,
                isDeleted: false,
                createdAt: { gte: startDate, lte: endDate },
            },
        });
    }

    private async getMostActiveHoursForCalls(
        organisationId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<HourlyCount[]> {
        const result = await this.prisma.$queryRaw<
            Array<{ hour: number; count: bigint }>
        >`
            SELECT 
                EXTRACT(HOUR FROM created_at)::integer as hour,
                COUNT(*)::bigint as count
            FROM calls
            WHERE 
                organisation_id = ${organisationId}
                AND is_deleted = false
                AND status = 'COMPLETED'
                AND created_at >= ${startDate}
                AND created_at <= ${endDate}
            GROUP BY EXTRACT(HOUR FROM created_at)
            ORDER BY hour ASC
        `;

        // Fill missing hours with 0
        const allHours: HourlyCount[] = Array.from({ length: 24 }, (_, i) => {
            const found = result.find((r) => r.hour === i);
            return {
                hour: i,
                count: found ? Number(found.count) : 0,
            };
        });

        return allHours;
    }

    private async getCallPickupRatePerDay(
        organisationId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<DailyPickupRate[]> {
        const result = await this.prisma.$queryRaw<
            Array<{
                date: Date;
                total_calls: bigint;
                completed_calls: bigint;
            }>
        >`
            SELECT 
                DATE(created_at) as date,
                COUNT(*)::bigint as total_calls,
                COUNT(*) FILTER (WHERE status = 'COMPLETED')::bigint as completed_calls
            FROM calls
            WHERE 
                organisation_id = ${organisationId}
                AND is_deleted = false
                AND created_at >= ${startDate}
                AND created_at <= ${endDate}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;

        return result.map((r) => ({
            date: r.date.toISOString().split('T')[0],
            rate:
                Number(r.total_calls) > 0
                    ? Math.round(
                          (Number(r.completed_calls) / Number(r.total_calls)) *
                              100 *
                              100,
                      ) / 100
                    : 0,
        }));
    }

    private async getAvgCallDurationPerDay(
        organisationId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<DailyAvgDuration[]> {
        const result = await this.prisma.$queryRaw<
            Array<{ date: Date; avg_duration: number }>
        >`
            SELECT
                DATE(created_at) as date,
                AVG(duration) as avg_duration
            FROM calls
            WHERE
                organisation_id = ${organisationId}
                AND is_deleted = false
                AND status = 'COMPLETED'
                AND created_at >= ${startDate}
                AND created_at <= ${endDate}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;

        return result.map((r) => ({
            date: r.date.toISOString().split('T')[0],
            avgDuration: r.avg_duration
                ? Math.round(r.avg_duration * 100) / 100
                : 0,
        }));
    }

    private async getChatCountByHoursPerDay(
        organisationId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<HourlyCount[]> {
        const result = await this.prisma.$queryRaw<
            Array<{ hour: number; count: bigint }>
        >`
            SELECT
                EXTRACT(HOUR FROM created_at)::integer as hour,
                COUNT(*)::bigint as count
            FROM chats
            WHERE
                organisation_id = ${organisationId}
                AND is_deleted = false
                AND created_at >= ${startDate}
                AND created_at <= ${endDate}
            GROUP BY EXTRACT(HOUR FROM created_at)
            ORDER BY hour ASC
        `;

        // Fill missing hours with 0
        const allHours: HourlyCount[] = Array.from({ length: 24 }, (_, i) => {
            const found = result.find((r) => r.hour === i);
            return {
                hour: i,
                count: found ? Number(found.count) : 0,
            };
        });

        return allHours;
    }
}
