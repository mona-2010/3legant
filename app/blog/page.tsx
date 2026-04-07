import BlogPage from '@/components/ui/BlogPage'
import React from 'react'
import { getBlogs } from '@/lib/actions/blogs'

const page = async () => {
  const { data } = await getBlogs({ limit: 6, offset: 0 })

  return (
    <div><BlogPage blogs={data || []} /></div>
  )
}

export default page