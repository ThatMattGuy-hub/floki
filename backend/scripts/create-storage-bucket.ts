import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStorageBucket() {
  console.log('Creating storage bucket "files"...');

  // Check if bucket already exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === 'files');
  
  if (exists) {
    console.log('✅ Bucket "files" already exists');
    return;
  }

  // Create bucket with minimal config
  const { data, error } = await supabase.storage.createBucket('files', {
    public: true
  });

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('✅ Bucket "files" already exists');
      return;
    }
    console.error('❌ Error creating bucket:', error);
    console.error('Please create the bucket manually in Supabase Dashboard:');
    console.error('1. Go to Storage in your Supabase dashboard');
    console.error('2. Click "New bucket"');
    console.error('3. Name it "files"');
    console.error('4. Make it public');
    process.exit(1);
  }

  console.log('✅ Bucket "files" created successfully!');
}

createStorageBucket()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

