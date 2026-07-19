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
import { useState, useCallback } from 'react';
import { Campaign, MercenaryCommand, CombatUnit, Pilot, Detachment } from '../types/generated';
import { GetCampaignMetadataQuery } from '../types/operations';
import { TerminalOverlayProps } from './TerminalOverlay';

interface ProcureAssetData extends Partial<CombatUnit> {
    overridePrice?: number;
}

interface HirePilotData extends Partial<Pilot> {
    overridePrice?: number;
}

interface UseHscActionHandlerProps {
    campaign: Campaign;
    userCommands?: MercenaryCommand[];
    setOverlay: (overlay: TerminalOverlayProps | null) => void;
    onActionComplete?: () => void; // Callback for when an editor saves
    metaData?: GetCampaignMetadataQuery;
}

interface ExtendedDetachment extends Detachment {
    totalSupportPoints: number;
}

export const useHscActionHandler = ({ campaign, userCommands, setOverlay, onActionComplete }: UseHscActionHandlerProps) => {
    const [procureAssetData, setProcureAssetData] = useState<ProcureAssetData | null>(null);
    const [procureTargetDetachment, setProcureTargetDetachment] = useState<ExtendedDetachment | null>(null);
    const [showProcureEditor, setShowProcureEditor] = useState(false);

    const [hirePilotData, setHirePilotData] = useState<HirePilotData | null>(null);
    const [hireTargetDetachment, setHireTargetDetachment] = useState<ExtendedDetachment | null>(null);
    const [showHireEditor, setShowHireEditor] = useState(false);

    const handleHscAction = useCallback((url: string) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.protocol !== 'hsc:') {
                console.warn("Tactical link protocol mismatch:", urlObj.protocol);
                return;
            }

            const myDetachmentsInCampaign = (campaign.participatingDetachments || [])
                .filter((det): det is NonNullable<typeof det> => det != null)
                .filter(det => (userCommands || []).some(cmd => cmd.id === det.mercenaryCommandId))
                .map(det => {
                    const cmd = (userCommands || []).find(c => c.id === det.mercenaryCommandId);
                    return { ...det, totalSupportPoints: cmd?.totalSupportPoints || 0 } as ExtendedDetachment;
                });

            if (myDetachmentsInCampaign.length === 0) {
                setOverlay({
                    title: "ACCESS DENIED",
                    message: "NO ACTIVE DETACHMENTS OWNED BY YOUR COMMAND ARE DEPLOYED IN THIS THEATER.",
                    onConfirm: () => setOverlay(null),
                    variant: 'alert'
                });
                return;
            }

            const selectDetachmentAndOpenEditor = (assetData: ProcureAssetData | HirePilotData, editorType: 'procure' | 'hire') => {
                if (myDetachmentsInCampaign.length === 1) {
                    if (editorType === 'procure') {
                        setProcureTargetDetachment(myDetachmentsInCampaign[0]);
                        setProcureAssetData(assetData as ProcureAssetData);
                        setShowProcureEditor(true);
                    } else {
                        setHireTargetDetachment(myDetachmentsInCampaign[0]);
                        setHirePilotData(assetData as HirePilotData);
                        setShowHireEditor(true);
                    }
                } else {
                    setOverlay({
                        title: "SELECT OPERATIONAL ELEMENT",
                        message: `MULTIPLE DETACHMENTS DETECTED. SELECT ${editorType === 'procure' ? 'PROCUREMENT' : 'RECRUITMENT'} RECIPIENT:`,
                        onConfirm: () => { }, // No-op, handled by button clicks
                        children: (
                            <div className="flex-col flex-gap-10 mt-15">
                                {myDetachmentsInCampaign.map(det => (
                                    <button
                                        key={det.id}
                                        className="mode-btn theme-amber text-left"
                                        onClick={() => {
                                            if (editorType === 'procure') {
                                                setProcureTargetDetachment(det);
                                                setProcureAssetData(assetData as ProcureAssetData);
                                                setShowProcureEditor(true);
                                            } else {
                                                setHireTargetDetachment(det);
                                                setHirePilotData(assetData as HirePilotData);
                                                setShowHireEditor(true);
                                            }
                                            setOverlay(null); // Close selection overlay
                                        }}
                                    >
                                        {det.name} ({det.totalSupportPoints} SP)
                                    </button>
                                ))}
                            </div>
                        )
                    });
                }
            };

            if (urlObj.host === 'procure') {
                const params = urlObj.searchParams;
                const asset = {
                    model: params.get('model') || 'NEW UNIT',
                    variant: params.get('variant') || '',
                    bv: parseInt(params.get('bv') || '0'),
                    pv: parseInt(params.get('pv') || '0'),
                    asSize: parseInt(params.get('sz') || '0'),
                    type: params.get('type') || 'BM',
                    techBase: params.get('tech') || 'Inner Sphere',
                    tonnage: parseInt(params.get('tons') || '0'),
                    overridePrice: params.get('price') ? parseInt(params.get('price')!) : undefined
                };
                selectDetachmentAndOpenEditor(asset, 'procure');
            } else if (urlObj.host === 'hire') {
                const params = urlObj.searchParams;
                const pilot = {
                    name: params.get('name') || 'NEW PILOT',
                    unitType: params.get('unitType') || 'BM',
                    wounds: parseInt(params.get('wounds') || '0'),
                    gunnerySpEarned: parseInt(params.get('gunnerySpEarned') || '0'),
                    pilotingSpEarned: parseInt(params.get('pilotingSpEarned') || '0'),
                    edgeTokensSpEarned: parseInt(params.get('edgeTokensSpEarned') || '0'),
                    edgeAbilitySpEarned: parseInt(params.get('edgeAbilitySpEarned') || '0'),
                    edgeAbilities: params.get('edgeAbilities') || '',
                    overridePrice: params.get('price') ? parseInt(params.get('price')!) : undefined
                };
                selectDetachmentAndOpenEditor(pilot, 'hire');
            } else if (urlObj.host === 'market' && urlObj.pathname === '/scrappers/draw') {
                setOverlay({
                    title: "SCRAP HEAP DRAW",
                    message: "ACCESSING CAMPAIGN MARKET DATA... ROLLING FOR SALVAGE...",
                    onConfirm: () => {
                        setOverlay(null);
                        // Note: This requires a backend mutation to actually perform the draw.
                        // For now, we simulate the 'reveal' and redirect to procurement.
                        console.log("Scrapper draw triggered for campaign:", urlObj.searchParams.get('campaign'));
                    },
                    variant: 'info'
                });
            } else {
                setOverlay({
                    title: "UNKNOWN ACTION",
                    message: `UNRECOGNIZED HSC PROTOCOL: ${urlObj.host}.`,
                    variant: 'alert',
                    onConfirm: () => setOverlay(null)
                });
            }
        } catch (e) { console.error("Invalid HSC action link", e); }
    }, [campaign, userCommands, setOverlay]);

    const handleProcureSave = useCallback(() => {
        setShowProcureEditor(false);
        setProcureAssetData(null);
        setProcureTargetDetachment(null);
        onActionComplete?.();
    }, [onActionComplete]);

    const handleProcureCancel = useCallback(() => {
        setShowProcureEditor(false);
        setProcureAssetData(null);
        setProcureTargetDetachment(null);
    }, []);

    const handleHireSave = useCallback(() => {
        setShowHireEditor(false);
        setHirePilotData(null);
        setHireTargetDetachment(null);
        onActionComplete?.();
    }, [onActionComplete]);

    const handleHireCancel = useCallback(() => {
        setShowHireEditor(false);
        setHirePilotData(null);
        setHireTargetDetachment(null);
    }, []);

    return {
        handleHscAction,
        showProcureEditor, procureAssetData, procureTargetDetachment, handleProcureSave, handleProcureCancel,
        showHireEditor, hirePilotData, hireTargetDetachment, handleHireSave, handleHireCancel,
    };
};