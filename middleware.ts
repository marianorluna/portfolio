import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveLocaleFromPathname, SITE_LOCALE_HEADER } from "@/i18n/locale";

export function middleware(request: NextRequest) {
  const locale = resolveLocaleFromPathname(request.nextUrl.pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(SITE_LOCALE_HEADER, locale);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
