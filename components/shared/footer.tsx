"use client";
import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import data from '@/lib/data'

export default function Footer() {
  const { site } = data.settings[0];

  return (
    <footer className="bg-gray-800 text-white border-t font-cairo" dir="rtl">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-right">من نحن</h3>
            <p className="text-xs sm:text-sm text-gray-300 text-right">
              {site.description}
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-right">روابط سريعة</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-right">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-300 hover:text-white transition-colors duration-200">
                  السلة
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-right">خدمة العملاء</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-right">
              <li>
                <Link href="/page/contact-us" className="text-gray-300 hover:text-white transition-colors duration-200">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href="/page/shipping" className="text-gray-300 hover:text-white transition-colors duration-200">
                  معلومات التوصيل
                </Link>
              </li>

            </ul>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-right">قانوني</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-right">
              <li>
                <Link href="/page/privacy-policy" className="text-gray-300 hover:text-white transition-colors duration-200">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/page/conditions-of-use" className="text-gray-300 hover:text-white transition-colors duration-200">
                  شروط الخدمة
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 text-xs sm:text-sm text-gray-300">
          <p className="text-center sm:text-right">&copy; {new Date().getFullYear()} {site.name}. جميع الحقوق محفوظة.</p>
          <p className="text-center sm:text-left">مدعوم بـ Next.js</p>
        </div>
      </div>
    </footer>
  );
}
