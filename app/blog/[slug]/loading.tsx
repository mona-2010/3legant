import { BlogDetailSkeleton } from '@/components/blog/BlogSkeleton'

export default function Loading() {
    return (
        <div>
            <div className="page-content-container">
                <div className='my-10'>
                    <BlogDetailSkeleton />
                </div>
            </div>
        </div>
    )
}
