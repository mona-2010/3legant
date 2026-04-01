import { ArrowRight } from "lucide-react";
import Link from "next/link";

type ButtonTextProps = {
    heading?: string,
    text: string;
    linkTo: string;
};

const ButtonText = ({ text, linkTo, heading }: ButtonTextProps) => {
    return (
        <div className="flex flex-col">
            <h1 className="text-[20px] md:text-[25px] lg:text-[34px] mb-2">{heading}</h1>
            <div className="w-fit border-b border-black-shade-1 font-medium leading-[28px] max-sm:text-sm max-sm:leading-6 undefined"> 
                <Link
                href={`/${linkTo}`}
                className="text-[14px] md:text-[16px] flex items-center">
                <p className="text-primary text-md">
                    {text}
                </p>
                <ArrowRight />
            </Link>
            </div>

        </div>
    );
};

export default ButtonText;