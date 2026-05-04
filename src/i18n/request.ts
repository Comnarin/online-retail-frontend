import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// Define supported locales explicitly to avoid Turbopack resolution issues
const locales = ["th", "en"];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "th";
  
  // Ensure locale is supported, fallback to 'th'
  const targetLocale = locales.includes(locale) ? locale : "th";

  return {
    locale: targetLocale,
    // Explicitly import to help Turbopack build the dependency graph
    messages: (await import(`../messages/${targetLocale}.json`)).default,
  };
});
