export interface EnvTemplate {
  id: string;
  name: string;
  description: string;
  repoUrl: string;
}

export const envTemplates: ReadonlyArray<EnvTemplate> = [
  {
    id: "blank",
    name: "Blank Environment",
    description:
      "A minimal starting template for creating custom environments from scratch.",
    repoUrl: "https://github.com/hud-evals/hud-blank",
  },
  {
    id: "deep-research",
    name: "Deep Research",
    description:
      "Advanced research environment with Exa search integration.",
    repoUrl: "https://github.com/hud-evals/hud-deepresearch",
  },
  {
    id: "rubrics",
    name: "Rubrics",
    description:
      "Environment for creating and evaluating with rubrics.",
    repoUrl: "https://github.com/hud-evals/hud-rubrics",
  },
  {
    id: "browser",
    name: "Browser",
    description: "Local browser automation environment.",
    repoUrl: "https://github.com/hud-evals/hud-browser",
  },
  {
    id: "remote-browser",
    name: "Remote Browser",
    description:
      "Cloud browser automation with Anchor, Steel, Browserbase, Kernel.",
    repoUrl: "https://github.com/hud-evals/hud-remote-browser",
  },
  {
    id: "coding",
    name: "Coding",
    description: "Full-featured coding environment.",
    repoUrl: "https://github.com/hud-evals/hud-coding",
  },
  {
    id: "data-science",
    name: "Data Science",
    description: "Analyze datasets in a sandboxed workspace.",
    repoUrl: "https://github.com/hud-evals/hud-datascience",
  },
  {
    id: "verilog",
    name: "Verilog Coding",
    description:
      "Implement digital logic modules, graded using iverilog and verilator.",
    repoUrl: "https://github.com/hud-evals/hud-verilog",
  },
];
