import smtplib
import uuid
from email.header import Header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import render_template, url_for
from itsdangerous import URLSafeTimedSerializer

TEST_MESSAGES = []

class EmailService():

    def __init__(self, app):
        self.app = app
        self.api_url = app.config['API_URL']
        self.site_url = app.config['SITE_URL']

    def tracking_code(self):
        return str(uuid.uuid4())[:16]

    def email_server(self):
        server = smtplib.SMTP(host=self.app.config['MAIL_SERVER'],
                              port=self.app.config['MAIL_PORT'],
                              timeout=self.app.config['MAIL_TIMEOUT'])
        server.ehlo()
        if self.app.config['MAIL_USE_TLS']:
            server.starttls()
        if self.app.config['MAIL_USERNAME']:
            server.login(self.app.config['MAIL_USERNAME'],
                         self.app.config['MAIL_PASSWORD'])
        return server

    def send_email(self, subject, recipients, text_body, html_body, sender=None, ical=None):
        msgRoot = MIMEMultipart('related')
        msgRoot.set_charset('utf8')

        if (sender == None):
            sender = self.app.config['MAIL_DEFAULT_SENDER']

        msgRoot['Subject'] = Header(subject.encode('utf-8'), 'utf-8').encode()
        msgRoot['From'] = sender
        msgRoot['To'] = ', '.join(recipients)
        msgRoot.preamble = 'This is a multi-part message in MIME format.'

        msgAlternative = MIMEMultipart('alternative')
        msgRoot.attach(msgAlternative)

        part1 = MIMEText(text_body, 'plain', _charset='UTF-8')
        part2 = MIMEText(html_body, 'html', _charset='UTF-8')

        msgAlternative.attach(part1)
        msgAlternative.attach(part2)

        if ical:
            ical_atch = MIMEText(ical.decode("utf-8"),'calendar')
            ical_atch.add_header('Filename','event.ics')
            ical_atch.add_header('Content-Disposition','attachment; filename=event.ics')
            msgRoot.attach(ical_atch)

        if 'TESTING' in self.app.config and self.app.config['TESTING']:
            print("TEST:  Recording Emails, not sending - %s - to:%s" % (subject, recipients))
            TEST_MESSAGES.append(msgRoot)
            return

        server = self.email_server()
        server.sendmail(sender, recipients, msgRoot.as_bytes())
        server.quit()

    def confirm_email(self, user):
        ts = URLSafeTimedSerializer(self.app.config["SECRET_KEY"])
        token = ts.dumps(user.email, salt='email-reset-key')
        tracking_code = self.tracking_code()

        subject = "iTHRIV: Confirm Email"
        confirm_url = self.app.config['FRONTEND_EMAIL_RESET'] + token
        logo_url = url_for('track.logo', user_id=user.id, code=tracking_code, _external=True)
        text_body = render_template("confirm_email.txt",
                                    user=user, confirm_url=confirm_url,
                                    tracking_code=tracking_code)

        html_body = render_template("confirm_email.html",
                                    user=user, confirm_url=confirm_url,
                                    logo_url=logo_url,
                                    tracking_code=tracking_code)

        self.send_email(subject,
                        recipients=[user.email], text_body=text_body, html_body=html_body)

        return tracking_code

    def reset_email(self, user):
        ts = URLSafeTimedSerializer(self.app.config["SECRET_KEY"])
        token = ts.dumps(user.email, salt='email-reset-key')
        tracking_code = self.tracking_code()

        subject = "iTHRIV: Password Reset Email"
        reset_url = self.app.config['FRONTEND_EMAIL_RESET'] + token
        logo_url = url_for('track.logo', user_id=user.id, code=tracking_code, _external=True)
        text_body = render_template("reset_email.txt",
                                    user=user, reset_url=reset_url,
                                    tracking_code=tracking_code)

        html_body = render_template("reset_email.html",
                                    user=user, reset_url=reset_url,
                                    logo_url=logo_url,
                                    tracking_code=tracking_code)

        self.send_email(subject,
                        recipients=[user.email], text_body=text_body, html_body=html_body)

        return tracking_code

    def consult_email(self, user, request_data):
        tracking_code = self.tracking_code()

        subject = "iTHRIV: Consult Request"
        logo_url = url_for('track.logo', user_id=user.id, code=tracking_code, _external=True)
        text_body = render_template("consult_email.txt",
                                    user=user, request_data=request_data, tracking_code=tracking_code)

        html_body = render_template("consult_email.html",
                                    user=user, request_data=request_data, logo_url=logo_url, tracking_code=tracking_code)

        self.send_email(subject,
                        recipients=[self.app.config['MAIL_CONSULT_RECIPIENT']], text_body=text_body, html_body=html_body)

        return tracking_code

    def approval_request_email(self, user, admin, resource):
        tracking_code = self.tracking_code()

        subject = "iTHRIV: Resource Approval Request"
        logo_url = url_for('track.logo', user_id=admin.id, code=tracking_code, _external=True)
        text_body = render_template("approval_request_email.txt",
                                    user=user, admin=admin, resource=resource, tracking_code=tracking_code)

        html_body = render_template("approval_request_email.html",
                                    user=user, admin=admin, resource=resource, logo_url=logo_url, tracking_code=tracking_code)

        self.send_email(subject,
                        recipients=[admin.email], text_body=text_body, html_body=html_body)

        return tracking_code

    def approval_request_confirm_email(self, user, resource):
        tracking_code = self.tracking_code()

        subject = "iTHRIV: Resource Approval Request Confirmed"
        support_email = self.app.config['MAIL_CONSULT_RECIPIENT']
        logo_url = url_for('track.logo', user_id=user.id, code=tracking_code, _external=True)
        text_body = render_template("approval_request_confirm_email.txt",
                                    user=user, resource=resource, support_email=support_email, tracking_code=tracking_code)

        html_body = render_template("approval_request_confirm_email.html",
                                    user=user, resource=resource, support_email=support_email, logo_url=logo_url, tracking_code=tracking_code)

        self.send_email(subject,
                        recipients=[user.email], text_body=text_body, html_body=html_body)

        return tracking_code
