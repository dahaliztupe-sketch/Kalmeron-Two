import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/src/lib/seo/blog-posts";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { Clock, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "مدونة كلميرون | استراتيجيات ريادة الأعمال العربية",
  description: "مقالات عملية، أدلة شاملة، وقصص نجاح لرواد الأعمال في مصر والعالم العربي. نشر أسبوعي في التسويق، التمويل، بناء الفرق، وتطوير المنتج بالعربية.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const sorted = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <SeoLandingShell
      eyebrow="المدونة"
      title="استراتيجيات لرواد الأعمال العرب"
      description="مقالات تحليلية، أدلة عملية، وقصص نجاح من المنطقة. مكتوبة من خبراء يفهمون السوق."
      breadcrumbs={[{ label: "المدونة" }]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {sorted.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all"
          >
            <div className="text-xs text-cyan-400 mb-2 uppercase tracking-wide">{post.category}</div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition leading-snug">
              {post.titleAr}
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4 line-clamp-3">{post.excerptAr}</p>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.publishedAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readingTimeMinutes} دقائق
              </span>
            </div>
          </Link>
        ))}
      </div>
    </SeoLandingShell>
  );
}
