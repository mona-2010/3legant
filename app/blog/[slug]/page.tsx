import Breadcrumb from '@/components/BreadCrumb'
import { Header } from '@/components/dynamicComponents'
import Footer from '@/components/layout/Footer'
import Blog from '@/components/layout/Blog'
import Newsletter from '@/components/layout/NewsLetter'
import { getBlogBySlug } from '@/lib/actions/blogs'
import { notFound } from 'next/navigation'
import { HiOutlineCalendar } from 'react-icons/hi'
import { PiUserCircleLight } from 'react-icons/pi'
import blogFallbackImage from '@/app/assets/images/blog-1.png'
import SafeImage from '@/components/common/SafeImage'
import { getBlogImageUrl } from '@/lib/blogs/images'

type PageProps = {
  params: Promise<{ slug: string }>
}

const formatBlogDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const getSections = (blog: NonNullable<Awaited<ReturnType<typeof getBlogBySlug>>["data"]>) => {
  const sections = (blog.sections || []).slice(0, 5)

  const hasStructuredContent = sections.some((section) => section.heading || section.paragraph)
  if (hasStructuredContent) return sections

  const legacyBlocks = (blog.content || "")
    .split(/\n{2,}/)
    .filter(Boolean)
    .slice(0, 5)

  return legacyBlocks.map((block, idx) => {
    if (block.startsWith('## ')) {
      return { heading: block.replace(/^##\s+/, ''), paragraph: '' }
    }

    return { heading: `Section ${idx + 1}`, paragraph: block }
  })
}

const renderSection = (
  heading: string,
  paragraph: string,
  key: string,
  align: 'left' | 'wide' = 'left'
) => {
  if (!heading && !paragraph) return null

  return (
    <section key={key} className={align === 'wide' ? 'w-full' : 'w-full lg:w-[82%]'}>
      <h1 className='font-poppins text-[28px] font-[600] py-2'>
        {heading}
      </h1>
      <p className='text-[16px] font-[500] py-2 whitespace-pre-line'>
        {paragraph}
      </p>
    </section>
  )
}

const page = async ({ params }: PageProps) => {
  const { slug } = await params
  const { data: currentBlog } = await getBlogBySlug(slug)

  if (!currentBlog) {
    notFound()
  }

  const coverImageSrc = getBlogImageUrl(currentBlog.cover_image_path) || currentBlog.cover_image || blogFallbackImage
  const galleryImages = (currentBlog.gallery_image_paths || []).map((path) => getBlogImageUrl(path) || blogFallbackImage)
  const sections = getSections(currentBlog)
  const normalizedSections = [
    ...sections,
    { heading: '', paragraph: '' },
    { heading: '', paragraph: '' },
    { heading: '', paragraph: '' },
    { heading: '', paragraph: '' },
    { heading: '', paragraph: '' },
  ].slice(0, 5)

  return (
    <div>
      <Header />
      <div className='mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px]'>
        <Breadcrumb
          currentPage={currentBlog.title}
          crumbs={[
            { title: 'Blog', href: '/blog' }
          ]}
        />
        <h5 className='uppercase font-[700] my-5'>article</h5>
        <h1 className='w-full lg:w-[70%] font-[500] mb-5 font-poppins text-[38px] md:text-[54px] leading-[46px] md:leading-[58px]'>
          {currentBlog.title}
        </h1>
        <div className='flex gap-10 text-gray-200'>
          <p className='flex gap-1 items-center'>
            <PiUserCircleLight className='text-2xl' />
            {currentBlog.author || 'Admin'}
          </p>
          <p className='flex gap-1 items-center'>
            <HiOutlineCalendar className='text-2xl' />
            {formatBlogDate(currentBlog.published_at)}
          </p>
        </div>

        <div className='my-10'>
          <SafeImage
            src={coverImageSrc}
            fallbackSrc={blogFallbackImage}
            alt={currentBlog.title}
            width={1400}
            height={700}
            className='w-full h-[600px] object-cover rounded-sm'
            priority
          />
        </div>

        <p className='text-[16px] font-[500] pb-2 w-full lg:w-[72%]'>{currentBlog.excerpt}</p>

        <div className='mt-10 mb-10 space-y-12'>
          {renderSection(normalizedSections[0].heading, normalizedSections[0].paragraph, 'section-1')}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {galleryImages.slice(0, 2).map((src, idx) => (
              <SafeImage
                key={idx}
                src={src}
                fallbackSrc={blogFallbackImage}
                alt={`${currentBlog.title} gallery ${idx + 1}`}
                width={700}
                height={700}
                className='w-full h-[700px] object-cover rounded-sm'
              />
            ))}
          </div>

          {renderSection(normalizedSections[1].heading, normalizedSections[1].paragraph, 'section-2')}
          {renderSection(normalizedSections[2].heading, normalizedSections[2].paragraph, 'section-3', 'wide')}

          <div className='flex flex-col md:flex-row justify-between gap-4 w-full'>
            {galleryImages[2] && (
              <SafeImage
                src={galleryImages[2]}
                fallbackSrc={blogFallbackImage}
                alt={`${currentBlog.title} gallery 3`}
                width={700}
                height={700}
                className='w-full md:w-[50%] h-[600px] object-cover rounded-sm'
              />
            )}
            <div className='w-full md:w-[50%]'>
              {renderSection(normalizedSections[3].heading, normalizedSections[3].paragraph, 'section-4')}
              {renderSection(normalizedSections[4].heading, normalizedSections[4].paragraph, 'section-5')}
            </div>
          </div>

        </div>
      </div>
      <Blog heading="You might also like" headingAs="h2" />
      <Newsletter />
      <Footer />
    </div>
  )
}

export default page
