import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/users')({
  component: UsersComponent,
});

function UsersComponent() {
  return <Outlet />;
}
