import { localRepository } from '../infrastructure/local.repository';
import { azureAdStub } from '../infrastructure/azuread.stub';
import type { User } from '../types/audit.types';

const ACTIVE_USER_KEY = 'active-user';

export const authService = {
  getActiveUser(): User | null {
    return localRepository.read<User | null>(ACTIVE_USER_KEY, null);
  },
  setActiveUser(user: User): void {
    localRepository.write(ACTIVE_USER_KEY, user);
  },
  async loginViaAzureAdStub(): Promise<User | null> {
    return azureAdStub.loginWithAzureAd();
  }
};

// TODO(Phase 2): Add claims-based role mapping and session refresh using Azure AD.
