// CLOSED integration: actual bundled authenticated reader -> Supabase client ->
// loopback PostgREST -> disposable PostgreSQL with labelled synthetic receipts.
// No production service, provider request, reservation or broker action.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const database = `ture-allocation-reader-db-${process.pid}`;
const api = `ture-allocation-reader-api-${process.pid}`;
const network = `ture-allocation-reader-net-${process.pid}`;
const docker = (...args) => execFileSync('docker', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
// TCP is available only on the final server, not the image's temporary
// initialization server. A Unix-socket readiness probe can race its shutdown.
const sql = statement => execFileSync('docker', ['exec', '-i', database, 'psql', '-h', '127.0.0.1', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'],
  { input: statement, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();

try {
  docker('network', 'create', '--driver', 'bridge', '--opt', 'com.docker.network.bridge.enable_ip_masquerade=false', network);
  docker('run', '--pull=never', '--rm', '-d', '--name', database, '--network', network,
    '-e', 'POSTGRES_PASSWORD=closed-reader-proof-only', 'postgres:17-alpine');
  for (let attempt = 0; ; attempt++) {
    try { sql('select 1;'); break; } catch (error) {
      if (attempt >= 60) throw error;
      await new Promise(done => setTimeout(done, 250));
    }
  }
  sql(`create role anon nologin; create role authenticated nologin;
    create role service_role nologin bypassrls;
    create role authenticator login password 'closed-reader-proof-only'; grant anon, service_role to authenticator;
    ${readFileSync(resolve(root, 'supabase/migrations/20260625000000_create_scheduled_scan_attempts.sql'), 'utf8')}
    ${readFileSync(resolve(root, 'supabase/migrations/20260926091134_sv_a2_observation_cycle_receipts.sql'), 'utf8')}
    alter table scheduled_scan_attempts enable row level security;
    revoke all on scheduled_scan_attempts from public, anon, authenticated;
    grant usage on schema public to service_role; grant select, insert on scheduled_scan_attempts to service_role;`);
  const secret = 'closed-reader-fixture-jwt-signing-secret-only';
  const basis = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')].join('.');
  const serviceKey = `${basis}.${createHmac('sha256', secret).update(basis).digest('base64url')}`;
  docker('run', '--pull=never', '--rm', '-d', '--name', api, '--network', network, '-p', '127.0.0.1::3000',
    '-e', `PGRST_DB_URI=postgres://authenticator:closed-reader-proof-only@${database}:5432/postgres`,
    '-e', 'PGRST_DB_ANON_ROLE=anon', '-e', `PGRST_JWT_SECRET=${secret}`, 'public.ecr.aws/supabase/postgrest:v14.5');
  const port = docker('port', api, '3000/tcp').split(':').at(-1);
  assert.match(port, /^[0-9]+$/);
  const origin = `http://127.0.0.1:${port}`;
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1000) });
      if (response.ok) break;
    } catch { /* bounded local startup */ }
    if (attempt >= 60) throw new Error('Local PostgREST readiness timeout');
    await new Promise(done => setTimeout(done, 250));
  }
  const environment = { ...process.env, PLAYWRIGHT_SKIP_WEB_SERVER: 'true' };
  for (const key of Object.keys(environment)) {
    if (/SUPABASE|TWELVE_DATA|POLYGON|OPENAI|AUTOMATION_SECRET|TURE_/.test(key)) delete environment[key];
  }
  Object.assign(environment, {
    TURE_TASK_EVALUATION_LOCAL_API_ORIGIN: origin,
    TURE_TASK_EVALUATION_LOCAL_DATABASE: database,
    TURE_TASK_EVALUATION_LOCAL_SERVICE_KEY: serviceKey,
  });
  const run = spawnSync(resolve(root, 'node_modules/.bin/playwright'), ['test',
    'tests/e2e/scanner-provider-credit-allocation-live-evaluation.spec.ts',
    '--project=chromium', '--workers=1', '--reporter=line', '-g', 'authenticated readback joins'],
    { cwd: root, env: environment, stdio: 'inherit', timeout: 90000 });
  if (run.error) throw run.error;
  assert.equal(run.status, 0, 'Actual isolated-database readback proof failed');
  assert.equal(sql('select count(*) from scheduled_scan_attempts;'), '6');
  assert.equal(sql('select count(*) from observation_cycle_receipts;'), '7');
  console.log(JSON.stringify({ evidence_mode: 'synthetic_closed_isolated_database',
    scheduled_attempt_rows: 6, cycle_rows: 7, owner_cycle_rows: 6,
    verified_completed_slots: 6, fixture_reserved_credits: 48,
    production_provider_requests: 0, production_credit_reservations: 0,
    candidate_publications: 0, broker_actions: 0, recommendation_quality: 'unproven' }));
} finally {
  for (const container of [api, database]) {
    spawnSync('docker', ['rm', '-f', container], { stdio: 'ignore' });
  }
  spawnSync('docker', ['network', 'rm', network], { stdio: 'ignore' });
}
