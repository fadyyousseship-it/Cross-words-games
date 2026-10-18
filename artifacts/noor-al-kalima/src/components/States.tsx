import { Link } from 'wouter';
import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react';

export function LoadingState({ label = 'نهيّئ رحلتك...' }: { label?: string }) {
  return <div className="space-y-5" aria-label={label}><div className="h-36 animate-pulse rounded-[2rem] bg-secondary/70"/><div className="grid gap-4 sm:grid-cols-3"><div className="h-28 animate-pulse rounded-2xl bg-secondary/70"/><div className="h-28 animate-pulse rounded-2xl bg-secondary/70"/><div className="h-28 animate-pulse rounded-2xl bg-secondary/70"/></div><p className="text-center text-sm text-muted-foreground">{label}</p></div>;
}

export function ErrorState({ retry }: { retry: () => void }) {
  return <div className="mx-auto max-w-lg rounded-[2rem] border border-border bg-card p-8 text-center shadow-sm"><AlertCircle className="mx-auto mb-3 text-accent" size={30}/><h2 className="font-serif text-2xl">تعذّر تحميل الرحلة</h2><p className="mt-2 text-sm text-muted-foreground">تحقق من اتصالك ثم حاول مرة أخرى.</p><button onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="button-retry"><RefreshCw size={16}/> حاول مجدداً</button></div>;
}

export function PageSpinner() {
  return <div className="grid min-h-[55vh] place-items-center"><div className="flex items-center gap-3 text-muted-foreground"><LoaderCircle className="animate-spin" size={20}/> لحظة من فضلك</div></div>;
}

export function SignInPrompt() {
  return <section className="mx-auto max-w-xl rounded-[2rem] border border-border bg-card p-9 text-center shadow-sm"><h1 className="font-serif text-3xl">هذه الرحلة تنتظرك</h1><p className="mt-3 leading-7 text-muted-foreground">سجّل دخولك لتتابع مراحل الكتاب المقدس وتحفظ نقاطك.</p><Link href="/sign-in" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground" data-testid="link-sign-in">تسجيل الدخول</Link></section>;
}
