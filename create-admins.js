const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://tbrvqcivcjowtneftstx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicnZxY2l2Y2pvd3RuZWZ0c3R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgzNDI3MiwiZXhwIjoyMDk3NDEwMjcyfQ.NsPsp2tUHf0lohXZtDxi_lXUMRKUZCmHR2hayQzXihQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUsers() {
  const admins = [
    { email: 'abdulahad@gmail.com', password: 'ahad1234', user_metadata: { role: 'admin' } },
    { email: 'gulm@gmail.com', password: 'gul1234', user_metadata: { role: 'admin' } }
  ];

  for (const admin of admins) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
      user_metadata: admin.user_metadata
    });

    if (error) {
      if (error.message.includes('already exists')) {
         console.log(`User ${admin.email} already exists. Updating password...`);
         const { data: usersData } = await supabase.auth.admin.listUsers();
         const existingUser = usersData.users.find(u => u.email === admin.email);
         if (existingUser) {
           await supabase.auth.admin.updateUserById(existingUser.id, {
             password: admin.password,
             user_metadata: admin.user_metadata
           });
           console.log(`Updated user ${admin.email}`);
         }
      } else {
         console.error(`Error creating ${admin.email}:`, error.message);
      }
    } else {
      console.log(`Successfully created ${admin.email}`);
    }
  }
}

createAdminUsers().catch(console.error);
