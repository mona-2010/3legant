import Image from 'next/image'
import signup from "../assets/images/signup.png"
import Link from 'next/link'
import ResetForm from '@/components/auth/ResetForm'
import ForgotPwdForm from '@/components/auth/ForgotPwdForm'

const ForgotPassword = () => {
    return (
        <section className='flex flex-col md:flex-row h-screen'>
            <div className="relative w-full md:w-1/2 h-[70vh] md:h-screen">

                <Image
                    src={signup}
                    alt="Sign up Image"
                    fill
                    className="object-cover"
                    priority
                />
                <Link
                    href="/"
                    className="absolute top-10 left-1/2 -translate-x-1/2 
                     text-[25px] font-poppins font-medium"
                >
                    3legant<span className="text-gray-200">.</span>
                </Link>

            </div>
            <ForgotPwdForm/>
        </section>
    )
}

export default ForgotPassword
