# Forkioo Supabase Security Documentation

This document outlines the comprehensive security measures implemented in Forkioo's Supabase backend.

## Overview

Forkioo uses Row Level Security (RLS) policies to ensure data isolation and security at the database level. All tables have RLS enabled, and policies are designed following the principle of least privilege.

## Database Schema

### Tables

1. **profiles** - User profiles extending Supabase auth
2. **services** - Services offered by providers
3. **availability** - Provider availability schedules
4. **bookings** - Booking records

### User Roles

- `admin` - Full system access
- `provider` - Can create services and manage bookings
- `customer` - Can book services and manage their bookings

## Security Policies

### Profiles Table

#### SELECT Policies
- ✅ **Public Read**: All profiles are viewable (for browsing providers)
- 🔒 **Sensitive Data**: Consider hiding email/phone in production

#### INSERT Policies
- ✅ **Self-Registration**: Users can only create their own profile
- 🔒 **Auto-Creation**: Profiles auto-created via auth trigger

#### UPDATE Policies
- ✅ **Self-Update**: Users can update their own profile
- ✅ **Admin Override**: Admins can update any profile
- 🔒 **Role Protection**: Role changes restricted to admins only

### Services Table

#### SELECT Policies
- ✅ **Active Services**: Public can view active services
- ✅ **Provider Services**: Providers see all their services (including inactive)

#### INSERT Policies
- ✅ **Provider-Only**: Only providers/admins can create services
- 🔒 **Owner Check**: Services must belong to the creator

#### UPDATE/DELETE Policies
- ✅ **Owner-Only**: Providers can only modify their own services

### Availability Table

#### SELECT Policies
- ✅ **Public Read**: Anyone can view provider availability

#### INSERT/UPDATE/DELETE Policies
- ✅ **Provider-Only**: Only providers can manage their availability

### Bookings Table

#### SELECT Policies
- ✅ **Customer View**: Customers see their own bookings
- ✅ **Provider View**: Providers see bookings for their services
- 🔒 **Privacy**: Users can't see others' bookings

#### INSERT Policies
- ✅ **Customer-Only**: Authenticated users can create bookings
- ✅ **Active Services**: Can only book active services
- 🔒 **Default Status**: New bookings start as 'pending'

#### UPDATE Policies
- ✅ **Customer Cancellation**: Customers can cancel pending bookings
- ✅ **Provider Management**: Providers can update status
- 🔒 **Price Protection**: Providers can't change pricing post-booking

#### DELETE Policies
- ✅ **Admin-Only**: Only admins can delete bookings

## Security Features

### 1. Conflict Prevention
```sql
check_booking_conflict()
```
- Prevents double-booking providers
- Checks for time overlaps
- Validates booking windows

### 2. Role Management
```sql
prevent_role_change()
```
- Restricts role changes to admins
- Prevents privilege escalation
- Audits role modifications

### 3. Data Validation
- Email format validation
- Time range constraints
- Price validation (non-negative)
- Currency restrictions
- Duration limits

### 4. Automatic Profile Creation
```sql
create_profile_for_user()
```
- Auto-creates profile on signup
- Ensures data consistency
- Default role assignment

### 5. Timestamp Management
```sql
update_updated_at_column()
```
- Auto-updates modified timestamps
- Enables audit trails
- Tracks data changes

## Best Practices Implemented

### ✅ Row Level Security
- All tables have RLS enabled
- Policies enforce at database level
- Can't be bypassed via API

### ✅ Least Privilege
- Users only access their data
- Role-based permissions
- Explicit policy definitions

### ✅ Data Integrity
- Foreign key constraints
- Check constraints
- Trigger validations

### ✅ Audit Trail
- Created/updated timestamps
- Change tracking
- Status history

## Setup Instructions

### 1. Initialize Supabase Project
```bash
supabase init
```

### 2. Apply Migrations
```bash
supabase db push
```

### 3. Test Policies
```bash
supabase test db
```

### 4. Configure Environment
```bash
cp .env.example .env
# Add your Supabase URL and anon key
```

## Testing Security

### Test User Isolation
```sql
-- As Customer A
SELECT * FROM bookings;  -- Should only see own bookings

-- As Provider B
SELECT * FROM bookings;  -- Should only see their service bookings
```

### Test Role Enforcement
```sql
-- As Customer
INSERT INTO services (...);  -- Should fail
UPDATE profiles SET role = 'admin';  -- Should fail
```

### Test Conflict Prevention
```sql
-- Create overlapping booking
INSERT INTO bookings (provider_id, start_time, end_time, ...);
-- Second booking with overlap should fail
```

## Production Considerations

### 🔒 Before Going Live

1. **Review Public Data**
   - Audit what's visible to anonymous users
   - Consider PII exposure in profiles
   - Add data masking if needed

2. **Rate Limiting**
   - Implement rate limits on booking creation
   - Prevent spam/abuse
   - Use Supabase rate limiting features

3. **Email Verification**
   - Require email verification
   - Enable in Supabase Auth settings
   - Prevent fake accounts

4. **Payment Integration**
   - Add payment verification before confirming bookings
   - Store payment records securely
   - Implement refund policies

5. **Monitoring**
   - Set up alerts for policy violations
   - Monitor failed auth attempts
   - Track booking patterns

6. **Backup Strategy**
   - Regular database backups
   - Point-in-time recovery
   - Test restore procedures

## Common Security Scenarios

### Scenario 1: Unauthorized Access Attempt
```
User tries to update another user's booking
→ RLS policy blocks at database level
→ No data returned
→ Operation fails safely
```

### Scenario 2: Booking Conflict
```
Two users book same provider at same time
→ First booking succeeds
→ Second booking triggers conflict check
→ Transaction rolled back
→ Error returned to user
```

### Scenario 3: Role Escalation Attempt
```
Customer tries to change role to admin
→ Trigger checks current user role
→ Non-admin role change blocked
→ Exception raised
→ Update rejected
```

## Support

For security issues or questions:
1. Review this documentation
2. Check Supabase RLS docs
3. Test in development environment
4. Report issues via GitHub

## Updates

This security model should be reviewed:
- Before each major release
- After security audits
- When adding new features
- Quarterly at minimum
