/**
 * In-memory mock user store.
 *
 * No persistence — registrations evaporate on dev reload. That's intentional:
 * this is a portfolio scaffold, not a real auth system.
 */

export type MockUser = {
  email: string;
  name: string;
};

// Module-scoped store. Reset whenever the dev server reloads this module.
const users = new Map<string, MockUser>([
  ["demo@hud.app", { email: "demo@hud.app", name: "Demo User" }],
]);

export function upsertUser(user: MockUser): MockUser {
  users.set(user.email.toLowerCase(), {
    email: user.email,
    name: user.name,
  });
  return user;
}

export function findUser(email: string): MockUser | undefined {
  return users.get(email.toLowerCase());
}
