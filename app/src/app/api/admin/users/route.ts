import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all users
export async function GET() {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(req: Request) {
  try {
    const { employee_id, full_name, role, domain, password } = await req.json();

    console.log('Creating user:', { employee_id, full_name, role, domain });

    const email = `${employee_id}@pragya.local`;

    // 1. Check existing profile by employee_id
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('employee_id', employee_id)
      .maybeSingle();

    if (existingProfile) {
      console.log('Deleting existing profile + auth:', employee_id);

      // delete profile
      await supabase.from('profiles').delete().eq('id', existingProfile.id);

      // delete auth user (ignore error if already deleted)
      await supabase.auth.admin.deleteUser(existingProfile.id);
    }

    // 2. Check existing auth user by email
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existingAuthUser = userList?.users?.find(
      (u) => u.email === email
    );

    if (existingAuthUser) {
      console.log('Deleting existing auth user:', email);
      await supabase.auth.admin.deleteUser(existingAuthUser.id);
    }

    // Small delay to avoid race conditions
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: role === 'user' ? 'temp123' : password,
        email_confirm: true,
        user_metadata: { employee_id, full_name }
      });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    console.log('Auth user created with ID:', userId);

    // 4. Ensure no orphan profile with same ID
    const { data: existingId } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingId) {
      console.log('Cleaning orphan profile with same ID');
      await supabase.from('profiles').delete().eq('id', userId);
    }

    // 5. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        employee_id,
        full_name,
        role,
        domain: role === 'sme' ? domain : null
      });

    if (profileError) {
      console.error('Profile error:', profileError);

      // rollback auth user
      await supabase.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    console.log('Successfully created user:', employee_id);

    return NextResponse.json({
      success: true,
      userId
    });
  } catch (error: any) {
    console.error('Create user error:', error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update user role
export async function PUT(req: Request) {
  try {
    const { userId, role, domain } = await req.json();

    const { error } = await supabase
      .from('profiles')
      .update({
        role,
        domain: role === 'sme' ? domain : null
      })
      .eq('id', userId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}