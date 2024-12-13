import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createAdmin() {
  try {
    // Sign up the admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@xflo.io',
      password: 'Admin123!',
    })

    if (authError) {
      throw authError
    }

    console.log('Created auth user:', authData)

    // Create the profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user?.id,
        email: 'admin@xflo.io',
        role: 'super_admin',
        first_name: 'Admin',
        last_name: 'User'
      })

    if (profileError) {
      throw profileError
    }

    console.log('Created profile:', profileData)
    console.log('\nAdmin user created successfully!')
    console.log('Email: admin@xflo.io')
    console.log('Password: Admin123!')
  } catch (error) {
    console.error('Error creating admin:', error)
  }
}

createAdmin()
