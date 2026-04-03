import React from 'react'
import { Header } from '../dynamicComponents'
import Breadcrumb from '../BreadCrumb'
import AboutBanner from '../layout/AboutBanner'
import ContactForm from '../forms/ContactForm'
import Values from '../layout/Values'
import Footer from '../layout/Footer'

const ContactPage = () => {
    return (
        <div>
            <Header />
            <div className="page-content-container">
                <div className='mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px]'>
                    <div className='my-5'><Breadcrumb currentPage='Contact us' /></div>
                    <h1 className='w-[85%] md:w-[70%] text-[30px] md:text-[54px] font-poppins font-medium leading-[30px] md:leading-[58px] mt-10'>We believe in sustainable decor. We’re passionate about life at home.</h1>
                    <p className='w-[90%] md:w-[70%] leading-[26px] py-[24px] text-[16px]'>Our features timeless furniture, with natural fabrics, curved lines, plenty of mirrors and classic design, which can be incorporated into any decor project. The pieces enchant for their sobriety, to last for generations, faithful to the shapes of each period, with a touch of the present</p>
                    <AboutBanner />
                    <ContactForm />
                </div>
                <div className='bg-gray-100'>
                    <Values />
                </div>
            </div>
            <Footer/>
        </div>
    )
}

export default ContactPage