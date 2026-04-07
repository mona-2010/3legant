import ButtonText from "./ButtonText";
import { getBlogs } from "@/lib/actions/blogs"
import blogFallbackImage from "../../app/assets/images/blog-1.png"
import SafeImage from "../common/SafeImage";
import { getBlogImageUrl } from "@/lib/blogs/images";
import type { ElementType } from "react";

type BlogProps = {
  heading?: string
  headingAs?: ElementType
  containerClassName?: string
}

const Blog = async ({
  heading = "Articles",
  headingAs: HeadingTag = "p",
  containerClassName = "mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px]",
}: BlogProps) => {
  const { data } = await getBlogs({ limit: 3 })
  const blogs = data || []

  return (
    <article className={`my-10 ${containerClassName}`}>
      <div className="flex justify-between items-center font-poppins">
        <HeadingTag className="text-[20px] md:text-[28px] font-[500]">{heading}</HeadingTag>
        <ButtonText text={"More Articles"} linkTo={"blog"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogs.map((blog, index) => (
          <div key={index} className="my-6 mx-auto w-full max-w-[380px]">
            <SafeImage src={getBlogImageUrl(blog.cover_image_path) || blog.cover_image || blogFallbackImage} fallbackSrc={blogFallbackImage} alt={blog.title} width={900} height={500} className="object-cover w-full h-60 md:h-90" />
            <p className="font-inter text-base text-black mt-4 mb-2 lg:text-xl line-clamp-2">
              {blog.title}
            </p>
            <ButtonText text={"Read More"} linkTo={`blog/${blog.slug}`} />
          </div>
        ))}
      </div>
    </article>
  );
};

export default Blog;