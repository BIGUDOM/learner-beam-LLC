from functools import wraps
from flask import session, redirect
import os 
import json
from datetime import datetime, time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import smtplib
import traceback
from dotenv import load_dotenv

load_dotenv()

def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if "user_id" not in session:
            return redirect("/login")
        return view(*args, **kwargs)
    return wrapped_view

from typing import Optional

def load_config() -> dict:
    """
    Load configuration entirely from environment variables.
    No config.json is used.
    Required environment variables:
      - EMAIL_USER
      - EMAIL_PASSWORD
      - ADMIN_CODE (optional, defaults to 'admin123')
      - SMTP_SERVER (optional, defaults to 'smtp.gmail.com')
      - SMTP_PORT (optional, defaults to 587)
    """
    cfg = {
        "smtp_server": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
        "smtp_port": int(os.getenv("SMTP_PORT", 587)),
        "sender_email": os.getenv("EMAIL_USER"),
        "sender_password": os.getenv("EMAIL_PASSWORD"),
        "admin_code": os.getenv("ADMIN_CODE", "admin123")
    }

    # Optional: warn if email creds are missing
    if not cfg["sender_email"] or not cfg["sender_password"]:
        print("⚠️ EMAIL_USER or EMAIL_PASSWORD not set. Emails will be disabled.")

    return cfg

def send_email(recipient: str, subject: str, body: str, html: bool=False, attachments: Optional[list]=None) -> bool:
    try:
        cfg = load_config()
        if not cfg["sender_email"] or not cfg["sender_password"]:
            print(f"Email not configured. Skipping sending to {recipient}.")
            return False

        msg = MIMEMultipart()
        msg["From"] = cfg["sender_email"]
        msg["To"] = recipient
        msg["Subject"] = subject

        if html:
            msg.attach(MIMEText(body, "html"))
        else:
            msg.attach(MIMEText(body, "plain"))

        # Attach files if any
        if attachments:
            for path in attachments:
                try:
                    if os.path.exists(path):
                        with open(path, "rb") as f:
                            part = MIMEApplication(f.read(), Name=os.path.basename(path))
                            part["Content-Disposition"] = f'attachment; filename="{os.path.basename(path)}"'
                            msg.attach(part)
                    else:
                        print(f"Attachment not found, skipping: {path}")
                except Exception as e:
                    print(f"Failed to attach {path}: {e}")

        # Send email using configured SMTP server
        with smtplib.SMTP(cfg["smtp_server"], cfg["smtp_port"]) as server:
            server.starttls()
            server.login(cfg["sender_email"], cfg["sender_password"])
            server.send_message(msg)

   
        return True

    except Exception as e:
        print(f"⚠️ Email failed: {e}")
        traceback.print_exc()
        return False



import threading

def send_email_async(recipient: str, subject: str, body: str, html: bool=False, attachments: Optional[list]=None):
    """Send email in a separate thread to avoid blocking requests."""
    def _send():
        try:
            success = send_email(recipient, subject, body, html, attachments)
            if not success:
                print(f"Failed to send email to {recipient}")
        except Exception as e:
            print(f"EMAIL THREAD ERROR: {e}")

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()

 
