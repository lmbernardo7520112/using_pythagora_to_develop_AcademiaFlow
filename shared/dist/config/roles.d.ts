//shared/dist/config/roles.d.ts
declare const ROLES: {
    readonly ADMIN: "admin";
    readonly USER: "user";
    readonly PROFESSOR: "professor";
    readonly SECRETARIA: "secretaria";
    readonly ADMINISTRADOR: "administrador";
};
type RoleValues = typeof ROLES[keyof typeof ROLES];
declare const ALL_ROLES: RoleValues[];
export { ROLES, ALL_ROLES, type RoleValues };
//# sourceMappingURL=roles.d.ts.map