import Image from "next/image";
import ButtonText from "./ButtonText";
import living_room_1 from "../../app/assets/images/blog-1.png"
import kitchen from "../../app/assets/images/blog-2.png"
import bedroom from "../../app/assets/images/blog-3.png"

export const blogs = [
	{ img: living_room_1, title: "7 ways to decor your home", link: "blog/1", date: "October 16,2023" },
	{ img: kitchen, title: "Kitchen organization", link: "blog/2", date: "October 16,2023" },
	{ img: bedroom, title: "Decor your bedroom", link: "blog/3", date: "October 16,2023" },
	{ img: bedroom, title: "Decor your bedroom", link: "blog/3", date: "October 16,2023" },
	{ img: bedroom, title: "Decor your bedroom", link: "blog/3", date: "October 16,2023" },
	{ img: bedroom, title: "Decor your bedroom", link: "blog/3", date: "October 16,2023" },
	{ img: bedroom, title: "Decor your bedroom", link: "blog/3", date: "October 16,2023" },
	{ img: bedroom, title: "Decor your bedroom", link: "blog/3", date: "October 16,2023" },
	{ img: bedroom, title: "Decor your bedroom", link: "blog/3", date: "October 16,2023" },
]

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
						<ButtonText text={"Read More"} linkTo={blog.link} />
					</div>
				))}
			</div>
		</article>
	);
};

export default Blog;