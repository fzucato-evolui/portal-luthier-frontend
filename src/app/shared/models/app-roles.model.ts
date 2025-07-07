export enum AppRoles {
    // Hierarchical Roles (level 1 is the most powerful)
    ROLE_HYPER = 'ROLE_HYPER',      // Hyper Admin (maior poder)
    ROLE_SUPER = 'ROLE_SUPER',      // Supervisor
    ROLE_ADMIN = 'ROLE_ADMIN',      // Administrador básico
    ROLE_SYSTEM = 'ROLE_SYSTEM',    // Role reservada para o sistema (nível 0)

    // Functional Roles
    CREATE_STORAGES = 'CREATE_STORAGES',
    VIEW_DASHBOARD = 'VIEW_DASHBOARD'
}

// Helper para obter o nível hierárquico de uma role
export function getRoleHierarchyLevel(role: AppRoles): number | null {
    switch (role) {
        case AppRoles.ROLE_SYSTEM:
            return 0;
        case AppRoles.ROLE_HYPER:
            return 1;
        case AppRoles.ROLE_SUPER:
            return 2;
        case AppRoles.ROLE_ADMIN:
            return 3;
        default:
            return null; // Roles funcionais retornam null
    }
}

// Helper para verificar se uma role é hierárquica
export function isHierarchicalRole(role: AppRoles): boolean {
    return getRoleHierarchyLevel(role) !== null;
}

// Helper para verificar se uma role é funcional
export function isFunctionalRole(role: AppRoles): boolean {
    return getRoleHierarchyLevel(role) === null;
}

// Helper para verificar se uma role tem hierarquia maior que outra
export function hasHigherHierarchyThan(role1: AppRoles, role2: AppRoles): boolean {
    const level1 = getRoleHierarchyLevel(role1);
    const level2 = getRoleHierarchyLevel(role2);

    if (level1 === null || level2 === null) {
        return false;
    }

    return level1 < level2; // Menor número = maior hierarquia
}
