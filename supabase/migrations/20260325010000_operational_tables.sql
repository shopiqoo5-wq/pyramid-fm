-- =========================================================================
-- PYRAMID FM CORPORATE ORDERING PORTAL
-- OPERATIONAL TABLES MIGRATION v1.1
-- =========================================================================

-- 1. CUSTOM ROLES
CREATE TABLE IF NOT EXISTS public.custom_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. WORK ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.work_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    assigned_role TEXT, -- 'All', 'Cleaner', etc.
    assigned_employee_id UUID,
    recurrence TEXT DEFAULT 'daily',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SITE PROTOCOLS
CREATE TABLE IF NOT EXISTS public.site_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    steps TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SUBMITTED CHECKLISTS
CREATE TABLE IF NOT EXISTS public.submitted_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_tasks TEXT[] DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, submission_date)
);

-- Enable RLS
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submitted_checklists ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Public read roles" ON public.custom_roles FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage roles" ON public.custom_roles FOR ALL USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Public read assignments" ON public.work_assignments FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage assignments" ON public.work_assignments FOR ALL USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Public read protocols" ON public.site_protocols FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage protocols" ON public.site_protocols FOR ALL USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Users manage own checklists" ON public.submitted_checklists FOR ALL USING ( employee_id::text = auth.uid()::text OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );
