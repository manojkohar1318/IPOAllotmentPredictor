import React from 'react';
import { ARTICLES } from '../lib/articles';
import { cn } from '../cn';

export const BlogSection = ({ isDark, setCurrentPage, setCurrentSlug }) => {
  // Show only the latest 3 articles on the homepage
  const latestArticles = ARTICLES.slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
        <div className="text-left">
          <h2 className={cn("text-4xl md:text-5xl font-black mb-4", isDark ? "text-white" : "text-slate-900")}>
            Latest <span className="text-emerald-500">Insights</span>
          </h2>
          <p className={cn("text-lg max-w-xl", isDark ? "text-slate-400" : "text-slate-500")}>
            Stay informed with the latest news, guides, and expert analysis on the Nepal Stock Market and IPOs.
          </p>
        </div>
        <button 
          onClick={() => setCurrentPage('blog')}
          className="px-8 py-4 rounded-2xl bg-emerald-500/10 text-emerald-500 font-bold hover:bg-emerald-500 hover:text-white transition-all whitespace-nowrap"
        >
          View All Articles
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {latestArticles.map((post) => (
          <div 
            key={post.slug} 
            onClick={() => {
              setCurrentSlug(post.slug);
              setCurrentPage('blog-post');
            }}
            className={cn(
              "group rounded-[2rem] border overflow-hidden transition-all duration-500 hover:scale-[1.02] cursor-pointer",
              isDark ? "bg-navy-900 border-white/10 hover:border-emerald-500/50" : "bg-white border-slate-200 shadow-sm hover:shadow-xl"
            )}
          >
            <div className="relative h-56 overflow-hidden">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-8 space-y-4">
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{post.date}</div>
              <h3 className={cn("text-xl font-bold leading-tight group-hover:text-emerald-500 transition-colors", isDark ? "text-white" : "text-slate-900")}>
                {post.title}
              </h3>
              <p className={cn("text-sm leading-relaxed line-clamp-3", isDark ? "text-slate-400" : "text-slate-600")}>
                {post.excerpt}
              </p>
              <button className="text-emerald-500 font-bold text-sm flex items-center gap-2 group/btn">
                Read More <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
