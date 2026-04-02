import { Header } from '@/components/dynamicComponents'
import Footer from '@/components/layout/Footer'
import Newsletter from '@/components/layout/NewsLetter'
import { getBlogBySlug } from '@/lib/actions/blogs'
import { notFound } from 'next/navigation'
import BlogDetail from '@/components/blog/BlogDetail'

type PageProps = {
  params: Promise<{ slug: string }>
}

const page = async ({ params }: PageProps) => {
  const { slug } = await params
  const { data: currentBlog } = await getBlogBySlug(slug)

  if (!currentBlog) {
    notFound()
  }

  return (
    <div>
      <Header />
      <div className='my-10'>
        <BlogDetail blog={currentBlog} />
      </div>
      <Newsletter />
      <Footer />
    </div>
  )
}

export default page
