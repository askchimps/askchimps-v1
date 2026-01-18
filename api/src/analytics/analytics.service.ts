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

    // Helper method to parse month and get date range
    private getMonthDateRange(month?: string): {
        startDate: Date;
        endDate: Date;
    } {
        const now = new Date();
        const targetMonth =
            month ||
            `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // Parse month string (YYYY-MM)
        const [year, monthNum] = targetMonth.split('-').map(Number);

        // Get start and end of month
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

        return { startDate, endDate };
    }

    async getTotalLeadsForMonth(
        organisationId: string,
        month?: string,
    ): Promise<{ totalLeads: number }> {
        const { startDate, endDate } = this.getMonthDateRange(month);
        const totalLeads = await this.getTotalLeads(
            organisationId,
            startDate,
            endDate,
        );
        return { totalLeads };
    }

    async getTotalCallsForMonth(
        organisationId: string,
        month?: string,
    ): Promise<{ totalCalls: number }> {
        const { startDate, endDate } = this.getMonthDateRange(month);
        const totalCalls = await this.getTotalCalls(
            organisationId,
            startDate,
            endDate,
        );
        return { totalCalls };
    }

    async getTotalChatsForMonth(
        organisationId: string,
        month?: string,
    ): Promise<{ totalChats: number }> {
        const { startDate, endDate } = this.getMonthDateRange(month);
        const totalChats = await this.getTotalChats(
            organisationId,
            startDate,
            endDate,
        );
        return { totalChats };
    }

    async getCallActivityByHour(
        organisationId: string,
        month?: string,
    ): Promise<HourlyCount[]> {
        const { startDate, endDate } = this.getMonthDateRange(month);
        return this.getMostActiveHoursForCalls(
            organisationId,
            startDate,
            endDate,
        );
    }

    async getChatActivityByHour(
        organisationId: string,
        month?: string,
    ): Promise<HourlyCount[]> {
        const { startDate, endDate } = this.getMonthDateRange(month);
        return this.getChatCountByHoursPerDay(
            organisationId,
            startDate,
            endDate,
        );
    }

    async getCallPickupRatePerDayForMonth(
        organisationId: string,
        month?: string,
    ): Promise<DailyPickupRate[]> {
        const { startDate, endDate } = this.getMonthDateRange(month);
        return this.getCallPickupRatePerDay(organisationId, startDate, endDate);
    }

    async getAvgCallDurationPerDayForMonth(
        organisationId: string,
        month?: string,
    ): Promise<DailyAvgDuration[]> {
        const { startDate, endDate } = this.getMonthDateRange(month);
        return this.getAvgCallDurationPerDay(
            organisationId,
            startDate,
            endDate,
        );
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
