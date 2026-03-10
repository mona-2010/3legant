"use client"
import Breadcrumb from '@/components/BreadCrumb'
import { Header } from '@/components/dynamicComponents'
import Footer from '@/components/layout/Footer'
import Blog, { blogs } from '@/components/layout/Blog'
import { PiUserCircleLight } from 'react-icons/pi'
import Image from 'next/image'
import img1 from '@/app/assets/images/blogb-1.png'
import blogb2 from '@/app/assets/images/blogb-2.png'
import blogb3 from '@/app/assets/images/blogb-3.png'
import blogb4 from '@/app/assets/images/blogb-4.png'
import Newsletter from '@/components/layout/NewsLetter'
import Link from 'next/link'
import { HiOutlineCalendar } from 'react-icons/hi'
import { useParams } from 'next/navigation'

const page = () => {
    const params = useParams();
    const { slug } = params;
    const currentBlog = blogs.find(blog => blog.slug === slug);

    if (!currentBlog) {
        return <p>Blog not found</p>;
    }
    return (
        <div>
            <Header />
            <div className='mx-[30px] md:mx-[140px]'>
                <Breadcrumb
                    currentPage={currentBlog.title}
                    crumbs={[
                        { title: "Blog", href: "/blog" }
                    ]}
                />
                <h5 className='uppercase font-[700] my-5'>article</h5>
                <h1 className='w-[70%] font-[500] mb-5 font-poppins text-[54px] leading-[58px]'>How to make a busy bathroom a place to relax</h1>
                <div className='flex gap-10 text-gray-200'>
                    <p className='flex gap-1 items-center'><PiUserCircleLight className='text-2xl' />Henrik Annemark</p>
                    <p className='flex gap-1 items-center'><HiOutlineCalendar className='text-2xl' />October 16, 2023</p>
                </div>
                <div>
                    <Image
                        src={img1}
                        alt='Blog 1'
                        className='w-full h-[646] my-10'
                    />
                    <p className='text-[16px] font-[500] pb-2'>Your bathroom serves a string of busy functions on a daily basis. See how you can make all of them work, and still have room for comfort and relaxation.</p>
                    <h2 className='font-poppins text-[28px] font-[600] py-2'>A cleaning hub with built-in ventilation</h2>
                    <p className='text-[16px] font-[500] py-2'>
                        Use a rod and a shower curtain to create a complement to your cleaning cupboard. Unsightly equipment is stored out of sight yet accessibly close – while the air flow helps dry any dampness.</p>
                </div>
                <div className='flex justify-between my-10'>
                    <Image
                        src={blogb2}
                        alt="blog"
                        width={600}
                        className='h-[729]'
                    />
                    <Image
                        src={blogb3}
                        alt="blog"
                        width={600}
                        className='h-[729]' />
                </div>
                <h2 className='font-poppins text-[28px] font-[500]'>Storage with a calming effect</h2>
                <p className='text-[16px] font-[500] py-2'>
                    Having a lot to store doesn’t mean it all has to go in a cupboard. Many bathroom items are better kept out in the open – either to be close at hand or are nice to look at. Add a plant or two to set a calm mood for the entire room (and they’ll thrive in the humid air).
                </p>
                <h2 className='font-poppins text-[28px] font-[500] py-2'>Kit your clutter for easy access</h2>
                <p className='text-[16px] font-[500] py-2 mb-5'>
                    Even if you have a cabinet ready to swallow the clutter, it’s worth resisting a little. Let containers hold kits for different activities – home spa, make-up, personal hygiene – to bring out or put back at a moment’s notice.</p>
                <div className='flex my-10 justify-between'>
                    <Image src={blogb4}
                        alt='blog'
                        width={600}
                        className='h-[700]' />
                    <div className='flex flex-col w-[600]'>
                        <h2 className='font-poppins text-[28px] font-[500]'>An ecosystem of towels</h2>
                        <p className='text-[16px] font-[500] py-2'>
                            Racks or hooks that allow air to circulate around each towel prolong their freshness. They dry quick and the need for frequent washing is minimized.</p>
                        <h2 className='font-poppins text-[28px] font-[500] py-2'>Kit your clutter for easy access</h2>
                        <p className='text-[16px] font-[500] py-2 mb-5'>
                            Having your cleaning tools organized makes them easier to both use and return to. When they’re not needed, close the curtain and feel the peace of mind it brings.</p></div>
                </div>
            </div>
            <Blog />
            <Newsletter />
            <Footer />
        </div>
    )
}

export default page