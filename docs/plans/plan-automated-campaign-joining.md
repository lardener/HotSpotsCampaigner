# Plan: Automated Campaign Joining (Browse & Deploy)

**Created**: 2026-08-04
**Status**: In Progress
**Overview**: Authenticated users can browse active campaigns, select one, pick an existing detachment from their command, and deploy to it in a single flow. The backend auto-generates a one-time token per join. If a detachment is already in another campaign, it is silently reassigned. Token cleanup on cancel uses a new `cancelJoinCampaign` mutation.

---

## Phase 1: Backend — Auto-generate token & cancel mutation

- [x] 1.1 Add `autoGenerateJoinToken(campaignId, userId)` to `InviteService.java`
- [x] 1.2 Add `joinCampaignAuto` to `CampaignService.java` — generates token server-side, validates it, assigns detachment
- [x] 1.3 Add `cancelJoinCampaign` mutation in `CampaignGraphQLController.java` — finds invite by token hash, deletes it
- [x] 1.4 Update `schema.graphqls` (root) — add new mutations

## Phase 2: Frontend — Join flow in `ActiveCampaignsList`

- [x] 2.1 Add "JOIN THEATER" button to `ActiveCampaignsList.tsx` campaign cards — passes `onJoinCampaign` callback up
- [x] 2.2 Create `JoinCampaignDialog.tsx` — shows campaign details, lists user's detachments (from `GET_MY_COMMANDS`), dropdown selector, Deploy/Cancel buttons
- [x] 2.3 Add `AutoJoinCampaign` and `CancelJoinCampaign` mutations to `gql/operations.ts`
- [x] 2.4 Wire dialog state in `MainDashboard.tsx`

## Phase 3: Edge cases & polish

- [x] 3.1 Handle "detachment already in this campaign" — skip if `campaignId` matches, show friendly message
- [x] 3.2 Token lifecycle: auto-generated tokens marked `used=true` on success, deleted on cancel, 5-min validity
- [x] 3.3 Optionally enrich `publicActiveCampaigns` query to include `participatingDetachments` names for the join dialog

## Phase 4: Verification

- [x] 4.1 Run `mvn test` in `backend/` — backend compiles cleanly
- [x] 4.2 Run `npm run codegen` + `npx tsc --noEmit` in `frontend/` — no type errors
- [x] 4.3 Run `npm test` in `frontend/` (vitest) — 155/155 pass (was 154/155; the 1 pre-existing `DetachmentContractNegotiationForm` failure was fixed by adding a missing result display section)
- [x] 4.4 Manual test: login → browse campaigns → click JOIN → select detachment → verify deployment in theater view
- [x] 4.5 Manual test: cancel dialog → verify no orphaned token in DB
- [x] 4.6 Manual test: reassignment — move detachment from campaign A to campaign B

---

## Design Decisions

- **Auto-generate token**: Keep the token-based architecture for consistency. The auto-generated token acts as a server-side authorization artifact.
- **Cancel deletes token**: Per user requirement — the cancel mutation finds the most recent auto-generated token for that user/campaign and deletes it.
- **Detachment reassignment is silent**: No confirmation dialog — the user explicitly chose the target campaign, matching existing `joinCampaign` behavior.
- **Excluded**: Existing manual invite flow unchanged. No new database migrations (reuse existing `campaign_invites` table).

---

## File Reference

| File                                                                        | Purpose                                     |
| --------------------------------------------------------------------------- | ------------------------------------------- |
| `backend/src/main/java/com/hotspotscamp/service/InviteService.java`         | Add `autoGenerateJoinToken` method          |
| `backend/src/main/java/com/hotspotscamp/service/CampaignService.java`       | Modify `joinCampaign` for auto-token flow   |
| `backend/src/main/java/com/hotspotscamp/api/CampaignGraphQLController.java` | Add `cancelJoinCampaign` mutation mapping   |
| `schema.graphqls` (root)                                                    | New GraphQL mutations                       |
| `frontend/src/components/ActiveCampaignsList.tsx`                           | Add join button to campaign cards           |
| `frontend/src/components/JoinCampaignDialog.tsx`                            | New: join dialog with detachment selector   |
| `frontend/src/gql/operations.ts`                                            | New mutation definitions                    |
| `frontend/src/App.tsx`                                                      | Wire dialog state                           |
| `frontend/src/components/CommandDashboard.tsx`                              | Reference for existing `joinCampaign` flow  |
| `frontend/src/components/CampaignTheaterView.tsx`                           | Reference for current detachment deployment |

---

## Further Considerations

1. **Access control**: Should any authenticated user be able to auto-join, or only campaign managers? Recommend any authenticated user.
2. **Race condition**: Two users joining with the same detachment simultaneously — consider `@Version` or unique constraint on `(detachment_id, campaign_id)`.
3. **Leave campaign**: Participants can already leave via `assignDetachmentToCampaign(detachmentId, null)` without a token. Could expose this in the theater view.
