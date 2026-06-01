export type SessionScopeSource = 'session' | 'fallback' | 'missing';

export interface EveSessionScope {
  characterId: string;
  characterName: string;
  corporationId: string;
  corporationName: string;
  issuedAt: string;
  expiresAt: string;
  source: 'eve-sso';
}

export interface EveSsoState {
  state: string;
  returnTo: string;
  issuedAt: string;
  expiresAt: string;
}

export type SessionStateResponse =
  | {
      signedIn: true;
      scopeSource: 'session';
      characterId: string;
      characterName: string;
      corporationId: string;
      corporationName: string;
      expiresAt: string;
    }
  | {
      signedIn: false;
      scopeSource: 'fallback';
      corporationId: string;
    }
  | {
      signedIn: false;
      scopeSource: 'missing';
    };

export interface ScopeResolutionResult {
  corporationId: string;
  source: 'session' | 'fallback';
  session?: EveSessionScope;
}
