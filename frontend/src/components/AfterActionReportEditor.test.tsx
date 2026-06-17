import { describe, it, expect } from 'vitest';
import { calculateAwardFinancials, calculateUnitFinancials, calculatePilotFinancials, aarReducer, AarDataState, AarAction } from './AfterActionReportEditor';
import { CampaignDetail, CombatUnit, TrackDetail, UnitStatus } from '../types/global.d';

describe('AfterActionReportEditor Financial Helpers', () => {
    const mockCampaign = {
        combatPay: 1000,
    } as unknown as CampaignDetail;

    describe('calculateAwardFinancials', () => {
        it('should calculate standard successful award correctly', () => {
            const terms = {
                selectedContractId: 'contract-primary',
                outcomeMultiplier: 1.0,
                payRate: 1.0,
                selectedLevel: 1,
                salvageValue: 500,
                salvageCoverage: 0.5,
                customAward: 0
            };

            const result = calculateAwardFinancials(mockCampaign, terms);

            // Pay: 1000 * 1.0 * 1.0 * 1 = 1000
            // Salvage: 500 * 0.5 = 250
            expect(result.payAward).toBe(1000);
            expect(result.salvageAward).toBe(250);
            expect(result.total).toBe(1250);
        });

        it('should apply multipliers (bonus, rate, level) and round pay correctly', () => {
            const terms = {
                selectedContractId: 'contract-primary',
                outcomeMultiplier: 1.5, // 150% bonus
                payRate: 0.8,          // 80% contract rate
                selectedLevel: 2,      // Level 2 deployment
                salvageValue: 0,
                salvageCoverage: 0,
                customAward: 0
            };

            const result = calculateAwardFinancials(mockCampaign, terms);

            // 1000 * 1.5 * 0.8 * 2 = 2400
            expect(result.payAward).toBe(2400);
            expect(result.total).toBe(2400);
        });

        it('should round salvage awards correctly (.25 rounds down, .5 rounds up)', () => {
            const noPayCampaign = { combatPay: 0 } as CampaignDetail;

            const termsDown = {
                selectedContractId: 'contract-primary',
                outcomeMultiplier: 1, payRate: 1, selectedLevel: 1, customAward: 0,
                salvageValue: 333,
                salvageCoverage: 0.25 // 83.25 -> 83
            };
            expect(calculateAwardFinancials(noPayCampaign, termsDown).salvageAward).toBe(83);

            const termsUp = {
                selectedContractId: 'contract-primary',
                outcomeMultiplier: 1, payRate: 1, selectedLevel: 1, customAward: 0,
                salvageValue: 333,
                salvageCoverage: 0.5 // 166.5 -> 167
            };
            expect(calculateAwardFinancials(noPayCampaign, termsUp).salvageAward).toBe(167);
        });

        it('should include custom awards in the total (positive and negative)', () => {
            const terms = {
                selectedContractId: 'contract-primary',
                outcomeMultiplier: 1.0, payRate: 1.0, selectedLevel: 1, salvageValue: 0, salvageCoverage: 0,
                customAward: 500
            };
            expect(calculateAwardFinancials(mockCampaign, terms).total).toBe(1500);

            const termsPenalty = { ...terms, customAward: -200 };
            expect(calculateAwardFinancials(mockCampaign, termsPenalty).total).toBe(800);
        });

        it('should handle missing combat pay by defaulting to 0', () => {
            const result = calculateAwardFinancials({} as CampaignDetail, {
                selectedContractId: 'contract-primary',
                outcomeMultiplier: 1.0, payRate: 1.0, selectedLevel: 1, salvageValue: 100, salvageCoverage: 1.0, customAward: 0
            });
            expect(result.payAward).toBe(0);
            expect(result.total).toBe(100);
        });
    });

    describe('calculatePilotFinancials', () => {
        const terms = {
            support: { type: 'STRAIGHT' as const, pct: 0.5 }
        };
        const healCost = 30;

        it('should calculate medical cost with straight coverage', () => {
            const pState = { healed: 2 };
            const result = calculatePilotFinancials(pState, terms, healCost);

            // 2 wounds * 30 SP = 60 Raw
            // 50% Coverage = 30 Mercenary Cost
            expect(result.rawMedicalCost).toBe(60);
            expect(result.mercenaryCost).toBe(30);
            expect(result.mercenaryCostSigned).toBe(-30);
        });

        it('should handle battle support (100% coverage)', () => {
            const battleTerms = { support: { type: 'BATTLE' as const, pct: 1.0 } };
            const result = calculatePilotFinancials({ healed: 1 }, battleTerms, healCost);
            expect(result.mercenaryCost).toBe(0);
        });

        it('should handle no support coverage', () => {
            const noTerms = { support: { type: 'NONE' as const, pct: 0 } };
            const result = calculatePilotFinancials({ healed: 1 }, noTerms, healCost);
            expect(result.mercenaryCost).toBe(30);
        });

        it('should use provided custom heal cost', () => {
            const result = calculatePilotFinancials({ healed: 1 }, { support: { type: 'NONE' as const, pct: 0 } }, 50);
            expect(result.rawMedicalCost).toBe(50);
        });
    });

    describe('calculateUnitFinancials', () => {
        const mockUnit = {
            tonnage: 50,
            bv: 1000,
            type: 'BM',
            techBase: 'Inner Sphere'
        } as CombatUnit;

        const statuses: UnitStatus[] = ['OPERATIONAL', 'ARMOR DAMAGE', 'INTERNAL DAMAGE', 'CRIPPLED', 'DESTROYED', 'TRULY DESTROYED'];
        const rules = {} as unknown as CampaignDetail; // Will use defaults

        it('should return 0 cost for operational status', () => {
            const result = calculateUnitFinancials(mockUnit, 'OPERATIONAL', rules, statuses);
            expect(result.baseRepairCost).toBe(0);
            expect(result.isTrulyDestroyed).toBe(false);
        });

        it('should calculate IS repair cost (Armor Damage)', () => {
            const result = calculateUnitFinancials(mockUnit, 'ARMOR DAMAGE', rules, statuses);
            // 50T * 0.5 (armor) * 1.0 (BM) * 1.0 (IS) = 25
            expect(result.baseRepairCost).toBe(25);
            expect(result.techTax).toBe(1.0);
        });

        it('should apply Clan tech tax and Internal multiplier', () => {
            const clanUnit = { ...mockUnit, techBase: 'Clan' } as CombatUnit;
            const result = calculateUnitFinancials(clanUnit, 'INTERNAL DAMAGE', rules, statuses);
            // 50T * 2.0 (internal) * 1.0 (BM) * 2.0 (Clan) = 200
            expect(result.baseRepairCost).toBe(200);
            expect(result.techTax).toBe(2.0);
        });

        it('should apply non-mech modifier for CV units', () => {
            const cvUnit = { ...mockUnit, type: 'CV' } as CombatUnit;
            const result = calculateUnitFinancials(cvUnit, 'ARMOR DAMAGE', rules, statuses);
            // 50T * 0.5 (armor) * 0.5 (non-mech) * 1.0 (IS) = 12.5
            expect(result.baseRepairCost).toBe(12.5);
        });

        it('should calculate replacement value for truly destroyed units with tech tax', () => {
            const mixedUnit = { ...mockUnit, techBase: 'Mixed' } as CombatUnit;
            const result = calculateUnitFinancials(mixedUnit, 'TRULY DESTROYED', rules, statuses);
            // 1000 BV * 0.5 (baseline) * 1.5 (Mixed) = 750
            expect(result.baseReplacementValue).toBe(750);
            expect(result.isTrulyDestroyed).toBe(true);
        });

        it('should use custom salvage ratio from flattened campaign rules', () => {
            const unit = { ...mockUnit, bv: 1000, techBase: 'Inner Sphere' } as CombatUnit;
            // 10/40 = 0.25 salvage ratio
            const customRules = { pvSellUnitMultiplier: 10, pvPurchaseUnitMultiplier: 40 } as unknown as CampaignDetail;
            const result = calculateUnitFinancials(unit, 'TRULY DESTROYED', customRules, statuses);
            expect(result.baseReplacementValue).toBe(250);
        });
    });

    describe('aarReducer SYNC_PROPS', () => {
        const mockCampaign = {
            id: 'camp-1',
            contracts: [{ id: 'contract-primary' }],
            participatingDetachments: [
                {
                    id: 'det-1',
                    units: [{ id: 'unit-1', status: 'OPERATIONAL' }],
                    pilots: [{ id: 'pilot-1', wounds: 0 }]
                }
            ]
        } as unknown as CampaignDetail;

        const mockTrack = {
            id: 'track-1',
            afterActionNarrative: 'Initial Narrative'
        } as unknown as TrackDetail;

        const unitStatuses = ['OPERATIONAL', 'ARMOR DAMAGE', 'DESTROYED'];

        const getEmptyState = (): AarDataState => ({
            detachmentAars: {},
            unitStates: {},
            pilotStates: {},
            afterActionNarrative: '',
            isNarrativeDirty: false,
            pricingRule: 'Core'
        });

        it('should initialize empty state with defaults from props', () => {
            const action: AarAction = { type: 'SYNC_PROPS', campaign: mockCampaign, track: mockTrack, unitStatuses };
            const state = aarReducer(getEmptyState(), action);

            expect(state.detachmentAars['det-1']).toBeDefined();
            expect(state.detachmentAars['det-1'].selectedContractId).toBe('contract-primary');
            expect(state.unitStates['unit-1'].status).toBe('OPERATIONAL');
            expect(state.afterActionNarrative).toBe('Initial Narrative');
            expect(state.isNarrativeDirty).toBe(false);
        });

        it('should preserve user-modified state during synchronization', () => {
            const userModifiedState: AarDataState = {
                detachmentAars: {
                    'det-1': {
                        selectedContractId: 'custom-contract',
                        selectedLevel: 3,
                        outcomeMultiplier: 1.5,
                        salvageValue: 500,
                        customAward: 100
                    }
                },
                unitStates: {
                    'unit-1': { status: 'DESTROYED', ammo: 10 }
                },
                pilotStates: {
                    'pilot-1': { injuries: 3, healed: 2 }
                },
                afterActionNarrative: 'User Edited Narrative',
                isNarrativeDirty: true,
                pricingRule: 'Core'
            };

            const action: AarAction = { type: 'SYNC_PROPS', campaign: mockCampaign, track: mockTrack, unitStatuses };
            const state = aarReducer(userModifiedState, action);

            // Verify detachment award selections are preserved
            expect(state.detachmentAars['det-1'].selectedContractId).toBe('custom-contract');
            expect(state.detachmentAars['det-1'].selectedLevel).toBe(3);

            // Verify unit and pilot status changes are preserved
            expect(state.unitStates['unit-1'].status).toBe('DESTROYED');
            expect(state.unitStates['unit-1'].ammo).toBe(10);
            expect(state.pilotStates['pilot-1'].injuries).toBe(3);

            // Verify narrative is preserved
            expect(state.afterActionNarrative).toBe('User Edited Narrative');
            expect(state.isNarrativeDirty).toBe(true);
        });
    });
});