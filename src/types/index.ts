export type UserRole = 'ADMIN' | 'INVENTORY_MANAGER' | 'PROCUREMENT' | 'LOGISTICS';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  tierLevel: 1 | 2 | 3 | 4;
  permissions: string[];
  avatar: string;
}

export interface Batch {
  batchNumber: string;
  quantity: number;
  expiryDate: string; // YYYY-MM-DD
  mfgDate: string;
  storageTemp: string; // e.g. "2°C to 8°C"
  status: 'OPTIMAL' | 'NEAR_EXPIRY' | 'EXPIRED';
}

export type ProductCategory = 
  | 'Pharmaceuticals'
  | 'Emergency & ICU'
  | 'Vaccines & Biologics'
  | 'Surgical Equipment'
  | 'Diagnostics & Reagents'
  | 'PPE & Consumables';

export interface Product {
  id: string;
  sku: string;
  name: string;
  genericName: string;
  ndc: string; // National Drug Code format e.g. 50458-578-01
  category: ProductCategory;
  dosageForm: string;
  unitPrice: number;
  stockQuantity: number;
  allocatedReserved: number;
  reorderLevel: number;
  criticalThreshold: number;
  isColdChain: boolean;
  targetTempRange?: string;
  locationRack: string;
  manufacturer: string;
  description: string;
  batches: Batch[];
  cachedInRedis: boolean;
  lastCachedAt?: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  allocatedBatch?: string;
}

export type OrderStatus = 
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ALLOCATED_PICKED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'REJECTED';

export type OrderPriority = 'CRITICAL' | 'HIGH' | 'NORMAL';

export interface TrackingCheckpoint {
  id: string;
  status: string;
  timestamp: string;
  location: string;
  completed: boolean;
  temperatureReading?: number;
}

export interface DeliveryTracking {
  courierName: string;
  trackingNumber: string;
  vehicleId: string;
  driverName: string;
  driverPhone: string;
  currentTempCelsius: number;
  targetTempMin: number;
  targetTempMax: number;
  etaMinutes: number;
  destinationHospital: string;
  destinationWard: string;
  checkpoints: TrackingCheckpoint[];
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  requisitionBy: string;
  department: string;
  priority: OrderPriority;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  deliveryTracking?: DeliveryTracking;
  approvedBy?: string;
  approvedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
}

export interface RedisCacheEntry {
  key: string;
  type: 'STRING' | 'HASH' | 'SET';
  ttl: number; // seconds
  hits: number;
  sizeBytes: number;
  lastAccessed: string;
  valueSnippet: string;
}

export interface ConcurrencyAuditLog {
  requestId: string;
  ward: string;
  unitsRequested: number;
  status: 'SUCCESS' | 'REJECTED_OUT_OF_STOCK' | 'OVERSOLD_ERROR';
  latencyMs: number;
  remainingStockAfter: number;
  timestamp: string;
  isolationNote: string;
}

export interface ConcurrencySimulationResult {
  strategy: 'MEDIFLOW_ATOMIC_LOCK' | 'NAIVE_RACE_CONDITION';
  initialStock: number;
  concurrentRequestsCount: number;
  successfulOrdersCount: number;
  rejectedOrdersCount: number;
  unitsFitted: number;
  oversoldUnits: number;
  finalStockReported: number;
  executionDurationMs: number;
  logs: ConcurrencyAuditLog[];
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  service: 'Frontend (Next.js)' | 'Golang API Server' | 'PostgreSQL 16' | 'Redis 7.2 Cache' | 'MinIO Object Storage';
  status: 'UP' | 'RESTARTING' | 'EXITED';
  health: 'healthy' | 'starting' | 'unhealthy';
  ports: string;
  cpuUsage: string;
  memUsage: string;
  uptime: string;
  logs: string[];
}

export interface ApiEndpointSpec {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  requiredRole: UserRole | 'ANY';
  headers: Record<string, string>;
  sampleRequestBody?: object;
  sampleResponseBody: object;
  statusCode: number;
}
