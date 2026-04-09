import Image from 'next/image'
import signup from "../assets/images/signup.png"
import SigninForm from '@/components/auth/SigninForm'
import Link from 'next/link'

const SignIn = () => {
    return (
        <section className='flex flex-col md:flex-row'>
            <div className="relative w-full md:w-1/2 h-[50vh] md:h-[70vh] md:h-screen">

                <Image
                    src={signup}
                    alt="Sign up Image"
                    fill
                    className="object-contain bg-gray-100"
                    priority
                />
                <Link
                    href="/"
                    className="absolute top-5 md:top-10 left-1/2 -translate-x-1/2 
                     text-[25px] font-poppins font-medium"
                >
                    3legant<span className="text-gray-200">.</span>
                </Link>

            </div>
            <SigninForm />
        </section>
    )
}

export default SignIn
