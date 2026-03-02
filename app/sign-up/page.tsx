import Image from 'next/image'
import signup from "../assets/images/signup.png"
import SignupForm from '@/components/auth/SignupForm'
import Link from 'next/link'

const SignUp = () => {
    return (
        <section className='relative flex flex-col md:flex-row'>
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
                    3legant<span className="text-[#6C7275]">.</span>
                </Link>

            </div><SignupForm />
        </section>
    )
}

export default SignUp
