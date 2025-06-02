-- Create organizations table
CREATE TABLE organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create organization_members table
CREATE TABLE organization_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'deleted')) DEFAULT 'pending',
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(organization_id, user_id)
);

-- Create organization_invites table
CREATE TABLE organization_invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    invited_by UUID REFERENCES auth.users(id),
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(organization_id, email)
);

-- Add RLS policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Organizations are viewable by members"
    ON organizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
            AND organization_members.status = 'active'
        )
    );

-- Organization members policies
CREATE POLICY "Members are viewable by organization members"
    ON organization_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organization_members.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.status = 'active'
        )
    );

CREATE POLICY "Only admins can manage members"
    ON organization_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organization_members.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role = 'admin'
            AND organization_members.status = 'active'
        )
    );

-- Organization invites policies
CREATE POLICY "Invites are viewable by organization members"
    ON organization_invites FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organization_invites.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.status = 'active'
        )
    );

CREATE POLICY "Only admins can manage invites"
    ON organization_invites FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organization_invites.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role = 'admin'
            AND organization_members.status = 'active'
        )
    );

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
DECLARE
    admin_id UUID;
BEGIN
    -- Get the first admin of the organization
    SELECT user_id INTO admin_id
    FROM organization_members
    WHERE organization_id = OLD.organization_id
    AND role = 'admin'
    AND status = 'active'
    LIMIT 1;

    -- If no admin found, use the system admin
    IF admin_id IS NULL THEN
        admin_id := '00000000-0000-0000-0000-000000000000'::UUID; -- System admin UUID
    END IF;

    -- Reassign public notes to the admin
    UPDATE notes
    SET user_id = admin_id
    WHERE user_id = OLD.user_id
    AND is_public = true;

    -- Delete private notes
    DELETE FROM notes
    WHERE user_id = OLD.user_id
    AND is_public = false;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user deletion
CREATE TRIGGER on_user_deletion
    BEFORE DELETE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_deletion(); 