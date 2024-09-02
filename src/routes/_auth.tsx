import { Card, CardContent } from '@components/ui/card';
import { UserAuthForm } from '@components/UserAuthForm';
import { useAuth } from '@services/hooks/auth';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  component: () => {
    if (!isAuthenticated()) {
      return <AuthComponent />;
    }
    return <Outlet />;
  },
});

function isAuthenticated() {
  const auth = useAuth();
  return auth.isAuthenticated;
}

function AuthComponent() {
  return (
    <div className="flex h-[500px] w-full items-center justify-center">
      <Card className="p-5">
        <CardContent>
          <UserAuthForm />
        </CardContent>
      </Card>
    </div>
  );
}
