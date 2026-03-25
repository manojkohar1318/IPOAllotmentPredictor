import { BlogListing } from '@/components/BlogListing';

export const metadata = {
  title: "Nepal IPO & NEPSE Blog — Guides & Market Insights",
  description: "Expert articles on Nepal IPO allotment, NEPSE stock market, Mero Share guides, and IPO tips for Nepali investors.",
};

export default function BlogPage() {
  return <BlogListing isDark={true} />;
}
