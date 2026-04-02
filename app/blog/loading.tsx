import React from 'react'
import { Header } from '@/components/dynamicComponents'
import Footer from '@/components/layout/Footer'
import Newsletter from '@/components/layout/NewsLetter'
import Breadcrumb from '@/components/BreadCrumb'
import { BlogListSkeleton } from '@/components/blog/BlogSkeleton'

export default function Loading() {
    return (
        <div>
            <Header />
            <div
                className='mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] flex justify-center items-center bg-gray-100 min-h-[200px] lg:min-h-[400px] max-h-[392px]'
            >
                <div className='flex flex-col w-full justify-center mx-auto items-center animate-pulse'>
                    <Breadcrumb currentPage='Blog' />
                    <div className='h-10 md:h-14 w-48 bg-gray-200 mt-5 rounded' />
                    <div className='h-6 w-64 bg-gray-200 mt-2 rounded' />
                </div>
            </div>

            <div className="mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] mt-10">
                <div className="flex gap-6 mb-10 border-b border-gray-100 pb-2">
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <BlogListSkeleton view="grid3" />
            </div>

            <Newsletter />
            <Footer />
        </div>
    )
}
