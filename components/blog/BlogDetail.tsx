import React from 'react'
import Breadcrumb from '@/components/BreadCrumb'
import blogFallbackImage from '@/app/assets/images/blog-1.png'
import SafeImage from '@/components/common/SafeImage'
import { getBlogImageUrl } from '@/lib/blogs/images'
import { HiOutlineCalendar } from 'react-icons/hi'
import { PiUserCircleLight } from 'react-icons/pi'
import { BlogPost } from '@/types'
import Blog from '@/components/layout/Blog'

type BlogDetailProps = {
    blog: BlogPost
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

const getSections = (blog: BlogPost) => {
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
            <p className='text-[16px] font-[500] py-2 text-gray-800'>
                {paragraph}
            </p>
        </section>
    )
}

const BlogDetail = ({ blog }: BlogDetailProps) => {
    const coverImageSrc = getBlogImageUrl(blog.cover_image_path) || blog.cover_image || blogFallbackImage
    const galleryImages = (blog.gallery_image_paths || []).map((path) => getBlogImageUrl(path) || blogFallbackImage)
    const sections = getSections(blog)
    const normalizedSections = [
        ...sections,
        { heading: '', paragraph: '' },
        { heading: '', paragraph: '' },
        { heading: '', paragraph: '' },
        { heading: '', paragraph: '' },
        { heading: '', paragraph: '' },
    ].slice(0, 5)

    return (
        <div className='mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px]'>
            <Breadcrumb
                currentPage={blog.title}
                crumbs={[
                    { title: 'Blog', href: '/blog' }
                ]}
                showMobileBackOnly
                backHref="/blog"
            />
            <h5 className='uppercase font-[700] my-5 text-sm tracking-widest'>article</h5>
            <h1 className='w-full lg:w-[70%] font-[500] mb-5 font-poppins text-[38px] md:text-[54px] leading-[46px] md:leading-[58px]'>
                {blog.title}
            </h1>
            <div className='flex flex-col md:flex-row gap-2 md:gap-10 text-gray-500'>
                <p className='flex gap-1 md:items-center'>
                    <PiUserCircleLight className='text-2xl' />
                    {blog.author || 'Admin'}
                </p>
                <p className='flex gap-1 md:items-center'>
                    <HiOutlineCalendar className='text-2xl' />
                    {formatBlogDate(blog.published_at)}
                </p>
            </div>

            <div className='my-10'>
                <SafeImage
                    src={coverImageSrc}
                    fallbackSrc={blogFallbackImage}
                    alt={blog.title}
                    width={1400}
                    height={700}
                    className='w-full h-[300px] md:h-[600px] object-cover rounded-sm'
                    priority
                />
            </div>

            <p className='text-[16px] font-[500] py-2 text-gray-800'>
                {blog.excerpt}
            </p>

            <div className='mb-20'>
                {renderSection(normalizedSections[0].heading, normalizedSections[0].paragraph, 'section-1')}

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {galleryImages.slice(0, 2).map((src, idx) => (
                        <SafeImage
                            key={idx}
                            src={src}
                            fallbackSrc={blogFallbackImage}
                            alt={`${blog.title} gallery ${idx + 1}`}
                            width={700}
                            height={700}
                            className='w-full h-[400px] md:h-[700px] object-cover rounded-sm outline-none'
                        />
                    ))}
                </div>

                {renderSection(normalizedSections[1].heading, normalizedSections[1].paragraph, 'section-2')}
                {renderSection(normalizedSections[2].heading, normalizedSections[2].paragraph, 'section-3', 'wide')}

                <div className='flex flex-col md:flex-row justify-between gap-10 w-full items-start'>
                    {galleryImages[2] && (
                        <SafeImage
                            src={galleryImages[2]}
                            fallbackSrc={blogFallbackImage}
                            alt={`${blog.title} gallery 3`}
                            width={700}
                            height={700}
                            className='w-full md:w-[50%] h-[500px] md:h-[600px] object-cover rounded-sm'
                        />
                    )}
                    <div className='w-full md:w-[50%]'>
                        {renderSection(normalizedSections[3].heading, normalizedSections[3].paragraph, 'section-4')}
                        <div className="mt-8">
                            {renderSection(normalizedSections[4].heading, normalizedSections[4].paragraph, 'section-5')}
                        </div>
                    </div>
                </div>
            </div>
            <Blog heading="You might also like" headingAs="h2" containerClassName="mx-0" />
        </div>
    )
}

export default BlogDetail
