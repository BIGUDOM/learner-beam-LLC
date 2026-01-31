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

CONFIG_FILE = "config.json"

def load_config() -> dict:
    if not os.path.exists(CONFIG_FILE):
        template = {
            "smtp_server": "smtp.gmail.com",
            "smtp_port": 587,
            "sender_email": os.getenv("EMAIL_USER"),
            "sender_password": os.getenv("EMAIL_PASSWORD"),
            "admin_code": "admin123"
        }
        try:
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(template, f, indent=4)
            print(f"⚠️ config.json created. Please edit it to add SMTP creds and set a secure admin_code.")
        except Exception as e:
            print(f"Could not create config file: {e}")

    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            cfg = json.load(f)
    except Exception:
        cfg = {}

    fixed_cfg = {
        "smtp_server": cfg.get("smtp_server", "smtp.gmail.com"),
        "smtp_port": cfg.get("smtp_port", 587),
        "sender_email": cfg.get("sender_email",  os.getenv("EMAIL_USER")),
        "sender_password": cfg.get("sender_password",os.getenv("EMAIL_PASSWORD")),
        "admin_code": cfg.get("admin_code", "admin123")
    }

    return fixed_cfg

# ======== EMAIL ========
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