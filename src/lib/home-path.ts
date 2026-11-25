/**
 * Is this pathname the homepage?
 *
 * The homepage is revalidated (ISR). When Vercel re-renders it on the server,
 * usePathname() returns "/index", while the browser, on the same page, returns
 * "/". A component that compared the pathname to "/" therefore rendered
 * different markup on the server and in the browser, and React threw
 * hydration error #418. Treating "/" and "/index" as the same page keeps the
 * first render identical on both sides.
 */
export const isHomePath = (pathname: string | null): boolean => pathname === "/" || pathname === "/index";
