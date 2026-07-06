import { CombatUnit } from '../types/generated';
import { PublicCampaignMetadataWithRules } from '../types/helpers';

export function getTechTax(techBase: string, metadata?: PublicCampaignMetadataWithRules): number {
    if (techBase === 'Clan') return metadata?.clanTechModifier ?? 2.0;
    if (techBase === 'Mixed') return metadata?.mixedTechModifier ?? 1.5;
    return 1.0;
}

export function calculatePurchasePrice(
    bv: number,
    pv: number,
    techBase: string,
    pricingRule: 'Core' | 'Alpha Strike',
    overridePrice: number | undefined,
    metadata?: PublicCampaignMetadataWithRules
): number {
    if (overridePrice !== undefined) {
        return overridePrice;
    }

    const techTax = getTechTax(techBase, metadata);

    if (pricingRule === 'Core') {
        return Math.round(bv * techTax);
    }

    // Alpha Strike
    const pvMultiplier = metadata?.pvPurchaseUnitMultiplier ?? 40;
    return Math.round(pv * pvMultiplier);
}

export function calculateReconfigureCost(
    mode: string,
    unit: CombatUnit | null,
    formBv: number,
    formPv: number,
    formTonnage: number,
    formAsSize: number,
    formTechBase: string,
    formDetachmentId: string | null,
    pricingRule: 'Core' | 'Alpha Strike',
    metadata?: PublicCampaignMetadataWithRules
): number {
    if (mode !== 'edit' || !unit || !formDetachmentId) return 0;
    if (formBv === unit.bv && formPv === unit.pv) return 0;

    const modifier = metadata?.omnimechReconfigureModifier ?? 0.5;
    const techTax = getTechTax(formTechBase, metadata);

    const basis = pricingRule === 'Core'
        ? formTonnage
        : formAsSize * 20;

    return Math.round(basis * modifier * techTax);
}
