## Setting Up Your Project with Dynamic Routing and State Management

The **TanStack Router** is an excellent choice for projects seeking high performance and strong TypeScript typing, while also simplifying routing in React applications. Here's a detailed step-by-step guide to setting up a project with **TanStack Router**, **Vite**, and **TypeScript**.

In this example, we will configure functionalities such as **Authentication Context**, **Data Loading through Loader**, **Data Management**, and **Using URL Parameters to Store Data for Requests**.

---

### 1. Create Your Project with Vite

First, initialize a project with Vite configured for React and TypeScript. In the terminal, run:

```bash
npm create vite@latest
```

Set up your project for React and TypeScript.

### 2. Installing TanStack Router and TanStack Query

Install **TanStack Query**, **TanStack Router**, their Dev Tools, and the Vite plugin:

```bash
npm i @tanstack/react-router @tanstack/react-query @tanstack/react-query-devtools
npm i -D @tanstack/router-plugin @tanstack/router-devtools
```

If you'd like to configure Vite for automatic route generation based on files, modify the `vite.config.ts` file to include the TanStack Router plugin:

`vite.config.ts`

```ts
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    viteReact(),
    // ...,
  ],
});
```

---

### 3. Configuring Hooks for Authentication Management

Set up a hook to manage the authentication context:

`src/services/hooks/auth.tsx`

```ts
import * as React from 'react';
import { sleep } from '@services/utils/utils';
import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string({ required_error: 'The field is required, buddy' }).trim(),
  password: z
    .string({ required_error: 'We need it to test on the machine' })
    .min(3, { message: 'You’re missing numbers here, friend' })
    .max(14, { message: 'Whoa, friend, this isn’t German, why so many letters?' })
    .trim(),
});

export type LoginType = z.infer<typeof LoginSchema>;

export interface AuthContext {
  isAuthenticated: boolean;
  login: (login: LoginType, token: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
  user: string | null;
}

const AuthContext = React.createContext<AuthContext | null>(null);

const key = 'boilerplate.auth.user';

export function getStoredUser() {
  return localStorage.getItem(key);
}

function setStoredUser(user: string | null) {
  if (user) {
    localStorage.setItem(key, user);
  } else {
    localStorage.removeItem(key);
  }
}

const keyToken = 'boilerplate.auth.token';

export function getStoredToken() {
  return localStorage.getItem(keyToken);
}

function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(keyToken, token);
  } else {
    localStorage.removeItem(key);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<string | null>(getStoredUser());
  const [token, setToken] = React.useState<string | null>(getStoredToken());
  const isAuthenticated = !!user;

  const logout = React.useCallback(async () => {
    await sleep(250);

    setStoredUser(null);
    setUser(null);
  }, []);

  const login = React.useCallback(async (login: LoginType, token: string) => {
    await sleep(500);

    setStoredUser(login.username);
    setUser(login.username);
    setStoredToken(token);
    setToken(token);
  }, []);

  React.useEffect(() => {
    setUser(getStoredUser());
    setToken(getStoredToken());
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, token }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

### 4. Creating the Routes

Now, create a directory structure for the routes. The TanStack Router can infer routes from file names. In the `src` folder, create a folder called `routes` with the following files:

```bash
src/
└── routes/
    ├── __root.tsx
    ├── index.tsx
    ├── about.tsx
    ├── _auth.tsx
    ├── _auth.index.tsx
    ├── _auth.home.tsx
```

In the `__root.tsx` file, configure the structure for route usage with context and layout, including links for navigation:

In the function to create the root route, `createRootRouteWithContext`, pass the `QueryClient` and `AuthContext` properties.

`src/routes/__root.tsx`

```tsx
import { AuthContext, useAuth } from '@services/hooks/auth';
import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { Suspense } from 'react';

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  auth: AuthContext;
}>()({
  component: RootComponent,
});

function RootComponent() {
  const auth = useAuth();
  return (
    <>
      <div className="flex min-h-screen w-screen flex-col justify-between px-2 pb-6 xl:px-10">
        <div className="flex w-full flex-wrap-reverse items-center gap-4 py-2 sm:my-2 md:flex-nowrap xl:gap-2 xl:space-x-7">
          <div className="hidden w-full justify-center md:order-first md:flex xl:w-1/3 xl:justify-start">
            <a href="https://github.com/LeonardoSarmento/routing-use-case" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="gap-3">
                <Github />
                <p className="text-base underline underline-offset-4 max-md:hidden">routing-use-case</p>
              </Button>
            </a>
          </div>
          <div className="flex w-full flex-wrap justify-around justify-items-center gap-3 xl:w-1/3">
            <Link to="/" className="[&.active]:font-bold">
              Welcome
            </Link>
            <Link to="/home" className="[&.active]:font-bold">
              {t('home')}
            </Link>
            <Link to="/users" className="[&.active]:font-bold">
              {t('users')}
            </Link>
            <Link to="/config" className="[&.active]:font-bold">
              {t('config')}
            </Link>
          </div>
          <div className="flex w-full justify-around gap-3 md:justify-end xl:w-1/3">
            {auth.isAuthenticated ? <Button onClick={() => auth.logout()}>Logout</Button> : null}
            <div className="md:hidden">
              <a href="https://github.com/LeonardoSarmento/routing-use-case" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="gap-3">
                  <Github />
                  <p className="text-base underline underline-offset-4 max-md:hidden">routing-use-case</p>
                </Button>
              </a>
            </div>
            <PortfolioNav />
            <SelectLanguage />
            <ModeToggle className="justify-self-end" />
          </div>
        </div>
        <Outlet />
      </div>
      <Suspense>
        <ReactQueryDevtools initialIsOpen={false} />
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}
```

Next, configure the `index.tsx`, `about.tsx`, `_auth.tsx`, and `_auth.index.tsx` files to define the application routes:

`src/routes/index.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  );
}
```

`src/routes/about.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return <div className="p-2">Hello from About!</div>;
}
```

`src/routes/_auth.tsx`

```tsx
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
      <UserAuthForm />
    </div>
  );
}
```

`src/routes/_auth.home.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/home')({
  component: () => <div>Hello /_auth/home!</div>,
});
```

`src/routes/_auth.index.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/')({
  component: () => <div>Hello /_auth/!</div>,
});
```

For the `UserAuthForm` component, you can implement your own login form logic as long as you use the functions from the Hook created in `src/services/hooks/auth.tsx`. An example of usage would be the following:

```ts
import { useAuth } from '@services/hooks/auth';
import { useRouter } from '@tanstack/react-router';

const auth = useAuth();
const router = useRouter();
const onSubmit = form.handleSubmit((values) => {
  if (values.username === 'admin' && values.password === 'admin') {
    auth.login(values, 'skajdksjakdj').then(() => router.invalidate());
    toast.success(t('toastMessage.success.title'));
    return;
  }
  toast.error(t('toastMessage.error.title'));
});
```

---

### 5. Generating the Route Tree File

To connect the created routes, TanStack Router automatically generates a file called `routeTree.gen.ts`. This file organizes all routes and defines their relationships. Start the development environment to generate the route tree:

```bash
npm run dev
```

This will create a file with the inferred routes in the `src` folder called `routeTree.gen.ts`.

Whenever there are changes in the files, the router will check the routes and regenerate them. As long as no errors are indicated, all routes will be available for use.

---

### 6. Configuring the Router and Query in the Application

Set up your project to use **TanStack Query** throughout your application:

`src/services/providers/QueryProvider.tsx`

```ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

export const queryClient = new QueryClient();

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

Finally, connect the `QueryProvider` and router in the `main.tsx` file:

`src/main.tsx`

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { AuthProvider, useAuth } from '@services/hooks/auth';
import { queryClient, QueryProvider } from '@services/providers/QueryProvider';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined!,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <InnerApp />
      </QueryProvider>
    </AuthProvider>
  );
}

const container = document.getElementById('

root');
if (container) {
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  );
}
```

---

### 7. Using Loader with URL Parameters

Now that the application is fully configured, you can take advantage of features like using URL parameters in requests.

One advantage of using this feature is that it stores the entire search history in the URL, allowing the user to share or save it for later use.

First, define which parameters will be used by creating a Schema with the `Zod` library for validation of the URL format:

```ts
import { z } from 'zod';

export const FilterSchema = z.object({
  userId: z.number().optional().catch(undefined),
  postId: z.number().optional().catch(undefined),
});

export type FilterType = z.infer<typeof FilterSchema>;
```

Create the following hook that accesses user post data (adjust the return to the format of the request you want to use in your project):

```ts
import api from '@services/Axios';
import { FilterType } from '@services/types/Filters';
import { PostSchema, PostType } from '@services/types/Posts';
import { queryOptions } from '@tanstack/react-query';

const GetUserPostById = async (filter: FilterType): Promise<ReturnUserPostType> => {
  if (!filter.postId && !filter.userId) return { type: 'error', data: placeholderPost };
  const { data } = await api.get<PostType[]>('posts', { params: filter });

  const validatedPost = PostSchema.array().safeParse(data);
  if (!validatedPost.success) {
    return { type: 'error', data: placeholderPost };
  }
  return { type: 'success', data: validatedPost.data };
};

export function UserPostById(filter: FilterType) {
  return queryOptions({
    queryKey: ['posts-by-user', filter],
    queryFn: () => GetUserPostById(filter),
  });
}
```

After creating the hook, you can use it on the created page.

Pass the **Zod** schema to `validateSearch`, capture the parameters through `loaderDeps`, and access them in `loader` using **queryClient** functions via the previously configured context.

Now, when this page is accessed, the post data will be loaded. You just need to use the `useLoaderData` function provided by the **Route**:

```ts
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
  const { t } = useTranslation('users');

  const { id } = Route.useParams();
  const post = Route.useLoaderData();

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
```

---

### Conclusion

You now have a fully configured project with **Vite**, **TanStack Router**, **TanStack Query**, and **React**. This setup offers complete TypeScript typing, file-based routing, asynchronous component loading, and optimized performance with route prefetching.

This guide provides a solid overview of the initial configuration, but TanStack Router has many advanced features, which you can explore as your application grows.

If you're interested, the link to the **repository** is: [Routing - Use case](https://github.com/LeonardoSarmento/routing-use-case)

Come back often :)
