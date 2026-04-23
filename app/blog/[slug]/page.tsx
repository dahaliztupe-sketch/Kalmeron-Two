import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, getAllBlogSlugs, BLOG_POSTS } from "@/src/lib/seo/blog-posts";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { Calendar, Clock, User } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.titleAr,
    description: post.metaDescriptionAr,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.titleAr,
      description: post.metaDescriptionAr,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.authorName],
      images: [{ url: `/api/og?title=${encodeURIComponent(post.titleAr)}&type=blog` }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.titleAr,
      description: post.metaDescriptionAr,
      images: [`/api/og?title=${encodeURIComponent(post.titleAr)}&type=blog`],
    },
  };
}

// Very small markdown renderer (handles ## headings, ### sub-headings, lists, paragraphs).
function renderMarkdown(content: string) {
  const lines = content.trim().split("\n");
  const out: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    out.push(
      <ul key={`l-${out.length}`} className="space-y-2 my-4 mr-6">
        {listBuffer.map((item, i) => (
          <li key={i} className="text-zinc-300 leading-relaxed flex gap-2">
            <span className="text-cyan-400 flex-shrink-0">·</span>
            <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      out.push(
        <h3 key={out.length} className="text-xl font-semibold text-white mt-8 mb-3">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      out.push(
        <h2 key={out.length} className="text-2xl font-bold text-white mt-10 mb-4">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("- ") || line.startsWith("❌ ") || line.startsWith("✅ ")) {
      listBuffer.push(line.slice(line.startsWith("- ") ? 2 : 0));
    } else {
      flushList();
      out.push(
        <p
          key={out.length}
          className="text-zinc-300 leading-relaxed my-4"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, "<strong class='text-white'>$1</strong>") }}
        />
      );
    }
  }
  flushList();
  return out;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  // JSON-LD Article schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.titleAr,
    "description": post.metaDescriptionAr,
    "datePublished": post.publishedAt,
    "author": { "@type": "Organization", "name": post.authorName },
    "publisher": { "@type": "Organization", "name": "Kalmeron AI" },
    "inLanguage": "ar",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoLandingShell
        eyebrow={post.category}
        title={post.titleAr}
        description={post.excerptAr}
        breadcrumbs={[
          { label: "المدونة", href: "/blog" },
          { label: post.titleAr },
        ]}
      >
        <article className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-12 pb-6 border-b border-white/5">
            <span className="inline-flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.authorName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.publishedAt).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readingTimeMinutes} دقائق قراءة
            </span>
          </div>

          {/* Body */}
          <div className="prose prose-invert max-w-none">{renderMarkdown(post.contentAr)}</div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">مقالات مرتبطة</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:border-cyan-500/30 transition"
                >
                  <h3 className="text-base font-semibold text-white mb-1 line-clamp-2">{r.titleAr}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">{r.excerptAr}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </SeoLandingShell>
    </>
  );
}
