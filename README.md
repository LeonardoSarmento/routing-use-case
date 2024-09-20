## Project - Routing and State Managment use case.

Use case to apply routing and state managment to a project.

### Main Techs

- Router : `@tanstack/react-router` (^1.57.10)
- State Managment : `@tanstack/query` (^5.56.0)

### Project Techs

- Language : `TypeScript` (^5.6.2)
- Web Application framework : `Vite` (^5.4.4)
- Markdown Viewer : `@uiw/react-markdown-preview` (^5.1.2)
- React i18n: `react-i18next` (^15.0.1)
- Form : `react-hook-form` (^7.52.2)
- Validation : `zod` (^3.23.8)
- Styling : `tailwindcss` (^3.4.11)

- Lint : `eslint` (^8.57.0)
- Formatting : `prettier` (^3.3.3)

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.app.json'],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

Update dependencies:

```bash

npx npm-check-updates -u

```
