package com.hotspotscamp.service;

import org.springframework.stereotype.Service;

import com.hotspotscamp.dto.CampaignMetadata;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.enums.RuleSet;
import com.hotspotscamp.util.RulesConstants;
import com.hotspotscamp.util.TypeUtils;

import lombok.extern.slf4j.Slf4j;

/**
 * Service for computing unit prices based on campaign metadata and unit
 * attributes. Mirrors frontend pricingUtils.ts logic.
 */
@Service
@Slf4j
public class PriceComputationService {

    /**
     * Compute price for a unit using campaign metadata pricing multipliers.
     *
     * Core mode: BV × techTax Alpha Strike: PV × pvPurchaseUnitMultiplier
     */
    public long computePrice(CombatUnit unit, CampaignMetadata metadata, RuleSet ruleSet) {
        if ((unit != null) && (metadata != null) && (ruleSet != null)) {
            switch (ruleSet) {
                case ALPHA_STRIKE:
                    int pvMultiplier = TypeUtils.asInt(metadata.pvPurchaseUnitMultiplier(), RulesConstants.PURCHASE_UNIT_POINT_VALUE_MULTIPLIER);
                    int pv = TypeUtils.asInt(unit.getPv(), 0);
                    return pv * pvMultiplier;
                case CORE:
                    double techTax = getTechTax(unit.getTechBase(), metadata);
                    int bv = TypeUtils.asInt(unit.getBv(), 0);
                    return Math.round(Math.ceil(bv * techTax));
                default:
                    log.warn("Unknown rule set for price computation: {}", ruleSet);
            }
        } else {
            log.warn("Cannot compute price: unit, metadata, or ruleSet is null: unit={}, metadata={}, ruleSet={}", unit, metadata, ruleSet);
        }
        // Fallback
        return 1000000;

    }

    private double getTechTax(String techBase, CampaignMetadata metadata) {
        double clanMod = TypeUtils.asDouble(metadata.clanTechModifier(), RulesConstants.REPAIR_MULT_CLAN_TECH);
        double mixedMod = TypeUtils.asDouble(metadata.mixedTechModifier(), RulesConstants.REPAIR_MULT_MIXED_TECH);

        if ("Clan".equalsIgnoreCase(techBase)) {
            return clanMod;
        }
        if ("Mixed".equalsIgnoreCase(techBase)) {
            return mixedMod;
        }
        return 1.0;
    }
}
