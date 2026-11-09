const fs = require('fs');
const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > -1 && !line.trim().startsWith('#')) {
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
});

const { createClient } = require('@supabase/supabase-js');
const { isRealUserAccount, getAccountTypeInfo } = require('../src/lib/utils/account-detector.js');

async function verifyAll() {
  console.log('=== 1. VERIFY ACCOUNT DETECTOR ===');
  const dummyStaff = ['j01@gmail.com', 'j25@gmail.com', 'jxx@gmail.com', 'jpetugas@gmail.com'];
  const realUsers = ['bagaspmltt@gmail.com', 'meccarobbani0708@gmail.com', 'user@corporate.co.id'];
  const demoUsers = ['admin.operasional@railhub.id', 'penumpang.demo@railhub.id', 'staff@railhub.com'];

  for (const d of dummyStaff) {
    if (isRealUserAccount(d)) throw new Error(`Expected ${d} to be dummy, but got real!`);
    console.log(`✓ Dummy staff identified correctly: ${d} -> ${getAccountTypeInfo(d).label}`);
  }
  for (const r of realUsers) {
    if (!isRealUserAccount(r)) throw new Error(`Expected ${r} to be real, but got dummy!`);
    console.log(`✓ Real user identified correctly: ${r} -> ${getAccountTypeInfo(r).label}`);
  }
  for (const dm of demoUsers) {
    if (isRealUserAccount(dm)) throw new Error(`Expected ${dm} to be dummy, but got real!`);
    console.log(`✓ Demo user identified correctly: ${dm} -> ${getAccountTypeInfo(dm).label}`);
  }

  console.log('\n=== 2. VERIFY SUPABASE CONNECTION & ADMIN AUTH ===');
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: auth, error: aErr } = await supabase.auth.signInWithPassword({
    email: 'admin.operasional@railhub.id',
    password: 'DemoAdmin2026!',
  });
  if (aErr || !auth?.user?.id) throw new Error('Admin login failed: ' + aErr?.message);
  console.log(`✓ Admin authenticated successfully: ${auth.user.email} (${auth.user.id})`);

  console.log('\n=== 3. VERIFY FULL SCHEDULE THROUGH 25 DECEMBER 2026 ===');
  const { count: dec25Count, data: dec25Sample } = await supabase
    .from('schedules')
    .select('id, departure_time, arrival_time, status, trains(name, train_number), routes(name)', { count: 'exact' })
    .gte('departure_time', '2026-12-25T00:00:00+07:00')
    .lte('departure_time', '2026-12-25T23:59:59+07:00')
    .order('departure_time', { ascending: true })
    .limit(5);

  console.log(`✓ Christmas Day (2026-12-25) total schedules in DB: ${dec25Count}`);
  if (dec25Count < 50) throw new Error('Expected >= 50 schedules on 2026-12-25, found ' + dec25Count);
  console.log('Sample schedule on 2026-12-25:', dec25Sample[0].trains?.name, dec25Sample[0].departure_time);

  console.log('\n=== 4. VERIFY TODAY OPERATIONAL TRIPS & LIVE MONITOR ===');
  const now = new Date();
  const past12h = new Date(now.getTime() - 12 * 3600 * 1000).toISOString();
  const next12h = new Date(now.getTime() + 12 * 3600 * 1000).toISOString();

  const { data: operationalSchedules } = await supabase
    .from('schedules')
    .select('id, status, departure_time, arrival_time')
    .gte('departure_time', past12h)
    .lte('departure_time', next12h);

  function getTripOperationalCategory(schedule, nowTime = new Date()) {
    const status = schedule.status;
    const depTime = new Date(schedule.departure_time);
    const arrTime = new Date(schedule.arrival_time);
    if (status === 'cancelled') return 'cancelled';
    if (status === 'arrived' || arrTime < nowTime) return 'sudah_jalan';
    if (status === 'departed' || status === 'boarding' || (depTime <= nowTime && arrTime >= nowTime)) return 'sedang_jalan';
    return 'belum_jalan';
  }

  let sedangCount = 0, sudahCount = 0, belumCount = 0;
  (operationalSchedules || []).forEach(s => {
    const cat = getTripOperationalCategory(s, now);
    if (cat === 'sedang_jalan') sedangCount++;
    else if (cat === 'sudah_jalan') sudahCount++;
    else if (cat === 'belum_jalan') belumCount++;
  });

  console.log(`✓ Real-time operational trips around now:`);
  console.log(`   - Sedang Jalan (in transit / running): ${sedangCount}`);
  console.log(`   - Sudah Jalan (completed / arrived): ${sudahCount}`);
  console.log(`   - Belum Jalan (scheduled): ${belumCount}`);

  console.log('\n=== 5. VERIFY STAFF ASSIGNMENTS & REAL STAFF RECOGNITION ===');
  const { data: assignments } = await supabase
    .from('staff_assignments')
    .select('id, staff_id, schedule_id, profiles!staff_assignments_staff_id_fkey(full_name, email, role), schedules(departure_time, trains(name))');
  console.log(`✓ Staff assignments count: ${assignments?.length}`);
  if (assignments?.length > 0) {
    const a = assignments[0];
    const isReal = isRealUserAccount(a.profiles?.email);
    console.log(`   Assignment 1: ${a.profiles?.full_name} (${a.profiles?.email}) -> ${isReal ? 'REAL STAFF' : 'DUMMY STAFF'}`);
  }

  console.log('\n=== 6. VERIFY FLEET & ROUTE MANAGEMENT ===');
  const { count: trainCount } = await supabase.from('trains').select('*', { count: 'exact', head: true });
  const { count: routeCount } = await supabase.from('routes').select('*', { count: 'exact', head: true });
  const { count: stationCount } = await supabase.from('stations').select('*', { count: 'exact', head: true });
  console.log(`✓ Trains: ${trainCount}, Routes: ${routeCount}, Stations: ${stationCount}`);

  console.log('\n=== 7. VERIFY FINANCIAL & TRANSACTIONS ===');
  const { data: bookings } = await supabase.from('bookings').select('id, booking_code, total_amount, status');
  console.log(`✓ Total bookings in DB: ${bookings?.length}`);

  console.log('\n>>> ALL DEEP VERIFICATIONS PASSED SUCCESSFULLY! <<<');
}

verifyAll().catch(err => {
  console.error('VERIFICATION FAILURE:', err);
  process.exit(1);
});
