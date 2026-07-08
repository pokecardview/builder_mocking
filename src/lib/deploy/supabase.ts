export async function createSupabaseProject(name: string, dbPassword: string, managementToken: string) {
  const response = await fetch('https://api.supabase.com/v1/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managementToken}` },
    body: JSON.stringify({ name, db_pass: dbPassword, plan: 'free', region: 'us-east-1' }),
  });
  if (!response.ok) throw new Error(`Supabase management error: ${response.status}`);
  return await response.json();
}

export async function executeSqlOnProject(ref: string, sql: string, managementToken: string) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managementToken}` },
    body: JSON.stringify({ query: sql }),
  });
  if (!response.ok) throw new Error(`Supabase SQL execution error: ${response.status}`);
  return await response.json();
}
