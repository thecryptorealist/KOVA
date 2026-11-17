import {readFile,readdir} from 'node:fs/promises';
import pg from 'pg';
const connectionString=process.env.DATABASE_URL;
if(!connectionString)throw new Error('DATABASE_URL is required');
const client=new pg.Client({connectionString});
try {
 await client.connect();
 await client.query('SELECT pg_advisory_lock(72491601)');
 await client.query('CREATE TABLE IF NOT EXISTS public.schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
 await client.query('ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY');
 for(const file of (await readdir(new URL('../db/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort()) {
 const name=file.slice(0,-4);
 const existing=await client.query('SELECT name FROM public.schema_migrations WHERE name=$1',[name]);
 if(!existing.rowCount){
  const sql=await readFile(new URL('../db/migrations/'+file,import.meta.url),'utf8');
  await client.query(sql.replace(/COMMIT;\s*$/, ''));
  await client.query('INSERT INTO public.schema_migrations(name) VALUES($1)',[name]);
  await client.query('COMMIT');
  console.log(JSON.stringify({migration:name,applied:true}));
 }
 }
 await client.query('ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY');
 const tables=await client.query("SELECT schemaname,tablename,rowsecurity FROM pg_tables WHERE schemaname='core' OR (schemaname='public' AND tablename='schema_migrations') ORDER BY schemaname,tablename");
 console.log(JSON.stringify(tables.rows,null,2));
 console.log('Database migrations complete');
} catch(e) {console.error(JSON.stringify({event:'migration_failed',code:typeof e==='object'&&e&&'code' in e?String(e.code):'unknown'}));process.exitCode=1;} finally {await client.end();}
