import LegalPage from "@/components/ui/LegalPage";
import React from "react";

const TermsOfUse = () => {
    return (
        <LegalPage title="Terms of Use">
            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">1. Acceptance of Terms</h2>
                <p className="mb-4">
                    By accessing and using the 3legant website, you agree to comply with and be bound by these Terms of Use. If you do not agree, please do not use our services.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">2. Account Responsibility</h2>
                <p className="mb-4">
                    When you create an account with us, you are responsible for maintaining the confidentiality of your credentials. You agree to notify us immediately of any unauthorized use of your account.
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Username and passwords must be kept secure.</li>
                    <li>You are responsible for all activities that occur under your account.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">3. Payments and Billing</h2>
                <p className="mb-4">
                    We want your shopping experience to be smooth. Here are the payment conditions:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>Stripe:</strong> We accept all major credit and debit cards through our secure Stripe payment gateway.</li>
                    <li><strong>PayPal:</strong> Please note that PayPal is currently unavailable as a payment method.</li>
                    <li><strong>Currencies:</strong> All prices are displayed in USD unless otherwise specified.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">4. Shipping Constraints</h2>
                <p className="mb-4">
                    At this time, 3legant ships exclusively to the following regions:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>USA (United States of America)</strong></li>
                    <li><strong>India</strong></li>
                </ul>
                <p className="mt-4">
                    We are working on expanding our reach. Standard shipping times apply once an order is processed.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">5. Returns and Refunds</h2>
                <p className="mb-4">
                    We offer a 30-day return policy for most items. Items must be in their original packaging and unused.
                </p>
                <p className="mb-4">
                    Refunds will be processed back to your original payment method once the return is inspected and approved.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">6. Prohibited Activities</h2>
                <p className="mb-4">
                    You may not use our website for any illegal or unauthorized purpose, including but not limited to hacking, spread of malware, or unauthorized data scraping.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">7. Limitation of Liability</h2>
                <p className="mb-4">
                    3legant is not liable for any direct, indirect, incidental, or consequential damages resulting from your use of the site or products purchased.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">8. Governing Law</h2>
                <p className="mb-4">
                    These Terms of Use are governed by the laws of the jurisdiction in which 3legant operates.
                </p>
            </section>
        </LegalPage>
    );
};

export default TermsOfUse;
