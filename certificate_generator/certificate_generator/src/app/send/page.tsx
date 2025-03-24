'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Send() {
  const [traineesData, setTraineesData] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingResults, setSendingResults] = useState<{email: string, status: string, message: string}[]>([]);
  const [error, setError] = useState<string>('');
  const [testMode, setTestMode] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>('default');
  const [emailSettings, setEmailSettings] = useState({
    emailUser: '',
    emailPassword: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    fromName: ''
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestEmail(e.target.value);
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestMode(e.target.value === 'test');
  };

  // تغيير نوع قالب البريد الإلكتروني
  const handleTemplateTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplateType(e.target.value);
  };

  // الحصول على قالب البريد الإلكتروني المناسب حسب الجنس
  const getEmailTemplateByGender = (gender: string) => {
    if (selectedTemplateType === 'default') {
      return `مرحباً،

نرجو أن تجد مرفقاً شهادة إتمام البرنامج التدريبي.

شكراً لمشاركتك معنا.

مع أطيب التحيات،
فريق التدريب`;
    } else if (selectedTemplateType === 'male') {
      return `مرحباً،

نرجو أن تجد مرفقاً شهادتك لإتمام البرنامج التدريبي.

شكراً لمشاركتك معنا، ونتمنى لك التوفيق في مسيرتك المهنية.

مع أطيب التحيات،
فريق التدريب`;
    } else if (selectedTemplateType === 'female') {
      return `مرحباً،

نرجو أن تجدي مرفقاً شهادتك لإتمام البرنامج التدريبي.

شكراً لمشاركتك معنا، ونتمنى لك التوفيق في مسيرتك المهنية.

مع أطيب التحيات،
فريق التدريب`;
    }
    
    // استخدام القالب الافتراضي إذا لم يتم تحديد نوع
    return `مرحباً،

نرجو أن تجد مرفقاً شهادة إتمام البرنامج التدريبي.

شكراً لمشاركتك معنا.

مع أطيب التحيات،
فريق التدريب`;
  };

  const validateSettings = () => {
    if (!emailSettings.emailUser || !emailSettings.emailPassword || !emailSettings.smtpHost || !emailSettings.smtpPort) {
      setError('يرجى إدخال جميع بيانات SMTP المطلوبة');
      return false;
    }

    if (testMode && !testEmail) {
      setError('يرجى إدخال بريد إلكتروني للاختبار');
      return false;
    }

    return true;
  };

  const handleSendEmails = async () => {
    if (traineesData.length === 0) {
      setError('لا توجد بيانات متدربين لإرسال الشهادات');
      return;
    }

    if (!validateSettings()) {
      return;
    }

    setIsSending(true);
    setError('');
    setSendingProgress(0);
    setSendingResults([]);

    try {
      // تحديد المستلمين بناءً على وضع الاختبار
      const recipients = testMode 
        ? [{ email: testEmail, trainee_name: 'اختبار', Gender: 'Male', id: 0 }] 
        : traineesData.map((trainee, index) => ({ 
            email: trainee.email, 
            trainee_name: trainee.trainee_name,
            Gender: trainee.Gender,
            id: index
          }));
      
      const totalEmails = recipients.length;
      const results: {email: string, status: string, message: string}[] = [];

      for (let i = 0; i < totalEmails; i++) {
        const recipient = recipients[i];
        
        // الحصول على قالب البريد الإلكتروني المناسب حسب الجنس
        const emailTemplate = getEmailTemplateByGender(recipient.Gender);
        
        // محاكاة إرسال البريد الإلكتروني باستخدام SMTP
        // في التطبيق الحقيقي، سيتم استخدام nodemailer لإرسال البريد الإلكتروني
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // محاكاة نجاح/فشل عشوائي (في التطبيق الحقيقي سيكون هذا نتيجة فعلية)
        const success = Math.random() > 0.2; // 80% نسبة النجاح
        
        results.push({
          email: recipient.email,
          status: success ? 'sent' : 'failed',
          message: success ? 'تم الإرسال بنجاح' : 'فشل في الإرسال'
        });
        
        // تحديث حالة المتدرب إذا لم نكن في وضع الاختبار
        if (!testMode) {
          const updatedTrainees = [...traineesData];
          updatedTrainees[recipient.id] = {
            ...traineesData[recipient.id],
            status: success ? 'sent' : 'failed'
          };
          setTraineesData(updatedTrainees);
        }
        
        // تحديث التقدم
        setSendingProgress(Math.round(((i + 1) / totalEmails) * 100));
        setSendingResults(results);
      }
      
      // حفظ البيانات المحدثة في التخزين المحلي إذا لم نكن في وضع الاختبار
      if (!testMode) {
        localStorage.setItem('traineesData', JSON.stringify(traineesData));
      }
      
    } catch (error: any) {
      console.error('Error sending emails:', error);
      setError(`حدث خطأ أثناء إرسال البريد الإلكتروني: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadUpdatedData = () => {
    if (traineesData.length > 0) {
      // تحويل البيانات إلى CSV
      const headers = Object.keys(traineesData[0]).join(',');
      const rows = traineesData.map(trainee => 
        Object.values(trainee).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      
      // إنشاء ملف CSV وتنزيله
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'trainees_data_with_status.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <Link href="/generate" className="text-primary hover:underline mb-4 inline-block">
          &larr; العودة إلى صفحة إنشاء الشهادات
        </Link>
        <h1 className="text-3xl font-bold">إرسال الشهادات بالبريد الإلكتروني</h1>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">إعدادات البريد الإلكتروني (SMTP)</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">عنوان البريد الإلكتروني</label>
            <input
              type="email"
              name="emailUser"
              value={emailSettings.emailUser}
              onChange={handleInputChange}
              className="input-field"
              placeholder="example@gmail.com"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">كلمة المرور أو كلمة مرور التطبيق</label>
            <input
              type="password"
              name="emailPassword"
              value={emailSettings.emailPassword}
              onChange={handleInputChange}
              className="input-field"
              placeholder="••••••••"
            />
            <p className="text-sm text-gray-500 mt-1">
              ملاحظة: لحسابات Gmail، يجب استخدام كلمة مرور التطبيق وليس كلمة مرور الحساب العادية.
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">خادم SMTP</label>
            <input
              type="text"
              name="smtpHost"
              value={emailSettings.smtpHost}
              onChange={handleInputChange}
              className="input-field"
              placeholder="smtp.gmail.com"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">منفذ SMTP</label>
            <input
              type="text"
              name="smtpPort"
              value={emailSettings.smtpPort}
              onChange={handleInputChange}
              className="input-field"
              placeholder="587"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">اسم المرسل</label>
            <input
              type="text"
              name="fromName"
              value={emailSettings.fromName}
              onChange={handleInputChange}
              className="input-field"
              placeholder="اسم المرسل"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">نوع قالب البريد الإلكتروني</label>
            <select 
              className="input-field" 
              value={selectedTemplateType}
              onChange={handleTemplateTypeChange}
            >
              <option value="default">قالب للجنسين</option>
              <option value="male">قالب للذكور</option>
              <option value="female">قالب للإناث</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              سيتم استخدام القالب المناسب تلقائياً حسب جنس المتدرب.
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">وضع الإرسال</label>
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="test-mode"
                name="send-mode"
                value="test"
                checked={testMode}
                onChange={handleModeChange}
                className="mr-2"
              />
              <label htmlFor="test-mode">وضع الاختبار (إرسال إلى بريد إلكتروني واحد للتجربة)</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="all-mode"
                name="send-mode"
                value="all"
                checked={!testMode}
                onChange={handleModeChange}
                className="mr-2"
              />
              <label htmlFor="all-mode">إرسال إلى جميع المتدربين</label>
            </div>
          </div>
          
          {testMode && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني للاختبار</label>
              <input
                type="email"
                value={testEmail}
                onChange={handleTestEmailChange}
                className="input-field"
                placeholder="test@example.com"
              />
            </div>
          )}
          
          <button 
            onClick={handleSendEmails}
            disabled={isSending || traineesData.length === 0 || !emailSettings.emailUser || !emailSettings.emailPassword}
            className={`btn-primary w-full ${(isSending || traineesData.length === 0 || !emailSettings.emailUser || !emailSettings.emailPassword) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSending ? 'جاري الإرسال...' : testMode ? 'إرسال بريد اختباري' : 'إرسال الشهادات بالبريد الإلكتروني'}
          </button>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">بيانات المتدربين</h2>
          <p className="mb-4">
            عدد المتدربين: <span className="font-bold">{traineesData.length}</span>
          </p>
          
          {isSending && (
            <div className="mb-4">
              <p className="mb-2">جاري إرسال البريد الإلكتروني: {sendingProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${sendingProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {sendingResults.length > 0 && !testMode && (
            <button 
              onClick={handleDownloadUpdatedData}
              className="btn-primary w-full mb-4"
            >
              تنزيل البيانات المحدثة مع حالة الإرسال
            </button>
          )}
          
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">معاينة قالب البريد الإلكتروني</h3>
            <div className="bg-gray-50 p-4 rounded border">
              <pre className="whitespace-pre-wrap text-sm">{getEmailTemplateByGender(selectedTemplateType === 'female' ? 'Female' : 'Male')}</pre>
            </div>
          </div>
        </div>
      </div>
      
      {sendingResults.length > 0 && (
        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-4">نتائج الإرسال</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>البريد الإلكتروني</th>
                  <th>الحالة</th>
                  <th>الرسالة</th>
                </tr>
              </thead>
              <tbody>
                {sendingResults.map((result, index) => (
                  <tr key={index}>
                    <td>{result.email}</td>
                    <td>
                      <span className={result.status === 'sent' ? 'status-sent' : 'status-failed'}>
                        {result.status === 'sent' ? 'تم الإرسال' : 'فشل'}
                      </span>
                    </td>
                    <td>{result.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
