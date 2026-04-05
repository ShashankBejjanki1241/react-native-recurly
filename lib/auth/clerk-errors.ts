/**
 * Surface Clerk API errors in UI-friendly copy.
 */
export function formatClerkError(
  error: { message?: string; errors?: { message?: string }[] } | null | undefined,
): string {
  if (!error) return "";
  if (typeof error.message === "string" && error.message.length > 0) {
    return error.message;
  }
  const errs = error.errors;
  if (Array.isArray(errs) && errs.length > 0) {
    return errs
      .map((e) => (typeof e.message === "string" ? e.message : ""))
      .filter(Boolean)
      .join("\n");
  }
  return "Something went wrong. Please try again.";
}
