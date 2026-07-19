/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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
