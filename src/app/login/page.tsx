'use client';

import { useState, useRef, useCallback } from 'react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submittedRef = useRef(false);

  const handleSubmit = useCallback(async (currentPin: string) => {
    if (currentPin.length < 4 || submittedRef.current) return;
    submittedRef.current = true;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: currentPin }),
      });

      if (res.ok) {
        // Hard navigate so the proxy picks up the new cookie
        window.location.href = '/';
      } else {
        setError('Invalid PIN');
        setPin('');
        submittedRef.current = false;
        setLoading(false);
      }
    } catch {
      setError('Connection error');
      submittedRef.current = false;
      setLoading(false);
    }
  }, []);

  const handleDigit = (digit: string) => {
    if (pin.length >= 6 || loading) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');

    // Auto-submit at 4 digits
    if (newPin.length === 4) {
      handleSubmit(newPin);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-xs">
        <h1 className="text-2xl font-bold text-center mb-2">Workout Tracker</h1>
        <p className="text-muted text-center mb-8">Enter your PIN</p>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-colors ${
                i < pin.length ? 'bg-accent' : 'bg-card-border'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-danger text-center text-sm mb-4">{error}</p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((digit, i) => (
            <button
              key={i}
              onClick={() => {
                if (digit === '⌫') handleDelete();
                else if (digit) handleDigit(digit);
              }}
              disabled={loading || (!digit && digit !== '0')}
              className={`h-16 rounded-xl text-2xl font-semibold transition-colors
                ${!digit ? 'invisible' : ''}
                ${digit === '⌫'
                  ? 'bg-transparent text-muted active:bg-card'
                  : 'bg-card text-foreground active:bg-card-border'
                }
                disabled:opacity-50`}
            >
              {digit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
