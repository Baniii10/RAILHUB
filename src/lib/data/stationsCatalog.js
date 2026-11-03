/**
 * RAILHUB Station Catalog
 * Curated 50 major operational stations across Java & Sumatra
 * Sourced from raw_data/stasiun_fajriyan_raw.json & stasiun_kai_booking_raw.json
 */

export const STATIONS_CATALOG = [
  // --- DKI Jakarta ---
  { code: 'PSE', name: 'Pasar Senen', city: 'Jakarta Pusat', province: 'DKI Jakarta', hub: 'PSE', category: 'Intercity' },
  { code: 'GMR', name: 'Gambir', city: 'Jakarta Pusat', province: 'DKI Jakarta', hub: 'GMR', category: 'Intercity' },
  { code: 'JNG', name: 'Jatinegara', city: 'Jakarta Timur', province: 'DKI Jakarta', hub: 'PSE', category: 'Intercity' },
  { code: 'MRI', name: 'Manggarai', city: 'Jakarta Selatan', province: 'DKI Jakarta', hub: 'GMR', category: 'Transit Hub' },
  { code: 'JAKK', name: 'Jakarta Kota', city: 'Jakarta Barat', province: 'DKI Jakarta', hub: 'GMR', category: 'Heritage' },

  // --- Jawa Barat ---
  { code: 'BD', name: 'Bandung', city: 'Kota Bandung', province: 'Jawa Barat', hub: 'BD', category: 'Intercity' },
  { code: 'KAC', name: 'Kiaracondong', city: 'Kota Bandung', province: 'Jawa Barat', hub: 'BD', category: 'Intercity' },
  { code: 'CN', name: 'Cirebon', city: 'Kota Cirebon', province: 'Jawa Barat', hub: 'CN', category: 'Intercity' },
  { code: 'CNP', name: 'Cirebon Prujakan', city: 'Kota Cirebon', province: 'Jawa Barat', hub: 'CN', category: 'Intercity' },
  { code: 'BJR', name: 'Banjar', city: 'Kota Banjar', province: 'Jawa Barat', hub: 'BD', category: 'Regional' },
  { code: 'CI', name: 'Ciamis', city: 'Kabupaten Ciamis', province: 'Jawa Barat', hub: 'BD', category: 'Regional' },
  { code: 'TSM', name: 'Tasikmalaya', city: 'Kota Tasikmalaya', province: 'Jawa Barat', hub: 'BD', category: 'Intercity' },
  { code: 'CKP', name: 'Cikampek', city: 'Kabupaten Karawang', province: 'Jawa Barat', hub: 'GMR', category: 'Junction' },
  { code: 'BOP', name: 'Bogor Paledang', city: 'Kota Bogor', province: 'Jawa Barat', hub: 'GMR', category: 'Regional' },
  { code: 'BTT', name: 'Batutulis', city: 'Kota Bogor', province: 'Jawa Barat', hub: 'GMR', category: 'Regional' },
  { code: 'CBD', name: 'Cibadak', city: 'Kabupaten Sukabumi', province: 'Jawa Barat', hub: 'BD', category: 'Regional' },
  { code: 'CB', name: 'Cibatu', city: 'Kabupaten Garut', province: 'Jawa Barat', hub: 'BD', category: 'Junction' },
  { code: 'CCL', name: 'Cicalengka', city: 'Kabupaten Bandung', province: 'Jawa Barat', hub: 'BD', category: 'Commuter' },
  { code: 'CCR', name: 'Cicurug', city: 'Kabupaten Sukabumi', province: 'Jawa Barat', hub: 'GMR', category: 'Regional' },
  { code: 'AWN', name: 'Arjawinangun', city: 'Kabupaten Cirebon', province: 'Jawa Barat', hub: 'CN', category: 'Regional' },

  // --- Jawa Tengah ---
  { code: 'SMT', name: 'Semarang Tawang', city: 'Kota Semarang', province: 'Jawa Tengah', hub: 'SMT', category: 'Intercity' },
  { code: 'SMC', name: 'Semarang Poncol', city: 'Kota Semarang', province: 'Jawa Tengah', hub: 'SMT', category: 'Intercity' },
  { code: 'SLO', name: 'Solo Balapan', city: 'Kota Surakarta', province: 'Jawa Tengah', hub: 'SLO', category: 'Intercity' },
  { code: 'PWT', name: 'Purwokerto', city: 'Kabupaten Banyumas', province: 'Jawa Tengah', hub: 'PWT', category: 'Intercity' },
  { code: 'CP', name: 'Cilacap', city: 'Kabupaten Cilacap', province: 'Jawa Tengah', hub: 'PWT', category: 'Regional' },
  { code: 'KTA', name: 'Kutoarjo', city: 'Kabupaten Purworejo', province: 'Jawa Tengah', hub: 'YK', category: 'Intercity' },
  { code: 'TGL', name: 'Tegal', city: 'Kota Tegal', province: 'Jawa Tengah', hub: 'SMT', category: 'Intercity' },
  { code: 'PK', name: 'Pekalongan', city: 'Kota Pekalongan', province: 'Jawa Tengah', hub: 'SMT', category: 'Intercity' },
  { code: 'BB', name: 'Brebes', city: 'Kabupaten Brebes', province: 'Jawa Tengah', hub: 'SMT', category: 'Regional' },
  { code: 'BMA', name: 'Bumiayu', city: 'Kabupaten Brebes', province: 'Jawa Tengah', hub: 'PWT', category: 'Regional' },
  { code: 'BTG', name: 'Batang', city: 'Kabupaten Batang', province: 'Jawa Tengah', hub: 'SMT', category: 'Regional' },
  { code: 'CO', name: 'Comal', city: 'Kabupaten Pemalang', province: 'Jawa Tengah', hub: 'SMT', category: 'Regional' },
  { code: 'DPL', name: 'Doplang', city: 'Kabupaten Blora', province: 'Jawa Tengah', hub: 'SMT', category: 'Regional' },
  { code: 'GBN', name: 'Gambringan', city: 'Kabupaten Grobogan', province: 'Jawa Tengah', hub: 'SMT', category: 'Junction' },
  { code: 'GB', name: 'Gombong', city: 'Kabupaten Kebumen', province: 'Jawa Tengah', hub: 'PWT', category: 'Intercity' },
  { code: 'GD', name: 'Gundih', city: 'Kabupaten Grobogan', province: 'Jawa Tengah', hub: 'SLO', category: 'Junction' },

  // --- DI Yogyakarta ---
  { code: 'YK', name: 'Yogyakarta', city: 'Kota Yogyakarta', province: 'DI Yogyakarta', hub: 'YK', category: 'Intercity' },
  { code: 'LPN', name: 'Lempuyangan', city: 'Kota Yogyakarta', province: 'DI Yogyakarta', hub: 'YK', category: 'Intercity' },
  { code: 'WT', name: 'Wates', city: 'Kabupaten Kulon Progo', province: 'DI Yogyakarta', hub: 'YK', category: 'Regional' },

  // --- Jawa Timur ---
  { code: 'SGU', name: 'Surabaya Gubeng', city: 'Kota Surabaya', province: 'Jawa Timur', hub: 'SGU', category: 'Intercity' },
  { code: 'SBI', name: 'Surabaya Pasarturi', city: 'Kota Surabaya', province: 'Jawa Timur', hub: 'SGU', category: 'Intercity' },
  { code: 'WO', name: 'Wonokromo', city: 'Kota Surabaya', province: 'Jawa Timur', hub: 'SGU', category: 'Regional' },
  { code: 'ML', name: 'Malang', city: 'Kota Malang', province: 'Jawa Timur', hub: 'ML', category: 'Intercity' },
  { code: 'MLK', name: 'Malang Kotalama', city: 'Kota Malang', province: 'Jawa Timur', hub: 'ML', category: 'Intercity' },
  { code: 'MN', name: 'Madiun', city: 'Kota Madiun', province: 'Jawa Timur', hub: 'MN', category: 'Intercity' },
  { code: 'BL', name: 'Blitar', city: 'Kota Blitar', province: 'Jawa Timur', hub: 'ML', category: 'Intercity' },
  { code: 'KD', name: 'Kediri', city: 'Kota Kediri', province: 'Jawa Timur', hub: 'KD', category: 'Intercity' },
  { code: 'JG', name: 'Jombang', city: 'Kabupaten Jombang', province: 'Jawa Timur', hub: 'SGU', category: 'Intercity' },
  { code: 'KTS', name: 'Kertosono', city: 'Kabupaten Nganjuk', province: 'Jawa Timur', hub: 'MN', category: 'Junction' },
  { code: 'JR', name: 'Jember', city: 'Kabupaten Jember', province: 'Jawa Timur', hub: 'JR', category: 'Intercity' },
]

export function getStationByCode(code) {
  if (!code) return null
  const normalized = code.trim().toUpperCase()
  return STATIONS_CATALOG.find(s => s.code === normalized) || null
}

export function searchStations(query) {
  if (!query) return STATIONS_CATALOG
  const q = query.trim().toLowerCase()
  return STATIONS_CATALOG.filter(s =>
    s.code.toLowerCase().includes(q) ||
    s.name.toLowerCase().includes(q) ||
    s.city.toLowerCase().includes(q) ||
    s.province.toLowerCase().includes(q)
  )
}

