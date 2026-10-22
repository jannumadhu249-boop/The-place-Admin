import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, 
  FolderTree, 
  Layers, 
  Utensils, 
  ShoppingBag, 
  Store, 
  UtensilsCrossed, 
  MapPin, 
  Bike, 
  Ticket, 
  Image as ImageIcon, 
  Bell, 
  Landmark, 
  BarChart3, 
  Users, 
  UserCheck,
  Building2, 
  HelpCircle, 
  Info, 
  PhoneCall, 
  FileText 
} from 'lucide-react';
import { URLS } from '../url';

// ----------------------------------------------------------------------
// Master definition of all Sidebar components & their supported actions
// ----------------------------------------------------------------------
export const RBAC_MODULES = [
  // Overview
  {
    id: 'dashboard',
    label: 'Dashboard',
    category: 'Overview',
    icon: LayoutDashboard,
    description: 'Analytics, revenue KPIs, order statistics & summary charts',
    actions: [
      { id: 'view', label: 'View Analytics' }
    ]
  },

  // My Categories
  {
    id: 'categories',
    label: 'Categories',
    category: 'My Categories',
    icon: FolderTree,
    description: 'Primary product and food catalog classifications',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Create' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'sub-categories',
    aliases: ['subcategories'],
    label: 'Sub Categories',
    category: 'My Categories',
    icon: Layers,
    description: 'Sub-level food and grocery categories under parent category',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Create' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'cuisines',
    label: 'Cuisines',
    category: 'My Categories',
    icon: Utensils,
    description: 'Regional and specialized culinary cuisine tags',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Create' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },

  // Operations
  {
    id: 'orders',
    label: 'Orders',
    category: 'Operations',
    icon: ShoppingBag,
    description: 'Active, completed, pending and cancelled customer food orders',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Create / Place' },
      { id: 'edit', label: 'Process / Update' },
      { id: 'delete', label: 'Cancel / Delete' }
    ]
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    category: 'Operations',
    icon: Store,
    description: 'Merchant partners, outlet profiles, menus and hours',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Onboard / Add' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'food',
    label: 'Food Management',
    category: 'Operations',
    icon: UtensilsCrossed,
    description: 'Dishes, item pricing, dietary tags and availability',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Add Item' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'zone',
    label: 'Zone Setup',
    category: 'Operations',
    icon: MapPin,
    description: 'Delivery geofencing polygons, operational boundaries and surge zones',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Create' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'delivery',
    label: 'Delivery Management',
    category: 'Operations',
    icon: Bike,
    description: 'Delivery partners, dispatch runs and rider assignment',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Add Partner' },
      { id: 'edit', label: 'Edit / Assign' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'users',
    aliases: ['customers'],
    label: 'Customers',
    category: 'Operations',
    icon: UserCheck,
    description: 'Registered customer directory, profiles, phone, addresses and account status',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'edit', label: 'Block / Unblock' }
    ]
  },

  // Marketing & Engagement
  {
    id: 'coupons',
    label: 'Coupons',
    category: 'Marketing & Engagement',
    icon: Ticket,
    description: 'Promo codes, seasonal discounts and redemption limits',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Create' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'banners',
    label: 'Banners',
    category: 'Marketing & Engagement',
    icon: ImageIcon,
    description: 'Mobile & web promotional carousel hero banners',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Upload' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'notifications',
    label: 'Push Notifications',
    category: 'Marketing & Engagement',
    icon: Bell,
    description: 'Customer and delivery broadcast announcements',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Send Broadcast' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },

  // Finance & Team
  {
    id: 'disbursement',
    label: 'Disbursements',
    category: 'Finance & Team',
    icon: Landmark,
    description: 'Restaurant and courier payout settlements and invoices',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Generate Payout' },
      { id: 'edit', label: 'Approve / Process' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'reports',
    label: 'Report Management',
    category: 'Finance & Team',
    icon: BarChart3,
    description: 'Financial transactions, commission reports & data export',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Export Data' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'employee',
    aliases: ['roles', 'staff'],
    label: 'Employee Management',
    category: 'Finance & Team',
    icon: Users,
    description: 'Staff directory, admin credentials & role access control',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Add Employee' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'departments',
    label: 'Departments',
    category: 'Finance & Team',
    icon: Building2,
    description: 'Organizational staff divisions and teams',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Create' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },

  // Pages & Support
  {
    id: 'faqs',
    label: 'Help & FAQs',
    category: 'Pages & Support',
    icon: HelpCircle,
    description: 'Customer and restaurant FAQ knowledge base items',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'create', label: 'Create' },
      { id: 'edit', label: 'Edit' },
      { id: 'delete', label: 'Delete' }
    ]
  },
  {
    id: 'about-us',
    label: 'About Us',
    category: 'Pages & Support',
    icon: Info,
    description: 'Platform mission, history, and brand story content',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'edit', label: 'Edit Content' }
    ]
  },
  {
    id: 'contact-us',
    label: 'Contact Us',
    category: 'Pages & Support',
    icon: PhoneCall,
    description: 'Customer support hotline numbers, office addresses and inquiries',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'edit', label: 'Edit Content' }
    ]
  },
  {
    id: 'policies',
    label: 'Legal & Policies',
    category: 'Pages & Support',
    icon: FileText,
    description: 'Terms of Service, Privacy Policy, and Refund guidelines',
    actions: [
      { id: 'view', label: 'View' },
      { id: 'edit', label: 'Edit Policies' }
    ]
  }
];

// Flat list of all permission identifiers for easy lookup
export const ALL_PERMISSION_KEYS = RBAC_MODULES.flatMap(m => 
  m.actions.map(a => `${m.id}:${a.id}`)
);

// Backward-compatibility alias map for older flat permissions
const LEGACY_PERMISSION_MAP = {
  'dashboard:view': ['dashboard:view', 'dashboard'],
  'reports:view': ['reports:view', 'reports:create', 'reports'],
  'orders:view': ['orders:view', 'orders'],
  'orders:manage': ['orders:view', 'orders:create', 'orders:edit', 'orders:delete', 'orders'],
  'delivery:tracking': ['delivery:view', 'delivery:edit', 'delivery'],
  'categories:manage': ['categories:view', 'categories:create', 'categories:edit', 'categories:delete', 'categories', 'sub-categories:view', 'sub-categories', 'cuisines:view', 'cuisines'],
  'subcategories:manage': ['sub-categories:view', 'sub-categories:create', 'sub-categories:edit', 'sub-categories:delete', 'sub-categories', 'subcategories'],
  'food:manage': ['food:view', 'food:create', 'food:edit', 'food:delete', 'food'],
  'restaurants:view': ['restaurants:view', 'restaurants'],
  'restaurants:manage': ['restaurants:view', 'restaurants:create', 'restaurants:edit', 'restaurants:delete', 'restaurants'],
  'restaurants:commission': ['restaurants:view', 'restaurants:edit', 'restaurants'],
  'coupons:manage': ['coupons:view', 'coupons:create', 'coupons:edit', 'coupons:delete', 'coupons'],
  'banners:manage': ['banners:view', 'banners:create', 'banners:edit', 'banners:delete', 'banners'],
  'notifications:send': ['notifications:view', 'notifications:create', 'notifications'],
  'zone:setup': ['zone:view', 'zone:create', 'zone:edit', 'zone:delete', 'zone'],
  'disbursement:view': ['disbursement:view', 'disbursement'],
  'disbursement:manage': ['disbursement:view', 'disbursement:create', 'disbursement:edit', 'disbursement:delete', 'disbursement'],
  'employee:view': ['employee:view', 'employee'],
  'employee:manage': ['employee:view', 'employee:create', 'employee:edit', 'employee:delete', 'employee'],
  'roles:manage': ['employee:view', 'employee:create', 'employee:edit', 'employee:delete', 'employee', 'roles'],
  'departments:manage': ['departments:view', 'departments:create', 'departments:edit', 'departments:delete', 'departments'],
  'faqs:manage': ['faqs:view', 'faqs:create', 'faqs:edit', 'faqs:delete', 'faqs'],
  'content:manage': ['about-us:view', 'about-us:edit', 'about-us', 'contact-us:view', 'contact-us:edit', 'contact-us', 'policies:view', 'policies:edit', 'policies']
};

export const normalizePermissions = (rawPermissions = []) => {
  if (!Array.isArray(rawPermissions)) return [];
  const set = new Set();
  for (const p of rawPermissions) {
    if (!p) continue;
    if (LEGACY_PERMISSION_MAP[p]) {
      LEGACY_PERMISSION_MAP[p].forEach(mapped => set.add(mapped));
    } else {
      set.add(p);
    }
  }
  return Array.from(set);
};

// ----------------------------------------------------------------------
// React Context
// ----------------------------------------------------------------------
const PermissionContext = createContext(null);

export const PermissionProvider = ({ user, children }) => {
  // Initialize permissions immediately from prop or localStorage
  const [resolvedPermissions, setResolvedPermissions] = useState(() => {
    if (user?.rolesAndPermission && Array.isArray(user.rolesAndPermission) && user.rolesAndPermission.length > 0) {
      return normalizePermissions(user.rolesAndPermission);
    }
    try {
      const stored = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed?.rolesAndPermission) && parsed.rolesAndPermission.length > 0) {
          return normalizePermissions(parsed.rolesAndPermission);
        }
      }
    } catch (_) {}
    return [];
  });
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Check if current user is Super Admin
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    if (user.email === 'gopi@gmail.com') return true;
    const roleStr = String(user.role || user.roleName || '').toLowerCase().trim();
    if (roleStr === 'super admin' || roleStr === 'superadmin') {
      return true;
    }
    if (Array.isArray(user.rolesAndPermission) && user.rolesAndPermission.includes('*')) {
      return true;
    }
    return false;
  }, [user]);

  // Resolve user permissions using staff & role API waterfall
  useEffect(() => {
    let isMounted = true;

    if (isSuperAdmin) {
      setResolvedPermissions(ALL_PERMISSION_KEYS);
      return;
    }

    if (!user) {
      setResolvedPermissions([]);
      return;
    }

    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    if (!token) {
      setResolvedPermissions([]);
      return;
    }

    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    const applyPerms = (permsArray) => {
      if (!isMounted) return;
      const normalized = normalizePermissions(permsArray);
      setResolvedPermissions(normalized);
      // Persist to storage
      try {
        const storage = localStorage.getItem('admin_token') ? localStorage : sessionStorage;
        const prev = JSON.parse(storage.getItem('admin_user') || '{}');
        prev.rolesAndPermission = permsArray;
        storage.setItem('admin_user', JSON.stringify(prev));
      } catch (_) {}
      return true;
    };

    const resolvePermissions = async () => {
      setLoadingPermissions(true);
      try {
        // STRATEGY 1: Already present on user object
        const directPerms = user?.rolesAndPermission || user?.permissions;
        if (Array.isArray(directPerms) && directPerms.length > 0) {
          applyPerms(directPerms);
          return;
        }

        // STRATEGY 2: Fetch staff details by ID to get their roleId and roleName
        const staffId = user?._id || user?.id;
        let roleId = user?.roleId || user?.role_id;
        let roleName = user?.roleName || user?.role;

        if (staffId) {
          try {
            const staffRes = await fetch(URLS.GetByIdEmpolyee, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                authorization: authHeader
              },
              body: JSON.stringify({ staffId, id: staffId })
            });
            if (staffRes.ok) {
              const staffData = await staffRes.json();
              const staff = staffData?.staff || staffData?.data;
              if (staff) {
                if (staff.roleId) roleId = staff.roleId;
                if (staff.roleName) roleName = staff.roleName;

                // Sync roleName to storage
                try {
                  const storage = localStorage.getItem('admin_token') ? localStorage : sessionStorage;
                  const prev = JSON.parse(storage.getItem('admin_user') || '{}');
                  prev.role = staff.roleName || prev.role;
                  prev.roleName = staff.roleName || prev.roleName;
                  prev.roleId = staff.roleId || prev.roleId;
                  storage.setItem('admin_user', JSON.stringify(prev));
                  window.dispatchEvent(new CustomEvent('profile-updated', { detail: prev }));
                } catch (_) {}
              }
            }
          } catch (_) {}
        }

        // STRATEGY 3: Fetch role details by roleId
        if (roleId) {
          try {
            const byIdRes = await fetch(URLS.GetByIdRole, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                authorization: authHeader
              },
              body: JSON.stringify({ roleId, id: roleId })
            });
            if (byIdRes.ok) {
              const byIdData = await byIdRes.json();
              const roleDoc = byIdData?.role || byIdData?.data || byIdData;
              const rolePerms = roleDoc?.rolesAndPermission || roleDoc?.permissions || [];
              applyPerms(rolePerms);
              return;
            }
          } catch (_) {}
        }

        // STRATEGY 4: If no permissions found or assigned, set to empty
        if (isMounted) {
          setResolvedPermissions([]);
        }

      } finally {
        if (isMounted) setLoadingPermissions(false);
      }
    };

    resolvePermissions();

    return () => {
      isMounted = false;
    };
  }, [user, isSuperAdmin]);

  // Check if user has permission for a specific module and action
  const can = useCallback((moduleName, action = 'view') => {
    if (isSuperAdmin) return true;
    if (!moduleName) return false;

    // Check direct key e.g. "categories:view"
    const directKey = `${moduleName}:${action}`;
    if (resolvedPermissions.includes(directKey)) return true;

    // Check alias e.g. "subcategories" -> "sub-categories", "roles" -> "employee"
    const matchedModule = RBAC_MODULES.find(m => 
      m.id === moduleName || (m.aliases && m.aliases.includes(moduleName))
    );
    if (matchedModule) {
      if (resolvedPermissions.includes(`${matchedModule.id}:${action}`)) return true;
      if (matchedModule.aliases) {
        for (const alias of matchedModule.aliases) {
          if (resolvedPermissions.includes(`${alias}:${action}`)) return true;
        }
      }
      if (resolvedPermissions.includes(`${matchedModule.id}:*`)) return true;
    }

    // Full access wildcard for that module e.g. "categories:*" or "*"
    if (resolvedPermissions.includes(`${moduleName}:*`) || resolvedPermissions.includes('*')) {
      return true;
    }

    return false;
  }, [isSuperAdmin, resolvedPermissions]);

  const canView = useCallback((moduleName) => can(moduleName, 'view'), [can]);
  const canCreate = useCallback((moduleName) => can(moduleName, 'create'), [can]);
  const canEdit = useCallback((moduleName) => can(moduleName, 'edit'), [can]);
  const canDelete = useCallback((moduleName) => can(moduleName, 'delete'), [can]);

  // Find the first route the user is permitted to view
  const firstAccessibleRoute = useMemo(() => {
    if (isSuperAdmin) return '/dashboard';
    for (const mod of RBAC_MODULES) {
      if (can(mod.id, 'view')) {
        return `/${mod.id}`;
      }
    }
    return '/profile';
  }, [isSuperAdmin, can]);

  const contextValue = useMemo(() => ({
    user,
    isSuperAdmin,
    permissions: resolvedPermissions,
    loadingPermissions,
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
    firstAccessibleRoute,
    modules: RBAC_MODULES
  }), [
    user, 
    isSuperAdmin, 
    resolvedPermissions, 
    loadingPermissions, 
    can, 
    canView, 
    canCreate, 
    canEdit, 
    canDelete, 
    firstAccessibleRoute
  ]);

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    // Return fallback for components rendered outside provider
    return {
      isSuperAdmin: true,
      permissions: ALL_PERMISSION_KEYS,
      loadingPermissions: false,
      can: () => true,
      canView: () => true,
      canCreate: () => true,
      canEdit: () => true,
      canDelete: () => true,
      firstAccessibleRoute: '/dashboard',
      modules: RBAC_MODULES
    };
  }
  return context;
};
