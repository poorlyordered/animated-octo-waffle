import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { AutomationQueueRoute } from '../../../routes/AutomationQueueRoute';
import { CommandBriefRoute } from '../../../routes/CommandBriefRoute';
import { DecisionRecordsRoute } from '../../../routes/DecisionRecordsRoute';
import { NumbersRoute } from '../../../routes/NumbersRoute';
import { OpportunityRoute } from '../../../routes/OpportunityRoute';
import { PeopleRoute } from '../../../routes/PeopleRoute';

const LazyCommanderChatRoute = lazy(() =>
  import('../../../routes/CommanderChatRoute').then((module) => ({ default: module.CommanderChatRoute }))
);
const LazyEsiSyncRoute = lazy(() =>
  import('../../../routes/EsiSyncRoute').then((module) => ({ default: module.EsiSyncRoute }))
);
const LazyIntelligenceRefreshRoute = lazy(() =>
  import('../../../routes/IntelligenceRefreshRoute').then((module) => ({ default: module.IntelligenceRefreshRoute }))
);
const LazyOperationsHealthRoute = lazy(() =>
  import('../../../routes/OperationsHealthRoute').then((module) => ({ default: module.OperationsHealthRoute }))
);
const LazyProductionEvidenceRoute = lazy(() =>
  import('../../../routes/ProductionEvidenceRoute').then((module) => ({ default: module.ProductionEvidenceRoute }))
);

const commandSurfaces = [
  {
    id: 'brief',
    label: 'Brief',
    eyebrow: 'Command state',
    title: 'Corporation state',
    description: 'Latest processed assessment, coverage, recommendations, and evidence.'
  },
  {
    id: 'opportunity',
    label: 'Opportunity',
    eyebrow: 'Opportunity',
    title: 'Signals and openings',
    description: 'Strategic impacts, watchlists, ingestion status, and decision handoffs.'
  },
  {
    id: 'numbers',
    label: 'Numbers',
    eyebrow: 'Numbers',
    title: 'Operational health',
    description: 'Wallet, assets, logistics, market, and activity snapshots.'
  },
  {
    id: 'decisions',
    label: 'Decisions',
    eyebrow: 'Authority',
    title: 'Decision loop',
    description: 'Proposed, approved, delegated, rejected, and completed command decisions.'
  },
  {
    id: 'queue',
    label: 'Queue',
    eyebrow: 'Automation',
    title: 'Queued work',
    description: 'Auditable work preparation without silent execution.'
  },
  {
    id: 'people',
    label: 'People',
    eyebrow: 'People',
    title: 'Leadership layer',
    description: 'Members, roles, follow-ups, onboarding, and delegation context.'
  },
  {
    id: 'sync',
    label: 'Sync',
    eyebrow: 'Data pull',
    title: 'ESI sync',
    description: 'Read-only source capture and provenance for corporation data.'
  },
  {
    id: 'refresh',
    label: 'Refresh',
    eyebrow: 'Evaluation',
    title: 'Intel refresh',
    description: 'Durable refresh runs, worker steps, Brain linkage, and retry posture.'
  },
  {
    id: 'chat',
    label: 'Chat',
    eyebrow: 'Commander chat',
    title: 'Cited advisory',
    description: 'Durable chat over command state with draft decision support.'
  },
  {
    id: 'health',
    label: 'Health',
    eyebrow: 'Operations',
    title: 'System posture',
    description: 'Runtime health, stale data, warnings, and non-execution boundaries.'
  },
  {
    id: 'evidence',
    label: 'Evidence',
    eyebrow: 'Production',
    title: 'Evidence trail',
    description: 'Deployment and production validation records.'
  }
];

function CommandSurface({
  id,
  children
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="command-surface">
      {children}
    </section>
  );
}

function CommandSurfaceFallback({ label }: { label: string }) {
  return (
    <main className="command-brief command-surface-fallback" aria-label={`${label} loading`}>
      Loading {label}...
    </main>
  );
}

export function CommandShell() {
  return (
    <main className="command-shell" aria-label="Gryyk-47 command control">
      <header className="command-control-hero">
        <div>
          <p className="eyebrow">Gryyk-47 Control</p>
          <h1>Corporation command board</h1>
          <p className="command-control-copy">
            Inspect the operating loop from signal capture through recommendation, decision, queued work, and production evidence.
          </p>
        </div>
        <aside className="command-control-boundary" aria-label="Command authority boundary">
          <span>Authority boundary</span>
          <strong>Review, approve, then act</strong>
          <p>No surface silently writes to EVE, dispatches workers, or changes player state.</p>
        </aside>
      </header>

      <nav className="command-nav" aria-label="Command surfaces">
        {commandSurfaces.map((surface) => (
          <a href={`#${surface.id}`} key={surface.id}>
            {surface.label}
          </a>
        ))}
      </nav>

      <section className="command-overview" aria-label="Command overview">
        {commandSurfaces.slice(0, 8).map((surface) => (
          <a className="command-overview-item" href={`#${surface.id}`} key={surface.id}>
            <span>{surface.eyebrow}</span>
            <strong>{surface.title}</strong>
            <p>{surface.description}</p>
          </a>
        ))}
      </section>

      <div className="command-surface-stack">
        <CommandSurface id="brief">
          <CommandBriefRoute />
        </CommandSurface>
        <CommandSurface id="opportunity">
          <OpportunityRoute />
        </CommandSurface>
        <CommandSurface id="numbers">
          <NumbersRoute />
        </CommandSurface>
        <CommandSurface id="decisions">
          <DecisionRecordsRoute />
        </CommandSurface>
        <CommandSurface id="queue">
          <AutomationQueueRoute />
        </CommandSurface>
        <CommandSurface id="people">
          <PeopleRoute />
        </CommandSurface>
        <CommandSurface id="sync">
          <Suspense fallback={<CommandSurfaceFallback label="ESI sync" />}>
            <LazyEsiSyncRoute />
          </Suspense>
        </CommandSurface>
        <CommandSurface id="refresh">
          <Suspense fallback={<CommandSurfaceFallback label="intelligence refresh" />}>
            <LazyIntelligenceRefreshRoute />
          </Suspense>
        </CommandSurface>
        <CommandSurface id="chat">
          <Suspense fallback={<CommandSurfaceFallback label="commander chat" />}>
            <LazyCommanderChatRoute />
          </Suspense>
        </CommandSurface>
        <CommandSurface id="health">
          <Suspense fallback={<CommandSurfaceFallback label="operations health" />}>
            <LazyOperationsHealthRoute />
          </Suspense>
        </CommandSurface>
        <CommandSurface id="evidence">
          <Suspense fallback={<CommandSurfaceFallback label="production evidence" />}>
            <LazyProductionEvidenceRoute />
          </Suspense>
        </CommandSurface>
      </div>
    </main>
  );
}
