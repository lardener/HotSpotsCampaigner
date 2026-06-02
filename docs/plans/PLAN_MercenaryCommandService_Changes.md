# Plan for MercenaryCommandService.java Modifications

## Objective
To integrate the concept of "months" into campaign management, allowing campaign managers to adjust the total duration of a campaign and assign tracks to specific months.


## Database Entity Modifications

To support the new temporal dimension, the following entities and their corresponding database tables need to be updated:

### 1. `Campaign` Entity
- **Field Added**: `lengthInMonths` (Integer)
- **Purpose**: Represents the total duration of the campaign in months.

### 2. `CampaignTrack` Entity
- **Field Added**: `monthIndex` (Integer)
- **Purpose**: Represents the 1-based month number to which a specific track is assigned.

### SQL Schema Alterations

```sql
-- Alter table for Campaign entity
ALTER TABLE campaigns
ADD COLUMN length_in_months INT;

-- Alter table for CampaignTrack entity
ALTER TABLE campaign_tracks
ADD COLUMN month_index INT;
```

## Changes Applied to `d:\dev\HotSpotsCampaigner\backend\src\main\java\com\hotspotscamp\service\MercenaryCommandService.java`

### 0. Dependency Injection
- Added `CampaignTrackRepository` to the `MercenaryCommandService` to allow management of campaign tracks within the command management lifecycle.
- Updated imports for `CampaignTrack` and `CampaignTrackRepository`.

### 1. `updateCampaignDetails` Method Enhancement

**Purpose**: To enable the updating of a campaign's total duration (`lengthInMonths`) and the number of tracks (`trackCount`) via a GraphQL mutation.

**Modification**:
- Added `if (input.containsKey("lengthInMonths"))` block to set the `lengthInMonths` field of the `Campaign` entity.
- Added `if (input.containsKey("trackCount"))` block to set the `trackCount` field of the `Campaign` entity.

### 2. `updateTrack` Method Implementation

**Purpose**: To allow campaign managers to assign individual tracks to a specific month within the campaign's timeline.

**Modification (New Method)**:
- Implemented `updateTrack` which supports updating `trackName`, `location`, `nextSession`, `attackerFactionId`, and the new `monthIndex`. This `monthIndex` represents the 1-based month number to which the track is assigned.

## Rationale
These changes provide the necessary backend support for the frontend `CampaignTheaterView` to manage campaign duration and track-to-month assignments, laying the groundwork for more complex scheduling rules like those in "Hot Spots Draconis Reach". The database modifications are crucial for persisting this new temporal data.

## Data Migration Strategy

For existing campaigns and tracks, we need to populate the new `length_in_months` and `month_index` columns with default values based on the current campaign structure (where `lengthInMonths` equals `trackCount` and each track is in its own month).

### SQL Data Migration Scripts

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