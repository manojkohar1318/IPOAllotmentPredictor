import { ARTICLES } from '@/lib/articles';
import BlogImage from '@/components/BlogImage';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import JsonLd from '@/components/JsonLd';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return { title: 'Article Not Found' };
  return { 
    title: article.title,
    description: article.excerpt.slice(0, 160),
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.coverImage,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "datePublished": article.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ipoallotmentpredictor.vercel.app/blog/${article.slug}`
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <JsonLd data={articleSchema} />
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <Link href="/" className="hover:text-green-500 shrink-0">Home</Link>
          <span className="shrink-0">/</span>
          <Link href="/blog" className="hover:text-green-500 shrink-0">Blog</Link>
          <span className="shrink-0">/</span>
          <span className="text-gray-900 dark:text-white truncate">{article.title}</span>
        </nav>

        {/* Article Image */}
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-2xl overflow-hidden shadow-lg">
          <BlogImage 
            src={article.coverImage} 
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Author/Date Bar */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              {article.author[0]}
            </div>
            <span>{article.author}</span>
          </div>
          <span>•</span>
          <span>{article.date}</span>
        </div>

        {/* Article Body */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-green-500 prose-img:rounded-xl">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Disclaimer Box */}
        <div className="mt-16 p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            <strong className="text-gray-900 dark:text-white">Disclaimer:</strong> The information provided in this article is for educational purposes only. Investing in the stock market involves risks. Always consult with a financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
