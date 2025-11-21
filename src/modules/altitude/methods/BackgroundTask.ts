import { uAgentWeb } from "../../../config/axios";

export interface BackgroundTaskResult {
  Id: number;
  Status: string;
  StatusDescription: string;
  PercentageDone: number;
  CreationMoment: string;
  StartMoment: string;
  EndMoment: string;
  Internal: any;
}

export async function getBackgroundTask(
  taskId: string,
  token: string,
  apiVersion: string,
) {
  const response = await uAgentWeb.get(
    `/api/instance/instanceManager/backgroundTaskData?taskId=${taskId}&api-version=${apiVersion}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data as BackgroundTaskResult;
}
