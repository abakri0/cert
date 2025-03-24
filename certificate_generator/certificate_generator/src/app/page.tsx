'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-4xl font-bold mb-6">مولد الشهادات</h1>
        <p className="text-xl mb-8 max-w-2xl">
          أداة سهلة الاستخدام لإنشاء وإرسال الشهادات باستخدام خطوط شامل العربية. قم برفع ملف البيانات الخاص بك وإنشاء شهادات احترافية في ثوانٍ.
        </p>
        
        <div className="card w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold mb-4">ابدأ الآن</h2>
          <p className="mb-6">
            قم برفع ملف CSV أو XLSX يحتوي على بيانات المتدربين لإنشاء الشهادات.
          </p>
          <Link href="/upload" className="btn-primary w-full block">
            رفع ملف البيانات
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="card">
            <h3 className="text-xl font-bold mb-2">رفع البيانات</h3>
            <p>قم برفع ملف CSV أو XLSX يحتوي على بيانات المتدربين.</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-2">إنشاء الشهادات</h3>
            <p>قم بإنشاء الشهادات باستخدام قالب PDF مخصص وخطوط شامل العربية.</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-2">إرسال بالبريد الإلكتروني</h3>
            <p>أرسل الشهادات مباشرة إلى المتدربين عبر البريد الإلكتروني.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
