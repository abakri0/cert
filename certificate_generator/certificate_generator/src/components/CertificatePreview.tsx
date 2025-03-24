'use client';

import React from 'react';

interface CertificatePreviewProps {
  certificate: {
    id: number;
    trainee: any;
    pdfBytes: Uint8Array;
  } | null;
  onDownload: () => void;
  onSendEmail: () => void;
}

export default function CertificatePreview({ certificate, onDownload, onSendEmail }: CertificatePreviewProps) {
  // إنشاء URL للعرض من مصفوفة البايت
  const getPdfUrl = () => {
    if (!certificate) return '';
    
    const blob = new Blob([certificate.pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };
  
  // تنظيف URL عند إزالة المكون
  React.useEffect(() => {
    const url = getPdfUrl();
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [certificate]);
  
  if (!certificate) {
    return (
      <div className="card flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <p className="text-gray-600">لم يتم اختيار أي شهادة للمعاينة</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">معاينة الشهادة</h2>
        <div className="flex gap-2">
          <button 
            onClick={onDownload}
            className="btn-primary"
          >
            تنزيل الشهادة
          </button>
          <button 
            onClick={onSendEmail}
            className="btn-secondary"
          >
            إرسال بالبريد الإلكتروني
          </button>
        </div>
      </div>
      
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2">تفاصيل الشهادة:</h3>
        <p><strong>الاسم:</strong> {certificate.trainee.trainee_name}</p>
        <p><strong>البريد الإلكتروني:</strong> {certificate.trainee.email}</p>
        <p><strong>البرنامج التدريبي:</strong> {certificate.trainee.trainee_program}</p>
      </div>
      
      <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <iframe 
          src={getPdfUrl()} 
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
          title="معاينة الشهادة"
        />
      </div>
    </div>
  );
}
