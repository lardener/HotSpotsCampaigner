# Plan: Campaign Months Integration

## Objective
To introduce the concept of "months" into the campaign data model, ensuring that the random campaign generator and campaign management services support this new temporal dimension. Initially, the number of months will be equal to the number of tracks, with each track assigned to its own month. This lays the groundwork for future enhancements (e.g., Hot Spots Draconis Reach rules) where months can be larger than tracks, and multiple tracks can occur in a single month.
The campaign theater view will also be modified to allow managers to change the number of months and tracks, and to assign tracks to specific months.

## Database Entity Modifications

To support the new temporal dimension, the following entities and their corresponding database tables need to be updated:

### 1. [x] `Campaign` Entity
- **Field Added**: `lengthInMonths` (Integer) - **COMPLETE**
- **Purpose**: Represents the total duration of the campaign in months.

### 2. [x] `CampaignTrack` Entity
- **Field Added**: `monthIndex` (Integer) - **COMPLETE**
- **Purpose**: Represents the 1-based month number to which a specific track is assigned.

### 3. [x] `SchemaGenerator.java` Update
- **Modification**: Included `length_in_months` and `month_index` in the Java-based schema generator for fresh installations. - **COMPLETE**
- **Rationale**: Ensures the temporal model is consistent across all environments.

### [x] SQL Schema Alterations

```sql
-- Alter table for Campaign entity
ALTER TABLE campaigns
ADD COLUMN length_in_months INT;

-- Alter table for CampaignTrack entity
ALTER TABLE campaign_tracks
ADD COLUMN month_index INT,
ADD COLUMN complications VARCHAR(1000);
```

## Backend (`CampaignService.java`) Changes

### 1. [x] `generateProposal` Logic Update
- **Modification**: Set the `lengthInMonths` field of the `Campaign` object to be equal to `trackCount` during proposal generation. - **COMPLETE**
- **Rationale**: Ensures that newly generated campaigns have a default duration that matches the number of tracks, aligning with the initial 1:1 month-to-track mapping.

### 2. [x] `generateDoblessCampaign` Mutation Handler
- **Modification**: - **COMPLETE**
    - Accept `lengthInMonths` as a parameter.
    - Explicitly set `campaign.setLengthInMonths(lengthInMonths)` if provided.
    - When creating `CampaignTrack` entities, assign `monthIndex` based on their `sequenceOrder` (e.g., `sequenceOrder + 1` for 1-based indexing).
- **Rationale**: Allows the frontend to pass the desired campaign duration and ensures each generated track is initially assigned to a unique month, maintaining the 1:1 relationship for newly generated campaigns.

## [x] Backend (`MercenaryCommandService.java`) Changes

### 1. [x] `updateCampaignDetails` Method Enhancement
- **Modification**: Add logic to update `campaign.setLengthInMonths()` and `campaign.setTrackCount()` if `input` map contains these keys. - **COMPLETE**
- **Rationale**: Enables campaign managers to adjust the total duration and number of tracks for an active campaign via the GraphQL API.

### 2. [x] `updateTrack` Method Implementation
- **Modification**: Add logic to update `track.setMonthIndex()` if the `input` map contains the `monthIndex` key. - **COMPLETE**
- **Rationale**: Allows campaign managers to reassign individual tracks to different months.

## [x] Frontend (`RandomCampaignGenerator.tsx`) Changes

### 1. [x] `Proposal` Interface Update
- **Modification**: Add `lengthInMonths: number` to the `campaign` object within the `Proposal` interface. - **COMPLETE**
- **Rationale**: Reflects the new `lengthInMonths` field in the data structure received from the backend.

### 2. [x] `GraphQL Queries Update`
- **Modification**: Include `lengthInMonths` in the `campaign` selection of the `PREVIEW_CAMPAIGN` GraphQL query. - **COMPLETE**
- **Rationale**: Ensures the frontend receives the `lengthInMonths` data from the backend.

### 3. [x] `getSaveParams` Function Update
- **Modification**: Include `lengthInMonths: proposal.campaign.lengthInMonths` in the input object for the `CREATE_CAMPAIGN` mutation. - **COMPLETE**
- **Rationale**: Passes the campaign's duration to the backend when saving a new campaign.

### 4. [x] `updateProposalCampaign` Function Update
- **Modification**: When the `trackCount` field is updated, automatically set `updatedCampaign.lengthInMonths = updatedVal as number` to keep them in sync. - **COMPLETE**
- **Rationale**: Maintains the initial requirement that `lengthInMonths` equals `trackCount` in the generator UI.

## [x] Frontend (`CampaignTheaterView.tsx`) Changes

### 1. [x] `GraphQL Queries/Mutations Update`
- **Modification**: - **COMPLETE**
    - Update `GET_CAMPAIGN_INVITES` (which fetches `CampaignDetail`) to include `lengthInMonths` and `trackCount` in the `CampaignDetail` type.
    - Update `UPDATE_CAMPAIGN` mutation to accept `lengthInMonths` and `trackCount` in its `CampaignInput`.
    - Update `UPDATE_TRACK` mutation to accept `monthIndex` in its `TrackInput`.
- **Rationale**: Ensures the frontend can fetch and send the new month-related data to the backend.

### 2. [x] UI for Campaign Duration (`lengthInMonths`) and Total Tracks (`trackCount`)
- **Modification**: - **COMPLETE**
    - Add input fields for `lengthInMonths` and `trackCount` in the campaign summary section of the `CampaignTheaterView`.
    - Implement `onChange` and `onBlur` handlers for these inputs to call the `handleUpdate` function, persisting changes to the backend.
- **Rationale**: Provides campaign managers with direct control over the campaign's total duration and the number of tracks.

### 3. [x] UI for Assigning Tracks to Months (Drag and Drop Panels)
- **Modification**: - **COMPLETE**
    - Replace the "TRACK OPERATIONS" table with a grid of "MONTH PANELS".
    - Render panels for Month 1 through `campaign.lengthInMonths`.
    - Display tracks as draggable cards within their assigned month panel.
    - Implement drag-and-drop logic to allow moving tracks between month panels, updating the `monthIndex` upon drop.
- **Rationale**: Provides a more intuitive tactical overview of the campaign schedule and allows managers to easily reorder operations across the timeline.


## [x] Rationale
These changes provide the necessary backend and frontend support for managing campaign duration and track-to-month assignments. The database modifications are crucial for persisting this new temporal data, while the service and UI updates ensure a consistent and manageable experience for campaign creators and managers.

## [x] Data Migration Strategy

For existing campaigns and tracks, we need to populate the new `length_in_months` and `month_index` columns with default values based on the current campaign structure (where `lengthInMonths` equals `trackCount` and each track is in its own month).

### [x] SQL Data Migration Scripts
```sql
```sql
-- Migrate existing Campaign data: Set length_in_months equal to track_count
UPDATE campaigns
SET length_in_months = track_count
WHERE length_in_months IS NULL;

-- Migrate existing CampaignTrack data: Set month_index based on sequence_order (0-based to 1-based)
UPDATE campaign_tracks
SET month_index = sequence_order + 1
WHERE month_index IS NULL;
```