import { ARTICLES } from "@/lib/articles";

export default function sitemap() {
  const baseUrl = "https://ipoallotmentpredictor.vercel.app";

  // Static routes
  const staticRoutes = [
    "",
    "/blog",
    "/about",
    "/contact",
    "/privacy-policy",
    "/disclaimer",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/blog" ? "daily" : "monthly",
    priority: route === "" ? 1 : route === "/blog" ? 0.8 : 0.5,
  }));

  // Blog post routes
  const blogRoutes = ARTICLES.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
