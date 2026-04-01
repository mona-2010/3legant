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

type BlogPageProps = {
    blogs: BlogPost[]
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

const BlogPage = ({ blogs }: BlogPageProps) => {
    const [activeTab, setActiveTab] = useState("all")
    const [view, setView] = useState("grid3")
    const [visibleCount, setVisibleCount] = useState(6)
    const featuredBlogs = blogs.filter((blog) => blog.is_featured)
    const filteredBlogs = activeTab === "featured" ? featuredBlogs : blogs
    const visibleBlogs = filteredBlogs.slice(0, visibleCount)

    return (
        <div>
            <Header />
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
                            setVisibleCount(6)
                        }}
                        className={`${activeTab === "all"
                            ? "text-black border-b-2 border-black"
                            : "text-gray-400"
                            } pb-1`}
                    >
                        All Blog
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab("featured")
                            setVisibleCount(3)
                        }}
                        className={`${activeTab === "featured"
                            ? "text-black border-b-2 border-black"
                            : "text-gray-400"
                            } pb-1`}
                    >
                        Featured
                    </button>
                </div>

                <div className="flex items-center gap-4 mt-4 md:mt-0 text-black">
                    <select
                        value={activeTab}
                        onChange={(e) => {
                            const value = e.target.value
                            setActiveTab(value)
                            setVisibleCount(value === "featured" ? 3 : 6)
                        }}
                        className="px-4 py-2 text-[16px] focus:outline-none "
                    >
                        <option value="all">All Blog</option>
                        <option value="featured">Featured</option>
                    </select>

                    <div className="flex text-xl bg-white rounded-md p-1 gap-2">
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
                            className={`hidden sm:hidden md:block cursor-pointer p-1
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
                className={`mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] gap-8
                ${view === "grid3" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}
                ${view === "grid2" && "grid grid-cols-1 sm:grid-cols-4"}
                ${view === "grid1" && "grid grid-cols-2"}
                ${view === "list" && "flex flex-col"}
                `}
            >
                {visibleBlogs.map((blog, index) => (
                    <div
                        key={blog.id || index}
                        className={`my-6 ${(view === "list" || view === "grid1") && "flex gap-6 items-center"}`}
                    >
                        <Link href={`/blog/${blog.slug}`}>
                            <SafeImage
                                src={getBlogImageUrl(blog.cover_image_path) || blog.cover_image || blogFallbackImage}
                                fallbackSrc={blogFallbackImage}
                                alt={blog.title}
                                width={800}
                                height={500}
                                className={` ${(view === "list" || view === "grid1") ? "max-w-[200px] h-50" : "w-full h-90"}`}
                            />
                        </Link>

                        <div>
                            <p className="font-inter text-base text-black mt-4 mb-2 lg:text-xl">
                                {blog.title}
                            </p>
                            <p className='text-[12px] text-gray-200'>
                                {formatBlogDate(blog.published_at)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {visibleCount < filteredBlogs.length && (
                <div className='text-center my-10'>
                    <button
                        onClick={() => setVisibleCount(filteredBlogs.length)}
                        className='border rounded-full px-6 py-2 hover:bg-black hover:text-white transition'
                    >
                        Show More
                    </button>
                </div>
            )}
            <Newsletter />
            <Footer />
        </div>
    )
}

export default BlogPage