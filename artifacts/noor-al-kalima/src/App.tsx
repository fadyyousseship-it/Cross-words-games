import { useEffect, useRef, type ReactNode } from 'react';
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { arSA } from '@clerk/localizations';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Home from '@/pages/Home';
import Play from '@/pages/Play';
import Leaderboard from '@/pages/Leaderboard';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { Link } from 'wouter';

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#315d55',
    colorForeground: '#21383b',
    colorMutedForeground: '#697b7b',
    colorDanger: '#bd514c',
    colorBackground: '#fcf8ee',
    colorInput: '#fffdf8',
    colorInputForeground: '#21383b',
    colorNeutral: '#d8cfbd',
    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fcf8ee] rounded-2xl w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#21383b] font-bold',
    headerSubtitle: 'text-[#697b7b]',
    socialButtonsBlockButtonText: 'text-[#21383b] font-semibold',
    formFieldLabel: 'text-[#21383b] font-semibold',
    footerActionLink: 'text-[#315d55] font-semibold',
    footerActionText: 'text-[#697b7b]',
    dividerText: 'text-[#697b7b]',
    identityPreviewEditButton: 'text-[#315d55]',
    formFieldSuccessText: 'text-[#315d55]',
    alertText: 'text-[#21383b]',
    logoBox: 'rounded-xl',
    logoImage: 'rounded-xl',
    socialButtonsBlockButton: 'border-[#d8cfbd] bg-[#fffdf8] rounded-xl',
    formButtonPrimary: 'bg-[#315d55] hover:bg-[#274c45] rounded-xl',
    formFieldInput: 'border-[#d8cfbd] bg-[#fffdf8] text-[#21383b] rounded-xl',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[#d8cfbd]',
    alert: 'rounded-xl',
    otpCodeFieldInput: 'border-[#d8cfbd] bg-[#fffdf8] text-[#21383b] rounded-xl',
    formFieldRow: 'gap-2',
    main: 'gap-4',
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (previousUserId.current !== undefined && previousUserId.current !== userId) client.clear();
      previousUserId.current = userId;
    });
    return unsubscribe;
  }, [addListener, client]);
  return null;
}

function SignInPage() {
  return <main className="grain grid min-h-[100dvh] place-items-center bg-background px-4 py-10"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`}/></main>;
}

function SignUpPage() {
  return <main className="grain grid min-h-[100dvh] place-items-center bg-background px-4 py-10"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`}/></main>;
}

function NotFound() {
  return <main className="grid min-h-[100dvh] place-items-center px-5 text-center"><div className="max-w-md rounded-[2rem] border border-border bg-card p-9 shadow-sm"><p className="text-sm font-bold text-accent">وصلت إلى صفحة غير موجودة</p><h1 className="mt-3 font-serif text-4xl">الطريق لم يُرسم هنا</h1><p className="mt-3 leading-7 text-muted-foreground">عد إلى لوحة الرحلة، وستجد محطاتك في انتظارك.</p><Link href="/" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground" data-testid="link-not-found-home">العودة إلى الرحلة</Link></div></main>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={import.meta.env.VITE_CLERK_PROXY_URL}
    appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    localization={arSA}
    routerPush={to => setLocation(stripBase(to))}
    routerReplace={to => setLocation(stripBase(to), { replace: true })}
  >
    <ClerkQueryClientCacheInvalidator/>
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home}/>
        <Route path="/play/:stageId" component={Play}/>
        <Route path="/leaderboard" component={Leaderboard}/>
        <Route path="/sign-in/*?" component={SignInPage}/>
        <Route path="/sign-up/*?" component={SignUpPage}/>
        <Route component={NotFound}/>
      </Switch>
    </RoutedErrorBoundary>
  </ClerkProvider>;
}

function App() {
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes/>
      </WouterRouter>
      <Toaster/>
    </TooltipProvider>
  </QueryClientProvider>;
}

export default App;
