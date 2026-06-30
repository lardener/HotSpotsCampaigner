import { CombatUnit, CampaignDetail, DetachmentAarState, UnitStatus } from '../types/global.d';
import { parseNumericInput } from './contractUtils';

export interface SupportTerms {
    type: 'BATTLE' | 'STRAIGHT' | 'NONE';
    pct: number;
}

export const calculatePilotFinancials = (pState: { healed: number }, terms: { support: SupportTerms }, healCost: number, pricingRule: 'Core' | 'Alpha Strike' = 'Core') => {
    // Alpha Strike: only 1 wound max can be healed
    const effectiveHealCount = pricingRule === 'Alpha Strike' ? Math.min(pState.healed, 1) : pState.healed;

    const rawMedicalCost = effectiveHealCount * healCost;
    let mercenaryCost = 0;

    if (terms.support.type === 'BATTLE') {
        mercenaryCost = 0;
    } else if (terms.support.type === 'STRAIGHT') {
        mercenaryCost = Math.round(rawMedicalCost * (1 - terms.support.pct));
    } else {
        mercenaryCost = rawMedicalCost; // Fixed typo from the source code I saw earlier if any, but let's stick to logic
    }

    return {
        rawMedicalCost,
        mercenaryCost,
        mercenaryCostSigned: mercenaryCost * -1,
        healed: pState.healed,
        injuryHealCost: healCost,
        supportType: terms.support.type,
        supportPct: terms.support.pct
    };
};

export const calculateAwardFinancials = (campaign: CampaignDetail, terms: DetachmentAarState & { payRate: number; salvageCoverage: number }) => {
    const baseCombatPay = campaign.combatPay || 0;

    // Convert potential string inputs to numbers for calculation
    const sValue = parseNumericInput(terms.salvageValue);
    const cAward = parseNumericInput(terms.customAward);

    const payAward = Math.round(baseCombatPay * terms.outcomeMultiplier * terms.selectedLevel);
    const salvageAward = Math.round(sValue * terms.salvageCoverage);
    const total = payAward + salvageAward + cAward;

    return {
        baseCombatPay,
        outcomeMultiplier: terms.outcomeMultiplier,
        payRate: terms.payRate,
        selectedLevel: terms.selectedLevel,
        payAward,
        salvageValue: terms.salvageValue,
        salvageCoverage: terms.salvageCoverage,
        salvageAward,
        customAward: terms.customAward,
        total
    };
};

export const calculateUnitFinancials = (unit: CombatUnit, status: string, rules: Partial<CampaignDetail> | undefined, statuses: UnitStatus[], pricingRule: 'Core' | 'Alpha Strike' = 'Core') => {
    const [operational, armor, internal, crippled, destroyed, trulyDestroyed] = statuses;

    const isTrulyDestroyed = status === trulyDestroyed;
    let baseRepairCost = 0;
    let baseReplacementValue = 0;
    let damageMultiplier = 0;
    let unitModifier = 1.0;
    let techTax = 1.0;
    const costBasis = pricingRule === 'Core' ? (unit.tonnage || 0) : ((unit.asSize || 0) * 20);

    // Determine tech level multiplier based on specific tech base
    if (unit.techBase === 'Clan') {
        techTax = (rules?.clanTechModifier ?? 2.0);
    } else if (unit.techBase === 'Mixed') {
        techTax = (rules?.mixedTechModifier ?? 1.5);
    }

    if (isTrulyDestroyed) {
        // For truly destroyed units, calculate replacement value modified by tech tax
        if (pricingRule === 'Alpha Strike') {
            baseReplacementValue = (unit.pv || 0) * 40 * 0.5 * techTax;
        } else {
            baseReplacementValue = (unit.bv || 0) * 0.5 * techTax;
        }
    } else {
        // For other statuses, calculate repair cost
        const multipliers: Record<string, number> = {
            [operational || 'OPERATIONAL']: 0.0,
            [armor || 'ARMOR DAMAGE']: rules?.armorMultiplier ?? 0.5,
            [internal || 'INTERNAL DAMAGE']: rules?.internalMultiplier ?? 2.0,
            [crippled || 'CRIPPLED']: rules?.crippledMultiplier ?? 3.0,
            [destroyed || 'DESTROYED']: rules?.destroyedMultiplier ?? 5.0,
        };

        damageMultiplier = multipliers[status] || 0;

        baseRepairCost = costBasis * damageMultiplier;

        if (['CV', 'BA', 'CI'].includes(unit.type)) {
            unitModifier = (rules?.nonMechModifier ?? 0.5);
            baseRepairCost *= unitModifier;
        }

        // Apply tech level multiplier to repair cost
        baseRepairCost *= techTax;
    }

    return {
        baseRepairCost,
        baseReplacementValue,
        isTrulyDestroyed,
        techTax,
        damageMultiplier,
        unitModifier,
        costBasis,
        tonnage: unit.tonnage || 0,
        bv: unit.bv || 0,
        techBase: unit.techBase,
        statusLabel: status
    };
};
