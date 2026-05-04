"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "locale";

export async function setUserLocale(locale: "en" | "th") {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale, { maxAge: 31536000, path: "/" });
}

export async function getUserLocale() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || "th";
}
