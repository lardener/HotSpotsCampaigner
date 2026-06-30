import { CombatUnit } from './combatUnit';
import { Pilot } from './pilot';

export interface LedgerEntryInput {
    amount: number;
    description: string;
    reputationChange?: number | null;
    campaignId?: string | null;
    campaignName?: string | null;
    monthIndex?: number | null;
}

export interface LedgerEntry extends LedgerEntryInput {
    __typename?: string;
    id: string;
    detachmentId: string | null;
    timestamp: string;
}

export interface Detachment {
    __typename?: string;
    id: string;
    name: string;
    campaignId: string | null;
    campaignName: string | null;
    mercenaryCommandId: string | null;
    mercenaryCommandName: string | null;
    units?: CombatUnit[];
    pilots?: Pilot[];
    campaignRating?: number;
}

export type Command = MercenaryCommand;

export interface MercenaryCommand {
    __typename?: string;
    id: string;
    name: string;
    totalSupportPoints: number;
    reputation: number;
    isManager?: boolean;
    isParticipant?: boolean;
    commandingOfficer: string;
    detachments?: Detachment[];
    units?: CombatUnit[];
    pilots?: Pilot[];
    allLedgerEntries?: LedgerEntry[];
}

export type CommandUpdateInput = Partial<Pick<MercenaryCommand, 'name' | 'commandingOfficer' | 'totalSupportPoints' | 'reputation'>>;

// ==================== Mutation Input Variables ====================

export interface UpdateCommandVars {
    id: string;
    input: CommandUpdateInput;
}

export interface AssignAssetVars {
    assetType: string;
    assetId: string;
    detachmentId: string | null;
}

export interface DeleteDetachmentVars {
    detachmentId: string;
}

export interface CreateDetachmentVars {
    commandId: string;
    campaignId: string | null;
    name: string;
}
