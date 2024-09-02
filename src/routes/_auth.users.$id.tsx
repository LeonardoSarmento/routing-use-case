import { Button } from '@components/ui/button';
import { UserPostById } from '@services/hooks/postsByUser';
import { FilterSchema } from '@services/types/Filters';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_auth/users/$id')({
  loaderDeps: ({ search: filters }) => filters,
  loader: ({ context: { queryClient }, deps: filters }) => queryClient.ensureQueryData(UserPostById(filters)),
  component: UserComponent,
  validateSearch: FilterSchema,
});

function UserComponent() {
  const { id } = Route.useParams();
  const post = Route.useLoaderData();
  const { t } = useTranslation('users');
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div>{t('byUser.title', { id: id })}</div>
      <div>
        {post.type === 'success' ? (
          <div className="my-2 flex flex-col gap-2 rounded border p-2">
            <div className="flex gap-2 border-b-2">
              <p>{t('content.title')}</p>
              <p>{post.data.id}</p>
            </div>

            <p>{post.data.title}</p>
            <p>{post.data.body}</p>
          </div>
        ) : null}
      </div>
      <Link to="/users">
        <Button variant="ghost">{t('byUser.goBack')}</Button>
      </Link>
    </div>
  );
}
