"use client"

import { useState } from 'react'
import { Header } from '../dynamicComponents'
import Footer from '../layout/Footer'
import bgimage from '../../app/assets/images/blog-bg.png'
import Breadcrumb from '../BreadCrumb'
import Newsletter from '../layout/NewsLetter'
import { BsGrid3X3GapFill, BsGridFill } from 'react-icons/bs'
import Link from 'next/link'
import { BlogPost } from '@/types'
import blogFallbackImage from '../../app/assets/images/blog-1.png'
import SafeImage from '../common/SafeImage'
import { getBlogImageUrl } from '@/lib/blogs/images'
import { MdViewAgenda } from 'react-icons/md'
import { PiColumnsFill } from 'react-icons/pi'
import { getBlogs } from '@/lib/actions/blogs'

type BlogPageProps = {
    blogs: BlogPost[]
}

const PAGE_SIZE = 6

const formatBlogDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

const BlogPage = ({ blogs }: BlogPageProps) => {
    const [activeTab, setActiveTab] = useState("all")
    const [sortOrder, setSortOrder] = useState("newest")
    const [view, setView] = useState("grid3")
    const [allBlogs, setAllBlogs] = useState(blogs)
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(blogs.length === PAGE_SIZE)
    const featuredBlogs = allBlogs.filter((blog) => blog.is_featured)
    const filteredBlogs = activeTab === "featured" ? featuredBlogs : allBlogs
    const sortedBlogs = [...filteredBlogs].sort((a, b) => {
        const aTime = new Date(a.published_at).getTime()
        const bTime = new Date(b.published_at).getTime()

        if (sortOrder === "oldest") return aTime - bTime
        return bTime - aTime
    })
    const visibleBlogs = sortedBlogs.slice(0, visibleCount)

    const handleLoadMore = async () => {
        if (isLoadingMore || !hasMore) return

        setIsLoadingMore(true)
        const { data, error } = await getBlogs({
            limit: PAGE_SIZE,
            offset: allBlogs.length,
        })

        if (error || !data) {
            setIsLoadingMore(false)
            return
        }

        setAllBlogs((prev) => {
            const existingIds = new Set(prev.map((item) => item.id))
            const incoming = data.filter((item) => !existingIds.has(item.id))
            return [...prev, ...incoming]
        })

        setVisibleCount((prev) => prev + PAGE_SIZE)
        setHasMore(data.length === PAGE_SIZE)
        setIsLoadingMore(false)
    }

    return (
        <div>
            <Header />
            <div className="page-content-container">
                <div
                    className='mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] flex justify-center items-center bg-cover min-h-[200px] lg:min-h-[400px] max-h-[392px]'
                    style={{
                        backgroundImage: `url(${bgimage.src})`
                    }}
                >
                    <div className='flex flex-col w-full justify-center mx-auto items-center'>
                        <Breadcrumb currentPage='Blog' />
                        <h1 className='my-5 font-poppins text-[24px] md:text-[36px] lg:text-[54px] font-[500]'>
                            Our Blog
                        </h1>
                        <p className='text-center text-[12px] md:text-[16px] lg:text-[20px] text-[#121212]'>
                            Home ideas and design inspiration
                        </p>
                    </div>
                </div>

            <div className="mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] mt-10 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex gap-6 text-[16px] font-medium">
                    <button
                        onClick={() => {
                            setActiveTab("all")
                            setVisibleCount(PAGE_SIZE)
                        }}
                        className={`cursor-pointer ${activeTab === "all"
                            ? "text-black border-b-2 border-black"
                            : "text-gray-400"
                            } pb-1`}
                    >
                        All Blog
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab("featured")
                            setVisibleCount(PAGE_SIZE)
                        }}
                        className={`cursor-pointer ${activeTab === "featured"
                            ? "text-black border-b-2 border-black"
                            : "text-gray-400"
                            } pb-1`}
                    >
                        Featured
                    </button>
                </div>

                <div className="flex items-center gap-4 my-4 md:mt-0 text-black">
                    <select
                        value={sortOrder}
                        onChange={(e) => {
                            const value = e.target.value
                            setSortOrder(value)
                            setVisibleCount(PAGE_SIZE)
                        }}
                        className="cursor-pointer w-full md:w-auto px-4 py-2 text-[16px] focus:outline-none border md:border-0 rounded-md"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>

                    <div className="lg:flex text-xl rounded-md p-1 gap-2 hidden ">
                        <button
                            onClick={() => setView("grid3")}
                            className={`hidden sm:hidden md:block cursor-pointer p-1
        ${view === "grid3" ? "bg-lightgray" : "text-gray-500"}
        `}
                        >
                            <BsGrid3X3GapFill />
                        </button>

                        <button
                            onClick={() => setView("grid2")}
                            className={`hidden sm:hidden lg:block cursor-pointer p-1
        ${view === "grid2" ? "bg-lightgray" : " text-gray-500"}
        `}
                        >
                            <BsGridFill />
                        </button>

                        <button
                            onClick={() => setView("grid1")}
                            className={`cursor-pointer p-1
        ${view === "grid1" ? "bg-lightgray text-black" : "text-gray-500"}
        `}
                        >
                            <PiColumnsFill />
                        </button>

                        <button
                            onClick={() => setView("list")}
                            className={`cursor-pointer p-1
        ${view === "list" ? "bg-lightgray text-black" : "text-gray-500"}
        `}
                        >
                            <MdViewAgenda />
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={`mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] gap-2 lg:gap-8
                ${view === "grid3" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}
                ${view === "grid2" && "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4"}
                ${view === "grid1" && "grid grid-cols-2"}
                ${view === "list" && "flex flex-col h-auto"}
                `}
            >
                {visibleBlogs.map((blog, index) => (
                    <div
                        key={blog.id || index}
                        className={`my-0 md:my-6 ${(view === "list" || view === "grid1") && "flex flex-col md:flex-row gap-2 md:gap-6 items-center"}`}
                    >
                        <Link href={`/blog/${blog.slug}`}>
                            <SafeImage
                                src={getBlogImageUrl(blog.cover_image_path) || blog.cover_image || blogFallbackImage}
                                fallbackSrc={blogFallbackImage}
                                alt={blog.title}
                                width={800}
                                height={500}
                                className={`object-cover ${(view === "list" || view === "grid1" || view === "grid2") ? "max-w-auto md:max-w-60 min-w-60 h-60" : "w-full h-60 md:h-90"}`}
                            />
                        </Link>

                        <div>
                            <p className="line-clamp-2 md:line-clamp-4 font-inter text-base text-black mt-4 mb-2 lg:text-xl">
                                {blog.title}
                            </p>
                            <p className='text-[12px] text-gray-200'>
                                {formatBlogDate(blog.published_at)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {(visibleCount < sortedBlogs.length || hasMore) && (
                <div className='text-center my-10'>
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className='border rounded-full px-6 py-3 hover:bg-black hover:text-white transition'
                    >
                        {isLoadingMore ? 'Loading...' : 'Show More'}
                    </button>
                </div>
            )}
                <Newsletter />
            </div>
            <Footer />
        </div>
    )
}

export default BlogPage