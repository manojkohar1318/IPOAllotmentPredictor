import { ARTICLES } from '@/lib/articles';
import Link from 'next/link';
import BlogImage from '@/components/BlogImage';

export const metadata = {
  title: "Nepal IPO & NEPSE Blog — Guides & Market Insights",
  description: "Expert articles on Nepal IPO allotment, NEPSE stock market, Mero Share guides, and IPO tips for Nepali investors.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Latest IPO Insights & Guides
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          Stay updated with the latest trends and strategies in the Nepal Stock Market.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ARTICLES.map((article) => (
            <div key={article.slug} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <BlogImage 
                  src={article.coverImage} 
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-sm text-green-500 font-semibold uppercase tracking-wide mb-2">
                  {article.date}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">
                  {article.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                  {article.excerpt}
                </p>
                <Link 
                  href={`/blog/${article.slug}`}
                  className="inline-flex items-center text-green-500 font-semibold hover:text-green-400 text-sm gap-1 mt-auto"
                >
                  Read More <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
