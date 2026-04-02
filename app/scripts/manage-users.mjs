// import { createClient } from '@supabase/supabase-js';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Read .env from app folder
// const envPath = path.join(__dirname, '../.env');
// let supabaseUrl, supabaseKey;

// try {
//   const envContent = fs.readFileSync(envPath, 'utf-8');
//   const lines = envContent.split('\n');
//   for (const line of lines) {
//     if (line.startsWith('SUPABASE_URL=')) {
//       supabaseUrl = line.split('=')[1].trim();
//     }
//     if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
//       supabaseKey = line.split('=')[1].trim();
//     }
//   }
// } catch (err) {
//   console.error('❌ Could not read .env file at:', envPath);
//   console.error('Make sure you have .env file in the app folder\n');
//   process.exit(1);
// }

// if (!supabaseUrl || !supabaseKey) {
//   console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
//   process.exit(1);
// }

// const supabase = createClient(supabaseUrl, supabaseKey);

// // Users with separate SMEs for each domain
// const users = [
//   // Admin
//   { email: 'admin@pragya.local', password: 'admin123', employee_id: 'ADMIN001', name: 'Admin User', role: 'admin', domain: null },
  
//   // SMEs for each domain
//   { email: 'sme_hr@pragya.local', password: 'sme123', employee_id: 'SME_HR001', name: 'HR Law SME', role: 'sme', domain: 'hr_law' },
//   { email: 'sme_citizen@pragya.local', password: 'sme123', employee_id: 'SME_CIT001', name: 'Citizen Law SME', role: 'sme', domain: 'citizen_law' },
//   { email: 'sme_company@pragya.local', password: 'sme123', employee_id: 'SME_COM001', name: 'Company Law SME', role: 'sme', domain: 'company_law' },
  
//   // Regular User
//   { email: 'user@pragya.local', password: 'user123', employee_id: 'USER001', name: 'Regular User', role: 'user', domain: null }
// ];

// async function setup() {
//   console.log('🔧 Setting up users...\n');
//   console.log(`Using Supabase: ${supabaseUrl}\n`);
  
//   for (const u of users) {
//     try {
//       // Check if user exists by employee_id
//       const { data: existing } = await supabase
//         .from('profiles')
//         .select('id, email')
//         .eq('employee_id', u.employee_id)
//         .maybeSingle();
      
//       if (existing) {
//         // Update existing user's profile
//         const { error: updateError } = await supabase
//           .from('profiles')
//           .update({ 
//             role: u.role, 
//             domain: u.domain,
//             full_name: u.name
//           })
//           .eq('id', existing.id);
        
//         if (updateError) {
//           console.log(`⚠️  Update failed for ${u.employee_id}: ${updateError.message}`);
//         } else {
//           console.log(`🔄 Updated: ${u.employee_id} | ${u.email} | ${u.role}${u.domain ? ` → ${u.domain}` : ''}`);
//         }
//       } else {
//         // Create new auth user
//         const { data: authData, error: authError } = await supabase.auth.admin.createUser({
//           email: u.email,
//           password: u.password,
//           email_confirm: true,
//           user_metadata: { 
//             employee_id: u.employee_id,
//             full_name: u.name
//           }
//         });
        
//         if (authError) {
//           console.log(`❌ Error creating ${u.email}: ${authError.message}`);
//         } else {
//           // Create profile
//           const { error: profileError } = await supabase
//             .from('profiles')
//             .insert({
//               id: authData.user.id,
//               employee_id: u.employee_id,
//               full_name: u.name,
//               role: u.role,
//               domain: u.domain
//             });
          
//           if (profileError) {
//             console.log(`⚠️  Profile error for ${u.employee_id}: ${profileError.message}`);
//           } else {
//             console.log(`✅ Created: ${u.employee_id} | ${u.email} | ${u.role}${u.domain ? ` → ${u.domain}` : ''}`);
//           }
//         }
//       }
//     } catch (err) {
//       console.log(`❌ Error with ${u.employee_id}: ${err.message}`);
//     }
//   }
  
//   // Show all users
//   console.log('\n📋 Current users in database:');
//   const { data: allUsers } = await supabase
//     .from('profiles')
//     .select('employee_id, email, role, domain, full_name')
//     .order('role');
  
//   if (allUsers && allUsers.length > 0) {
//     allUsers.forEach(u => {
//       console.log(`   ${u.employee_id} | ${u.email} | ${u.role}${u.domain ? ` | ${u.domain}` : ''} | ${u.full_name || '-'}`);
//     });
//   }
  
//   console.log('\n✨ Setup complete!');
//   console.log('\n🔐 Login credentials:');
//   console.log('   ADMIN: ADMIN001/ admin123');
//   console.log('   HR SME:     SME_HR001 / sme123');
//   console.log('   CITIZEN SME: SME_CIT001 / sme123');
//   console.log('   COMPANY SME: SME_COM001 / sme123');
//   console.log('   USER:       USER001 / user123');
// }

// setup();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../app/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// List of users with Indian names
const users = [
  { employee_id: 'ADMIN001', name: 'Rajesh Kumar', role: 'admin', domain: null, password: 'admin123' },
  { employee_id: 'SME_HR001', name: 'Priya Sharma', role: 'sme', domain: 'hr_law', password: 'sme123' },
  { employee_id: 'SME_CIT001', name: 'Amit Patel', role: 'sme', domain: 'citizen_law', password: 'sme123' },
  { employee_id: 'SME_COM001', name: 'Neha Gupta', role: 'sme', domain: 'company_law', password: 'sme123' },
  { employee_id: 'USER001', name: 'Vikram Singh', role: 'user', domain: null, password: null },
  { employee_id: 'USER002', name: 'Anjali Nair', role: 'user', domain: null, password: null },
  { employee_id: 'USER003', name: 'Rahul Verma', role: 'user', domain: null, password: null },
];

async function manageUsers() {
  console.log('Managing users...\n');
  
  for (const u of users) {
    // Check if user exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('employee_id', u.employee_id)
      .maybeSingle();
    
    if (existing) {
      // Update existing user
      await supabase
        .from('profiles')
        .update({ full_name: u.name, role: u.role, domain: u.domain })
        .eq('id', existing.id);
      console.log(`🔄 Updated: ${u.employee_id} - ${u.name} (${u.role})`);
    } else if (u.role !== 'user') {
      // Create new user with password (Admin/SME)
      const { data: authData } = await supabase.auth.admin.createUser({
        email: `${u.employee_id}@pragya.local`,
        password: u.password,
        email_confirm: true,
        user_metadata: { employee_id: u.employee_id, full_name: u.name }
      });
      
      if (authData?.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          employee_id: u.employee_id,
          full_name: u.name,
          role: u.role,
          domain: u.domain
        });
        console.log(`✅ Created: ${u.employee_id} - ${u.name} (${u.role})`);
      }
    } else {
      // Create regular user (no password needed)
      const { data: authData } = await supabase.auth.admin.createUser({
        email: `${u.employee_id}@pragya.local`,
        password: 'temp123',
        email_confirm: true,
        user_metadata: { employee_id: u.employee_id, full_name: u.name }
      });
      
      if (authData?.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          employee_id: u.employee_id,
          full_name: u.name,
          role: u.role,
          domain: u.domain
        });
        console.log(`✅ Created: ${u.employee_id} - ${u.name} (${u.role})`);
      }
    }
  }
  
  console.log('\n✨ Done!');
}

manageUsers();