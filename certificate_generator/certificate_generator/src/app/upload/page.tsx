"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';

export default function Upload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [newProgram, setNewProgram] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [customPrograms, setCustomPrograms] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedPrograms = localStorage.getItem('customPrograms');
    if (savedPrograms) {
      setCustomPrograms(JSON.parse(savedPrograms));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

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

  const reverseEnglishWords = (text: string) => {
    return text.replace(/[A-Za-z]+/g, (match) =>
      match.split('').reverse().join('')
    );
  };

  const handleNameSubmit = () => {
    const processedName = reverseEnglishWords(customName);
    const updatedPrograms = {
      ...customPrograms,
      [newProgram]: processedName
    };

    setCustomPrograms(updatedPrograms);
    localStorage.setItem('customPrograms', JSON.stringify(updatedPrograms));
    setShowModal(false);
    setCustomName('');
  };

  const getProgramName = async (program: string) => {
    if (customPrograms[program]) return customPrograms[program];

    const predefined: { [key: string]: string } = {
      'UX/UI': 'تصميم الواجهات وتجربة المستخدم IU/XU',
      'Excel & Power-Bi': 'تحليل البيانات بإستخدام IB-rewoP & lecxE',
      'Frontend Development': 'تطوير مواقع الويب repoleveD dne-tnorF',
      'Power-Bi': 'تحليل البيانات بإستخدام IB-rewoP',
      'Game Dev': 'تطوير الالعاب باستخدام ytinU',
      '3D Design': 'التصميم ثلاثي الابعاد للالعاب'
    };

    if (predefined[program]) return predefined[program];

    setNewProgram(program);
    setShowModal(true);

    return new Promise<string>((resolve) => {
      const checkInterval = setInterval(() => {
        if (customPrograms[program]) {
          clearInterval(checkInterval);
          resolve(customPrograms[program]);
        }
      }, 100);
    });
  };

  const parseFile = async (file: File) => {
    setIsLoading(true);

    try {
      const fileContent = await readFileContent(file);
      let data: any[] = [];

      if (file.name.endsWith('.csv')) {
        const Papa = await import('papaparse');
        const result = Papa.parse(fileContent, { header: true });
        data = result.data;
      } else if (file.name.endsWith('.xlsx')) {
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(fileContent, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      }

      const requiredColumns = ['Program', 'Name AR', 'Gender', 'Email'];
      const missingColumns = requiredColumns.filter(col =>
        !data[0] || !Object.keys(data[0]).includes(col)
      );

      if (missingColumns.length > 0) {
        setError(`الملف لا يحتوي على الأعمدة المطلوبة: ${missingColumns.join(', ')}`);
        setPreviewData([]);
      } else {
        const processedData = [];
        for (const row of data) {
          const program = row['Program'];
          const trainee_program = await getProgramName(program);

          processedData.push({
            trainee_name: row['Name AR'],
            email: row['Email'],
            trainee_program
          });
        }

        setPreviewData(processedData); // تحديث حالة previewData
        localStorage.setItem('traineesData', JSON.stringify(processedData));
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
          يرجى رفع ملف يحتوي على الأعمدة التالية: Program,	Name AR,	Gender,	Email
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
        <button onClick={() => setShowModal(true)}>فتح المودال</button>

        <Dialog
          open={showModal}
          onClose={() => setShowModal(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  إدخال اسم البرنامج
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">البرنامج الجديد: {newProgram}</p>
                </div>

                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="أدخل الاسم المعروض (سيتم عكس الكلمات الإنجليزية تلقائيًا)"
                  className="w-full p-2 border rounded mb-4"
                />

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleNameSubmit}
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={() => setShowModal(false)}
                  >
                    إلغاء
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>

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
