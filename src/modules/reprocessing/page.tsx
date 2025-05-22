"use client";

import { CustomBreadcrumb } from "@/common/components/custom-breadcrumb/custom-breadcrumb";

export default function Reprocessing() {
  return (
    <>
      <CustomBreadcrumb name="Trade-In" className="mb-12" />
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Trade in your old device & get a discount!
        </h1>
        <div className="text-center p-8 shadow-xl rounded-2xl bg-white border border-gray-200 max-w-2xl">
          <p className="text-lg text-gray-700 mb-6 font-medium leading-relaxed">
            Our partner offers a trade-in program for old devices! Simply bring
            your device to the exchange point and receive a bonus towards the
            purchase of new equipment.
          </p>
          <ul className="text-left text-gray-600 list-disc pl-6 mb-6 space-y-2">
            <li>
              We accept smartphones, laptops, tablets, and other electronics.
            </li>
            <li>The discount amount depends on the condition of the device.</li>
            <li>The discount applies to all product categories.</li>
          </ul>
          <div className="bg-gray-100 p-6 rounded-lg shadow-inner text-left flex flex-col md:flex-row gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Exchange Point:
              </h2>
              <ul className="text-gray-700 flex flex-col gap-4">
                <li>
                  <span className="font-bold">TechRecycle Center</span>
                </li>
                <li>
                  <span className="font-bold">Address:</span> 123 Main Street,
                  Anytown, USA
                </li>
                <li>
                  <span className="font-bold">Opening hours:</span> Mon-Fri
                  10:00 AM - 6:00 PM
                </li>
                <li>
                  <span className="font-bold">Phone:</span> +1 (555) 123-4567
                </li>
              </ul>
            </div>
            <iframe
              className="w-full md:w-[300px] h-[200px] rounded-lg shadow-lg border"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.22248317193!2d30.47143197609811!3d50.455581586994796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce80bb14c36b%3A0x5c4eb5067e6b48c6!2z0YPQuy4g0JHQvtCz0LTQsNC90LAg0JPQsNCy0YDQuNC70LjRiNC40L3QsCwgMjQsINCa0LjQtdCyLCAwMjAwMA!5e0!3m2!1sru!2sua!4v1743677002506!5m2!1sru!2sua"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </>
  );
}
