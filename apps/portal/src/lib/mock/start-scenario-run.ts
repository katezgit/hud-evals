/**
 * Mock scenario-run starter.
 *
 * Stands in for the future `POST /scenarios/:id/runs` endpoint. Returns a
 * known mock job id so the drawer can redirect into `/jobs/[id]` and the
 * existing job-detail mock resolves to a real fixture.
 */

const DEFAULT_JOB_ID = "job_3e1b08";

export interface StartScenarioRunResult {
  jobId: string;
}

export interface StartScenarioRunInput {
  envId: string;
  scenarioId: string;
  inputs: Record<string, unknown>;
}

export async function startScenarioRun(
  input: StartScenarioRunInput,
): Promise<StartScenarioRunResult> {
  void input;
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { jobId: DEFAULT_JOB_ID };
}
