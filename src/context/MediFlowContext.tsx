import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  UserProfile, 
  UserRole, 
  Product, 
  Order, 
  OrderItem, 
  OrderStatus, 
  OrderPriority, 
  RedisCacheEntry,
  ConcurrencySimulationResult,
  ConcurrencyAuditLog
} from '../types';
import { 
  USER_PROFILES, 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_REDIS_ENTRIES 
} from '../data/mockData';

interface ToastNotification {
  id: string;
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface RedisTelemetry {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRatePercent: number;
  avgRedisLatencyMs: number;
  avgPostgresLatencyMs: number;
  evictedKeysCount: number;
  lastEvictedKey?: string;
  entries: RedisCacheEntry[];
}

interface MediFlowContextType {
  currentUser: UserProfile;
  userProfiles: Record<string, UserProfile>;
  switchRole: (role: UserRole) => void;
  jwtToken: string;
  decodedJwt: {
    header: object;
    payload: object;
    signature: string;
  };
  hasPermission: (permission: string) => boolean;

  // Products & Inventory
  products: Product[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  adjustStock: (productId: string, batchNumber: string, delta: number, reason: string) => boolean;
  addNewBatch: (productId: string, batchNumber: string, quantity: number, expiryDate: string, mfgDate: string) => void;
  addNewProduct: (product: Omit<Product, 'id' | 'allocatedReserved' | 'cachedInRedis'>) => void;

  // Requisitions & Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  submitRequisition: (priority: OrderPriority, notes: string, ward: string) => Order | null;

  // Orders Lifecycle
  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => boolean;
  selectedOrderForTracking: Order | null;
  setSelectedOrderForTracking: (order: Order | null) => void;

  // Redis Telemetry
  redisTelemetry: RedisTelemetry;
  simulateRedisQuery: (key: string) => { cached: boolean; latencyMs: number };
  flushRedisCache: () => void;

  // Concurrency Engine
  runConcurrencyStressTest: (
    productId: string, 
    requestedUnitsPerWard: number, 
    concurrentWardsCount: number, 
    strategy: 'MEDIFLOW_ATOMIC_LOCK' | 'NAIVE_RACE_CONDITION'
  ) => ConcurrencySimulationResult;
  lastSimulationResult: ConcurrencySimulationResult | null;

  // Toasts
  toasts: ToastNotification[];
  addToast: (type: ToastNotification['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Modals state
  isJwtModalOpen: boolean;
  setIsJwtModalOpen: (open: boolean) => void;
  isDockerModalOpen: boolean;
  setIsDockerModalOpen: (open: boolean) => void;
}

const MediFlowContext = createContext<MediFlowContextType | undefined>(undefined);

export const MediFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const currentUser = USER_PROFILES[currentRole];

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [isJwtModalOpen, setIsJwtModalOpen] = useState<boolean>(false);
  const [isDockerModalOpen, setIsDockerModalOpen] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastNotification[]>([
    {
      id: 't_init',
      type: 'INFO',
      title: 'MediFlow Cluster Initialized',
      message: 'Redis 7.2 Cache & Golang Microservice connected with 84.7% hit rate',
      timestamp: 'Just now'
    }
  ]);

  const [redisEntries, setRedisEntries] = useState<RedisCacheEntry[]>(INITIAL_REDIS_ENTRIES);
  const [queryStats, setQueryStats] = useState({
    totalQueries: 14280,
    cacheHits: 12095,
    cacheMisses: 2185,
    evictedKeysCount: 14
  });

  const [lastSimulationResult, setLastSimulationResult] = useState<ConcurrencySimulationResult | null>(null);

  const addToast = (type: ToastNotification['type'], title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [
      { id, type, title, message, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 4)
    ]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const hasPermission = (permission: string): boolean => {
    if (currentUser.permissions.includes('system:all')) return true;
    return currentUser.permissions.includes(permission);
  };

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    const profile = USER_PROFILES[newRole];
    addToast(
      'INFO', 
      `Switched to ${profile.roleTitle}`, 
      `RBAC Tier ${profile.tierLevel} loaded: ${profile.permissions.length} granular scopes active`
    );
  };

  // Generate simulated JWT
  const { jwtToken, decodedJwt } = useMemo(() => {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
      kid: 'mediflow-auth-key-2026'
    };
    const payload = {
      sub: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      tier: currentUser.tierLevel,
      department: currentUser.department,
      permissions: currentUser.permissions,
      iss: 'mediflow-golang-auth',
      aud: 'mediflow-platform',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 * 8
    };
    const headerBase64 = btoa(JSON.stringify(header));
    const payloadBase64 = btoa(JSON.stringify(payload));
    const signature = 'c9a81f84b15ce8905b22a00bf8a77df3c965c7ae09bb219';
    const token = `${headerBase64}.${payloadBase64}.${signature}`;

    return {
      jwtToken: token,
      decodedJwt: { header, payload, signature }
    };
  }, [currentUser]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  // Stock Adjustment with Redis Cache Invalidation
  const adjustStock = (productId: string, batchNumber: string, delta: number, reason: string): boolean => {
    if (!hasPermission('inventory:adjust') && !hasPermission('inventory:write')) {
      addToast(
        'ERROR', 
        '403 Forbidden - RBAC Restriction', 
        `Role "${currentUser.roleTitle}" lacks 'inventory:adjust' permission.`
      );
      return false;
    }

    let affectedSku = '';
    let newQty = 0;

    setProducts(prevProducts => prevProducts.map(prod => {
      if (prod.id !== productId) return prod;
      affectedSku = prod.sku;

      const updatedBatches = prod.batches.map(b => {
        if (b.batchNumber === batchNumber) {
          return { ...b, quantity: Math.max(0, b.quantity + delta) };
        }
        return b;
      });

      newQty = Math.max(0, prod.stockQuantity + delta);

      return {
        ...prod,
        stockQuantity: newQty,
        batches: updatedBatches,
        cachedInRedis: false // Invalidate Redis entry
      };
    }));

    // Invalidate Redis cache keys
    const skuKey = `mediflow:product:${affectedSku}:stock`;
    setRedisEntries(prev => prev.filter(e => e.key !== skuKey && e.key !== 'mediflow:catalog:products:all'));
    setQueryStats(prev => ({
      ...prev,
      evictedKeysCount: prev.evictedKeysCount + 2
    }));

    addToast(
      'SUCCESS',
      `Inventory Adjusted (${delta > 0 ? `+${delta}` : delta} units)`,
      `Updated ${affectedSku} [Batch: ${batchNumber}]. Evicted key '${skuKey}' from Redis cache.`
    );

    return true;
  };

  const addNewBatch = (productId: string, batchNumber: string, quantity: number, expiryDate: string, mfgDate: string) => {
    if (!hasPermission('batch:manage') && !hasPermission('inventory:write')) {
      addToast('ERROR', '403 Forbidden', 'Requires batch:manage permission tier.');
      return;
    }

    setProducts(prev => prev.map(prod => {
      if (prod.id !== productId) return prod;
      return {
        ...prod,
        stockQuantity: prod.stockQuantity + quantity,
        batches: [
          ...prod.batches,
          {
            batchNumber,
            quantity,
            expiryDate,
            mfgDate,
            storageTemp: prod.isColdChain ? '2°C to 8°C' : 'Ambient 20°C',
            status: 'OPTIMAL'
          }
        ]
      };
    }));

    addToast('SUCCESS', 'New Batch Registered', `Batch ${batchNumber} (+${quantity} units) added to inventory.`);
  };

  const addNewProduct = (productData: Omit<Product, 'id' | 'allocatedReserved' | 'cachedInRedis'>) => {
    if (!hasPermission('inventory:write')) {
      addToast('ERROR', '403 Forbidden', 'Requires inventory:write permission tier.');
      return;
    }

    const newProd: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      allocatedReserved: 0,
      cachedInRedis: false
    };

    setProducts(prev => [newProd, ...prev]);
    addToast('SUCCESS', 'Product Cataloged', `${newProd.name} (${newProd.sku}) added to MediFlow catalog.`);
  };

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1) => {
    const available = product.stockQuantity - product.allocatedReserved;
    if (available <= 0) {
      addToast('WARNING', 'Stock Depleted', `${product.name} is currently out of stock.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(available, existing.quantity + quantity);
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(available, quantity) }];
    });

    addToast('INFO', 'Item Added to Requisition', `${product.name} added to cart.`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id !== productId) return item;
      const available = item.product.stockQuantity - item.product.allocatedReserved;
      return { ...item, quantity: Math.min(available, quantity) };
    }));
  };

  const clearCart = () => setCart([]);

  // Submit Requisition (Order Placement with Overselling Prevention)
  const submitRequisition = (priority: OrderPriority, notes: string, ward: string): Order | null => {
    if (!hasPermission('orders:create')) {
      addToast('ERROR', '403 Forbidden', 'Current role lacks orders:create permission.');
      return null;
    }

    if (cart.length === 0) {
      addToast('WARNING', 'Empty Cart', 'Please add products before submitting requisition.');
      return null;
    }

    // Check overselling prevention for all items
    for (const item of cart) {
      const liveProd = products.find(p => p.id === item.product.id);
      if (!liveProd) continue;
      const available = liveProd.stockQuantity - liveProd.allocatedReserved;
      if (item.quantity > available) {
        addToast(
          'ERROR', 
          'Overselling Prevented', 
          `Insufficient stock for ${liveProd.name}. Requested: ${item.quantity}, Available: ${available}. Mutex lock aborted transaction.`
        );
        return null;
      }
    }

    // Atomically reserve stock
    setProducts(prev => prev.map(prod => {
      const inCart = cart.find(c => c.product.id === prod.id);
      if (!inCart) return prod;
      return {
        ...prod,
        allocatedReserved: prod.allocatedReserved + inCart.quantity
      };
    }));

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      sku: item.product.sku,
      name: item.product.name,
      unitPrice: item.product.unitPrice,
      quantity: item.quantity,
      allocatedBatch: item.product.batches[0]?.batchNumber || 'BCH-PENDING'
    }));

    const totalAmount = orderItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
    const orderNumber = `MF-ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      requisitionBy: `${currentUser.name} (${currentUser.roleTitle})`,
      department: ward || currentUser.department,
      priority,
      status: 'PENDING_APPROVAL',
      items: orderItems,
      totalAmount,
      notes
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    addToast(
      'SUCCESS',
      `Requisition Created: ${orderNumber}`,
      `Total $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Stock atomically locked in PostgreSQL.`
    );

    return newOrder;
  };

  // Update Order Status (Full Lifecycle)
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus): boolean => {
    // Permission checks per status
    if (newStatus === 'APPROVED' && !hasPermission('orders:approve')) {
      addToast('ERROR', '403 Forbidden', 'Requires orders:approve permission (Pharmacist or Admin).');
      return false;
    }
    if (newStatus === 'ALLOCATED_PICKED' && !hasPermission('orders:allocate')) {
      addToast('ERROR', '403 Forbidden', 'Requires orders:allocate permission.');
      return false;
    }
    if (newStatus === 'DISPATCHED' && !hasPermission('orders:dispatch')) {
      addToast('ERROR', '403 Forbidden', 'Requires orders:dispatch permission (Logistics or Admin).');
      return false;
    }
    if (newStatus === 'DELIVERED' && !hasPermission('orders:mark_delivered')) {
      addToast('ERROR', '403 Forbidden', 'Requires orders:mark_delivered permission.');
      return false;
    }

    setOrders(prev => prev.map(ord => {
      if (ord.id !== orderId) return ord;

      const updated = { ...ord, status: newStatus };

      if (newStatus === 'APPROVED') {
        updated.approvedBy = currentUser.name;
        updated.approvedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      }

      if (newStatus === 'DISPATCHED') {
        updated.dispatchedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        // Assign cold-chain tracking if not present
        if (!updated.deliveryTracking) {
          updated.deliveryTracking = {
            courierName: 'MediFlow Fleet Express #12',
            trackingNumber: `TRK-MED-${Math.floor(100000 + Math.random() * 900000)}-CL`,
            vehicleId: 'VAN-CL-04 (Dual-Temp Refrigerator)',
            driverName: 'Marco Bellini',
            driverPhone: '+1 (555) 302-8821',
            currentTempCelsius: 4.1,
            targetTempMin: 2.0,
            targetTempMax: 8.0,
            etaMinutes: 24,
            destinationHospital: 'Metropolitan General Hospital',
            destinationWard: ord.department,
            checkpoints: [
              {
                id: 'cp_10',
                status: 'Pharmacy Batch Verification & Packaging',
                timestamp: 'Just now',
                location: 'Central Medical Depot Bay 2',
                completed: true,
                temperatureReading: 3.8
              },
              {
                id: 'cp_11',
                status: 'Loaded into Cold-Chain Secure Box',
                timestamp: 'Just now',
                location: 'Dispatch Dock 4',
                completed: true,
                temperatureReading: 4.0
              },
              {
                id: 'cp_12',
                status: 'En Route to Hospital Destination',
                timestamp: 'In transit',
                location: 'Arterial Ring Road Sector 7',
                completed: false,
                temperatureReading: 4.1
              }
            ]
          };
        }
      }

      if (newStatus === 'DELIVERED') {
        updated.deliveredAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        if (updated.deliveryTracking) {
          updated.deliveryTracking.etaMinutes = 0;
          updated.deliveryTracking.checkpoints = updated.deliveryTracking.checkpoints.map(cp => ({
            ...cp,
            completed: true
          }));
        }

        // Deduct actual physical stock upon delivery
        setProducts(currProducts => currProducts.map(p => {
          const item = ord.items.find(i => i.productId === p.id);
          if (!item) return p;
          return {
            ...p,
            stockQuantity: Math.max(0, p.stockQuantity - item.quantity),
            allocatedReserved: Math.max(0, p.allocatedReserved - item.quantity)
          };
        }));
      }

      return updated;
    }));

    addToast('SUCCESS', 'Order Lifecycle Updated', `Order transitioned to ${newStatus.replace('_', ' ')}.`);
    return true;
  };

  // Simulate Redis query
  const simulateRedisQuery = (key: string) => {
    const isHit = Math.random() < 0.847; // 84.7% hit rate
    const latencyMs = isHit ? +(1.8 + Math.random() * 2.5).toFixed(1) : +(38.0 + Math.random() * 24.0).toFixed(1);

    setQueryStats(prev => ({
      ...prev,
      totalQueries: prev.totalQueries + 1,
      cacheHits: isHit ? prev.cacheHits + 1 : prev.cacheHits,
      cacheMisses: !isHit ? prev.cacheMisses + 1 : prev.cacheMisses
    }));

    return { cached: isHit, latencyMs };
  };

  const flushRedisCache = () => {
    if (!hasPermission('redis:flush')) {
      addToast('ERROR', '403 Forbidden', 'Only Admin tier can execute Redis FLUSHDB.');
      return;
    }
    setRedisEntries([]);
    setQueryStats(prev => ({
      ...prev,
      cacheMisses: prev.cacheMisses + 50,
      evictedKeysCount: prev.evictedKeysCount + prev.entries?.length || 5
    }));
    addToast('WARNING', 'Redis Cache Flushed', 'FLUSHDB executed. Next queries will read directly from PostgreSQL.');
  };

  // Concurrency & Overselling Stress Test
  const runConcurrencyStressTest = (
    productId: string,
    requestedUnitsPerWard: number,
    concurrentWardsCount: number,
    strategy: 'MEDIFLOW_ATOMIC_LOCK' | 'NAIVE_RACE_CONDITION'
  ): ConcurrencySimulationResult => {
    const targetProd = products.find(p => p.id === productId) || products[0];
    const initialStock = targetProd.stockQuantity;
    const logs: ConcurrencyAuditLog[] = [];

    const wards = [
      'ICU Trauma Bay 1',
      'Emergency Resuscitation Wing',
      'Cardiac Surgery Suite 3',
      'Pediatric Intensive Care',
      'Neuro-Trauma Unit',
      'Burn & Wound Center',
      'Inpatient Oncology Depo',
      'Rapid Response Team Alpha',
      'Surgical Recovery Pod 2',
      'Cardiology Step-Down'
    ];

    let currentStockTracker = initialStock;
    let successfulCount = 0;
    let rejectedCount = 0;
    let oversoldUnits = 0;

    const startTime = performance.now();

    if (strategy === 'MEDIFLOW_ATOMIC_LOCK') {
      // Golang sync.Mutex + Redis atomic decr (DECRBY) + Postgres SELECT ... FOR UPDATE
      for (let i = 0; i < concurrentWardsCount; i++) {
        const wardName = wards[i % wards.length];
        const reqId = `req_tx_${Math.random().toString(36).substring(2, 8)}`;
        const latencyMs = +(1.2 + Math.random() * 2.8).toFixed(2);

        if (currentStockTracker >= requestedUnitsPerWard) {
          currentStockTracker -= requestedUnitsPerWard;
          successfulCount++;
          logs.push({
            requestId: reqId,
            ward: wardName,
            unitsRequested: requestedUnitsPerWard,
            status: 'SUCCESS',
            latencyMs,
            remainingStockAfter: currentStockTracker,
            timestamp: new Date().toISOString().substring(11, 19),
            isolationNote: 'Redis DECRBY atomic check OK -> Postgres row-lock acquired'
          });
        } else {
          rejectedCount++;
          logs.push({
            requestId: reqId,
            ward: wardName,
            unitsRequested: requestedUnitsPerWard,
            status: 'REJECTED_OUT_OF_STOCK',
            latencyMs,
            remainingStockAfter: currentStockTracker,
            timestamp: new Date().toISOString().substring(11, 19),
            isolationNote: 'Insufficient available stock. Mutex rolled back transaction (409 Conflict)'
          });
        }
      }
    } else {
      // NAIVE RACE CONDITION: All concurrent threads read same stale stock snapshot simultaneously
      const snapshotRead = initialStock;

      for (let i = 0; i < concurrentWardsCount; i++) {
        const wardName = wards[i % wards.length];
        const reqId = `req_race_${Math.random().toString(36).substring(2, 8)}`;
        const latencyMs = +(15.0 + Math.random() * 35.0).toFixed(2);

        // Under race condition, each worker thinks stock is snapshotRead
        if (snapshotRead >= requestedUnitsPerWard) {
          currentStockTracker -= requestedUnitsPerWard;
          successfulCount++;

          const isOversold = currentStockTracker < 0;
          if (isOversold) {
            oversoldUnits += requestedUnitsPerWard;
          }

          logs.push({
            requestId: reqId,
            ward: wardName,
            unitsRequested: requestedUnitsPerWard,
            status: isOversold ? 'OVERSOLD_ERROR' : 'SUCCESS',
            latencyMs,
            remainingStockAfter: currentStockTracker,
            timestamp: new Date().toISOString().substring(11, 19),
            isolationNote: isOversold 
              ? `CRITICAL OVERSOLD! Stock dropped to ${currentStockTracker} due to missing mutex lock.`
              : 'Stale read permitted order without lock.'
          });
        } else {
          rejectedCount++;
          logs.push({
            requestId: reqId,
            ward: wardName,
            unitsRequested: requestedUnitsPerWard,
            status: 'REJECTED_OUT_OF_STOCK',
            latencyMs,
            remainingStockAfter: currentStockTracker,
            timestamp: new Date().toISOString().substring(11, 19),
            isolationNote: 'Out of stock'
          });
        }
      }
    }

    const duration = +(performance.now() - startTime).toFixed(2);

    const result: ConcurrencySimulationResult = {
      strategy,
      initialStock,
      concurrentRequestsCount: concurrentWardsCount,
      successfulOrdersCount: successfulCount,
      rejectedOrdersCount: rejectedCount,
      unitsFitted: initialStock - Math.max(0, currentStockTracker),
      oversoldUnits: Math.abs(Math.min(0, currentStockTracker)),
      finalStockReported: currentStockTracker,
      executionDurationMs: duration,
      logs
    };

    setLastSimulationResult(result);
    return result;
  };

  const redisTelemetry: RedisTelemetry = {
    totalQueries: queryStats.totalQueries,
    cacheHits: queryStats.cacheHits,
    cacheMisses: queryStats.cacheMisses,
    hitRatePercent: +(queryStats.cacheHits / (queryStats.totalQueries || 1) * 100).toFixed(1),
    avgRedisLatencyMs: 3.2,
    avgPostgresLatencyMs: 51.4,
    evictedKeysCount: queryStats.evictedKeysCount,
    entries: redisEntries
  };

  return (
    <MediFlowContext.Provider value={{
      currentUser,
      userProfiles: USER_PROFILES,
      switchRole,
      jwtToken,
      decodedJwt,
      hasPermission,
      products,
      categories,
      selectedCategory,
      setSelectedCategory,
      searchQuery,
      setSearchQuery,
      adjustStock,
      addNewBatch,
      addNewProduct,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      submitRequisition,
      orders,
      updateOrderStatus,
      selectedOrderForTracking,
      setSelectedOrderForTracking,
      redisTelemetry,
      simulateRedisQuery,
      flushRedisCache,
      runConcurrencyStressTest,
      lastSimulationResult,
      toasts,
      addToast,
      removeToast,
      isJwtModalOpen,
      setIsJwtModalOpen,
      isDockerModalOpen,
      setIsDockerModalOpen
    }}>
      {children}
    </MediFlowContext.Provider>
  );
};

export const useMediFlow = () => {
  const context = useContext(MediFlowContext);
  if (!context) {
    throw new Error('useMediFlow must be used within a MediFlowProvider');
  }
  return context;
};
