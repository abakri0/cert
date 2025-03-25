'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CertificatePreview from '../../components/CertificatePreview';

export default function Generate() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [traineesData, setTraineesData] = useState<any[]>([]);
  const [generatedCertificates, setGeneratedCertificates] = useState<any[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [customTemplate, setCustomTemplate] = useState<File | null>(null);
  const [templateUrl, setTemplateUrl] = useState<string>('/template.pdf');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [showDateFields, setShowDateFields] = useState(false);

  // قائمة الأشهر المختصرة
  const months = [
    { value: '', label: 'بدون شهر' },
    { value: 'JAN', label: 'JAN - يناير' },
    { value: 'FEB', label: 'FEB - فبراير' },
    { value: 'MAR', label: 'MAR - مارس' },
    { value: 'APR', label: 'APR - أبريل' },
    { value: 'MAY', label: 'MAY - مايو' },
    { value: 'JUN', label: 'JUN - يونيو' },
    { value: 'JUL', label: 'JUL - يوليو' },
    { value: 'AUG', label: 'AUG - أغسطس' },
    { value: 'SEP', label: 'SEP - سبتمبر' },
    { value: 'OCT', label: 'OCT - أكتوبر' },
    { value: 'NOV', label: 'NOV - نوفمبر' },
    { value: 'DEC', label: 'DEC - ديسمبر' }
  ];

  // قائمة السنوات
  const years = [
    { value: '', label: 'بدون سنة' },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
    { value: '2027', label: '2027' },
    { value: '2028', label: '2028' }
  ];

  // استرجاع بيانات المتدربين من التخزين المحلي عند تحميل الصفحة
  useEffect(() => {
    const storedData = localStorage.getItem('traineesData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setTraineesData(parsedData);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        setError('حدث خطأ في استرجاع بيانات المتدربين');
      }
    } else {
      setError('لم يتم العثور على بيانات المتدربين. يرجى رفع ملف البيانات أولاً.');
    }
  }, []);

  // معالجة تغيير قالب PDF
  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('يرجى رفع ملف PDF فقط');
        return;
      }
      
      setCustomTemplate(file);
      const url = URL.createObjectURL(file);
      setTemplateUrl(url);
      
      // إعادة تعيين الشهادات المولدة عند تغيير القالب
      setGeneratedCertificates([]);
      setSelectedCertificate(null);
    }
  };

  // معالجة تغيير الشهر
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
    // إعادة تعيين الشهادات المولدة عند تغيير الشهر
    setGeneratedCertificates([]);
    setSelectedCertificate(null);
  };

  // معالجة تغيير السنة
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
    // إعادة تعيين الشهادات المولدة عند تغيير السنة
    setGeneratedCertificates([]);
    setSelectedCertificate(null);
  };

  // تبديل عرض حقول التاريخ
  const toggleDateFields = () => {
    setShowDateFields(!showDateFields);
    if (!showDateFields) {
      // إذا تم تفعيل حقول التاريخ، نعيد تعيين الشهادات المولدة
      setGeneratedCertificates([]);
      setSelectedCertificate(null);
    }
  };

  // إنشاء الشهادات
  const handleGenerateCertificates = async () => {
    if (traineesData.length === 0) {
      setError('لا توجد بيانات متدربين لإنشاء الشهادات');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      // استيراد المكتبات اللازمة
      const { PDFDocument, rgb } = await import('pdf-lib');
      const fontkit = await import('fontkit');
      
      const certificates = [];
      
      for (let i = 0; i < traineesData.length; i++) {
        const trainee = traineesData[i];
        
        try {
          // قراءة ملف القالب
          const templateBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
          
          // إنشاء مستند PDF جديد من القالب
          const pdfDoc = await PDFDocument.load(templateBytes);
          
          // تسجيل fontkit - هذا هو الإصلاح الرئيسي
          pdfDoc.registerFontkit(fontkit);
          
          // تحميل الخطوط
          const shamelBoldBytes = await fetch('/fonts/shamel_bold.ttf').then(res => res.arrayBuffer());
          const shamelLightBytes = await fetch('/fonts/shamel_light.ttf').then(res => res.arrayBuffer());
          
          // تسجيل الخطوط في المستند
          const shamelBoldFont = await pdfDoc.embedFont(shamelBoldBytes);
          const shamelLightFont = await pdfDoc.embedFont(shamelLightBytes);
          
          // الحصول على الصفحة الأولى من القالب
          const pages = pdfDoc.getPages();
          const firstPage = pages[0];
          
          // الحصول على أبعاد الصفحة
          const { width, height } = firstPage.getSize();
          
          // دالة مساعدة لتوسيط النص
          const getCenteredPosition = (text: string, font: any, size: number) => {
            const textWidth = font.widthOfTextAtSize(text, size);
            return (width - textWidth) / 2;
          };
          
          // رسم اسم المتدرب في المنتصف
          firstPage.drawText(trainee.trainee_name, {
            x: getCenteredPosition(trainee.trainee_name, shamelBoldFont, 30),
            y: height - 350, // موقع اسم المتدرب
            size: 30,
            font: shamelBoldFont,
            color: rgb(0.62, 0.45, 0.78), // لون أرجواني
          });
          
          // تصحيح اتجاه النص الإنجليزي في اسم البرنامج التدريبي
          let programName = trainee.trainee_program;
          // استبدال النص المقلوب بالنص الصحيح
          programName = programName.replace(/\)XU\/IU\(/g, '(UX/UI)');
          
          // رسم اسم البرنامج التدريبي
          firstPage.drawText(programName, {
            x: getCenteredPosition(programName, shamelBoldFont, 30),
            y: height - 510, // موقع البرنامج التدريبي
            size: 30,
            font: shamelBoldFont,
            color: rgb(0.77, 0.67, 0.86), // لون أرجواني فاتح
          });
          
          // إضافة الشهر والسنة إذا تم تفعيل حقول التاريخ
          if (showDateFields) {
            // إضافة الشهر في الأعلى على اليمين
            if (selectedMonth) {
              firstPage.drawText(selectedMonth, {
                x: width - 100, // موقع الشهر على اليمين
                y: height - 100, // موقع الشهر في الأعلى
                size: 20,
                font: shamelBoldFont,
                color: rgb(0.3, 0.3, 0.3), // لون رمادي داكن
              });
            }
            
            // إضافة السنة في الأعلى على اليسار
            if (selectedYear) {
              firstPage.drawText(selectedYear, {
                x: 80, // موقع السنة على اليسار
                y: height - 100, // موقع السنة في الأعلى
                size: 20,
                font: shamelBoldFont,
                color: rgb(0.3, 0.3, 0.3), // لون رمادي داكن
              });
            }
          }
          
          // حفظ المستند كمصفوفة بايت
          const pdfBytes = await pdfDoc.save();
          
          certificates.push({
            id: i + 1,
            trainee: trainee,
            pdfBytes: pdfBytes
          });
        } catch (error: any) {
          console.error(`Error generating certificate for ${trainee.trainee_name}:`, error);
        }
      }
      
      setGeneratedCertificates(certificates);
      
      if (certificates.length > 0) {
        setSelectedCertificate(certificates[0].id);
      }
    } catch (error: any) {
      console.error('Error generating certificates:', error);
      setError(`حدث خطأ أثناء إنشاء الشهادات: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // تنزيل الشهادة المحددة
  const handleDownloadCertificate = () => {
    if (selectedCertificate) {
      const certificate = generatedCertificates.find(cert => cert.id === selectedCertificate);
      if (certificate) {
        const blob = new Blob([certificate.pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${certificate.trainee.trainee_name.replace(/\s+/g, '_')}.pdf`;
        link.click();
        
        URL.revokeObjectURL(url);
      }
    }
  };

  // تنزيل جميع الشهادات
  const handleDownloadAllCertificates = () => {
    if (generatedCertificates.length > 0) {
      // في هذه النسخة المبسطة، سنقوم بتنزيل كل شهادة على حدة
      for (const cert of generatedCertificates) {
        const blob = new Blob([cert.pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cert.trainee.trainee_name.replace(/\s+/g, '_')}.pdf`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        // انتظار لحظة قبل تنزيل الملف التالي لتجنب حظر المتصفح
        setTimeout(() => {}, 500);
      }
    }
  };

  // الحصول على الشهادة المحددة
  const getSelectedCertificateObject = () => {
    if (selectedCertificate) {
      return generatedCertificates.find(cert => cert.id === selectedCertificate) || null;
    }
    return null;
  };

  // إرسال الشهادة المحددة بالبريد الإلكتروني
  const handleSendEmail = () => {
    router.push('/send');
  };

  // إعادة تعيين القالب إلى القالب الافتراضي
  const handleResetTemplate = () => {
    setCustomTemplate(null);
    setTemplateUrl('/template.pdf');
    // إعادة تعيين الشهادات المولدة عند إعادة تعيين القالب
    setGeneratedCertificates([]);
    setSelectedCertificate(null);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <Link href="/upload" className="text-primary hover:underline mb-4 inline-block">
          &larr; العودة إلى صفحة رفع الملفات
        </Link>
        <h1 className="text-3xl font-bold">إنشاء الشهادات</h1>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">الإعدادات</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">قالب الشهادة</label>
              <div className="flex items-center mb-2">
                <button 
                  onClick={handleResetTemplate}
                  className="btn-secondary text-sm mr-2"
                  disabled={!customTemplate}
                >
                  استخدام القالب الافتراضي
                </button>
                {customTemplate && (
                  <span className="text-sm text-green-600">
                    تم رفع: {customTemplate.name}
                  </span>
                )}
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleTemplateChange}
                className="block w-full text-gray-700 bg-white rounded-lg border border-gray-300 cursor-pointer focus:outline-none p-2"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="show-date-fields"
                  checked={showDateFields}
                  onChange={toggleDateFields}
                  className="mr-2"
                />
                <label htmlFor="show-date-fields" className="text-sm font-medium">
                  إضافة حقول التاريخ (اختياري)
                </label>
              </div>
              
              {showDateFields && (
                <div className="mt-2 bg-gray-50 p-3 rounded">
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">الشهر (يظهر في أعلى اليمين)</label>
                    <select 
                      className="input-field" 
                      value={selectedMonth}
                      onChange={handleMonthChange}
                    >
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">السنة (تظهر في أعلى اليسار)</label>
                    <select 
                      className="input-field" 
                      value={selectedYear}
                      onChange={handleYearChange}
                    >
                      {years.map((year) => (
                        <option key={year.value} value={year.value}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">الخط</label>
              <select className="input-field">
                <option>شامل بولد</option>
                <option>شامل لايت</option>
              </select>
            </div>
            
            <button 
              onClick={handleGenerateCertificates}
              disabled={isGenerating || traineesData.length === 0}
              className={`btn-primary w-full ${(isGenerating || traineesData.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? 'جاري الإنشاء...' : 'إنشاء الشهادات'}
            </button>
          </div>
          
          {generatedCertificates.length > 0 && (
            <div className="card mt-4">
              <h2 className="text-xl font-bold mb-4">قائمة الشهادات ({generatedCertificates.length})</h2>
              <div className="max-h-80 overflow-y-auto">
                <ul className="divide-y">
                  {generatedCertificates.map((cert) => (
                    <li 
                      key={cert.id} 
                      className={`py-2 px-2 cursor-pointer hover:bg-gray-50 ${selectedCertificate === cert.id ? 'bg-primary-light bg-opacity-20 rounded' : ''}`}
                      onClick={() => setSelectedCertificate(cert.id)}
                    >
                      <p className="font-bold">{cert.trainee.trainee_name}</p>
                      <p className="text-sm text-gray-600">{cert.trainee.email}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          {isGenerating ? (
            <div className="card flex items-center justify-center min-h-[500px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600">جاري إنشاء الشهادات...</p>
              </div>
            </div>
          ) : (
            <CertificatePreview 
              certificate={getSelectedCertificateObject()}
              onDownload={handleDownloadCertificate}
              onSendEmail={handleSendEmail}
            />
          )}
          
          {generatedCertificates.length > 0 && (
            <div className="card mt-4">
              <h2 className="text-xl font-bold mb-4">إجراءات جماعية</h2>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleDownloadAllCertificates}
                  className="btn-primary"
                >
                  تنزيل جميع الشهادات
                </button>
                <Link href="/send" className="btn-primary">
                  إرسال جميع الشهادات بالبريد الإلكتروني
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
