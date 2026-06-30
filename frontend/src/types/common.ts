/**
 * Shared Common and UI helper types.
 */

/**
 * Represents a numeric value during UI entry.
 * Allows strings to handle intermediate states like empty fields or 
 * a lone negative sign ("-") before the number is fully typed.
 */
export type NumericInput = string | number;

export type UnitType = 'BM' | 'CV' | 'PM' | 'IM' | 'BA' | 'CI';
export type TechBase = 'Inner Sphere' | 'Clan' | 'Mixed';
export type UnitStatus = 'OPERATIONAL' | 'ARMOR DAMAGE' | 'INTERNAL DAMAGE' | 'CRIPPLED' | 'DESTROYED' | 'TRULY DESTROYED';

/**
 * Utility to map a query name to an entity type for GraphQL response structures.
 */
export type GQLResponse<K extends string, T> = {
    [P in K]: T;
};
