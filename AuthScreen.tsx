import { FormEvent, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole, Mail, Sparkles } from 'lucide-react';

import Button from './ui/Button';
import NEXUS_LOGO from '../assets/nexus-symbol.svg';

function GoogleMark() {
  return <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.24-.2-1.78H12v3.36h5.37c-.11.84-.72 2.1-2.08 2.95l-.02.11 3.02 2.34.21.02c1.94-1.79 2.85-4.42 2.85-7Z"/><path fill="#34A853" d="M12 21.75c2.63 0 4.83-.87 6.44-2.37l-3.07-2.47c-.82.57-1.91.97-3.37.97-2.58 0-4.77-1.7-5.55-4.05l-.1.01-3.14 2.43-.03.1A9.73 9.73 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M6.45 13.83A5.88 5.88 0 0 1 6.14 12c0-.64.11-1.26.3-1.83v-.12L3.27 7.58l-.1.05A9.74 9.74 0 0 0 2.25 12c0 1.57.37 3.06.92 4.37l3.28-2.54Z"/><path fill="#EA4335" d="M12 6.12c1.84 0 3.08.8 3.79 1.47l2.77-2.7C16.82 3.27 14.63 2.25 12 2.25a9.73 9.73 0 0 0-8.83 5.38l3.28 2.54C7.23 7.82 9.42 6.12 12 6.12Z"/></svg>;
}

export default function AuthScreen({ initialMode = 'login', onAuthenticated }: { initialMode?: 'login' | 'signup'; onAuthenticated?: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState<'signup' | 'reset' | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const clearFeedback = () => { setError(''); setNotice(''); };
  const changeMode = (nextMode: 'login' | 'signup' | 'reset') => {
    clearFeedback();
    setMode(nextMode);
    setPending(null);
    setCode('');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    clearFeedback();
    try {
      if (pending === 'signup') {
        const user = await window.genmb.auth.verifySignUp(email, code);
        if (!user) throw new Error('Verification was not completed.');
        onAuthenticated?.();
        return;
      }
      if (pending === 'reset') {
        await window.genmb.auth.confirmPasswordReset(email, code, password);
        setNotice('Password updated. You can now sign in.');
        setPending(null);
        setMode('login');
        setCode('');
        return;
      }
      if (mode === 'signup') {
        await window.genmb.auth.signUp(email, password, name);
        setPending('signup');
        setNotice('Check your email for the 6-digit verification code.');
        return;
      }
      if (mode === 'reset') {
        await window.genmb.auth.requestPasswordReset(email);
        setPending('reset');
        setNotice('Check your email for the password reset code.');
        return;
      }
      const user = await window.genmb.auth.signInWithPassword(email, password);
      if (!user) throw new Error('Sign in was not completed.');
      onAuthenticated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    clearFeedback();
    try {
      const user = await window.genmb.auth.signIn();
      if (user) onAuthenticated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const title = pending ? 'Verify your email' : mode === 'signup' ? 'Create your workspace' : mode === 'reset' ? 'Reset your password' : 'Welcome back';
  const passwordLabel = pending === 'reset' ? 'New password' : 'Password';

  return <main className="auth">
    <section className="auth-card" aria-labelledby="auth-title">
      <header className="auth-brand">
        <img className="brand-logo-image" src={NEXUS_LOGO} alt="NEXUS AI" />
        <p className="eyebrow">NEXUS AI SYSTEM</p>
        <h1 id="auth-title">{title}</h1>
        <p className="subtle">by Aayushmaan · Your intelligent workspace.</p>
      </header>

      {(notice || error) && <div className="auth-feedback" aria-live="polite">
        {notice && <p className="notice">{notice}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </div>}

      <form onSubmit={submit} className="auth-form">
        {pending ? <>
          <label className="auth-field">
            <span> Email</span>
            <span className="input-shell"><Mail size={18} aria-hidden="true" /><input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" placeholder="Email" /></span>
          </label>
          <label className="auth-field">
            <span>Verification code</span>
            <span className="input-shell"><KeyRound size={18} aria-hidden="true" /><input autoFocus value={code} onChange={event => setCode(event.target.value)} required inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" /></span>
          </label>
          {pending === 'reset' && <label className="auth-field">
            <span>{passwordLabel}</span>
            <span className="input-shell"><LockKeyhole size={18} aria-hidden="true" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" placeholder="New password" /><button className="password-toggle" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
          </label>}
        </> : <>
          {mode === 'signup' && <label className="auth-field">
            <span>Name</span>
            <span className="input-shell"><Sparkles size={18} aria-hidden="true" /><input value={name} onChange={event => setName(event.target.value)} required autoComplete="name" placeholder="Name" /></span>
          </label>}
          <label className="auth-field">
            <span>Email</span>
            <span className="input-shell"><Mail size={18} aria-hidden="true" /><input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" placeholder="Email" /></span>
          </label>
          {mode !== 'reset' && <label className="auth-field">
            <span>Password</span>
            <span className="input-shell"><LockKeyhole size={18} aria-hidden="true" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} required minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder="Password" /><button className="password-toggle" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
          </label>}
        </>}
        <Button loading={busy} className="auth-submit">{pending ? <><KeyRound size={17} aria-hidden="true" />Verify</> : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset code' : 'Sign in'}</Button>
      </form>

      {!pending && <>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => void google()} className="auth-google"><GoogleMark />Continue with Google</Button>
        <div className="auth-links">
          <button type="button" className="text-action" onClick={() => changeMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create an account' : 'Already have an account? Sign in'}</button>
          {mode === 'login' && <button type="button" className="text-action" onClick={() => changeMode('reset')}>Forgot password?</button>}
        </div>
      </>}
      {pending && <button type="button" className="text-action auth-back" onClick={() => changeMode(mode)}><ArrowLeft size={15} aria-hidden="true" />Back</button>}
    </section>
  </main>;
}
