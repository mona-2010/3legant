import React from 'react'

const titlegrid = () => {
    return (
        <div className="mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] flex flex-col justify-center items-center gap-4 md:gap-7 lg:gap-10 my-5 md:flex-row">
			<h2 className="font-poppins font-[500] text-4xl md:text-5xl lg:text-7xl mb-4 min-w-[55%]">
				Simply Unique<span className="text-gray-200">/</span> <br /> Simply Better
				<span className="text-gray-200">.</span>
			</h2>
			<div className="min-w-[40%]">
				<p className="text-[14px] md:text-[16px] text-gray-200">
					<span className="font-semibold text-[#121212]">3legant</span> is
					a gift & decorations store based in HCMC, Vietnam. Est since 2019.
				</p>
			</div>
		</div>
    )
}

export default titlegrid