import { CustomError } from '../../../errors/error'
import { altitudeServiceInstance } from '../../altitude/instances/AltitudeServiceInstance'
import { BackgroundTaskResult } from '../../altitude/methods/BackgroundTask'

export async function waitForTaskCompletion(
  taskId: string,
  interval = 2000,
  maxAttempts = 60,
): Promise<BackgroundTaskResult> {
  let attempts = 0
  while (attempts < maxAttempts) {
    const result = await altitudeServiceInstance.getBackgroundTaskData(taskId)

    if (
      result.Status === 'Completed' ||
      result.Status === 'Finished' ||
      result.PercentageDone === 100
    ) {
      return result
    }

    if (result.Status === 'Error' || result.Status === 'Failed') {
      throw new CustomError(
        `Task ${taskId} falhou: ${JSON.stringify(result)}`,
        500,
      )
    }

    await new Promise((resolve) => setTimeout(resolve, interval))
    attempts++
  }

  throw new CustomError(
    `Task ${taskId} não terminou após ${maxAttempts} tentativas.`,
    500,
  )
}
