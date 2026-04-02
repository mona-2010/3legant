import React from 'react'
import Skeleton from '../common/Skeleton'

type BlogCardSkeletonProps = {
    view?: 'grid3' | 'grid2' | 'grid1' | 'list'
}

export const BlogCardSkeleton = ({ view = 'grid3' }: BlogCardSkeletonProps) => {
    const isListOrGrid1 = view === 'list' || view === 'grid1'

    return (
        <div className={`my-6 ${isListOrGrid1 ? 'flex gap-6 items-center' : ''}`}>
            <Skeleton
                className={`${isListOrGrid1 ? 'w-[200px] h-32 md:h-40' : 'w-full h-64 md:h-80'}`}
            />
            <div className={isListOrGrid1 ? 'flex-1' : 'w-full'}>
                <Skeleton className="h-6 w-3/4 mt-4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
            </div>
        </div>
    )
}

export const BlogListSkeleton = ({ view = 'grid3' }: BlogCardSkeletonProps) => {
    const gridClasses = {
        grid3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        grid2: 'grid grid-cols-1 sm:grid-cols-4',
        grid1: 'grid grid-cols-2',
        list: 'flex flex-col'
    }

    const count = view === 'grid2' ? 4 : view === 'grid1' ? 4 : 6

    return (
        <div className={`gap-8 ${gridClasses[view] || gridClasses.grid3}`}>
            {Array.from({ length: count }).map((_, index) => (
                <BlogCardSkeleton key={index} view={view} />
            ))}
        </div>
    )
}

export const BlogDetailSkeleton = () => {
    return (
        <div className="mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] animate-pulse">
            {/* Breadcrumb Skeleton */}
            <div className="flex gap-2 my-5">
                <Skeleton className="h-4 w-16" />
                <span className="text-gray-300">/</span>
                <Skeleton className="h-4 w-24" />
            </div>

            {/* Label */}
            <Skeleton className="h-4 w-20 uppercase my-5" />

            {/* Title */}
            <Skeleton className="h-10 md:h-14 w-full lg:w-[70%] mb-5" />

            {/* Metadata */}
            <div className="flex gap-10 mb-10">
                <div className="flex gap-2 items-center">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2 items-center">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            {/* Hero Image */}
            <Skeleton className="w-full h-[300px] md:h-[600px] rounded-sm my-10" />

            {/* Excerpt */}
            <Skeleton className="h-6 w-full lg:w-[72%] mb-12" />

            {/* Content Sections */}
            <div className="space-y-12">
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ))}

                {/* Gallery Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
                    <Skeleton className="w-full h-[400px] md:h-[700px] rounded-sm" />
                    <Skeleton className="w-full h-[400px] md:h-[700px] rounded-sm" />
                </div>
            </div>
        </div>
    )
}
