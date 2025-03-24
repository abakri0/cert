import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import json

# Paths for certificates and data
CERTIFICATES_DIR = 'certificates'
JSON_FILE_PATH = 'data.json'

# Gmail credentials
GMAIL_USER = '***'  # Replace with your Gmail address
GMAIL_PASSWORD = '****'  # Replace with your Gmail app password

# Function to send an email with the certificate attached
def send_certificate(email, trainee_name, gender, attachment_path):
    try:
        # Extract first name
        first_name = trainee_name.split()[0]
        
        # Determine greeting and pronouns based on gender
        if gender == "Female":
            greeting = f"أهلاً بكِ {first_name} 👋🏻,"
            pronoun = "كِ"
            contact_instruction = "لأي استفسار أو طلب تقدرين تتواصلين معنا:"
            whatsapp_text = "تواصلي معنا عبر واتساب"
            wishes="كانت رحلتنا معك مميزة وملهمة، ونتمنى أن تكونين استفدتي من كل جزء في البرنامج وأن يكون خطوة جديدة في مشوارك المهني."
        else:
            greeting = f"أهلاً بك {first_name} 👋🏻,"
            pronoun = "ك"
            contact_instruction = "لأي استفسار أو طلب تقدر تتواصل معنا:"
            whatsapp_text = "تواصل معنا عبر واتساب"
            wishes="كانت رحلتنا معك مميزة وملهمة، ونتمنى أن تكون استفدت من كل جزء في البرنامج وأن يكون خطوة جديدة في مشوارك المهني."

        # Set up the MIME
        msg = MIMEMultipart()
        msg['From'] = GMAIL_USER
        msg['To'] = email
        msg['Subject'] = "شهادة اتمام البرنامج التدريبي!"

        # Email body with HTML content
        body = f"""
        <html>
        <body dir="rtl" style="font-family: Arial, sans-serif;">
            <h2>{greeting}</h2>
            <p>نبارك ل{pronoun} إتمام البرنامج التدريبي بنجاح! 🎉</p>
            <p>{wishes}</p>
            <p style="color: #9E72C7;">{contact_instruction}</p>
                        <p>كما ان الشهادة المعتمدة من المؤسسة العامة للتدريب التقني والمهني ستصلك طريقة إصدارها على الواتساب من خلال الرقم الموحد.</p>
            <div style="text-align: center; margin: 20px;">
                <a href="https://wa.me/966172200887" style="display: inline-block; background-color: #9E72C7; color: #ffffff; padding: 15px 25px; font-size: 18px; border-radius: 5px; text-decoration: none;">{whatsapp_text}</a>
            </div>
            <p>سعدنا جدًا بتواجدك معنا، ونتمنى لك كل التوفيق والنجاح فيما هو قادم 🌟</p>
            <p>نراكم قريباً،</p>
            <h3>فريق شركة معهد واجهة المُبتَكِر للتدريب</h3>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        # Attachment
        with open(attachment_path, 'rb') as attachment:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.read())
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                'attachment',
                filename="شهادة اتمام البرنامج التدريبي.pdf"
            )
            msg.attach(part)

        # Set up the SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(GMAIL_USER, email, text)
        server.quit()
        print(f"Email sent successfully to {email}")
    except Exception as e:
        print(f"Failed to send email to {email}: {e}")

if __name__ == "__main__":
    # Load data from JSON file
    with open(JSON_FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Send a test email
    trainee = data[0]
    trainee_name = trainee.get('trainee_name', 'Unnamed')
    email = input("Write your test email: ")
    gender = trainee.get('Gender', 'Male')  # Default to Male if not specified
    certificate_path = os.path.join(CERTIFICATES_DIR, f"{trainee.get('email', 'noemail@example.com')}.pdf")

    # Check if certificate exists for testing
    if os.path.exists(certificate_path):
        send_certificate(email, trainee_name, gender, certificate_path)
    else:
        print(f"Test certificate for {trainee_name} ({email}) not found.")

    # Ask user for approval to send all certificates
    user_input = input("Is the test email okay? (yes/no): ")
    if user_input.lower() == 'yes':
        # Iterate over each trainee and send certificates
        for trainee in data:
            trainee_name = trainee.get('trainee_name', 'Unnamed')
            email = trainee.get('email', 'noemail@example.com')
            gender = trainee.get('Gender', 'Male')  # Default to Male if not specified
            certificate_path = os.path.join(CERTIFICATES_DIR, f"{email}.pdf")
            # Check if certificate exists
            if os.path.exists(certificate_path):
                send_certificate(email, trainee_name, gender, certificate_path)
            else:
                print(f"Certificate for {trainee_name} ({email}) not found.")