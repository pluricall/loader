import { altitudeServiceInstance } from "../../altitude/instances/AltitudeServiceInstance";
import { BackgroundTaskResult } from "../../altitude/methods/BackgroundTask";

interface WaitForTaskOptions {
  interval?: number;
  maxAttempts?: number;
  bdTitle?: string;
  files?: string[];
  onWarning?: (taskResult: BackgroundTaskResult) => Promise<void>;
  onSuccess?: (taskResult: BackgroundTaskResult) => Promise<void>;
}

export async function waitForTaskCompletion(
  taskId: string,
  {
    interval = 2000,
    maxAttempts = 60,
    bdTitle,
    onWarning,
    onSuccess,
  }: WaitForTaskOptions = {},
): Promise<BackgroundTaskResult> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const result = await altitudeServiceInstance.getBackgroundTaskData(taskId);

    if (
      result.Status === "Completed" ||
      result.Status === "Finished" ||
      result.PercentageDone === 100
    ) {
      // Detecta warning
      const warningDetected =
        result.Status === "Completed" &&
        (result.StatusDescription?.toLowerCase().includes(
          "rows were rejected",
        ) ||
          (Array.isArray(result.Internal) &&
            result.Internal.includes(
              "LPTS_TASK_AUX_STATUS_DAT_LINES_DISCARDED",
            )));

      if (warningDetected && bdTitle) {
        try {
          if (onWarning) {
            await onWarning(result);
          }
        } catch (err) {
          console.warn("⚠️ Falha ao enviar e-mail de aviso:", err);
        }
      }

      if (onSuccess) {
        await onSuccess(result);
      }

      return result;
    }

    if (result.Status === "Error" || result.Status === "Failed") {
      throw new Error(`Task ${taskId} falhou: ${JSON.stringify(result)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
    attempts++;
  }

  throw new Error(
    `Task ${taskId} não terminou após ${maxAttempts} tentativas.`,
  );
}
