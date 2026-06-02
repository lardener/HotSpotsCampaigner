# Navigation Tree Implementation Plan

## Objective
Transition the UI from a flat tab-based system to a hierarchical "Command and Control" tree structure.

## Tree Structure
1. **Current Deployments (Root)**
   - List: Active Detachments belonging to user's commands.
   - Detail: Specific ledger for the selected deployment.
2. **Mercenary Commands (Root)**
   - Main Page: Aggregate ledger showing all history for the command (pooled + all detachments).
   - Children: List of Detachments under this command.
   - Detail: Deployment-specific ledger.
3. **Managed Campaigns (Root)**
   - Main Page: Campaign Intel (rules, pay steps) and creation tool.
   - Children: All detachments assigned to this theater (Manager's audit view).
4. **Global Intel (Root)**
   - Main Page: Existing public campaign listing.

## Data Requirements
- [x] Aggregated ledger entries for `MercenaryCommand`.
- [x] Theater-wide detachment visibility for Campaign Managers.
- [x] Repository support for contract-to-detachment lookups.
 - [x] Frontend Sidebar refactor to `TreeView` component.