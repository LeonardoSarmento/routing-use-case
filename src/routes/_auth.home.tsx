import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/home')({
  component: () => <div>Hello /_auth/home!</div>,
});
