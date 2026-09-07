import { 
  UserProfile, 
  Product, 
  Order, 
  DockerContainer, 
  ApiEndpointSpec, 
  RedisCacheEntry 
} from '../types';

export const USER_PROFILES: Record<string, UserProfile> = {
  ADMIN: {
    id: 'usr_adm_901',
    name: 'Dr. Elena Vance',
    email: 'e.vance@mediflow-health.org',
    role: 'ADMIN',
    roleTitle: 'Hospital System Administrator',
    department: 'Executive Operations & IT',
    tierLevel: 1,
    permissions: [
      'system:all',
      'inventory:write',
      'inventory:read',
      'orders:create',
      'orders:approve',
      'orders:dispatch',
      'concurrency:test',
      'redis:flush',
      'audit:read',
      'docker:manage'
    ],
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  },
  INVENTORY_MANAGER: {
    id: 'usr_inv_442',
    name: 'Marcus Thorne, PharmD',
    email: 'm.thorne@pharmacy.mediflow.org',
    role: 'INVENTORY_MANAGER',
    roleTitle: 'Chief Pharmacist & Inventory Lead',
    department: 'Central Hospital Pharmacy & Depots',
    tierLevel: 2,
    permissions: [
      'inventory:read',
      'inventory:write',
      'inventory:adjust',
      'batch:manage',
      'orders:approve',
      'orders:allocate',
      'redis:view',
      'audit:read'
    ],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  },
  PROCUREMENT: {
    id: 'usr_pro_108',
    name: 'Dr. Sarah Chen, MD',
    email: 's.chen@icu.mediflow.org',
    role: 'PROCUREMENT',
    roleTitle: 'ICU Senior Clinician & Procurement Officer',
    department: 'Department of Critical Care & Surgery',
    tierLevel: 3,
    permissions: [
      'inventory:read',
      'catalog:search',
      'orders:create',
      'orders:view_own',
      'orders:track'
    ],
    avatar: 'https://images.unsplash.com/photo-1594824813512-921644788c0a?w=150&auto=format&fit=crop&q=80'
  },
  LOGISTICS: {
    id: 'usr_log_773',
    name: 'Rafael Santos',
    email: 'r.santos@fleet.mediflow.org',
    role: 'LOGISTICS',
    roleTitle: 'Cold-Chain Logistics & Dispatch Lead',
    department: 'Medical Transport & Courier Fleet',
    tierLevel: 4,
    permissions: [
      'orders:view_dispatched',
      'orders:dispatch',
      'orders:mark_delivered',
      'coldchain:telemetry',
      'delivery:track'
    ],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    sku: 'MED-REM-100',
    name: 'Remdesivir Lyophilized Powder',
    genericName: 'Remdesivir for Injection 100mg',
    ndc: '61958-2901-1',
    category: 'Emergency & ICU',
    dosageForm: '100mg Vial (IV Infusion)',
    unitPrice: 520.00,
    stockQuantity: 18,
    allocatedReserved: 4,
    reorderLevel: 25,
    criticalThreshold: 10,
    isColdChain: false,
    targetTempRange: '15°C to 25°C (Controlled Room Temp)',
    locationRack: 'Bay-A3 / Secure Safe 02',
    manufacturer: 'Gilead Sciences BioPharma',
    description: 'Broad-spectrum antiviral nucleotide analog for severe pulmonary and viral ICU patients.',
    cachedInRedis: true,
    lastCachedAt: '34s ago',
    batches: [
      {
        batchNumber: 'BCH-REM-2026A',
        quantity: 12,
        expiryDate: '2026-11-30',
        mfgDate: '2025-05-10',
        storageTemp: '20°C ambient',
        status: 'OPTIMAL'
      },
      {
        batchNumber: 'BCH-REM-2025D',
        quantity: 6,
        expiryDate: '2025-10-15',
        mfgDate: '2024-10-01',
        storageTemp: '20°C ambient',
        status: 'NEAR_EXPIRY'
      }
    ]
  },
  {
    id: 'prod_002',
    sku: 'VAX-BNT-030',
    name: 'Comirnaty mRNA COVID-19 Vaccine',
    genericName: 'Tozinameran (mRNA BNT162b2)',
    ndc: '00069-1000-02',
    category: 'Vaccines & Biologics',
    dosageForm: '0.3mL/dose (6-dose Multi-vial)',
    unitPrice: 195.00,
    stockQuantity: 140,
    allocatedReserved: 24,
    reorderLevel: 60,
    criticalThreshold: 30,
    isColdChain: true,
    targetTempRange: '2°C to 8°C (Refrigerated) / -80°C Ultra-Cold',
    locationRack: 'ColdVault-01 / Shelf C (Sensor #TC-99)',
    manufacturer: 'Pfizer-BioNTech',
    description: 'Lipid nanoparticle-formulated mRNA vaccine requiring continuous thermal cold-chain logging.',
    cachedInRedis: true,
    lastCachedAt: '12s ago',
    batches: [
      {
        batchNumber: 'BCH-VAX-8891',
        quantity: 90,
        expiryDate: '2027-02-28',
        mfgDate: '2025-08-15',
        storageTemp: '4.2°C logged',
        status: 'OPTIMAL'
      },
      {
        batchNumber: 'BCH-VAX-7740',
        quantity: 50,
        expiryDate: '2026-12-15',
        mfgDate: '2025-06-01',
        storageTemp: '3.9°C logged',
        status: 'OPTIMAL'
      }
    ]
  },
  {
    id: 'prod_003',
    sku: 'MED-NOR-004',
    name: 'Norepinephrine Bitartrate 4mg/4mL',
    genericName: 'Levophed / Norepinephrine IV',
    ndc: '00409-3375-04',
    category: 'Emergency & ICU',
    dosageForm: '4mg Ampoule (4mL)',
    unitPrice: 42.50,
    stockQuantity: 8, // Low stock trigger
    allocatedReserved: 2,
    reorderLevel: 30,
    criticalThreshold: 12,
    isColdChain: false,
    targetTempRange: '20°C to 25°C',
    locationRack: 'Emergency Crash-Cart Depo 4',
    manufacturer: 'Pfizer Injectables / Hospira',
    description: 'First-line alpha-1/beta-1 adrenergic agonist in septic and cardiogenic shock resuscitation.',
    cachedInRedis: true,
    lastCachedAt: '1m ago',
    batches: [
      {
        batchNumber: 'BCH-NOR-940',
        quantity: 8,
        expiryDate: '2026-08-30',
        mfgDate: '2024-09-12',
        storageTemp: '22°C ambient',
        status: 'OPTIMAL'
      }
    ]
  },
  {
    id: 'prod_004',
    sku: 'MED-INS-100',
    name: 'Lantus SoloStar Insulin Glargine',
    genericName: 'Insulin Glargine rDNA Origin 100 U/mL',
    ndc: '00088-2219-05',
    category: 'Pharmaceuticals',
    dosageForm: '5 x 3mL Pre-filled Pens (100 units/mL)',
    unitPrice: 285.00,
    stockQuantity: 45,
    allocatedReserved: 5,
    reorderLevel: 25,
    criticalThreshold: 15,
    isColdChain: true,
    targetTempRange: '2°C to 8°C (Do Not Freeze)',
    locationRack: 'ColdVault-02 / Bin 14',
    manufacturer: 'Sanofi-Aventis',
    description: 'Long-acting basal human insulin analog for inpatient glucose stabilization and diabetes management.',
    cachedInRedis: true,
    lastCachedAt: '45s ago',
    batches: [
      {
        batchNumber: 'BCH-INS-4412',
        quantity: 45,
        expiryDate: '2027-04-15',
        mfgDate: '2025-04-01',
        storageTemp: '4.5°C',
        status: 'OPTIMAL'
      }
    ]
  },
  {
    id: 'prod_005',
    sku: 'SURG-TRO-012',
    name: 'Endopath XCEL Bladeless Trocar 12mm',
    genericName: 'Optical Laparoscopic Cannula 12mm',
    ndc: 'SURG-ETH-5521',
    category: 'Surgical Equipment',
    dosageForm: 'Sterile Sealed Box of 6 units',
    unitPrice: 640.00,
    stockQuantity: 22,
    allocatedReserved: 3,
    reorderLevel: 15,
    criticalThreshold: 8,
    isColdChain: false,
    targetTempRange: 'Ambient Dry Storage',
    locationRack: 'OR Wing Sterile Depot / Bay 18',
    manufacturer: 'Ethicon / Johnson & Johnson',
    description: 'Precision optical entry bladeless trocar kit for minimally invasive laparoscopic surgical procedures.',
    cachedInRedis: false,
    batches: [
      {
        batchNumber: 'BCH-TRC-009',
        quantity: 22,
        expiryDate: '2028-10-31',
        mfgDate: '2025-01-20',
        storageTemp: 'Ambient',
        status: 'OPTIMAL'
      }
    ]
  },
  {
    id: 'prod_006',
    sku: 'MED-PRO-020',
    name: 'Diprivan (Propofol) Injectable Emulsion',
    genericName: 'Propofol 10 mg/mL (1%) Emulsion',
    ndc: '00310-0322-20',
    category: 'Emergency & ICU',
    dosageForm: '20 mL Ampule (200 mg / 20 mL)',
    unitPrice: 38.00,
    stockQuantity: 65,
    allocatedReserved: 10,
    reorderLevel: 40,
    criticalThreshold: 20,
    isColdChain: false,
    targetTempRange: '4°C to 22°C (Do Not Freeze)',
    locationRack: 'Surgical Anesthesia Vault B',
    manufacturer: 'Fresenius Kabi USA',
    description: 'Short-acting intravenous hypnotic agent for induction and maintenance of general anesthesia and ICU sedation.',
    cachedInRedis: true,
    lastCachedAt: '2m ago',
    batches: [
      {
        batchNumber: 'BCH-PRF-710',
        quantity: 65,
        expiryDate: '2026-09-18',
        mfgDate: '2025-03-01',
        storageTemp: '18°C',
        status: 'OPTIMAL'
      }
    ]
  },
  {
    id: 'prod_007',
    sku: 'DIAG-TRP-050',
    name: 'Alere Triage Cardiac Troponin I Reagent',
    genericName: 'High-Sensitivity cTnI Rapid Immunoassay',
    ndc: 'DIAG-TRP-8801',
    category: 'Diagnostics & Reagents',
    dosageForm: 'Kit of 25 Test Cartridges',
    unitPrice: 410.00,
    stockQuantity: 12,
    allocatedReserved: 2,
    reorderLevel: 15,
    criticalThreshold: 6,
    isColdChain: true,
    targetTempRange: '2°C to 8°C (Cold-Chain Reagent)',
    locationRack: 'Stat Lab Refrigerator 3',
    manufacturer: 'QuidelOrtho Diagnostics',
    description: 'Rapid quantitative fluorescent immunoassay for ruling out acute myocardial infarction in the Emergency Room.',
    cachedInRedis: true,
    lastCachedAt: '3m ago',
    batches: [
      {
        batchNumber: 'BCH-TRP-302',
        quantity: 12,
        expiryDate: '2026-05-15',
        mfgDate: '2025-05-01',
        storageTemp: '3.6°C',
        status: 'OPTIMAL'
      }
    ]
  },
  {
    id: 'prod_008',
    sku: 'PPE-NIT-100',
    name: 'Halyard Purple Nitrile Sterile Exam Gloves',
    genericName: 'Nitrile Chemo-Tested Gloves (Size M)',
    ndc: 'PPE-HAL-5508',
    category: 'PPE & Consumables',
    dosageForm: 'Box of 100 Ambidextrous Gloves',
    unitPrice: 24.50,
    stockQuantity: 380,
    allocatedReserved: 50,
    reorderLevel: 100,
    criticalThreshold: 50,
    isColdChain: false,
    targetTempRange: 'Ambient Dry',
    locationRack: 'Depot Warehouse Pallet 12',
    manufacturer: 'Owens & Minor / Halyard',
    description: 'Non-latex powder-free exam gloves tested against 29 chemotherapy drugs and medical pathogens.',
    cachedInRedis: true,
    lastCachedAt: '5m ago',
    batches: [
      {
        batchNumber: 'BCH-GLV-9921',
        quantity: 380,
        expiryDate: '2029-01-01',
        mfgDate: '2025-02-10',
        storageTemp: 'Ambient',
        status: 'OPTIMAL'
      }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_9901',
    orderNumber: 'MF-ORD-2026-9901',
    createdAt: '2026-09-07 07:15 UTC',
    requisitionBy: 'Dr. Sarah Chen (ICU Attending)',
    department: 'Cardiothoracic ICU & Trauma Unit',
    priority: 'CRITICAL',
    status: 'DISPATCHED',
    items: [
      {
        productId: 'prod_002',
        sku: 'VAX-BNT-030',
        name: 'Comirnaty mRNA COVID-19 Vaccine',
        unitPrice: 195.00,
        quantity: 12,
        allocatedBatch: 'BCH-VAX-8891'
      },
      {
        productId: 'prod_001',
        sku: 'MED-REM-100',
        name: 'Remdesivir Lyophilized Powder',
        unitPrice: 520.00,
        quantity: 4,
        allocatedBatch: 'BCH-REM-2026A'
      }
    ],
    totalAmount: 4420.00,
    notes: 'Urgent protocol: cold-chain vaccine + antiviral replenishment for ICU bay 4 isolation beds.',
    approvedBy: 'Marcus Thorne, PharmD',
    approvedAt: '2026-09-07 07:35 UTC',
    dispatchedAt: '2026-09-07 08:10 UTC',
    deliveryTracking: {
      courierName: 'MediFlow ColdLink Express #08',
      trackingNumber: 'TRK-MED-883910-CL',
      vehicleId: 'EV-SPRINTER-VAN-4B (Refrigerated)',
      driverName: 'Carlos Ramirez',
      driverPhone: '+1 (555) 438-9921',
      currentTempCelsius: 3.8,
      targetTempMin: 2.0,
      targetTempMax: 8.0,
      etaMinutes: 18,
      destinationHospital: 'St. Jude Metropolitan Trauma Center',
      destinationWard: 'ICU Critical Pharmacy Satellite - Bay 4',
      checkpoints: [
        {
          id: 'cp_1',
          status: 'Pharmacy Batch Allocation & Barcode Verification',
          timestamp: '07:45 UTC',
          location: 'Central Depot - Cold Vault 01',
          completed: true,
          temperatureReading: 3.6
        },
        {
          id: 'cp_2',
          status: 'Loaded into IoT Insulated Active-Chill Container',
          timestamp: '08:05 UTC',
          location: 'Dispatch Dock Bay 3',
          completed: true,
          temperatureReading: 3.7
        },
        {
          id: 'cp_3',
          status: 'In Transit via Refrigerated Van EV-4B',
          timestamp: '08:25 UTC',
          location: 'Metro Express Corridor Interstate 80 (Mile 14)',
          completed: true,
          temperatureReading: 3.8
        },
        {
          id: 'cp_4',
          status: 'Arriving at Hospital Receiving Dock',
          timestamp: 'Estimated 09:05 UTC',
          location: 'Trauma Center Receiving Dock G',
          completed: false,
          temperatureReading: 4.0
        }
      ]
    }
  },
  {
    id: 'ord_9902',
    orderNumber: 'MF-ORD-2026-9902',
    createdAt: '2026-09-07 06:40 UTC',
    requisitionBy: 'Nurse Supervisor Jenna Morales',
    department: 'Emergency Resuscitation & Shock Bay',
    priority: 'CRITICAL',
    status: 'ALLOCATED_PICKED',
    items: [
      {
        productId: 'prod_003',
        sku: 'MED-NOR-004',
        name: 'Norepinephrine Bitartrate 4mg/4mL',
        unitPrice: 42.50,
        quantity: 2,
        allocatedBatch: 'BCH-NOR-940'
      },
      {
        productId: 'prod_006',
        sku: 'MED-PRO-020',
        name: 'Diprivan (Propofol) Injectable Emulsion',
        unitPrice: 38.00,
        quantity: 10,
        allocatedBatch: 'BCH-PRF-710'
      }
    ],
    totalAmount: 465.00,
    notes: 'Crash cart replenishment for ER Bays 1-3 following overnight trauma admissions.',
    approvedBy: 'Marcus Thorne, PharmD',
    approvedAt: '2026-09-07 07:05 UTC'
  },
  {
    id: 'ord_9903',
    orderNumber: 'MF-ORD-2026-9903',
    createdAt: '2026-09-07 08:00 UTC',
    requisitionBy: 'Dr. Alistair Finch, Chief of Surgery',
    department: 'General & Minimally Invasive Surgery Suite',
    priority: 'HIGH',
    status: 'PENDING_APPROVAL',
    items: [
      {
        productId: 'prod_005',
        sku: 'SURG-TRO-012',
        name: 'Endopath XCEL Bladeless Trocar 12mm',
        unitPrice: 640.00,
        quantity: 3
      },
      {
        productId: 'prod_008',
        sku: 'PPE-NIT-100',
        name: 'Halyard Purple Nitrile Sterile Exam Gloves',
        unitPrice: 24.50,
        quantity: 20
      }
    ],
    totalAmount: 2410.00,
    notes: 'Scheduled for Afternoon Laparoscopic Cholecystectomy OR rotation.'
  },
  {
    id: 'ord_9900',
    orderNumber: 'MF-ORD-2026-9900',
    createdAt: '2026-09-06 16:20 UTC',
    requisitionBy: 'Endocrinology Dept - Dr. Patel',
    department: 'Outpatient Chronic Care Clinic',
    priority: 'NORMAL',
    status: 'DELIVERED',
    items: [
      {
        productId: 'prod_004',
        sku: 'MED-INS-100',
        name: 'Lantus SoloStar Insulin Glargine',
        unitPrice: 285.00,
        quantity: 15,
        allocatedBatch: 'BCH-INS-4412'
      }
    ],
    totalAmount: 4275.00,
    notes: 'Bi-weekly insulin inventory restocking. Chain of custody signed.',
    approvedBy: 'Marcus Thorne, PharmD',
    approvedAt: '2026-09-06 16:45 UTC',
    dispatchedAt: '2026-09-06 17:30 UTC',
    deliveredAt: '2026-09-06 18:42 UTC'
  }
];

export const INITIAL_REDIS_ENTRIES: RedisCacheEntry[] = [
  {
    key: 'mediflow:catalog:products:all',
    type: 'STRING',
    ttl: 342,
    hits: 1420,
    sizeBytes: 16420,
    lastAccessed: '2 seconds ago',
    valueSnippet: '[{"id":"prod_001","sku":"MED-REM-100"...},{"id":"prod_002"..."}]'
  },
  {
    key: 'mediflow:product:MED-REM-100:stock',
    type: 'STRING',
    ttl: 60,
    hits: 890,
    sizeBytes: 124,
    lastAccessed: '5 seconds ago',
    valueSnippet: '{"stock": 18, "allocated": 4, "available": 14}'
  },
  {
    key: 'mediflow:product:VAX-BNT-030:stock',
    type: 'STRING',
    ttl: 60,
    hits: 1104,
    sizeBytes: 128,
    lastAccessed: '1 second ago',
    valueSnippet: '{"stock": 140, "allocated": 24, "available": 116}'
  },
  {
    key: 'mediflow:category:Emergency & ICU',
    type: 'SET',
    ttl: 900,
    hits: 432,
    sizeBytes: 420,
    lastAccessed: '14 seconds ago',
    valueSnippet: '["prod_001", "prod_003", "prod_006"]'
  },
  {
    key: 'mediflow:rbac:usr_adm_901:perms',
    type: 'SET',
    ttl: 3600,
    hits: 310,
    sizeBytes: 512,
    lastAccessed: '3 seconds ago',
    valueSnippet: '["system:all","inventory:write","orders:approve",...]'
  }
];

export const DOCKER_CONTAINERS: DockerContainer[] = [
  {
    id: 'cnt_fe_01',
    name: 'mediflow-web',
    image: 'mediflow-web:latest (Next.js 14 App Router)',
    service: 'Frontend (Next.js)',
    status: 'UP',
    health: 'healthy',
    ports: '0.0.0.0:3000->3000/tcp',
    cpuUsage: '0.8%',
    memUsage: '142 MB / 1024 MB',
    uptime: 'Up 18 hours (healthy)',
    logs: [
      '[Next.js] Ready on http://0.0.0.0:3000',
      '[Next.js] Compiled /api/health in 48ms',
      '[Vite/Next] Serving production bundle, HMR disabled'
    ]
  },
  {
    id: 'cnt_go_02',
    name: 'mediflow-api-gateway',
    image: 'mediflow-api:v1.4.2 (Golang 1.22 Alpine)',
    service: 'Golang API Server',
    status: 'UP',
    health: 'healthy',
    ports: '0.0.0.0:8080->8080/tcp',
    cpuUsage: '1.4%',
    memUsage: '38 MB / 512 MB',
    uptime: 'Up 18 hours (healthy)',
    logs: [
      '[GIN-debug] [WARNING] Running in "release" mode',
      '[GIN] Listening and serving HTTP on :8080',
      '[DB-Pool] PostgreSQL pool initialized: 25 max connections',
      '[Redis] Connected to redis:6379 (TLS disabled, cluster standalone)',
      '[ConcurrencyEngine] Distributed mutex pool ready for SKU locks'
    ]
  },
  {
    id: 'cnt_pg_03',
    name: 'mediflow-postgres',
    image: 'postgres:16.2-alpine',
    service: 'PostgreSQL 16',
    status: 'UP',
    health: 'healthy',
    ports: '127.0.0.1:5432->5432/tcp',
    cpuUsage: '2.1%',
    memUsage: '210 MB / 2048 MB',
    uptime: 'Up 18 hours (healthy)',
    logs: [
      'PostgreSQL Database directory appears to contain a database; Skipping initialization',
      'server started at 2026-09-06 14:00:00 UTC',
      'database system is ready to accept connections',
      'autovacuum launcher started'
    ]
  },
  {
    id: 'cnt_rd_04',
    name: 'mediflow-redis',
    image: 'redis:7.2.4-alpine',
    service: 'Redis 7.2 Cache',
    status: 'UP',
    health: 'healthy',
    ports: '127.0.0.1:6379->6379/tcp',
    cpuUsage: '0.4%',
    memUsage: '28 MB / 512 MB',
    uptime: 'Up 18 hours (healthy)',
    logs: [
      '* Running mode=standalone, port=6379.',
      '# Server initialized',
      '* Ready to accept connections tcp',
      '* DB 0: 48 keys (0 volatile) in 64 slots. 84.7% cache hit ratio'
    ]
  },
  {
    id: 'cnt_io_05',
    name: 'mediflow-minio',
    image: 'minio/minio:RELEASE.2024-05-10',
    service: 'MinIO Object Storage',
    status: 'UP',
    health: 'healthy',
    ports: '127.0.0.1:9000->9000/tcp',
    cpuUsage: '0.2%',
    memUsage: '85 MB / 1024 MB',
    uptime: 'Up 18 hours (healthy)',
    logs: [
      'MinIO Object Storage Server initialized',
      'Bucket "mediflow-prescriptions" verified',
      'Bucket "coldchain-sensor-telemetry" verified'
    ]
  }
];

export const API_ENDPOINTS: ApiEndpointSpec[] = [
  {
    id: 'ep_1',
    method: 'GET',
    path: '/api/v1/products',
    summary: 'List medical catalog products with Redis caching & stock metrics',
    requiredRole: 'ANY',
    headers: {
      'Authorization': 'Bearer <JWT_TOKEN>',
      'X-Cache-Control': 'max-age=60'
    },
    sampleResponseBody: {
      success: true,
      cached: true,
      cacheSource: 'Redis (3.2ms response)',
      totalCount: 8,
      data: [
        {
          sku: 'MED-REM-100',
          name: 'Remdesivir Lyophilized Powder',
          stockQuantity: 18,
          availableStock: 14,
          unitPrice: 520.00,
          isColdChain: false
        }
      ]
    },
    statusCode: 200
  },
  {
    id: 'ep_2',
    method: 'POST',
    path: '/api/v1/orders/checkout',
    summary: 'Atomic order placement with Golang Mutex & Redis overselling lock',
    requiredRole: 'PROCUREMENT',
    headers: {
      'Authorization': 'Bearer <JWT_TOKEN>',
      'Content-Type': 'application/json',
      'X-Idempotency-Key': 'idem-88912-390'
    },
    sampleRequestBody: {
      ward: 'ICU Critical Trauma Unit',
      priority: 'CRITICAL',
      items: [
        { sku: 'MED-REM-100', quantity: 2 },
        { sku: 'VAX-BNT-030', quantity: 5 }
      ]
    },
    sampleResponseBody: {
      success: true,
      orderNumber: 'MF-ORD-2026-9904',
      status: 'PENDING_APPROVAL',
      reservedStock: true,
      lockMechanism: 'Golang sync.Mutex + Redis SETNX lock (50ms)',
      message: 'Stock decremented atomically. Zero overselling guarantee held.'
    },
    statusCode: 201
  },
  {
    id: 'ep_3',
    method: 'PATCH',
    path: '/api/v1/inventory/{sku}/adjust',
    summary: 'Adjust batch stock levels with automatic Redis cache invalidation',
    requiredRole: 'INVENTORY_MANAGER',
    headers: {
      'Authorization': 'Bearer <JWT_TOKEN>',
      'Content-Type': 'application/json'
    },
    sampleRequestBody: {
      batchNumber: 'BCH-REM-2026A',
      deltaQuantity: 10,
      reason: 'Physical cycle count replenishment from Central Depot'
    },
    sampleResponseBody: {
      success: true,
      sku: 'MED-REM-100',
      newQuantity: 28,
      redisInvalidated: true,
      keysEvicted: [
        'mediflow:catalog:products:all',
        'mediflow:product:MED-REM-100:stock'
      ]
    },
    statusCode: 200
  },
  {
    id: 'ep_4',
    method: 'GET',
    path: '/api/v1/deliveries/{orderId}/telemetry',
    summary: 'IoT Cold-Chain real-time thermal readings & GPS checkpoint telemetry',
    requiredRole: 'LOGISTICS',
    headers: {
      'Authorization': 'Bearer <JWT_TOKEN>'
    },
    sampleResponseBody: {
      trackingNumber: 'TRK-MED-883910-CL',
      vehicleId: 'EV-SPRINTER-VAN-4B',
      currentTempCelsius: 3.8,
      targetRange: '2.0°C - 8.0°C',
      tempExcursionDetected: false,
      etaMinutes: 18,
      lastReadingAt: '2026-09-07 08:44:12 UTC'
    },
    statusCode: 200
  },
  {
    id: 'ep_5',
    method: 'GET',
    path: '/api/v1/auth/me',
    summary: 'Verify current JWT token, RBAC tier permissions, and session expiry',
    requiredRole: 'ANY',
    headers: {
      'Authorization': 'Bearer <JWT_TOKEN>'
    },
    sampleResponseBody: {
      userId: 'usr_adm_901',
      role: 'ADMIN',
      tierLevel: 1,
      hospitalTenant: 'MediFlow Health Systems',
      tokenExpiryUtc: '2026-09-07 20:48:00Z',
      permissions: ['system:all', 'inventory:write', 'orders:approve']
    },
    statusCode: 200
  }
];
