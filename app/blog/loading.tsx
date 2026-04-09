import { BlogListSkeleton } from '@/components/blog/BlogSkeleton'

export default function Loading() {
    return (
        <div>
            <div className="page-content-container">
                <div className='mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] flex justify-center items-center bg-gray-100 min-h-[200px] lg:min-h-[400px] max-h-[392px]'>
                    <div className='flex flex-col w-full justify-center mx-auto items-center animate-pulse'>
                    </div>
                </div>

                <div className="mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] mt-10">
                    <div className="flex gap-6 mb-10 border-b border-gray-100 pb-2">
                        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <BlogListSkeleton view="grid3" />
                </div>
            </div>
        </div>
    )
}
