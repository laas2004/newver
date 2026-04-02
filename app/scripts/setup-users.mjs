import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL || fs.readFileSync('../.env', 'utf-8').match(/SUPABASE_URL=(.*)/)?.[1];
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fs.readFileSync('../.env', 'utf-8').match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1];

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
  { email: 'admin@pragya.local', password: 'admin123', employee_id: 'ADMIN001', name: 'Admin User', role: 'admin', domain: null },
  { email: 'sme_hr@pragya.local', password: 'sme123', employee_id: 'SME001', name: 'HR SME', role: 'sme', domain: 'hr_law' },
  { email: 'sme_citizen@pragya.local', password: 'sme123', employee_id: 'SME002', name: 'Citizen SME', role: 'sme', domain: 'citizen_law' },
  { email: 'sme_company@pragya.local', password: 'sme123', employee_id: 'SME003', name: 'Company SME', role: 'sme', domain: 'company_law' },
  { email: 'user@pragya.local', password: 'user123', employee_id: 'USER001', name: 'Regular User', role: 'user', domain: null }
];

async function setup() {
  console.log('Setting up users...\n');
  
  for (const u of users) {
    // Check if user exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('employee_id', u.employee_id)
      .maybeSingle();
    
    if (existing) {
      console.log(`⚠️  User ${u.employee_id} exists, skipping`);
      continue;
    }
    
    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { 
        employee_id: u.employee_id,
        full_name: u.name
      }
    });
    
    if (error) {
      console.log(`❌ Error creating ${u.email}: ${error.message}`);
    } else {
      // Update profile with role and domain
      await supabase
        .from('profiles')
        .update({ 
          role: u.role, 
          domain: u.domain,
          full_name: u.name
        })
        .eq('id', data.user.id);
      console.log(`✅ Created: ${u.employee_id} | ${u.email} | ${u.role}${u.domain ? ` | Domain: ${u.domain}` : ''}`);
    }
  }
  
  console.log('\n✨ Setup complete!');
}

setup();