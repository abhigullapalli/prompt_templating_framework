import type { User } from '../types/audit.types';

export const azureAdStub = {
  async loginWithAzureAd(): Promise<User | null> {
    // TODO(Phase 2): Integrate with Azure AD OAuth + token validation.
    return null;
  }
};
