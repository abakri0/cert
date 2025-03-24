'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Upload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // التحقق من نوع الملف
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'csv' && fileType !== 'xlsx') {
      setError('يرجى رفع ملف بصيغة CSV أو XLSX فقط');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
    parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    setIsLoading(true);
    
    try {
      // قراءة الملف وتحليله
      const fileContent = await readFileContent(file);
      let data: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        // تحليل ملف CSV
        const Papa = await import('papaparse');
        const result = Papa.parse(fileContent, { header: true });
        data = result.data;
      } else if (file.name.endsWith('.xlsx')) {
        // تحليل ملف XLSX
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(fileContent, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      }
      
      // التحقق من وجود الأعمدة المطلوبة
      const requiredColumns = ['trainee_name', 'email', 'trainee_program'];
      const missingColumns = requiredColumns.filter(col => 
        !data[0] || !Object.keys(data[0]).includes(col)
      );
      
      if (missingColumns.length > 0) {
        setError(`الملف لا يحتوي على الأعمدة المطلوبة: ${missingColumns.join(', ')}`);
        setPreviewData([]);
      } else {
        // عرض معاينة البيانات (أول 5 صفوف)
        setPreviewData(data.slice(0, 5));
        
        // تخزين البيانات في التخزين المحلي
        localStorage.setItem('traineesData', JSON.stringify(data));
      }
    } catch (error: any) {
      console.error('Error parsing file:', error);
      setError(`حدث خطأ أثناء تحليل الملف: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('فشل في قراءة الملف'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('فشل في قراءة الملف'));
      };
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const handleContinue = () => {
    if (previewData.length > 0) {
      router.push('/generate');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <Link href="/" className="text-primary hover:underline mb-4 inline-block">
          &larr; العودة إلى الصفحة الرئيسية
        </Link>
        <h1 className="text-3xl font-bold">رفع ملف البيانات</h1>
      </header>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">رفع ملف CSV أو XLSX</h2>
        <p className="mb-4">
          يرجى رفع ملف يحتوي على الأعمدة التالية: trainee_name, name_en, email, phone_code, phone_number, start_date, end_date, Gender, trainee_program, title, year_issue, date_issue
        </p>
        
        <div className="mb-6">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="block w-full text-gray-700 bg-white rounded-lg border border-gray-300 cursor-pointer focus:outline-none p-2"
          />
          {error && (
            <div className="mt-2 text-red-600 text-sm">{error}</div>
          )}
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="mr-2">جاري تحليل الملف...</span>
          </div>
        )}
        
        {previewData.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-2">معاينة البيانات</h3>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    {Object.keys(previewData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value: any, i) => (
                        <td key={i}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleContinue}
                className="btn-primary"
              >
                متابعة إلى إنشاء الشهادات
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
