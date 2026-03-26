import React from 'react';
import BlogImage from './BlogImage';
import Link from 'next/link';
import { ARTICLES } from '../lib/articles';

export const BlogSection = () => {
  // Show only the latest 6 articles on the homepage
  const latestArticles = ARTICLES.slice(0, 6);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Latest IPO Insights & Market Guides
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay informed with expert analysis, guides, and real-time updates on the Nepal Stock Market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {latestArticles.map((post) => (
            <div 
              key={post.slug} 
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <BlogImage 
                  src={post.coverImage} 
                  alt={post.title} 
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">
                  {post.date}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-green-500 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-green-500 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Read More <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href="/blog"
            className="inline-flex items-center px-8 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/25"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
};
