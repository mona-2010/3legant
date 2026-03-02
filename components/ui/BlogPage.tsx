"use client"

import { useState } from 'react'
import { Header } from '../dynamicComponents'
import Footer from '../layout/Footer'
import bgimage from '../../app/assets/images/blog-bg.png'
import Breadcrumb from '../BreadCrumb'
import { blogs } from '../layout/Blog'
import Image from 'next/image'
import Newsletter from '../layout/NewsLetter'
import { HiOutlineMenu } from 'react-icons/hi'
import { BsFillGrid3X3GapFill, BsFillGridFill } from 'react-icons/bs'
import { CiGrid2V } from 'react-icons/ci'

const BlogPage = () => {
    const [activeTab, setActiveTab] = useState("all")
    const [view, setView] = useState("grid3")
    const [visibleCount, setVisibleCount] = useState(6)
    const featuredBlogs = blogs.slice(3, 7)
    const filteredBlogs = activeTab === "featured" ? featuredBlogs : blogs
    const visibleBlogs = filteredBlogs.slice(0, visibleCount)

    return (
        <div>
            <Header />
            <div
                className='mx-[30px] md:mx-[140px] flex justify-center items-center'
                style={{
                    backgroundImage: `url(${bgimage.src})`,
                    backgroundSize: 'cover',
                    minHeight: '392px'
                }}
            >
                <div className='flex flex-col items-center'>
                    <Breadcrumb currentPage='Blog' />
                    <h1 className='my-5 font-poppins text-[54px] font-[500]'>
                        Our Blog
                    </h1>
                    <p className='text-[20px] text-[#121212]'>
                        Home ideas and design inspiration
                    </p>
                </div>
            </div>

            <div className="mx-[30px] md:mx-[140px] mt-10 flex flex-col md:flex-row md:items-center md:justify-between">
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

                    <div className="flex border border-[#EAEAEA] overflow-hidden">
                        <button
                            onClick={() => setView("grid3")}
                            className={`text-xl px-4 py-2 border-r border-[#EAEAEA]
        ${view === "grid3" ? "bg-[#F3F5F7] text-black" : "bg-white text-gray-500"}
        `}
                        >
                            <BsFillGrid3X3GapFill />
                        </button>

                        <button
                            onClick={() => setView("grid2")}
                            className={`text-xl px-4 py-2 border-r border-[#EAEAEA]
        ${view === "grid2" ? "bg-[#F3F5F7] text-black" : "bg-white text-gray-500"}
        `}
                        >
                            <BsFillGridFill />
                        </button>

                        <button
                            onClick={() => setView("grid2")}
                            className={`text-2xl px-4 py-2 border-r border-[#EAEAEA]
        ${view === "grid2" ? "bg-[#F3F5F7] text-black" : "bg-white text-gray-500"}
        `}
                        >
                            <CiGrid2V />
                        </button>

                        <button
                            onClick={() => setView("list")}
                            className={`text-2xl px-4 py-2 
        ${view === "list" ? "bg-[#F3F5F7] text-black" : "bg-white text-gray-500"}
        `}
                        >
                            <HiOutlineMenu />
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={`mx-[30px] md:mx-[140px] gap-8
                ${view === "grid3" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}
                ${view === "grid2" && "grid grid-cols-1 sm:grid-cols-2"}
                ${view === "list" && "flex flex-col"}
                `}
            >
                {visibleBlogs.map((blog, index) => (
                    <div
                        key={index}
                        className={`my-6 ${view === "list" && "flex gap-6 items-center"}`}
                    >
                        <Image
                            src={blog.img}
                            alt={blog.title}
                            className={`${view === "list" ? "w-[200px]" : "w-full"}`}
                        />

                        <div>
                            <p className="font-inter text-base text-black mt-4 mb-2 lg:text-xl">
                                {blog.title}
                            </p>
                            <p className='text-[12px] text-[#6C7275]'>
                                {blog.date}
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