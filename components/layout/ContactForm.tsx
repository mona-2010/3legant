import { BiLocationPlus } from 'react-icons/bi';
import { FiPhone } from 'react-icons/fi';
import { HiOutlineMail } from 'react-icons/hi';
import { IoHomeOutline } from 'react-icons/io5';

const values = [
    { icon: <IoHomeOutline />, title: "Address", desc: "234 Hai Trieu, Ho Chi Minh City, Viet Nam" },
    { icon: <FiPhone />, title: "Contact us", desc: "+84 234 567 890" },
    { icon: <HiOutlineMail />, title: "Email", desc: "hello@3legant.com" },
];

const ContactForm = () => {
    return (
        <>
            <h1 className='font-poppins font-medium text-[40px] text-center leading-[44px]'>Contact Us</h1>
            <div className="text-center flex flex-col md:flex-row md:justify-between lg:flex-row lg:justify-between my-4 gap-6">
                {values.map((value, index) => (
                    <div key={index} className="flex flex-col items-center w-full overflow-hidden max-sm:h-[150px]">
                        <div className="text-lg flex flex-col items-center justify-center md:text-4xl bg-[#F3F5F7] w-[250px] md:w-[390px] h-[200px] px-2 md:px-8 max-sm:px-4 max-sm:py-8">
                            {value.icon}
                            <p className="uppercase max-lg:text-md font-inter text-[20px] py-2 md:py-4 font-[700] text-[#6C7275] max-md:text-sm max-sm:font-semibold">
                                {value.title}
                            </p>
                            <p className="px-2 md:px-10 max-sm:w-50 font-semibold text-[12px] md:text-[12px] lg:text-[16px] text-[#141718]">
                                {value.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <div className='flex flex-col md:flex-row justify-center gap-10 my-10'>
                <form action="" className='w-full md:w-1/2'>
                    <div className='flex flex-col gap-3'>
                        <label htmlFor="fullname" className='font-[600] uppercase text-[#6C7275]'>Full Name</label>
                        <input
                            type="text"
                            name='fullname'
                            placeholder="Your Name"
                            className='border border-[#CBCBCB] rounded-md px-4 py-2 mb-3'
                        />
                        <label htmlFor="email" className='font-[600] uppercase text-[#6C7275]'>Email Address</label>
                        <input
                            type="text"
                            name='email'
                            placeholder="Your Email"
                            className='border border-[#CBCBCB] rounded-md px-4 py-2 mb-3'
                        />
                        <label htmlFor="message" className='font-[600] uppercase text-[#6C7275]'>Message</label>
                        <textarea
                            name='message'
                            placeholder="Your Message"
                            rows={4}
                            className='border border-[#CBCBCB] rounded-md px-4 py-2 mb-3'
                        />
                    </div>
                    <button className='text-center rounded-[8px] mt-6 py-[10px] px-[40px] bg-[#141718] text-white'>Send Message</button>
                </form>
                <div className="relative w-full md:w-1/2 h-[50vh] md:h-[550px]">

                    {/* Google Map Iframe */}
                    <iframe
                        className="w-full h-full border-0 block"
                        title="Google Maps Location - New York"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193571.43883442905!2d-74.11808690587499!3d40.70583163920109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c250b41c23b6b1%3A0xa9250b1c6b1a0!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1709459285600!5m2!1sen!2sin"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />

                    {/* Center Marker */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                            <BiLocationPlus className='text-2xl' />
                        </div>
                    </div>

                </div>
            </div>

        </>
    );
}

export default ContactForm