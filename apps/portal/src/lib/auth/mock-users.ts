export type MockUser = {
  email: string;
  name: string;
};

// No persistence: store resets on dev reload — mock auth scaffold.
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
