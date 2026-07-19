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
import { useState, useCallback } from 'react'
import { TreeItem } from '../components/NavigationTree'

export type TabType =
  | 'my-campaigns'
  | 'create-campaign'
  | 'commands'
  | 'ledger'
  | 'public-campaigns'
  | 'command-dashboard'

export const useDashboardNavigation = () => {
  const [activeTab, setActiveTab] = useState<TabType>('my-campaigns')
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [selectedDetachmentId, setSelectedDetachmentId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isCreatingCommand, setIsCreatingCommand] = useState(false)

  const handleTreeSelect = useCallback((item: TreeItem) => {
    // 1. Always exit creation mode when navigating via the tree
    setIsCreatingCommand(false)
    setSelectedNodeId(item.id)

    // 2. Map tree nodes to the specific pages described in the plan
    if (item.id === 'root-commands') {
      setSelectedDetachmentId(null)
      setActiveTab('commands') // Registry / Aggregate View
    } else if (item.type === 'COMMAND') {
      setSelectedCommandId(item.id)
      setSelectedDetachmentId(null)
      setActiveTab('command-dashboard') // Unit Dossier
    } else if (item.type === 'DETACHMENT' || item.type === 'DEPLOYMENT') {
      if (item.metadata?.commandId) setSelectedCommandId(item.metadata.commandId)
      if (item.metadata?.detachmentId) setSelectedDetachmentId(item.metadata.detachmentId)
      setActiveTab('command-dashboard') // Focus the unit dossier for this detachment
    } else if (item.id === 'root-campaigns') {
      setSelectedCampaignId(null)
      setSelectedDetachmentId(null)
      setActiveTab('my-campaigns') // Operational Overview
    } else if (item.type === 'CAMPAIGN') {
      setSelectedCampaignId(item.id)
      setSelectedDetachmentId(null)
      setActiveTab('my-campaigns') // Specific Campaign Focus
    } else if (item.id === 'public-intel') {
      setActiveTab('public-campaigns') // Global Intel
    } else if (item.id === 'create-campaign') {
      setActiveTab('create-campaign') // Creation Tool
    }
  }, [])

  const getSelectedNodeId = useCallback(() => {
    if (selectedNodeId) return selectedNodeId
    if (activeTab === 'create-campaign') return 'create-campaign'
    if (activeTab === 'public-campaigns') return 'public-intel'
    if (activeTab === 'my-campaigns') return 'root-campaigns'
    if (activeTab === 'commands') return 'root-commands'
    if (['command-dashboard', 'ledger'].includes(activeTab)) return selectedCommandId || undefined
    return undefined
  }, [selectedNodeId, activeTab, selectedCommandId])

  const getThemeClass = useCallback(() => {
    if (activeTab === 'ledger') return 'theme-green'
    if (activeTab === 'commands' || activeTab === 'command-dashboard') return 'theme-amber'
    if (activeTab === 'my-campaigns') return 'theme-blue'
    if (['create-campaign', 'public-campaigns'].includes(activeTab)) return 'theme-red'
    return 'theme-green'
  }, [activeTab])

  return {
    activeTab,
    setActiveTab,
    selectedCommandId,
    setSelectedCommandId,
    selectedCampaignId,
    setSelectedCampaignId,
    selectedDetachmentId,
    setSelectedDetachmentId,
    selectedNodeId,
    setSelectedNodeId,
    isCreatingCommand,
    setIsCreatingCommand,
    handleTreeSelect,
    getSelectedNodeId,
    getThemeClass,
  }
}
