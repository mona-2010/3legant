import Image from "next/image";
import ButtonText from "./ButtonText";
import living_room_1 from "../../app/assets/images/blog-1.png"
import kitchen from "../../app/assets/images/blog-2.png"
import bedroom from "../../app/assets/images/blog-3.png"
import living_room_2 from "../../app/assets/images/blog-4.png"
import living_room_3 from "../../app/assets/images/blog-5.png"
import living_room_4 from "../../app/assets/images/blog-9.png"
import living_room_5 from "../../app/assets/images/blog-7.png"
import living_room_6 from "../../app/assets/images/blog-8.png"
import living_room_7 from "../../app/assets/images/blog-9.png"

export const blogs = [
  {
    id: 1,
    img: living_room_1,
    title: "7 ways to decor your home",
    slug: "7-ways-to-decor-your-home",
    date: "October 16,2023"
  },
  {
    id: 2,
    img: kitchen,
    title: "Kitchen organization",
    slug: "kitchen-organization",
    date: "October 16,2023"
  },
  {
    id: 3,
    img: bedroom,
    title: "Decor your bedroom",
    slug: "decor-your-bedroom",
    date: "October 16,2023"
  },
  {
    id: 4,
    img: living_room_2,
    title: "Modern texas home is beautiful and completely kid-friendly",
    slug: "modern-texas-home-is-beautiful-and-completely-kid-friendly",
    date: "October 16,2023"
  },
  {
    id: 5,
    img: living_room_3,
    title: "Modern texas home is beautiful and completely kid-friendly",
    slug: "modern-texas-home-is-beautiful-and-completely-kid-friendly",
    date: "October 16,2023"
  },
  {
    id: 6,
    img: living_room_4,
    title: "Modern texas home is beautiful and completely kid-friendly",
    slug: "modern-texas-home-is-beautiful-and-completely-kid-friendly",
    date: "October 16,2023"
  },
  {
    id: 7,
    img: living_room_5,
    title: "Modern texas home is beautiful and completely kid-friendly",
    slug: "modern-texas-home-is-beautiful-and-completely-kid-friendly",
    date: "October 16,2023"
  },
  {
    id: 8,
    img: living_room_6,
    title: "Modern texas home is beautiful and completely kid-friendly",
    slug: "modern-texas-home-is-beautiful-and-completely-kid-friendly",
    date: "October 16,2023"
  },
  {
    id: 9,
    img: living_room_7,
    title: "Modern texas home is beautiful and completely kid-friendly",
    slug: "modern-texas-home-is-beautiful-and-completely-kid-friendly",
    date: "October 16,2023"
  },
];

const Blog = () => {
  return (
    <article className="my-12 mx-[30px] md:mx-[140px]">
      <div className="flex justify-between items-center font-poppins">
        <p className="text-[32px] md:text-[40px]">Articles</p>
        <ButtonText text={"More Articles"} linkTo={"blog"} />
      </div>

      <div className="flex flex-col items-center lg:flex-row lg:justify-between">
        {blogs.slice(0, 3).map((blog, index) => (
          <div key={index} className={`my-6 ${index === 1 ? "lg:mx-7" : ""}`}>
            <Image src={blog.img} alt={blog.title} />
            <p className="font-inter text-base text-black mt-4 mb-2 lg:text-xl">
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