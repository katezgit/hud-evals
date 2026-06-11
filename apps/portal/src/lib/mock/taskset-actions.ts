"use server";

import {
  createTaskset as createTasksetMock,
  setTasksetVisibility as setTasksetVisibilityMock,
  type Taskset,
  type TasksetPurpose,
  type TasksetVisibility,
} from "./tasksets";

// Server actions that close over the server-side module's `tasksets` array.
// Client-side mutations don't propagate to the Node server's module cache,
// so any UI flow that needs the next server render to reflect the change has
// to round-trip through one of these.

export async function createTasksetAction(input: {
  name: string;
  purpose: TasksetPurpose;
}): Promise<Taskset> {
  // Tiny artificial latency so the dialog spinner is observable in the demo.
  await new Promise((resolve) => setTimeout(resolve, 200));
  return createTasksetMock(input);
}

export async function setTasksetVisibilityAction(
  id: string,
  visibility: TasksetVisibility,
): Promise<Taskset | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return setTasksetVisibilityMock(id, visibility);
}
