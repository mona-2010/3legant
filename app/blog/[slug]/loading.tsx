import React from 'react'
import { Header } from '@/components/dynamicComponents'
import Footer from '@/components/layout/Footer'
import Newsletter from '@/components/layout/NewsLetter'
import { BlogDetailSkeleton } from '@/components/blog/BlogSkeleton'

export default function Loading() {
    return (
        <div>
            <Header />
            <div className='my-10'>
                <BlogDetailSkeleton />
            </div>
            <Newsletter />
            <Footer />
        </div>
    )
}
