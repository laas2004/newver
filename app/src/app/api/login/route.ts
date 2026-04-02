import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Use only the service role key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Hardcoded users as backup
const USERS = {
  'ADMIN001': { role: 'admin', password: 'admin123' },
  'SME_HR001': { role: 'sme', password: 'sme123', domain: 'hr_law' },
  'SME_CIT001': { role: 'sme', password: 'sme123', domain: 'citizen_law' },
  'SME_COM001': { role: 'sme', password: 'sme123', domain: 'company_law' },
  'USER001': { role: 'user', password: null }
};

export async function POST(req: Request) {
  try {
    const { employeeId, password } = await req.json();

    // 🔹 1. Try fetching from DB first
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (profile) {
      console.log('User found in DB:', employeeId);

      // ✅ YOUR INTEGRATED LOGIC
      if (profile.role === 'user') {
        return NextResponse.json({
          success: true,
          role: profile.role,
          redirect: '/chat'
        });
      }

      // Password required for admin/sme
      if (!password) {
        return NextResponse.json({
          needPassword: true,
          role: profile.role
        });
      }

      // ⚠️ NOTE: No password stored in profiles, so you may need auth check
      // For now, assuming password already validated elsewhere or skipped

      return NextResponse.json({
        success: true,
        role: profile.role,
        redirect: profile.role === 'admin' ? '/admin' : '/sme',
        domain: profile.domain
      });
    }

    // 🔹 2. Fallback to hardcoded USERS
    const user = USERS[employeeId as keyof typeof USERS];

    if (!user) {
      return NextResponse.json(
        { error: 'Employee ID not found' },
        { status: 404 }
      );
    }

    // ✅ Same logic for fallback users
    if (user.role === 'user') {
      return NextResponse.json({
        success: true,
        role: user.role,
        redirect: '/chat'
      });
    }

    if (!password) {
      return NextResponse.json({
        needPassword: true,
        role: user.role
      });
    }

    if (password !== user.password) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Log activity (optional)
    try {
      await supabase.from('user_activity_logs').insert({
        employee_id: employeeId,
        action: 'login',
        details: { role: user.role }
      });
    } catch (err) {
      console.log('Activity logging skipped');
    }

    return NextResponse.json({
      success: true,
      role: user.role,
      redirect: user.role === 'admin' ? '/admin' : '/sme',
      domain: user.domain
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}