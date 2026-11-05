/**
 * Curated Raw Train Fleet Catalog from DATA.md
 * Used for dynamic real-time scheduling & multi-day procedural timetable expansion.
 */

export const RAW_TRAIN_FLEET = [
  {
    id: 'bb04c3aa-b43b-50c5-9250-fa03ba1a6496',
    name: 'Argo Bromo Anggrek',
    train_number: 'KA 1',
    classes: [
      { name: 'Luxury', basePrice: 850000, subclass: 'L' },
      { name: 'Eksekutif', basePrice: 650000, subclass: 'AA' },
    ],
    serviceClass: 'Luxury Sleeper & Eksekutif New Gen',
    typicalDurationHours: 8.2,
    tag: 'Unggulan Pantura',
  },
  {
    id: 'cc8b6e05-4617-5151-9cf2-16da7af67686',
    name: 'Argo Parahyangan',
    train_number: 'KA 34',
    classes: [
      { name: 'Eksekutif', basePrice: 250000, subclass: 'AA' },
      { name: 'Ekonomi', basePrice: 150000, subclass: 'CA' },
    ],
    serviceClass: 'Eksekutif & Panoramic',
    typicalDurationHours: 2.8,
    tag: 'Wisata Parahyangan',
  },
  {
    id: '2ec4c39f-bddb-5a18-b028-df5af68f0920',
    name: 'Taksaka',
    train_number: 'KA 68',
    classes: [
      { name: 'Luxury', basePrice: 750000, subclass: 'L' },
      { name: 'Eksekutif', basePrice: 550000, subclass: 'AA' },
    ],
    serviceClass: 'Hype Trip Eksekutif',
    typicalDurationHours: 6.2,
    tag: 'Favorit Budaya',
  },
  {
    id: 'ba40386a-6b67-5c6f-acc7-6316dafa40d4',
    name: 'Argo Wilis',
    train_number: 'KA 6',
    classes: [
      { name: 'Eksekutif', basePrice: 600000, subclass: 'AA' },
    ],
    serviceClass: 'Eksekutif Panorama Lintas Selatan',
    typicalDurationHours: 9.8,
    tag: 'Panorama Selatan',
  },
  {
    id: '1aa203b0-498c-52b4-952d-00746d4361ea',
    name: 'Lodaya',
    train_number: 'KA 92',
    classes: [
      { name: 'Eksekutif', basePrice: 380000, subclass: 'AA' },
      { name: 'Ekonomi', basePrice: 260000, subclass: 'CA' },
    ],
    serviceClass: 'Eksekutif & Ekonomi',
    typicalDurationHours: 8.7,
    tag: 'Antar Budaya',
  },
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Jayakarta',
    train_number: 'KA 218',
    classes: [
      { name: 'Ekonomi', basePrice: 430000, subclass: 'CA' },
    ],
    serviceClass: 'Ekonomi Premium 2-2',
    typicalDurationHours: 12.8,
    tag: 'Lintas Pantura Panjang',
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'Gaya Baru Malam Selatan',
    train_number: 'KA 106',
    classes: [
      { name: 'Eksekutif', basePrice: 580000, subclass: 'AA' },
      { name: 'Ekonomi', basePrice: 460000, subclass: 'CA' },
    ],
    serviceClass: 'Eksekutif & Ekonomi',
    typicalDurationHours: 12.4,
    tag: 'Legenda Jalur Selatan',
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'Jayabaya',
    train_number: 'KA 108',
    classes: [
      { name: 'Eksekutif', basePrice: 560000, subclass: 'AA' },
      { name: 'Ekonomi', basePrice: 500000, subclass: 'CD' },
    ],
    serviceClass: 'Eksekutif & Ekonomi',
    typicalDurationHours: 10.3,
    tag: 'Pantura — Malang',
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'Airlangga',
    train_number: 'KA 236',
    classes: [
      { name: 'Ekonomi', basePrice: 104000, subclass: 'C' },
    ],
    serviceClass: 'Ekonomi Terjangkau (PSO)',
    typicalDurationHours: 11.7,
    tag: 'Paling Terjangkau',
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'Kertajaya',
    train_number: 'KA 220',
    classes: [
      { name: 'Ekonomi', basePrice: 310000, subclass: 'CA' },
    ],
    serviceClass: 'Ekonomi Rangkaian Panjang',
    typicalDurationHours: 10.9,
    tag: '14 Gerbong Kompak',
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    name: 'Argo Dwipangga',
    train_number: 'KA 10',
    classes: [
      { name: 'Luxury', basePrice: 800000, subclass: 'L' },
      { name: 'Eksekutif', basePrice: 580000, subclass: 'AA' },
    ],
    serviceClass: 'Eksekutif New Generation Stainless',
    typicalDurationHours: 6.1,
    tag: 'Eksekutif Modern',
  },
  {
    id: '11111111-1111-1111-1111-111111111107',
    name: 'Argo Lawu',
    train_number: 'KA 8',
    classes: [
      { name: 'Luxury', basePrice: 800000, subclass: 'L' },
      { name: 'Eksekutif', basePrice: 580000, subclass: 'AA' },
    ],
    serviceClass: 'Eksekutif New Generation Stainless',
    typicalDurationHours: 6.1,
    tag: 'Malam Solo Express',
  },
  {
    id: '11111111-1111-1111-1111-111111111108',
    name: 'Turangga',
    train_number: 'KA 66',
    classes: [
      { name: 'Eksekutif', basePrice: 580000, subclass: 'AA' },
    ],
    serviceClass: 'Eksekutif Night Express',
    typicalDurationHours: 10.2,
    tag: 'Ekspres Malam Selatan',
  },
  {
    id: '11111111-1111-1111-1111-111111111109',
    name: 'Sembrani',
    train_number: 'KA 64',
    classes: [
      { name: 'Luxury', basePrice: 780000, subclass: 'L' },
      { name: 'Eksekutif', basePrice: 620000, subclass: 'AA' },
    ],
    serviceClass: 'Eksekutif & Luxury',
    typicalDurationHours: 8.5,
    tag: 'Bisnis & Nyaman',
  },
  {
    id: '11111111-1111-1111-1111-111111111110',
    name: 'Bima',
    train_number: 'KA 60',
    classes: [
      { name: 'Eksekutif', basePrice: 590000, subclass: 'AA' },
    ],
    serviceClass: 'Eksekutif Klasik',
    typicalDurationHours: 10.5,
    tag: 'Legendaris Indonesia',
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Malabar',
    train_number: 'KA 122',
    classes: [
      { name: 'Eksekutif', basePrice: 480000, subclass: 'AA' },
      { name: 'Ekonomi', basePrice: 280000, subclass: 'CA' },
    ],
    serviceClass: 'Eksekutif, Bisnis & Ekonomi',
    typicalDurationHours: 12.5,
    tag: 'Lintas Pegunungan Malang',
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    name: 'Sancaka',
    train_number: 'KA 176',
    classes: [
      { name: 'Eksekutif', basePrice: 310000, subclass: 'AA' },
      { name: 'Ekonomi', basePrice: 220000, subclass: 'CA' },
    ],
    serviceClass: 'Eksekutif & Ekonomi',
    typicalDurationHours: 4.1,
    tag: 'Yogya — Surabaya Cepat',
  },
  {
    id: '11111111-1111-1111-1111-111111111113',
    name: 'Argo Semeru',
    train_number: 'KA 18',
    classes: [
      { name: 'Eksekutif', basePrice: 580000, subclass: 'A' },
    ],
    serviceClass: 'Eksekutif',
    typicalDurationHours: 10.5,
    tag: 'Panorama Pagi',
  },
  {
    id: '11111111-1111-1111-1111-111111111114',
    name: 'Pasundan',
    train_number: 'KA 240',
    classes: [
      { name: 'Ekonomi', basePrice: 280000, subclass: 'CA' },
    ],
    serviceClass: 'Ekonomi',
    typicalDurationHours: 13.7,
    tag: 'Favorit Hemat',
  },
  {
    id: '11111111-1111-1111-1111-111111111115',
    name: 'Mutiara Selatan',
    train_number: 'KA 86',
    classes: [
      { name: 'Eksekutif', basePrice: 520000, subclass: 'AA' },
      { name: 'Ekonomi', basePrice: 360000, subclass: 'CA' },
    ],
    serviceClass: 'Eksekutif & Ekonomi',
    typicalDurationHours: 11.1,
    tag: 'Malam Lintas Selatan',
  },
]

