import { getApiErrorMessage, superAdminService } from '@/lib/api';
import type { DormWithLocation, SuperAdminDormsOverviewResponse } from '@/lib/api/types';

export const flattenDormsFromOverview = (
  overview: SuperAdminDormsOverviewResponse,
  clientId?: string,
): DormWithLocation[] => {
  const bundles = clientId
    ? overview.clients.filter((client) => client.clientId === clientId)
    : overview.clients;

  return bundles.flatMap((client) =>
    client.dorms.map((dorm) => ({
      ...dorm,
      clientId: dorm.clientId || client.clientId,
    })),
  );
};

/** POST /super-admin/clients/dorms/list */
export async function fetchDormsForClient(clientId: string): Promise<{
  dorms: DormWithLocation[];
  error: string | null;
}> {
  if (!clientId) {
    return { dorms: [], error: null };
  }

  try {
    const dorms = await superAdminService.listDorms({ clientId });
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

export async function fetchDormsOverview(clientId?: string): Promise<{
  overview: SuperAdminDormsOverviewResponse | null;
  dorms: DormWithLocation[];
  error: string | null;
}> {
  try {
    const overview = await superAdminService.getDormsOverview(
      clientId ? { clientId } : {},
    );

    return {
      overview,
      dorms: flattenDormsFromOverview(overview, clientId),
      error: null,
    };
  } catch (error) {
    return {
      overview: null,
      dorms: [],
      error: getApiErrorMessage(error, 'Failed to load dorms overview'),
    };
  }
}
