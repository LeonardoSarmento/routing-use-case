## Configurando o seu projeto com roteamento dinamico e gerenciamento de estados

O **TanStack Router** é uma excelente escolha para projetos que buscam alta performance e forte tipagem com TypeScript, além de facilitar o roteamento em aplicações React. Aqui vai um passo a passo detalhado para configurar um projeto com **TanStack Router**, **Vite** e **TypeScript**.

Nesse exemplo utilizaremos configurações onde conseguiremos nos aproveitar de funcionalidades como **Contexto de Autentificação**, **Carregamento de dados através do Loader**,**Gerenciamento de Dados** e **Utilização de parâmetros na URL para armazenar dados a serem usados na requisição**.

---

### 1. Crie seu Projeto com Vite

Primeiro, inicie um projeto com Vite configurado para React e TypeScript. No terminal, execute:

```bash
npm create vite@latest
```

Configure seu projeto para o uso com React e Typescript.

### 2. Instalando TanStack Router e Tanstack Query

Instale o **TanStack Query**, **TanStack Router**, seus Dev Tools e o plugin para Vite:

```bash
npm i @tanstack/react-router @tanstack/react-query @tanstack/react-query-devtools
npm i -D @tanstack/router-plugin @tanstack/router-devtools
```

Se você quiser configurar o Vite para trabalhar com geração automática de rotas baseada em arquivos, modifique o arquivo `vite.config.ts` para incluir o plugin do TanStack Router:

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

### 3. Configurando Hooks para gerenciar autentificação

Configure o hook para realizar o contexto de autenticação:

`src/services/hooks/auth.tsx`

```ts
import * as React from 'react';
import { sleep } from '@services/utils/utils';
import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string({ required_error: 'O campo é obrigatório amigão' }).trim(),
  password: z
    .string({ required_error: 'Preciso dele pra testar aqui na maquininha' })
    .min(3, { message: 'Tá faltando número nisso ai amigo' })
    .max(14, { message: 'Oloko amigo isso não é alemão não pra que tanta letra' })
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

### 4. Criando as Rotas

Agora, crie uma estrutura de diretórios para as rotas. O TanStack Router pode inferir as rotas a partir dos nomes dos arquivos. Na pasta `src`, crie uma pasta chamada `routes` com os seguintes arquivos:

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

No arquivo `__root.tsx`, configure a estrutura para utilização de Rotas com contexto e layout com links para navegação:

Na função de criar a rota raiz, `createRootRouteWithContext`, passe as propriedades do `QueryClient` e do `AuthContext`.

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
            {auth.isAuthenticated ? <Button onClick={() => auth.logout()}>Sair</Button> : null}
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

Em seguida, configure os arquivos `index.tsx`, `about.tsx`, `_auth.tsx` e `_auth.index.tsx` para definir as rotas da aplicação:

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

Para o componente `UserAuthForm`, você pode fazer a sua própria lógica de formulário de login desde que utilize as funções do Hook criado em `src/services/hooks/auth.tsx`.
Um exemplo de uso seria o seguinte:

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

### 5. Gerando o Arquivo de Árvore de Rotas

Para conectar as rotas criadas, o TanStack Router gera automaticamente um arquivo chamado `routeTree.gen.ts`. Esse arquivo organiza todas as rotas e define como elas se relacionam. Inicialize o ambiente de desenvolvimento para gerar a árvore de rotas:

```bash
npm run dev
```

Isso criará um arquivo com as rotas inferidas na pasta `src` chamado `routeTree.gen.ts`.

Sempre que houver alguma alteração nos arquivos, o router fará uma checagem nas rotas as gerando novamente. Caso não exista nenhum erro indicado, todas as rotas estarão disponíveis para serem utilizadas.

### 6. Configurando o Router e Query na Aplicação

Crie em seu projeto a configuração para utilizar o `Tanstack Query` em toda a sua aplicação:

`src/services/providers/QueryProvider.tsx`

```ts
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

export const queryClient = new QueryClient();

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

Por fim, conecte o QueryProvider e o roteador na aplicação no arquivo `main.tsx`:

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
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
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

const container = document.getElementById('root');
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

### 7. Utilizando o Loader junto aos parâmetros de URL

Agora que está configurada toda a aplicação podemos aproveitar suas funcionalidades como a utilização de parâmetros de URL em requisições.

Uma das vantagens de se aproveitar dessa functionalidade é ter guardado na URL todo o histórico daquela pesquisa onde o usuário pode compartilhar ou armazenar para um futuro próximo.

Primeiro determinamos quais parâmetros estaremos utilizando, para isso criamos um Schema com a biblioteca `Zod` para que exista validações do formato recuperado na URL:

```ts
import { z } from 'zod';

export const FilterSchema = z.object({
  userId: z.number().optional().catch(undefined),
  postId: z.number().optional().catch(undefined),
});

export type FilterType = z.infer<typeof FilterSchema>;
```

Criando o seguinte Hook que podemos acessar os dados de publicações de um usuário (ajuste o retorno para o formato da requisição que você deseja utilizar no seu projeto):

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

Ápos ser criado o Hook, podemos utilizá-lo na página criado.

Passamos o schema do **Zod** no `validateSearch`, capturamos os parâmetros através do `loaderDeps` e o acessamos no `loader` utilizando as funções do **queryClient** pelo contexto previamente configurado.

Agora que garantimos que quando for acessada essa página, os dados das publicações estarão carregadas. Precisamos apenas usar a função `useLoaderData` provida pelo **Route**:

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

### Conclusão

Agora você tem um projeto totalmente configurado com **Vite**, **TanStack Router**, **TanStack Query** e **React**. Esse setup oferece tipagem completa com TypeScript, roteamento baseado em arquivos, carregamento assíncrono de componentes e performance otimizada com prefetching de rotas.

Esse guia dá uma visão sólida da configuração inicial, mas o TanStack Router tem diversas funcionalidades avançadas, que você pode explorar conforme a aplicação cresce.

Caso se interesse, o link para o **repositório** é: [Roteamento - Caso de uso](https://github.com/LeonardoSarmento/routing-use-case)

Volte sempre :)
