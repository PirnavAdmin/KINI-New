import { useState } from 'react';
import { X } from 'lucide-react';
import { authService } from '@shared/services/authService';
import { getApiErrorMessage } from '@shared/services/apiServices';

export default function MentorPasswordReset({ trainer, onClose, onComplete }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const send = async () => {
    setSending(true);
    setError('');
    try {
      await authService.forgotPassword(trainer.email, 'Email');
      onComplete('Password reset code requested. Ask the mentor to check their email.');
    } catch (error) {
      setError(getApiErrorMessage(error, 'Unable to send password reset code.'));
    } finally { setSending(false); }
  };
  return (
    <div className="fixed inset-0 z-[170] grid place-items-center bg-slate-950/45 p-4">
      <section role="alertdialog" aria-modal="true" aria-label="Reset mentor password" className="relative w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <button type="button" aria-label="Close password reset" disabled={sending} onClick={onClose} className="absolute right-3 top-3 p-2"><X className="h-4 w-4" /></button>
        <h3 className="pr-8 font-semibold">Reset mentor password</h3>
        <p className="mt-3 text-sm text-slate-600">Send a password reset code to {trainer.email || 'this mentor'}? The mentor can use it to choose a new password.</p>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" disabled={sending} onClick={onClose} className="rounded border px-3 py-2">Cancel</button>
          <button type="button" disabled={sending || !trainer.email} onClick={send} className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50">{sending ? 'Sending...' : 'Send reset code'}</button>
        </div>
      </section>
    </div>
  );
}
