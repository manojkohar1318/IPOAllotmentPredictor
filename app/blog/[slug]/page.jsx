import { ARTICLES } from '@/lib/articles';
import { BlogPost } from '@/components/BlogPost';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.excerpt.slice(0, 150),
    openGraph: {
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return <BlogPost isDark={true} slug={slug} />;
}
