import { forwardRef, useImperativeHandle, type ReactNode } from "react";

type TurnstileMockProps = {
  onSuccess?: (token: string) => void;
  onError?: (code: string) => void;
  onExpire?: () => void;
  siteKey?: string;
  children?: ReactNode;
};

export type TurnstileInstance = {
  reset: () => void;
};

/**
 * Mock de `@marsidev/react-turnstile` para Vitest (pool vmThreads).
 * Expone botones accesibles que los tests pulsan para simular éxito/error/expiración.
 */
export const Turnstile = forwardRef<TurnstileInstance, TurnstileMockProps>(
  function TurnstileMock({ onSuccess, onError, onExpire }, ref) {
    useImperativeHandle(ref, () => ({
      reset: () => {
        // no-op en tests
      },
    }));

    return (
      <div>
        <button type="button" onClick={() => onSuccess?.("token-test")}>
          mock-turnstile-success
        </button>
        <button type="button" onClick={() => onError?.("110200")}>
          mock-turnstile-error-domain
        </button>
        <button type="button" onClick={() => onError?.("200000")}>
          mock-turnstile-error-generic
        </button>
        <button type="button" onClick={() => onExpire?.()}>
          mock-turnstile-expire
        </button>
      </div>
    );
  }
);
