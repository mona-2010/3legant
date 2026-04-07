import LegalPage from "@/components/ui/LegalPage";
import React from "react";

const PrivacyPolicy = () => {
    return (
        <LegalPage title="Privacy Policy">
            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">1. Introduction</h2>
                <p className="mb-4">
                    At 3legant, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and make a purchase.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">2. Information We Collect</h2>
                <p className="mb-2">We collect the following types of information:</p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>Account Information:</strong> Name, email address, username, and password when you register.</li>
                    <li><strong>Order Details:</strong> Shipping and billing addresses, phone number, and order history.</li>
                    <li><strong>Payment Information:</strong> All payments are processed through Stripe. We do NOT store your credit card or sensitive payment details on our servers.</li>
                    <li><strong>Device Information:</strong> IP address and browser type for security and analytics.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">3. How We Use Your Information</h2>
                <p className="mb-2">Your data is used for:</p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Processing and shipping your orders.</li>
                    <li>Managing your account and providing customer support.</li>
                    <li>Sending order confirmations and shipping updates.</li>
                    <li>Improving our website and shopping experience.</li>
                    <li>Security monitoring and fraud prevention.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">4. Data Sharing and Third-Parties</h2>
                <p className="mb-4">
                    We do not sell your personal data. We share information only with trusted third-parties necessary for our operations:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>Supabase:</strong> For secure database management and user authentication.</li>
                    <li><strong>Stripe:</strong> For secure payment processing.</li>
                    <li><strong>Shipping Partners:</strong> To deliver your orders to India and the USA.</li>
                </ul>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">5. Cookies</h2>
                <p className="mb-4">
                    We use cookies to keep you logged in and to remember the items in your shopping cart. You can disable cookies in your browser settings, but some features of the site may not function correctly.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">6. Your Rights</h2>
                <p className="mb-4">
                    You have the right to access, update, or request the deletion of your personal information at any time through your account settings or by contacting us.
                </p>
            </section>

            <section className="mb-10">
                <h2 className="text-[#141718] font-semibold text-[20px] md:text-[24px] mb-4">7. Updates to This Policy</h2>
                <p className="mb-4">
                    We may update this policy periodically. The latest version will always be available on this page.
                </p>
            </section>
        </LegalPage>
    );
};

export default PrivacyPolicy;
