@ -0,0 +1,47 @@
## Plan: Track After-Action Narrative Field

Add a markdown-supported after-action narrative field to the After Action Report editor and persist it on the campaign track record.

**Steps**
1. Backend entity/schema updates
   - Modify `backend/src/main/java/com/hotspotscamp/entity/CampaignTrack.java` to add a new field `String afterActionNarrative` with `@Column("after_action_narrative")`.
   - Update `backend/src/main/resources/graphql/schema.graphqls` and top-level `schema.graphqls` to add `afterActionNarrative: String` to `CampaignTrack` and `TrackUpdateInput`.
   - Update `backend/src/main/java/com/hotspotscamp/service/CampaignService.java` to extend `TrackUpdateInput` with `String afterActionNarrative`.
   - Update `backend/src/main/java/com/hotspotscamp/service/MercenaryCommandService.java` in `updateTrack` so it saves `input.afterActionNarrative()` when present.
   - Update `backend/src/main/java/com/hotspotscamp/SchemaGenerator.java` and `schema.sql` to add a new `after_action_narrative` column to `campaign_tracks`.

2. Frontend UI and GraphQL updates
   - Modify `frontend/src/components/AfterActionReportEditor.tsx`:
     * import `Markdown` from `react-markdown` and `remarkGfm`.
     * Add local state for `afterActionNarrative` and `isEditingNarrative`.
     * Add a top-of-editor markdown field with editable textarea and rendered preview, matching the campaign description markdown style.
     * Add a `UPDATE_TRACK` GraphQL mutation locally or reuse the existing mutation shape, including `afterActionNarrative` in input and response.
     * Persist narrative changes on blur or save.
   - Update `frontend/src/components/CampaignTheaterView.tsx` query and mutation fragments so `tracks { ... }` includes `afterActionNarrative` and `updateTrack` returns it.
   - Optionally update any local TS track interfaces in `CampaignTheaterView.tsx` if those interfaces are used for track typing.

3. Verification
   - Run backend tests or targeted service/controller tests.
   - Run frontend compilation/tests.
   - Manual validation: open Campaign Theater > After Action Report editor, add narrative text, save, close, reopen or inspect track payload and DB column.
   - Confirm `campaign_tracks.after_action_narrative` is present in generated SQL and schema generation.

**Relevant files**
- `frontend/src/components/AfterActionReportEditor.tsx`
- `frontend/src/components/CampaignTheaterView.tsx`
- `backend/src/main/java/com/hotspotscamp/entity/CampaignTrack.java`
- `backend/src/main/java/com/hotspotscamp/service/CampaignService.java`
- `backend/src/main/java/com/hotspotscamp/service/MercenaryCommandService.java`
- `backend/src/main/resources/graphql/schema.graphqls`
- `schema.graphqls`
- `backend/src/main/java/com/hotspotscamp/SchemaGenerator.java`
- `schema.sql`

**Decisions**
- The new narrative field is stored on `CampaignTrack` and surfaced through existing track update APIs.
- The AAR editor will use the same markdown preview/edit pattern as the campaign theater description field.
- Both the resource GraphQL schema and the root schema file should be updated so API docs/tooling remain consistent.

**Further Considerations**
1. If existing campaign track objects are created without the new field, null is acceptable; no migration beyond schema addition is required.
2. If the AAR editor should also allow narrative editing from the theater track detail cards, that would be a separate enhancement.