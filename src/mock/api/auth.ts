/**
 * Mock authentication. The prototype only needs a plausible latency and a
 * predictable success shape — we never actually verify credentials.
 */
export interface SignInResult {
  ok: true;
  email: string;
}

export async function signInMock(email: string, _password: string): Promise<SignInResult> {
  await new Promise<void>((r) => setTimeout(r, 900));
  return { ok: true, email };
}
