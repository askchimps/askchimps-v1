# Changelog: Added `isTransferred` Field to Lead Model

## Date: 2026-01-10

## Summary
Added a new boolean field `isTransferred` to the Lead model to track whether a lead has been transferred to another agent or system.

## Changes Made

### 1. Database Schema (Prisma)
**File:** `api/prisma/schema.prisma`
- Added `isTransferred Boolean @default(false) @map("is_transferred")` field to the Lead model
- Position: Line 109, between `city` and `isDeleted` fields

### 2. Database Migration
**Migration:** `20260110210742_add_is_transferred_to_lead`
- Created and applied migration to add `is_transferred` column to `leads` table
- Default value: `false`
- Type: `BOOLEAN NOT NULL`

### 3. DTOs (Data Transfer Objects)

#### CreateLeadDto
**File:** `api/src/lead/dto/create-lead.dto.ts`
- Added `IsBoolean` import from `class-validator`
- Added `isTransferred` field with:
  - `@ApiPropertyOptional` decorator
  - `@IsBoolean()` validator
  - `@IsOptional()` validator
  - Description: "Whether the lead has been transferred to another agent or system"
  - Example: `false`
  - Default: `false`

#### UpdateLeadDto
**File:** `api/src/lead/dto/update-lead.dto.ts`
- Added `IsBoolean` import from `class-validator`
- Added `isTransferred` field with:
  - `@ApiPropertyOptional` decorator
  - `@IsBoolean()` validator
  - `@IsOptional()` validator
  - Description: "Whether the lead has been transferred to another agent or system"
  - Example: `false`

### 4. Entity
**File:** `api/src/lead/entities/lead.entity.ts`
- Added `isTransferred: boolean;` property
- Position: Line 16, between `city` and `isDeleted`

### 5. API Controller (Swagger Documentation)
**File:** `api/src/lead/lead.controller.ts`

#### Create Lead Response Example
- Added `isTransferred: false` to the response example (Line 58)

#### Update Lead Response Example
- Added `isTransferred: false` to the response example (Line 163)

### 6. Test Files

#### Agent Lead Call Schedule Service Tests
**File:** `api/src/agent-lead-call-schedule/agent-lead-call-schedule.service.spec.ts`
- Added `isTransferred: false` to mock lead object (Line 36)

#### Chat Service Tests
**File:** `api/src/chat/chat.service.spec.ts`
- Added `isTransferred: false` to mock lead object (Line 37)

### 7. Generated Files
The following files were automatically regenerated:
- `node_modules/@prisma/client/*` - Prisma Client
- `dist/src/lead/dto/*.js` - Compiled DTOs
- `dist/src/lead/entities/*.js` - Compiled entities

## API Usage

### Creating a Lead with isTransferred
```json
POST /v1/organisation/:organisationId/lead
{
  "organisationId": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "agentId": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "isTransferred": false
}
```

### Updating isTransferred Status
```json
PATCH /v1/organisation/:organisationId/lead/:leadId
{
  "isTransferred": true
}
```

### Response Example
```json
{
  "id": "01HZXYZ1234567890ABCDEFGHJK",
  "organisationId": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "agentId": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "isTransferred": false,
  "isDeleted": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Testing
- All existing tests pass: **186 tests passed**
- Test suites: **14 passed**
- No breaking changes introduced

## Backward Compatibility
- ✅ Fully backward compatible
- ✅ Default value of `false` ensures existing records work correctly
- ✅ Optional field in DTOs - not required for create/update operations
- ✅ Existing API calls continue to work without modification

## Next Steps
If you need to use this field in your application:
1. Update frontend forms to include the `isTransferred` toggle/checkbox
2. Add filtering by `isTransferred` status in lead queries
3. Create business logic for lead transfer workflows
4. Track `isTransferred` changes in the History service for audit trail

## Files Modified Summary
- **Schema:** 1 file (schema.prisma)
- **DTOs:** 2 files (create-lead.dto.ts, update-lead.dto.ts)
- **Entities:** 1 file (lead.entity.ts)
- **Controllers:** 1 file (lead.controller.ts)
- **Tests:** 2 files (agent-lead-call-schedule.service.spec.ts, chat.service.spec.ts)
- **Migrations:** 1 new migration created
- **Total:** 8 source files modified + 1 migration

