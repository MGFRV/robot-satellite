import { BlogPostCard } from '@/components/BlogPostCard';
import { getAllPosts } from '@/lib/blog';

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Блог</h1>
      <p className="text-slate-700">Статьи о промышленной автоматизации, подборе комплектующих и сервисе.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
