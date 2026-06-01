# Data Model: People Operating Layer

## MemberProfile

Represents a command-facing profile for one corporation member.

Persistence:

- Read from MongoDB `member_profiles` when present.
- Existing broader people context can be normalized into this shape only when it contains member-scoped fields.
- M4 does not run people sync or mutate EVE roles/access.

Fields:

- `id`: stable member profile identifier.
- `corporationId`: server-owned corporation scope.
- `characterId`: EVE character identifier when known.
- `displayName`: member display name.
- `aliases`: optional known aliases.
- `profileSummary`: commander-readable profile summary.
- `roleContext`: role and access context.
- `activitySummary`: activity recency and participation context.
- `delegationNotes`: leadership/delegation notes.
- `followUpSummary`: aggregate open/completed/blocked follow-up counts.
- `coverage`: people data coverage and missing/stale reasons.
- `sourceRefs`: source references that support the profile.
- `lastObservedAt`: latest source observation timestamp.
- `createdAt`: ISO timestamp when the profile was created.
- `updatedAt`: ISO timestamp when the profile was last updated.

Validation rules:

- `corporationId`, `displayName`, `roleContext`, `activitySummary`, `coverage`, `createdAt`, and `updatedAt` are required.
- Missing `characterId` is allowed but must be surfaced as missing identity data.
- Browser-provided corporation identity is ignored; server-owned scope is authoritative.

## MemberRoleContext

Represents known role, access, title, or group context for a member.

Fields:

- `roles`: known role names.
- `titles`: known title or group names.
- `accessNotes`: commander-readable access context.
- `isStale`: whether role data is stale.
- `lastObservedAt`: source timestamp for role context.
- `missingReasons`: missing-data notes.

Validation rules:

- `roles`, `titles`, and `missingReasons` are arrays.
- Stale role context must be visibly marked.
- Role context does not grant, revoke, or change access in M4.

## MemberActivitySummary

Represents measurable member activity context.

Fields:

- `lastActiveAt`: latest known activity timestamp.
- `activityLabel`: human-readable activity state such as active, quiet, stale, or unknown.
- `participationCount`: optional recent participation count.
- `staleAfterDays`: age threshold used to mark stale data.
- `isStale`: whether activity data is stale.
- `missingReasons`: missing-data notes.

Validation rules:

- `activityLabel`, `isStale`, and `missingReasons` are required.
- Missing activity timestamps must be surfaced as unknown or missing.

## PeopleDataCoverage

Represents coverage and missing data for people operations.

Fields:

- `identity`: one of `present`, `missing`, or `stale`.
- `roles`: one of `present`, `missing`, or `stale`.
- `activity`: one of `present`, `missing`, or `stale`.
- `delegation`: one of `present`, `missing`, or `stale`.
- `missingReasons`: missing-data notes.

Validation rules:

- All coverage legs are required.
- Missing or stale critical fields must include at least one reason.

## LeadershipFollowUp

Represents a durable leadership follow-up linked to a member.

Persistence:

- Stored in MongoDB `leadership_followups`.
- May reference a decision record or automation queue item without mutating either source record.

Fields:

- `id`: stable follow-up identifier.
- `corporationId`: server-owned corporation scope.
- `memberProfileId`: source member profile identifier.
- `memberDisplayName`: denormalized member name for list views.
- `reason`: follow-up reason.
- `priority`: one of `low`, `medium`, `high`, or `urgent`.
- `status`: one of `open`, `blocked`, `completed`, or `canceled`.
- `owner`: optional leadership owner.
- `dueAt`: optional ISO due timestamp.
- `sourceDecisionId`: optional linked decision record.
- `sourceQueueItemId`: optional linked automation queue item.
- `isPlayerImpacting`: whether the follow-up could affect players, roles, access, permissions, standings, wallets, contracts, or external services.
- `approval`: explicit approval snapshot when present.
- `sourceContext`: immutable context captured at follow-up creation time.
- `createdAt`: ISO timestamp when the follow-up was created.
- `updatedAt`: ISO timestamp when the follow-up was last changed.

Validation rules:

- `corporationId`, `memberProfileId`, `memberDisplayName`, `reason`, `priority`, `status`, `sourceContext`, `createdAt`, and `updatedAt` are required.
- New follow-ups start with status `open`.
- `reason` must not be empty.
- Duplicate follow-ups for the same member and reason must be rejected or clearly surfaced.
- Player-impacting follow-ups must remain follow-up records only; approval does not execute access or role changes.

## FollowUpSourceContext

Captures source context at follow-up creation time.

Fields:

- `memberProfileId`: source member profile identifier.
- `memberDisplayName`: member display name.
- `profileUpdatedAt`: profile timestamp when the follow-up was created.
- `decisionId`: optional linked decision identifier.
- `queueItemId`: optional linked queue item identifier.
- `coverage`: people data coverage at creation time.
- `createdAt`: ISO timestamp for the source context snapshot.

Validation rules:

- `memberProfileId`, `memberDisplayName`, `coverage`, and `createdAt` are required.
- Missing linked decision or queue records must not invalidate the follow-up.
