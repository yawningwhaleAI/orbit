import type { MetadataRoute } from "next";

const SITE = "https://withinorbit.space";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep member/operator areas and APIs out of the index.
      disallow: ["/home", "/onboarding", "/intro/", "/meeting/", "/dashboard", "/api/"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
