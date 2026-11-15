export interface RedirectError {
  digest: `NEXT_REDIRECT;${string}`;
}

export function isRedirectError(error: unknown): error is RedirectError {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export default isRedirectError;
