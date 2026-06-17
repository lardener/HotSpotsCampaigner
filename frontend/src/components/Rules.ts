import { UnitStatus, UnitType, TechBase } from '../types/global.d';
export const UNIT_STATUS_OPTIONS: UnitStatus[] = [
    'OPERATIONAL',
    'ARMOR DAMAGE',
    'INTERNAL DAMAGE',
    'CRIPPLED',
    'DESTROYED',
    'TRULY DESTROYED'
];

export const UNIT_TYPES: UnitType[] = ['BM', 'CV', 'PM', 'IM', 'BA', 'CI'];
export const TECH_BASES: TechBase[] = ['Inner Sphere', 'Clan', 'Mixed'];

export const HIRE_NAMED_PILOT_COST = 150; // Default cost for hiring a named pilot