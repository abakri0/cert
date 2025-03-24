const fs = require('fs');
const papa = require('papaparse');

// قراءة ملف CSV
const csvFile = fs.readFileSync('data.csv', 'utf8');

// معالجة البيانات وتحويلها لـ JSON
papa.parse(csvFile, {
    header: true,
    complete: function(results) {
        const jsonData = results.data.map(row => {
            // معالجة حقل البرنامج
            let trainee_program;
            if (row.program === 'UX/UI') {
                trainee_program = 'تصميم الواجهات وتجربة المستخدم IU/XU';
            } else if (row.program === 'Microsoft Excel') {
                trainee_program = 'تحليل البيانات بإستخدام IB-rewop & lecxE';
            } else if (row.program === 'Frontend Development') {
                trainee_program = 'تطوير مواقع الويب repoleveD dne-tnorF';
            } else {
                trainee_program = row.program;
            }


            

            return {
                "trainee_name": row.name_ar,
                "name_en": "",
                "email": row.primary_email,
                "phone_code": "+966",
                "phone_number": "",
                "start_date": "",
                "end_date": "",
                "Gender": row.gender,
                "trainee_program": trainee_program,
                "title": "شهادة اتمام برنامج تدريبي",
                "year_issue": "2025",
                "date_issue": ""
            };
        });

        // حفظ النتيجة في ملف JSON
        fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2));
        console.log('تم التحويل بنجاح!');
    }
});