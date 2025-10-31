export type PlanType = 'cliente' | 'bdi_inicial' | 'bdi_plus';

export const PLAN_HIERARCHY: Record<PlanType, number> = {
  cliente: 1,
  bdi_inicial: 2,
  bdi_plus: 3,
};

export const PLAN_NAMES: Record<PlanType, string> = {
  cliente: 'Cliente',
  bdi_inicial: 'BDI Inicial',
  bdi_plus: 'BDI Plus',
};

export function hasMinimumPlan(
  userPlan: PlanType | null,
  requiredPlan: PlanType
): boolean {
  if (!userPlan) return false;
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
}

export function canAccessContent(
  userPlan: PlanType | null,
  allowedPlans: PlanType[]
): boolean {
  if (!userPlan) return false;
  return allowedPlans.includes(userPlan);
}

// Configuración de acceso por contenido
export const CONTENT_ACCESS = {
  cursoInicial: ['bdi_inicial', 'bdi_plus'],
  optimizador: ['bdi_plus'],
  reportesPremium: ['bdi_inicial', 'bdi_plus'],
} as const;
