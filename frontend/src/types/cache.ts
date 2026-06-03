import { InMemoryCache, TypePolicies } from '@apollo/client';
import { Command, Detachment, CampaignDetail } from './global.d';

/**
 * Apollo Cache Configuration
 * 
 * Uses the consolidated types from global.d.ts to define merge policies 
 * for Tactical Data Models. This ensures that when units, pilots, or 
 * ledger entries are updated, the cache is correctly synchronized.
 */
export const typePolicies: TypePolicies = {
    // Core entities use 'id' for normalization.
    CombatUnit: {
        keyFields: ['id'],
    },
    Pilot: {
        keyFields: ['id'],
    },
    LedgerEntry: {
        keyFields: ['id'],
    },
    CampaignTrack: {
        keyFields: ['id'],
    },
    RepairRules: {
        keyFields: false,
    },
    // Nested collections need merge policies to ensure the local cache 
    // reflects the latest roster/financial status from the backend.
    Detachment: {
        fields: {
            units: {
                merge(_existing, incoming: NonNullable<Detachment['units']>) {
                    return incoming;
                },
            },
            pilots: {
                merge(_existing, incoming: NonNullable<Detachment['pilots']>) {
                    return incoming;
                },
            },
        },
    },
    MercenaryCommand: {
        fields: {
            units: {
                merge(_existing, incoming: NonNullable<Command['units']>) {
                    return incoming;
                },
            },
            pilots: {
                merge(_existing, incoming: NonNullable<Command['pilots']>) {
                    return incoming;
                },
            },
            allLedgerEntries: {
                merge(_existing, incoming: NonNullable<Command['allLedgerEntries']>) {
                    return incoming;
                },
            },
            detachments: {
                merge(_existing, incoming: NonNullable<Command['detachments']>) {
                    return incoming;
                },
            },
        },
    },
    Campaign: {
        fields: {
            contracts: {
                merge(_existing, incoming: NonNullable<CampaignDetail['contracts']>) {
                    return incoming;
                },
            },
            factions: {
                merge(_existing, incoming: NonNullable<CampaignDetail['factions']>) {
                    return incoming;
                },
            },
            tracks: {
                merge(_existing, incoming: NonNullable<CampaignDetail['tracks']>) {
                    return incoming;
                },
            },
            participatingDetachments: {
                merge(_existing, incoming: NonNullable<CampaignDetail['participatingDetachments']>) {
                    return incoming;
                },
            },
            campaignInvites: {
                merge(_existing, incoming: NonNullable<CampaignDetail['campaignInvites']>) {
                    return incoming;
                },
            },
        },
    },
};

export const cache = new InMemoryCache({
    typePolicies,
});