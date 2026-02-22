export interface SlfState {
  lastSuccessfulSync: number | null;
  lastError: string | null;
  consecutiveFailures: number;
  suspendedUntil: number | null;
}

export const slfState: SlfState = {
  lastSuccessfulSync: null,
  lastError: null,
  consecutiveFailures: 0,
  suspendedUntil: null,
};
