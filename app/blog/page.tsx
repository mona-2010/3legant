import BlogPage from '@/components/ui/BlogPage'
import React from 'react'
import { getBlogs } from '@/lib/actions/blogs'

const page = async () => {
  const { data } = await getBlogs()

  return (
    <div><BlogPage blogs={data || []} /></div>
  )
}

export default page