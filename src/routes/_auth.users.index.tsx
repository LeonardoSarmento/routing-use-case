import { PendingComponent } from '@components/PendingComponent';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { PostByUserId } from '@services/hooks/postsByUser';
import { FilterSchema, FilterType } from '@services/types/Filters';
import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router';
import { SquareChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const USERS: { id: number; name: string }[] = [
  { id: 1, name: 'Allberson' },
  { id: 2, name: 'Caio' },
  { id: 3, name: 'David' },
  { id: 4, name: 'George' },
  { id: 5, name: 'Jeni' },
  { id: 6, name: 'Jesus' },
  { id: 7, name: 'Juca' },
  { id: 8, name: 'Lahra' },
  { id: 9, name: 'Leo' },
  { id: 10, name: 'Alecrim' },
  { id: 11, name: 'Matheus' },
  { id: 12, name: 'Natan' },
  { id: 13, name: 'Paulo' },
  { id: 14, name: 'Pedro' },
  { id: 15, name: 'Renato' },
  { id: 16, name: 'Vitor' },
];

export const Route = createFileRoute('/_auth/users/')({
  loaderDeps: ({ search: filters }) => filters,
  loader: ({ context: { queryClient }, deps: filters }) => queryClient.ensureQueryData(PostByUserId(filters)),
  validateSearch: FilterSchema,
  component: UsersComponent,
  errorComponent: () => <div className="flex items-center justify-center">Error component</div>,
  pendingComponent: PendingComponent,
});

function UsersComponent() {
  const posts = Route.useLoaderData();
  const navigate = useNavigate();
  const filters = useSearch({
    from: '/_auth/users/',
  });
  const form = useForm<FilterType>({
    resolver: zodResolver(FilterSchema),
    defaultValues: filters,
  });

  function NavigateComponent({ user }: { user: string }) {
    return (
      <Link to="/users/$id" params={{ id: user }}>
        <Button variant="ghost" className="flex w-full justify-between">
          <p>{user}</p>
          <SquareChevronRight />
        </Button>
      </Link>
    );
  }

  function onSubmit(data: FilterType) {
    console.log('data: ', data);
    navigate({
      to: '/users',
      search: {
        userId: data.userId,
      },
    });
  }
  function ResetFilter() {
    form.setValue('userId', undefined), navigate({ to: '/users' });
  }
  const { t } = useTranslation('users');

  return (
    <div className="flex flex-col flex-wrap gap-4 xl:mt-14 xl:flex-row xl:flex-nowrap">
      <div className="m-4 flex h-fit flex-shrink-0 flex-col rounded-md border-2 p-2">
        <div className="max-xl:hidden">
          <div>{t('menu.title')}</div>
          <div className="my-2 h-1 border-b-2" />
          {USERS.map((user) => (
            <NavigateComponent key={user.id} user={user.name} />
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="xl:hidden">
            <div>{t('menu.title')}</div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mt-4 w-[325px]">
            <DropdownMenuLabel>{t('menu.label')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {USERS.map((user) => (
              <NavigateComponent key={user.id} user={user.name} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mx-auto flex flex-col items-center max-sm:mx-4">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div>{t('forms.title')}</div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center">{t('forms.label')}</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        form.setValue('userId', +value);
                        navigate({ to: '/users', search: { userId: +value } });
                      }}
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString()}
                      key={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('forms.selectPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USERS.map((user) => (
                          <SelectItem value={user.id.toString()} key={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>{t('forms.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {filters.userId ? (
                <Button variant="destructive" onClick={ResetFilter} type="button">
                  {t('forms.reset')}
                </Button>
              ) : null}
            </form>
          </Form>
        </div>
        <div>
          {posts.type === 'success' ? (
            posts.data.length ? (
              posts.data.map((post) => (
                <Link
                  key={post.id}
                  to="/users/$id"
                  params={{ id: USERS.find((user) => user.id === post.userId)!.name }}
                  search={{ postId: post.id, userId: post.userId }}
                >
                  <div className="my-2 flex flex-col gap-2 rounded border p-2 hover:bg-accent hover:text-accent-foreground">
                    <div className="flex gap-2 border-b-2">
                      <p>{t('content.title')}</p>
                      <p>{post.id}</p>
                    </div>

                    <div>{post.title}</div>
                    <div>{post.body}</div>
                  </div>
                </Link>
              ))
            ) : (
              <div>{t('content.noContent')}</div>
            )
          ) : (
            <div className="flex flex-col gap-2">
              <div>{posts.data.title}</div>
              <div>{posts.data.body}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
