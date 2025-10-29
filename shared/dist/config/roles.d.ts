declare const ROLES: {
    readonly ADMIN: "admin";
    readonly USER: "user";
    readonly PROFESSOR: "professor";
    readonly SECRETARIA: "secretaria";
    readonly COORDENACAO: "coordenacao";
};
type RoleValues = typeof ROLES[keyof typeof ROLES];
declare const ALL_ROLES: RoleValues[];
export { ROLES, ALL_ROLES, type RoleValues };
//# sourceMappingURL=roles.d.ts.map