# Data Model: M46 Production Operations Follow-up

This slice introduces no runtime data model changes.

## Operations Evidence Record

- `commitSha`: Reviewed commit intended for deployment.
- `prUrl`: Pull request or merge reference for the deployed change.
- `environment`: Staging or production target.
- `validationResults`: Local command gate result summary.
- `netlifyEnvironmentStatus`: Required variable names present or absent, without values.
- `eveSsoStatus`: Callback URL, scope, authorized session, and unauthorized session verification status.
- `mongodbStatus`: Database target, backup, restore, index, retention, and least-privilege status.
- `monitoringStatus`: Owner, alert destination, severity threshold, and first-response expectation.
- `rollbackTarget`: Previous known-good deploy id or commit.
- `approval`: Commander/operator go, no-go, or controlled-staging decision.

## Worker Rotation Record

- `workerClass`: Worker callback class under rotation.
- `environment`: Target environment.
- `rotationTimestamp`: Time the rotation was verified.
- `verifier`: Operator who verified the rotation.
- `status`: Pass or fail.
- `notes`: Value-free operational notes.

## Incident Rollback Record

- `failingDeploy`: Deploy id or commit SHA.
- `symptomSummary`: Value-free failure description.
- `rollbackTarget`: Previous known-good deploy id or commit.
- `verificationResult`: Smoke result after rollback.
- `followUpOwner`: Owner for the corrective follow-up.
