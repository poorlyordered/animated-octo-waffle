import {
  createLeadershipFollowUpRequestSchema,
  followUpPrioritySchema,
  followUpStatusSchema
} from '../../packages/contracts/src/index';
import { getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { getMongoDb } from './_shared/mongo';
import {
  createLeadershipFollowUp,
  findMemberProfile,
  getPeopleIngestionProvenance,
  listLeadershipFollowUps,
  listMemberProfiles
} from './_shared/people-store';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

function peoplePathId(event: FunctionEvent, segment: 'members'): string | null {
  const match = event.path?.match(new RegExp(`/people/${segment}/([^/]+)$`));
  return match?.[1] ?? null;
}

function booleanFilter(value: string | undefined): boolean | undefined {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    const { corporationId } = getAuthScope(event);
    const db = await getMongoDb();
    const path = event.path ?? '';

    if (method === 'GET' && path.includes('/people/members')) {
      const id = peoplePathId(event, 'members');

      if (id) {
        const member = await findMemberProfile(db, corporationId, id);

        if (!member) {
          return safeErrorResponse('Member profile not found', 404);
        }

        const followUps = await listLeadershipFollowUps(db, corporationId, { memberProfileId: member.id });
        return jsonResponse(200, { member, followUps });
      }

      const activity = event.queryStringParameters?.activity;
      const members = await listMemberProfiles(db, corporationId, {
        activity: activity === 'active' || activity === 'stale' || activity === 'missing' ? activity : undefined,
        needsFollowUp: booleanFilter(event.queryStringParameters?.needsFollowUp)
      });
      const ingestionProvenance = await getPeopleIngestionProvenance(db, corporationId, members);
      return jsonResponse(200, { members, ingestionProvenance });
    }

    if (method === 'GET' && path.includes('/people/follow-ups')) {
      const status = event.queryStringParameters?.status
        ? followUpStatusSchema.parse(event.queryStringParameters.status)
        : undefined;
      const priority = event.queryStringParameters?.priority
        ? followUpPrioritySchema.parse(event.queryStringParameters.priority)
        : undefined;
      const followUps = await listLeadershipFollowUps(db, corporationId, {
        status,
        priority,
        memberProfileId: event.queryStringParameters?.memberProfileId
      });

      return jsonResponse(200, { followUps });
    }

    if (method === 'POST' && path.includes('/people/follow-ups')) {
      const request = createLeadershipFollowUpRequestSchema.parse(parseJsonBody(event));
      const followUp = await createLeadershipFollowUp(db, corporationId, request);

      if (!followUp) {
        return safeErrorResponse('Member profile not found', 404);
      }

      return jsonResponse(201, { followUp });
    }

    return safeErrorResponse('Method not allowed', 405);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    if (
      error instanceof Error &&
      (error.message === 'Explicit approval is required for player-impacting follow-ups' ||
        error.message === 'Leadership follow-up already exists for this member and reason')
    ) {
      return safeErrorResponse(error.message, 400);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('People request is invalid', 400);
    }

    return safeErrorResponse('Unable to update people operating layer');
  }
}
