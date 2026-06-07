import type { PlopTypes } from '@turbo/gen'

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('nextjs-app', {
    description: 'Create a new Next.js app',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'App name (kebab-case):',
        validate: (input: string) => {
          if (!input) return 'App name is required'
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return 'Must be kebab-case (lowercase letters, numbers, hyphens)'
          }
          return true
        },
      },
      {
        type: 'input',
        name: 'title',
        message: 'App title (for browser tab):',
        validate: (input: string) => {
          if (!input) return 'App title is required'
          return true
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'App description:',
        default: '',
      },
      {
        type: 'input',
        name: 'port',
        message: 'Dev server port:',
        default: '3000',
        validate: (input: string) => {
          const port = parseInt(input, 10)
          if (isNaN(port) || port < 1000 || port > 65535) {
            return 'Must be a valid port number (1000-65535)'
          }
          return true
        },
      },
    ],
    actions: [
      // App files
      {
        type: 'add',
        path: 'apps/{{name}}/app/layout.tsx',
        templateFile: 'templates/nextjs-app/app/layout.tsx.hbs',
      },
      {
        type: 'add',
        path: 'apps/{{name}}/app/page.tsx',
        templateFile: 'templates/nextjs-app/app/page.tsx.hbs',
      },
      {
        type: 'add',
        path: 'apps/{{name}}/app/globals.css',
        templateFile: 'templates/nextjs-app/app/globals.css.hbs',
      },
      {
        type: 'add',
        path: 'apps/{{name}}/app/error.tsx',
        templateFile: 'templates/nextjs-app/app/error.tsx.hbs',
      },
      {
        type: 'add',
        path: 'apps/{{name}}/app/global-error.tsx',
        templateFile: 'templates/nextjs-app/app/global-error.tsx.hbs',
      },
      // Placeholder folders
      {
        type: 'add',
        path: 'apps/{{name}}/app/_components/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'apps/{{name}}/app/_actions/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'apps/{{name}}/app/_config/.gitkeep',
        template: '',
      },
      // Config files
      {
        type: 'add',
        path: 'apps/{{name}}/package.json',
        templateFile: 'templates/nextjs-app/package.json.hbs',
      },
      {
        type: 'add',
        path: 'apps/{{name}}/tsconfig.json',
        templateFile: 'templates/nextjs-app/tsconfig.json.hbs',
      },
      {
        type: 'add',
        path: 'apps/{{name}}/next.config.js',
        templateFile: 'templates/nextjs-app/next.config.js.hbs',
      },
      {
        type: 'add',
        path: 'apps/{{name}}/eslint.config.js',
        templateFile: 'templates/nextjs-app/eslint.config.js.hbs',
      },
    ],
  })
}
