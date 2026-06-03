import { render, screen, waitFor } from '@testing-library/react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import { CampaignGenerator } from './CampaignGenerator'; // Correctly import the component
import { GET_METADATA, PREVIEW_CAMPAIGN } from '../types/operations'; // Import GraphQL operations
import { describe, it, expect } from 'vitest';

const metadataMock = {
    request: {
        query: GET_METADATA,
    },
    result: {
        data: {
            campaignMetadata: {
                missions: {
                    primary: ['Raid'],
                    opponent: ['Garrison'],
                },
                trackTypes: ['Assault'],
                factions: ['Davion'],
                employerTypes: ['Noble'],
                resolvedSteps: [
                    { step: 1, values: { payRate: "100%", salvageRights: "None", supportRights: "None", transportation: "0%", commandRights: "House" } }
                ],
            },
        },
    },
};

const previewMock = {
    request: {
        query: PREVIEW_CAMPAIGN,
        variables: { input: {} },
    },
    result: {
        data: {
            previewCampaign: {
                campaign: { name: "TEST PREVIEW", systemName: "Terra", trackCount: 5 },
                contracts: [
                    { employerCategory: "Davion: Noble", missionType: "Raid", primaryContract: true, payRate: 1.0, payStep: 1, salvageTerms: "None", salvageStep: 1, supportTerms: "None", supportStep: 1, transportTerms: "0%", transportStep: 1, commandRights: "House", commandStep: 1, trackCount: 5 }
                ],
                tracks: ["Assault"],
            },
        },
    },
};

describe('CampaignGenerator Integration', () => {
    it('successfully fetches metadata and triggers initial preview', async () => {
        const client = new ApolloClient({
            link: new MockLink([metadataMock, previewMock]),
            cache: new InMemoryCache(),
        });

        render(
            <ApolloProvider client={client}>
                <CampaignGenerator />
            </ApolloProvider>
        );

        // Verify it loads metadata
        await waitFor(() => {
            expect(screen.getByText(/DOBLESS INFORMATION SERVICE/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /GENERATE CONTRACT OFFERS/i })).toBeInTheDocument();
        });
    });
});