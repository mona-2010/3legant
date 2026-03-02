import React from 'react'

const titlegrid = () => {
    return (
        <div className="mx-[32px] md:mx-[140px] flex flex-col justify-center items-center gap-4 md:gap-10 my-5 lg:flex-row">
			<h2 className="font-poppins font-[500] text-4xl md:text-7xl mb-4 min-w-[55%]">
				Simply Unique<span className="text-[#6C7275]">/</span> <br /> Simply Better
				<span className="text-[#6C7275]">.</span>
			</h2>
			<div className="min-w-[40%]">
				<p className="font-normal text-[14px] md:text-[16px] text-[#6C7275]">
					<span className="font-semibold text-[#121212]">3legant</span> is
					a gift & decorations store based in HCMC, Vietnam. Est since 2019.
				</p>
			</div>
		</div>
    )
}

export default titlegrid