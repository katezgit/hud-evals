import type { Preview } from "@storybook/react";
import React from "react";
import "../src/styles.css";

// IBM Plex fonts — preview-only, loaded via Google Fonts.
// Weights 100–700 for both Sans and Mono so all token weights render correctly.
const link = document.createElement("link");
link.rel = "stylesheet";
link.href =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap";
document.head.appendChild(link);

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Light / Dark theme",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) ?? "light";
      // Paint the iframe body so the theme background covers the full canvas,
      // not just the story content area.
      if (typeof document !== "undefined") {
        document.body.setAttribute("data-theme", theme);
        document.body.classList.add("bg-background", "text-foreground");
      }
      return React.createElement(
        "div",
        { style: { padding: 16 } },
        React.createElement(Story),
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Design Tokens",
          [
            "1. Colors",
            "2. Typography",
            "3. Spacing",
            "4. Sizing",
            "5. Elevation",
            "6. Motion",
          ],
          "Components",
          "*",
        ],
      },
    },
  },
};

export default preview;
