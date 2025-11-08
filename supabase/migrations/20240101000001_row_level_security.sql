-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view all profiles (for browsing providers)
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- =====================================================
-- SERVICES POLICIES
-- =====================================================

-- Anyone can view active services
CREATE POLICY "Active services are viewable by everyone"
    ON services FOR SELECT
    USING (is_active = true);

-- Providers can view their own services (including inactive)
CREATE POLICY "Providers can view their own services"
    ON services FOR SELECT
    USING (auth.uid() = provider_id);

-- Only providers can create services
CREATE POLICY "Providers can create their own services"
    ON services FOR INSERT
    WITH CHECK (
        auth.uid() = provider_id
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('provider', 'admin')
        )
    );

-- Providers can update their own services
CREATE POLICY "Providers can update their own services"
    ON services FOR UPDATE
    USING (auth.uid() = provider_id)
    WITH CHECK (auth.uid() = provider_id);

-- Providers can delete their own services
CREATE POLICY "Providers can delete their own services"
    ON services FOR DELETE
    USING (auth.uid() = provider_id);

-- =====================================================
-- AVAILABILITY POLICIES
-- =====================================================

-- Anyone can view provider availability
CREATE POLICY "Availability is viewable by everyone"
    ON availability FOR SELECT
    USING (true);

-- Providers can manage their own availability
CREATE POLICY "Providers can insert their own availability"
    ON availability FOR INSERT
    WITH CHECK (
        auth.uid() = provider_id
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('provider', 'admin')
        )
    );

CREATE POLICY "Providers can update their own availability"
    ON availability FOR UPDATE
    USING (auth.uid() = provider_id)
    WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can delete their own availability"
    ON availability FOR DELETE
    USING (auth.uid() = provider_id);

-- =====================================================
-- BOOKINGS POLICIES
-- =====================================================

-- Customers can view their own bookings
CREATE POLICY "Customers can view their own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = customer_id);

-- Providers can view their own bookings
CREATE POLICY "Providers can view their bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = provider_id);

-- Authenticated users can create bookings as customers
CREATE POLICY "Customers can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (
        auth.uid() = customer_id
        AND status = 'pending'
        -- Ensure the service exists and is active
        AND EXISTS (
            SELECT 1 FROM services
            WHERE id = service_id
            AND is_active = true
        )
    );

-- Customers can update their own pending bookings (cancel or add notes)
CREATE POLICY "Customers can update their pending bookings"
    ON bookings FOR UPDATE
    USING (
        auth.uid() = customer_id
        AND status = 'pending'
    )
    WITH CHECK (
        auth.uid() = customer_id
        AND (
            -- Can only change status to cancelled or update notes
            (status = 'cancelled' OR status = 'pending')
        )
    );

-- Providers can update bookings for their services
CREATE POLICY "Providers can update their bookings"
    ON bookings FOR UPDATE
    USING (auth.uid() = provider_id)
    WITH CHECK (
        auth.uid() = provider_id
        -- Providers can change status but not pricing
        AND total_price = (SELECT total_price FROM bookings WHERE id = bookings.id)
    );

-- Only admins can delete bookings
CREATE POLICY "Admins can delete bookings"
    ON bookings FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- =====================================================
-- ADDITIONAL SECURITY
-- =====================================================

-- Prevent users from changing their role (except admins)
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role != NEW.role THEN
        -- Check if the user is an admin
        IF NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Only admins can change user roles';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_unauthorized_role_change
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION prevent_role_change();

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant usage on tables to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant usage to anon users (for viewing public data)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON services TO anon;
GRANT SELECT ON availability TO anon;
