"use client";

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, CheckCircle2, Home, ChevronRight, Calculator } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { ARTICLES } from '../lib/articles';
import { cn } from '../cn';

export const BlogPost = ({ isDark, slug, setCurrentPage, setCurrentSlug }) => {
  const article = ARTICLES.find(a => a.slug === slug);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black mb-4">Article Not Found</h1>
        <button 
          onClick={() => setCurrentPage('blog')}
          className="text-emerald-500 font-bold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>
      </div>
    );
  }

  const relatedArticles = ARTICLES
    .filter(a => a.slug !== slug)
    .slice(0, 3);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.coverImage,
    "author": {
      "@type": "Person",
      "name": article.author,
      "url": "https://ipoallotmentpredictor.vercel.app"
    },
    "publisher": {
      "@type": "Organization",
      "name": "NEPSE IPO Allotment Predictor",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ipoallotmentpredictor.vercel.app/logo.png"
      }
    },
    "datePublished": article.date,
    "dateModified": article.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ipoallotmentpredictor.vercel.app/blog/${article.slug}`
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>{article.title} | NEPSE IPO Allotment Predictor</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.coverImage} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-8 overflow-hidden whitespace-nowrap">
        <button onClick={() => setCurrentPage('home')} className="hover:text-emerald-500 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        <button onClick={() => setCurrentPage('blog')} className="hover:text-emerald-500">Blog</button>
        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        <span className="truncate opacity-50">{article.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <article className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className={cn(
              "text-3xl md:text-5xl font-black mb-6 leading-tight",
              isDark ? "text-white" : "text-slate-900"
            )}>
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  {article.author[0]}
                </div>
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: {article.date}</span>
              </div>
            </div>

            <div className="relative h-[300px] md:h-[450px] rounded-[2rem] overflow-hidden mb-12">
              <img 
                src={article.coverImage} 
                alt={article.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => { e.target.src = `https://placehold.co/1200x630?text=${encodeURIComponent(article.title)}`; }}
              />
            </div>

            {/* Article Content */}
            <div className={cn(
              "prose prose-lg max-w-none mb-16",
              isDark ? "prose-invert" : "prose-slate",
              "prose-headings:font-black prose-headings:tracking-tight prose-a:text-emerald-500 prose-a:no-underline hover:prose-a:underline prose-img:rounded-[2rem]"
            )}>
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {article.content}
              </ReactMarkdown>
            </div>

            {/* Predictor CTA */}
            <div className={cn(
              "p-8 rounded-[2rem] border-2 border-dashed mb-16 flex flex-col md:flex-row items-center gap-8 text-center md:text-left",
              isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
            )}>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <Calculator className="w-8 h-8" />
              </div>
              <div className="flex-grow">
                <h3 className={cn("text-xl font-bold mb-2", isDark ? "text-white" : "text-slate-900")}>
                  Ready to check your IPO allotment probability?
                </h3>
                <p className={cn("text-sm mb-0", isDark ? "text-slate-400" : "text-slate-600")}>
                  Use our advanced statistical tool to calculate your chances based on real-time data.
                </p>
              </div>
              <button 
                onClick={() => setCurrentPage('home')}
                className="px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all whitespace-nowrap shadow-lg shadow-emerald-500/25"
              >
                Open Predictor
              </button>
            </div>

            {/* Social Share */}
            <div className={cn(
              "py-8 border-y flex flex-wrap items-center justify-between gap-6",
              isDark ? "border-white/10" : "border-slate-200"
            )}>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-500">Share this article:</span>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center hover:scale-110 transition-transform">
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleCopy}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      copied ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    )}
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-8">
            {/* Related Articles */}
            <div className={cn(
              "p-8 rounded-[2rem] border",
              isDark ? "bg-navy-900 border-white/10" : "bg-white border-slate-200 shadow-sm"
            )}>
              <h3 className={cn("text-xl font-black mb-6", isDark ? "text-white" : "text-slate-900")}>
                Related Articles
              </h3>
              <div className="space-y-6">
                {relatedArticles.map(rel => (
                  <button
                    key={rel.slug}
                    onClick={() => {
                      setCurrentSlug(rel.slug);
                      window.scrollTo(0, 0);
                    }}
                    className="group flex gap-4 text-left"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                      <img 
                        src={rel.coverImage} 
                        alt={rel.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.target.src = `https://placehold.co/800x450?text=${encodeURIComponent(rel.title)}`; }}
                      />
                    </div>
                    <div>
                      <h4 className={cn(
                        "text-sm font-bold line-clamp-2 group-hover:text-emerald-500 transition-colors",
                        isDark ? "text-white" : "text-slate-900"
                      )}>
                        {rel.title}
                      </h4>
                      <span className="text-xs text-slate-500 font-bold">{rel.date}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter / CTA */}
            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-4">Never Miss an IPO!</h3>
                <p className="text-emerald-50 text-sm mb-6 font-medium leading-relaxed">
                  Join 50,000+ Nepalese investors getting real-time IPO alerts and allotment predictions.
                </p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder:text-white/50 focus:bg-white/20 focus:outline-none transition-all font-bold text-sm"
                  />
                  <button className="w-full py-3 rounded-xl bg-white text-emerald-600 font-black text-sm hover:bg-emerald-50 transition-colors">
                    SUBSCRIBE NOW
                  </button>
                </div>
              </div>
              <Calculator className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
