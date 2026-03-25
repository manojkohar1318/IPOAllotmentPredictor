import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { ARTICLES } from '../lib/articles';
import { cn } from '../cn';

export const BlogListing = ({ isDark, setCurrentPage, setCurrentSlug }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-sm mb-6"
        >
          <BookOpen className="w-4 h-4" />
          OUR BLOG
        </motion.div>
        <h1 className={cn(
          "text-4xl md:text-6xl font-black mb-6",
          isDark ? "text-white" : "text-slate-900"
        )}>
          Latest Insights & <span className="text-emerald-500">Guides</span>
        </h1>
        <p className={cn(
          "text-xl max-w-2xl mx-auto",
          isDark ? "text-slate-400" : "text-slate-600"
        )}>
          Stay updated with the latest trends, strategies, and news from the Nepal Stock Exchange and IPO market.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ARTICLES.map((article, index) => (
          <motion.div
            key={article.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "group rounded-[2rem] overflow-hidden border transition-all duration-500 hover:scale-[1.02]",
              isDark ? "bg-navy-900 border-white/10 hover:border-emerald-500/50" : "bg-white border-slate-200 shadow-sm hover:shadow-xl"
            )}
          >
            <div className="relative h-56 overflow-hidden">
              <img 
                src={article.coverImage} 
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {article.author}
                </span>
              </div>
              
              <h2 className={cn(
                "text-xl font-bold mb-4 line-clamp-2 group-hover:text-emerald-500 transition-colors",
                isDark ? "text-white" : "text-slate-900"
              )}>
                {article.title}
              </h2>
              
              <p className={cn(
                "text-sm mb-6 line-clamp-3 leading-relaxed",
                isDark ? "text-slate-400" : "text-slate-600"
              )}>
                {article.excerpt}
              </p>
              
              <button 
                onClick={() => {
                  setCurrentSlug(article.slug);
                  setCurrentPage('blog-post');
                }}
                className="flex items-center gap-2 text-emerald-500 font-bold text-sm group/btn"
              >
                Read Full Article 
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
