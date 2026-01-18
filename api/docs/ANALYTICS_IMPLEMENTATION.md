# Dashboard Analytics Implementation

## API Endpoint
```
GET /v1/organisation/:organisationId/analytics?startDate=2024-01-01&endDate=2024-01-31
```

## Response Structure
```typescript
{
    data: {
        totalLeads: number;
        totalCalls: number;
        totalChats: number;
        mostActiveHoursForCalls: Array<{ hour: number; count: number }>;
        callPickupRatePerDay: Array<{ date: string; rate: number }>;
        avgCallDurationPerDay: Array<{ date: string; avgDuration: number }>;
        chatCountByHoursPerDay: Array<{ hour: number; count: number }>;
    };
}
```

---

## Metrics

### 1. Total Leads
```typescript
await prisma.lead.count({
    where: {
        organisationId,
        isDeleted: false,
        createdAt: { gte: startDate, lte: endDate },
    },
});
```

### 2. Total Calls
```typescript
await prisma.call.count({
    where: {
        organisationId,
        isDeleted: false,
        createdAt: { gte: startDate, lte: endDate },
    },
});
```

### 3. Total Chats
```typescript
await prisma.chat.count({
    where: {
        organisationId,
        isDeleted: false,
        createdAt: { gte: startDate, lte: endDate },
    },
});
```

### 4. Most Active Hours for Calls
Returns all 24 hours (0-23) with count for COMPLETED calls only.

```typescript
const result = await prisma.$queryRaw`
    SELECT
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
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
const allHours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: result.find(r => r.hour === i)?.count || 0
}));
```

### 5. Call Pickup Rate Per Day
Returns pickup rate for each day in the date range.

```typescript
const result = await prisma.$queryRaw`
    SELECT
        DATE(created_at) as date,
        COUNT(*) as total_calls,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_calls
    FROM calls
    WHERE
        organisation_id = ${organisationId}
        AND is_deleted = false
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
`;

// Calculate rate per day
const ratePerDay = result.map(r => ({
    date: r.date,
    rate: r.total_calls > 0 ? (r.completed_calls / r.total_calls) * 100 : 0
}));
```

### 6. Average Call Duration Per Day
Returns average duration for COMPLETED calls per day.

```typescript
const result = await prisma.$queryRaw`
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

// Format response
const avgPerDay = result.map(r => ({
    date: r.date,
    avgDuration: r.avg_duration || 0
}));
```

### 7. Chat Count by Hours Per Day
Returns all 24 hours (0-23) with count.

```typescript
const result = await prisma.$queryRaw`
    SELECT
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
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
const allHours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: result.find(r => r.hour === i)?.count || 0
}));
```

---

## Notes

- Default date range: Last 30 days
- All dates in UTC
- Execute queries in parallel with `Promise.all()`
- Return 0 or empty arrays for no data
- Fill missing hours/days with 0 values for complete datasets


