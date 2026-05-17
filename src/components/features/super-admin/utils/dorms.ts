import { getApiErrorMessage, superAdminService } from '@/lib/api';
import type { DormWithLocation } from '@/lib/api/types';

/** Load dorms for a single client (GET /super-admin/clients/dorms?clientId=CLIENT_xxx). */
export async function fetchDormsForClient(clientId: string): Promise<{
  dorms: DormWithLocation[];
  error: string | null;
}> {
  if (!clientId) {
    return { dorms: [], error: null };
  }

  try {
    const dorms = await superAdminService.getDorms({ clientId });
    return {
      dorms: dorms.map((dorm) => ({
        ...dorm,
        clientId: dorm.clientId || clientId,
      })),
      error: null,
    };
  } catch (error) {
    return {
      dorms: [],
      error: getApiErrorMessage(error, 'Failed to load dorms'),
    };
  }
}
