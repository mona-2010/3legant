"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "../BreadCrumb";
import { Header, NavigationHeader } from "../dynamicComponents";
import Newsletter from "../layout/NewsLetter";
import Footer from "../layout/Footer";

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

const LegalPage = ({ title, children }: LegalPageProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {mounted && (
        <>
          <NavigationHeader />
          <Header />
        </>
      )}
      <main className="page-content-container">
        <div className="mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] my-2 md:my-10">
          <Breadcrumb currentPage={title} />
          <h1 className="text-center my-4 md:my-5 font-poppins text-[28px] md:text-[48px] lg:text-[54px] font-medium text-black">
            {title}
          </h1>
          <div className="max-w-full text-gray-200 font-inter leading-relaxed text-[14px] md:text-[16px]">
            {children}
          </div>
        </div>
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default LegalPage;
