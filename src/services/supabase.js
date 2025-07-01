const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Faltan las credenciales de Supabase en las variables de entorno');
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Cliente de Supabase configurado correctamente');

module.exports = { supabase }; 
