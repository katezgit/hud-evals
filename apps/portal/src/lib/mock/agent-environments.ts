/**
 * Environment options for New Agent forms (Automation, Chat).
 *
 * Thin shape — id + display name + a short scenario list filtered to what's
 * runnable from that env. Mirrors the eventual
 * `GET /api/environments?for=agent-create` response.
 */

export interface AgentEnvironmentScenario {
  id: string;
  name: string;
}

export interface AgentEnvironment {
  id: string;
  name: string;
  scenarios: ReadonlyArray<AgentEnvironmentScenario>;
}

export const agentEnvironments: ReadonlyArray<AgentEnvironment> = [
  {
    id: "browserbase",
    name: "browserbase",
    scenarios: [
      { id: "browserbase:answer", name: "answer" },
      { id: "browserbase:fill-record", name: "fill-record" },
      { id: "browserbase:sheet-from-file", name: "sheet-from-file" },
      { id: "browserbase:wiki-speedrun", name: "wiki-speedrun" },
    ],
  },
  {
    id: "playwright",
    name: "playwright",
    scenarios: [
      { id: "playwright:dom-assertion", name: "dom-assertion" },
      { id: "playwright:form-fill", name: "form-fill" },
      { id: "playwright:navigation-trace", name: "navigation-trace" },
    ],
  },
  {
    id: "local-shell",
    name: "local-shell",
    scenarios: [
      { id: "local-shell:exec", name: "exec" },
      { id: "local-shell:file-edit", name: "file-edit" },
    ],
  },
  {
    id: "hud-browser",
    name: "hud-browser",
    scenarios: [
      { id: "hud-browser:2048-near-win", name: "2048-near-win" },
      { id: "hud-browser:todo-create", name: "todo-create" },
      { id: "hud-browser:wiki-hop", name: "wiki-hop" },
    ],
  },
];
