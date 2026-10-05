import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xghzubicunxcxjnxhecc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function test() {
  console.log("Testing with Service Role Key (bypassing RLS)...");
  
  // Fetch a product
  const { data: products, error: pErr } = await supabase.from('products').select('id, title').limit(1);
  if (pErr) {
    console.error("Error fetching products:", pErr);
    return;
  }
  if (!products || products.length === 0) {
    console.log("No products found in database.");
    return;
  }
  
  const product_id = products[0].id;
  console.log(`Using product: ${products[0].title} (${product_id})`);

  // Let's print out what properties product_variants actually has using rest api or dummy insert
  const testPayload = {
    product_id,
    color_name: 'Test Purple',
    color_code: '#800080',
    stock_quantity: 12,
    size: 'M'
  };

  console.log("Inserting payload to product_variants:", testPayload);
  const { data, error } = await supabase.from('product_variants').insert([testPayload]).select();
  if (error) {
    console.error("Insert into product_variants failed!", error);
  } else {
    console.log("Insert into product_variants SUCCESSFUL!", data);
    // clean up
    await supabase.from('product_variants').delete().eq('id', data[0].id);
  }
}

test();
