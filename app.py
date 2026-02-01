from fileinput import filename
import os
import json
import secrets
import uuid
import smtplib
import hashlib
from datetime import datetime, timedelta, timedelta
from functools import wraps
from flask import (
    Flask, request, jsonify, send_from_directory,
    session, url_for,render_template, redirect
)
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
from email.mime.text import MIMEText
from  backends.utils import send_email,login_required, send_email_async
import mysql.connector
from dotenv import load_dotenv
import traceback
# ---------------- Database Setup ----------------

load_dotenv()

# Db
def get_db():
    return  mysql.connector.connect(
        host = os.getenv("DB_HOST"),
        user =  os.getenv("DB_USER"),
        password =  os.getenv("DB_PASSWORD"),
        database =  os.getenv("DB_NAME"), 
        port =  os.getenv("DB_PORT"),
        autocommit=False
    )


# ---------------- Configuration ----------------
LOGIN_URL = "https://cryptoworldapp.com/login"


# ---------------- Flask Setup ----------------
app = Flask(__name__)
app.secret_key = "supersecretkey_change_me"  # Change this in production

# Allow credentials for cross-origin session cookies
CORS(app, supports_credentials=True)

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",  # Change to "None" + HTTPS for production
)

# ------------------ CONFIGURATION ----------------
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ------------------ ROUTES ------------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")
@app.route("/service")
def service():
    return render_template("service.html")
@app.route("/price")
def price():
    return render_template("price.html")
@app.route("/legal")
def legal():
    return render_template("legal.html")
@app.route("/register")
def register():
    return render_template("register.html")
@app.route("/login")
def login():
    return render_template("login.html")
@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/logout")
def logout():
    session.clear()
    response = redirect("/login")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.route("admin/logout")
def adin_logout():
    session.clear()
    response = redirect("/admin/login")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.route("/dashboard")
@login_required
def dashboard():
    user_id = session.get("user_id")
    db = get_db()
    cursor = db.cursor()

    try:
        # Wallet info
        cursor.execute(
            "SELECT balance, last_updated FROM WALLET_BASE WHERE user_id=%s",
            (user_id,)
        )
        wallet = cursor.fetchone()
        balance = wallet[0] if wallet else 0
        last_updated = wallet[1] if wallet else None
        pretty_updated = last_updated.strftime("%A, %B %d, %Y at %I:%M %p") if last_updated else "Never"

        # Customer info
        cursor.execute(
            "SELECT first_name, last_name FROM CUST_BASE WHERE user_id=%s",
            (user_id,)
        )
        cust = cursor.fetchone()
        first_name = cust[0] if cust else "Unknown"
        last_name = cust[1] if cust else "User"

        # Email
        cursor.execute("SELECT email FROM USER_BASE WHERE user_id=%s", (user_id,))
        email_row = cursor.fetchone()
        email = email_row[0] if email_row else "Unknown"

        # Trade profits
        cursor.execute(
            "SELECT amount FROM TRANSACTION_BASE WHERE user_id=%s AND transaction_type=%s",
            (user_id, 'TRADE PROFIT')
        )
        trades = cursor.fetchall()
        trade_count = len(trades)
        total_profit = sum([t[0] for t in trades])
        win_rate = (total_profit / trade_count) if trade_count > 0 and total_profit > 0 else 0

        # All transactions
        cursor.execute(
            "SELECT amount, transaction_type, description, status, created_at "
            "FROM TRANSACTION_BASE WHERE user_id=%s",
            (user_id,)
        )
        transactions = cursor.fetchall()

        return render_template(
            "dashboard.html",
            balance=balance,
            last_updated=pretty_updated,
            first_name=first_name,
            last_name=last_name,
            email=email,
            trade_count=trade_count,
            total_profit=total_profit,
            win_rate=win_rate,
            transactions=transactions
        )

    finally:
        cursor.close()

@app.route("/payment/<int:amount>")
@login_required
def payment(amount):
    return render_template("pay.html", amount=f"{amount:,.2f}")




@app.route("/admin/login")
def admin_login():
    return  render_template("admin_login.html")


@app.route("/admin")
def admin_dashboard():
    if "admin_id" not in session:
        redirect("/admin/login")


    db = get_db()
    cursor = db.cursor()

    try:
        # Total users
        cursor.execute("SELECT COUNT(*) FROM USER_BASE")
        total_users = cursor.fetchone()[0]

        # Total wallet balance
        cursor.execute("SELECT COALESCE(SUM(balance),0) FROM WALLET_BASE")
        total_balance = cursor.fetchone()[0]

        # Active users
        cursor.execute("SELECT COUNT(*) FROM USER_BASE WHERE active = TRUE")
        active_users = cursor.fetchone()[0]

        # Fetch clients info
        cursor.execute("""
            SELECT u.user_id, u.email, c.first_name, c.last_name, c.country, w.balance
            FROM USER_BASE u
            LEFT JOIN CUST_BASE c ON u.user_id = c.user_id
            LEFT JOIN WALLET_BASE w ON u.user_id = w.user_id
        """)
        clients = cursor.fetchall()

        client_list = [
            {
                "user_id": c[0],
                "email": c[1],
                "first_name": c[2] or "",
                "last_name": c[3] or "",
                "country": c[4] or "",
                "balance": c[5] or 0
            }
            for c in clients
        ]

        return render_template(
            "admin.html",
            total_users=total_users,
            total_balance=total_balance,
            active_users=active_users,
            clients=client_list
        )

    finally:
        cursor.close()



@app.route("/verify-register", methods=["POST"])
def verify_register():
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        data = request.get_json()
        if not data:
            return jsonify({"status":"error","message":"Invalid or missing JSON"}), 400

        required_fields = [
            "email", "password", "first_name",
            "last_name", "phone", "country", "currency", "verification_code"
        ]

        for field in required_fields:
            if not data.get(field):
                return jsonify({"status":"error","message":f"Missing field: {field}"}), 400

        email = data["email"]
        password = data["password"]
        first_name = data["first_name"]
        last_name = data["last_name"]
        phone = data["phone"]
        country = data["country"]
        currency = data["currency"]
        verification_code = data["verification_code"]

        # Check duplicate email safely
        cursor.execute("SELECT email FROM USER_BASE WHERE email=%s", (email,))
        if cursor.fetchone():
            return jsonify({"status":"error","message":"Email already exists"}), 400

        # Hash password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        # Insert user
        cursor.execute(
            """
            INSERT INTO USER_BASE (email, password_hash, failed_attempts, last_login, last_failed_login, locked, lock_reason, active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (email, hashed_password, 0, None, None, False, "", True)
        )
        user_id = cursor.lastrowid

        # Insert customer info
        cursor.execute(
            """
            INSERT INTO CUST_BASE (user_id, first_name, last_name, phone, country, currency)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (user_id, first_name, last_name, phone, country, currency)
        )

        # Insert wallet
        cursor.execute("INSERT INTO WALLET_BASE (user_id) VALUES (%s)", (user_id,))

        # Send verification email safely
        try:
            send_email_async(
                email,
                "Welcome to Leaner Beam LLC - Verify Your Account",
                f"Here's your verification code: {verification_code}\nPlease don't share with anyone",
                False
            )
        except Exception as e:
            print("EMAIL ERROR:", e)

        conn.commit()
        return jsonify({"status":"success","message":"Registration successful. Verification email sent."}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        print("REGISTER ERROR:", e)
        return jsonify({"status":"error","message":f"Registration failed: {str(e)}"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/verify-email", methods=["POST"])
def verify_email():
    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        data = request.get_json()
        if not data:
            return jsonify({"status":"error","message":"Invalid or missing JSON"}), 400

        required_fields = ["email", "verification_code", "entered_code"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"status":"error","message":f"Missing field: {field}"}), 400

        email = data["email"]
        verification_code = data["verification_code"]
        entered_code = data["entered_code"]

        if verification_code != entered_code:
            return jsonify({"status":"error","message":"Invalid verification code."}), 400

        # Update email_verified safely
        cursor.execute(
            "UPDATE USER_BASE SET email_verified = %s WHERE email = %s",
            (True, email)
        )

        # Send welcome email safely
        year = datetime.now().year
        welcome_message = f"""
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <!DOCTYPE html>

<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to Leaner Beam LLC</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: Arial, Helvetica, sans-serif;">


<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding:20px;">
    <tr>
        <td align="center">

            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                    <td style="background:linear-gradient(135deg,#2563eb,#1e40af); padding:30px; text-align:center;">
                        <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:700;">
                            Welcome to Leaner Beam LLC
                        </h1>
                        <p style="margin:8px 0 0; color:#e0e7ff; font-size:15px;">
                            Your trusted crypto trading platform
                        </p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:32px; color:#1e293b; font-size:15px; line-height:1.6;">

                        <p style="margin-top:0;">
                            Hello,
                        </p>

                        <p>
                            Thank you for registering with <strong>Leaner Beam LLC</strong>.
                            We’re excited to have you join our growing community of users
                            exploring the future of digital finance.
                        </p>

                        <p>
                            Our platform is designed to provide a secure, intuitive, and efficient
                            environment for managing your crypto activities — whether you’re
                            getting started or expanding your experience.
                        </p>

                        <p>
                            To begin, simply log in to your dashboard and complete your setup.
                            If you need any assistance, our support team is always here to help.
                        </p>

                        <!-- Button -->
                        <div style="text-align:center; margin:32px 0;">
                            <a href="#" 
                               style="display:inline-block; padding:14px 32px; background-color:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-size:15px; font-weight:600;">
                                Get Started
                            </a>
                        </div>

                        <p>
                            We’re glad to have you with us and look forward to supporting your journey
                            on Leaner Beam LLC.
                        </p>

                        <p style="margin-bottom:0;">
                            Best regards,<br>
                            <strong>The Leaner Beam LLC Team</strong>
                        </p>

                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color:#0f172a; padding:20px; text-align:center;">
                        <p style="margin:0; color:#94a3b8; font-size:12px;">
                            © Leaner Beam LLC. All rights reserved.
                        </p>
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>


</body>
</html>
</body>
    """

        try:
            send_email_async(
                email,
                "Welcome to Leaner Beam LLC  🎉",
                welcome_message,
                True
            )
        except Exception as e:
            print("EMAIL ERROR:", e)

        conn.commit()
        return jsonify({"status":"success","message":"Email verified successfully."}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        print("VERIFY EMAIL ERROR:", e)
        return jsonify({"status":"error","message":f"Email verification failed: {str(e)}"}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



@app.route("/loginp", methods=["POST"])
def verifylogin():
    # --- GET JSON DATA ---
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "Invalid or missing JSON"}), 400
    
    for field in ["email", "password"]:
        if not data.get(field):
            return jsonify({"status": "error", "message": f"Missing field: {field}"}), 400
    conn = None
    try:
        # --- CREATE A NEW DB CONNECTION ---
        conn = get_db()
        cursor = conn.cursor()
        # --- FETCH USER ---
        cursor.execute(
            "SELECT password_hash, locked, failed_attempts, last_failed_login, email, lock_reason, user_id FROM USER_BASE WHERE email=%s",
            (data['email'],)
        )
        user = cursor.fetchone()
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 401

        # --- CHECK IF ACCOUNT IS LOCKED ---
        if user[1]:  # locked
            return jsonify({"status": "error", "message": f"Account locked! Reason: {user[5]}"}), 403

        # --- VERIFY PASSWORD ---
        hashed = hashlib.sha256(data['password'].encode()).hexdigest()
        if hashed != user[0]:
            # Update failed attempts
            new_attempts = user[2] + 1
            cursor.execute(
                "UPDATE USER_BASE SET failed_attempts=%s, last_failed_login=NOW() WHERE email=%s",
                (new_attempts, data['email'])
            )
            if new_attempts >= 3:
                cursor.execute(
                    "UPDATE USER_BASE SET locked=1, lock_reason=%s WHERE email=%s",
                    ("Too many failed login attempts", data['email'])
                )
            conn.commit()
            return jsonify({"status": "error", "message": "Incorrect Password"}), 401

        # --- SUCCESSFUL LOGIN ---
        cursor.execute(
            "UPDATE USER_BASE SET failed_attempts=0, last_login=NOW() WHERE email=%s",
            (data['email'],)
        )

        # --- ENSURE WALLET EXISTS ---
        user_id = user[6]
        cursor.execute("SELECT * FROM WALLET_BASE WHERE user_id=%s", (user_id,))
        if not cursor.fetchone():
            cursor.execute("INSERT INTO WALLET_BASE (user_id) VALUES (%s)", (user_id,))

        conn.commit()

        # --- LOGIN NOTIFICATION EMAIL ---
        email = data['email']
        login_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ip_address = request.remote_addr or "Unknown"
        location = "Unknown"
        device = request.user_agent.string or "Unknown"

        
        login_html = f"""


<html>
<head>
    <meta charset="UTF-8">
    <title>Login Notification</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: Arial, Helvetica, sans-serif;">


<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding:20px;">
    <tr>
        <td align="center">

            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                    <td style="background:linear-gradient(135deg,#2563eb,#1e40af); padding:28px; text-align:center;">
                        <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">
                            Login Alert
                        </h1>
                        <p style="margin:6px 0 0; color:#e0e7ff; font-size:14px;">
                            Leaner Beam LLC Security Notification
                        </p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:32px; color:#1e293b; font-size:15px; line-height:1.6;">

                        <p style="margin-top:0;">
                            Hello,
                        </p>

                        <p>
                            We noticed a successful login to your <strong>Leaner Beam LLC</strong> account.
                            This message is sent to help keep your account secure.
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border-radius:10px; padding:16px; margin:20px 0;">
                            <tr>
                                <td style="font-size:14px; color:#334155; padding:6px 0;">
                                    <strong>Time:</strong> {login_time}
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:14px; color:#334155; padding:6px 0;">
                                    <strong>IP Address:</strong> {ip_address}
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:14px; color:#334155; padding:6px 0;">
                                    <strong>Location:</strong> {location}
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:14px; color:#334155; padding:6px 0;">
                                    <strong>Device:</strong> {device}
                                </td>
                            </tr>
                        </table>

                        <p>
                            If this was you, no further action is required.
                        </p>

                        <p style="color:#b91c1c;">
                            <strong>If you do not recognize this activity, please secure your account immediately by changing your password and contacting support.</strong>
                        </p>

                        <!-- Button -->
                        <div style="text-align:center; margin:28px 0;">
                            <a href="#" 
                               style="display:inline-block; padding:14px 30px; background-color:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-size:15px; font-weight:600;">
                                Secure My Account
                            </a>
                        </div>

                        <p>
                            Your security is our top priority. Thank you for choosing Leaner Beam LLC.
                        </p>

                        <p style="margin-bottom:0;">
                            Regards,<br>
                            <strong>Leaner Beam LLC Security Team</strong>
                        </p>

                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color:#0f172a; padding:20px; text-align:center;">
                        <p style="margin:0; color:#94a3b8; font-size:12px;">
                            © Leaner Beam LLC. All rights reserved.
                        </p>
                        <p style="margin:6px 0 0; color:#64748b; font-size:11px;">
                            This is an automated security message. Please do not reply.
                        </p>
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>


</body>
</html>

""" 

        # Wrap email in try/except so it does not break login
        try:
            send_email_async(email, "Leaner Beam LLC - Login Notification", login_html, True)
        except Exception as e:
            print("EMAIL ERROR:", e)

        session['user_id'] = user_id
        return jsonify({"status": "success", "message": "Login successful"}), 200

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"status": "error", "message": f"Login failed: {str(e)}"}), 500

    finally:
        if conn:
            conn.close()

@app.route("/resetpass", methods=["POST"])
def reset():
    data = request.get_json()
    print("RESET PASS HIT")

    required_fields = ["email"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"status": "error", "message": f"Missing {field}"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db()  # Use your get_db() helper
        cursor = conn.cursor()

        cursor.execute(
            "SELECT email FROM USER_BASE WHERE email=%s",
            (data['email'],)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        email = data['email']
        reset_code = secrets.token_hex(3)
        reset_code_hash = hashlib.sha256(reset_code.encode()).hexdigest()
        reset_code_expires = datetime.utcnow() + timedelta(minutes=10)

        cursor.execute(
            "UPDATE USER_BASE SET reset_code_hash=%s, reset_code_expires=%s WHERE email=%s",
            (reset_code_hash, reset_code_expires, email)
        )
        conn.commit()

        reset_password_html = f"""
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:#ffffff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background:#1558B0; padding:20px; text-align:center;">
                            <h2 style="margin:0; color:#ffffff; font-weight:600;">
                                Leaner Beam LLC
                            </h2>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:30px;">
                            <h3 style="margin-top:0; color:#333333;">
                                Reset Your Password
                            </h3>

                            <p style="color:#555555; font-size:15px; line-height:1.6;">
                                We received a request to reset your password.  
                                If you didn’t make this request, you can safely ignore this email.
                            </p>

                            <p style="color:#555555; font-size:15px; line-height:1.6;">
                                Use the verification code below to reset your password:
                            </p>

                            <!-- Code box -->
                            <div style="text-align:center; margin:25px 0;">
                                <span style="display:inline-block; padding:14px 24px; font-size:20px; letter-spacing:3px; background:#f1f5ff; color:#1558B0; border-radius:6px; font-weight:600;">
                                    {reset_code}
                                </span>
                            </div>

                            <p style="color:#777777; font-size:14px; line-height:1.6;">
                                This code will expire in 10 minutes.
                            </p>

                            <p style="color:#555555; font-size:14px; line-height:1.6;">
                                Need help? Contact our support team.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f4f6f8; padding:16px; text-align:center;">
                            <p style="margin:0; color:#888888; font-size:13px;">
                                © {datetime.now().year} Leaner Beam LLC. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
"""

        send_email_async(
            recipient=email,
            subject="Leaner Beam LLC - Password Reset Code",
            body=reset_password_html,
            html=True
        )

        return jsonify({"status": "success", "message": "Reset code sent to email"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        print("RESETPASS ERROR:", e)
        return jsonify({
            "status": "error",
            "message": "Server error",
            "details": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
    




@app.route("/save-password", methods=["POST"])
def save_password():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "Invalid or missing JSON"}), 400

    required_fields = ["email", "reset_code", "new_password"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"status": "error", "message": f"Missing field: {field}"}), 400

    conn = None
    cursor = None

    try:
        # Get fresh DB connection
        conn = get_db()
        cursor = conn.cursor()

        # Fetch user info
        cursor.execute(
            "SELECT reset_code_hash, reset_code_expires, email FROM USER_BASE WHERE email=%s",
            (data["email"],)
        )
        user = cursor.fetchone()
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        stored_hash, expires_at, email = user

        if not stored_hash or not expires_at:
            return jsonify({"status": "error", "message": "No active reset request"}), 400

        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)

        if datetime.utcnow() > expires_at:
            return jsonify({"status": "error", "message": "Reset code expired"}), 400

        entered_hash = hashlib.sha256(data["reset_code"].encode()).hexdigest()
        if entered_hash != stored_hash:
            return jsonify({"status": "error", "message": "Invalid reset code"}), 400

        # Hash new password
        new_password_hash = hashlib.sha256(data["new_password"].encode()).hexdigest()

        # Update password and clear reset code
        cursor.execute(
            """
            UPDATE USER_BASE
            SET password_hash=%s,
                reset_code_hash=NULL,
                reset_code_expires=NULL,
                locked=FALSE,
                failed_attempts=0
            WHERE email=%s
            """,
            (new_password_hash, email)
        )
        conn.commit()

        # Send email notification (doesn't break flow if fails)
        password_reset_email = f"""
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:#ffffff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden;">
<tr><td style="background:#1aa251; padding:20px; text-align:center;">
<h2 style="margin:0; color:#ffffff; font-weight:600;">Leaner Beam LLC</h2>
</td></tr>
<tr><td style="padding:30px;">
<h3 style="margin-top:0; color:#333333;">Password Reset Successful 🎉</h3>
<p style="color:#555555; font-size:15px; line-height:1.6;">Your password has been successfully reset.</p>
<p style="color:#555555; font-size:15px; line-height:1.6;">You can now log in to your account using your new password.</p>
<div style="text-align:center; margin:30px 0;">
<a href="{LOGIN_URL}" style="display:inline-block; padding:12px 26px; background:#1558B0; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:500; font-size:15px;">Go to Login</a>
</div>
<p style="color:#777777; font-size:14px; line-height:1.6;">If you did not perform this action, please contact support immediately.</p>
</td></tr>
<tr><td style="background:#f4f6f8; padding:16px; text-align:center;">
<p style="margin:0; color:#888888; font-size:13px;">© {datetime.now().year} Leaner Beam LLC. All rights reserved.</p>
</td></tr>
</table></td></tr></table>
</body>
"""
        try:
            send_email_async(
                recipient=email,
                subject="Leaner Beam LLC - Password Reset Successful",
                body=password_reset_email,
                html=True
            )
        except Exception as e:
            print("Email sending failed:", e)

        return jsonify({"status": "success", "message": "Password updated successfully"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        print("SAVE PASSWORD ERROR:", traceback.format_exc())
        return jsonify({"status": "error", "message": "Database error", "details": str(e)}), 500

    finally:
        # Close cursor and connection to prevent leaks on Render
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route("/payment/upload_proof", methods=["POST"])
def upload_proof():
    # Check file in request
    if 'proofImage' not in request.files:
        return jsonify({"status": "error", "message": "No proof image uploaded"}), 400

    file = request.files['proofImage']
    amount = request.form.get('amount')
    
    conn = None
    cursor = None

    if not amount:
        return jsonify({"status": "error", "message": "Amount missing"}), 400

    try:
        amount = float(amount.replace(",", ""))  # remove commas if any
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid amount"}), 400

    if not file.filename or file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"status": "error", "message": "Invalid file type"}), 400

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "User not logged in"}), 401

    try:
        # Save file
        import uuid
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)

        # Database operations
        conn = get_db()
        cursor = conn.cursor()

        # Update wallet
        cursor.execute(
            """
            UPDATE WALLET_BASE
            SET balance = balance + %s,
                last_updated = NOW()
            WHERE user_id=%s
            """,
            (amount, user_id)
        )

        # Record transaction
        cursor.execute(
            """
            INSERT INTO TRANSACTION_BASE (user_id, amount, transaction_type, description, status, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            """,
            (user_id, amount, 'DEPOSIT', 'Deposit via E-Wallet', 'COMPLETED')
        )

        # Get user email
        cursor.execute("SELECT email FROM USER_BASE WHERE user_id=%s", (user_id,))
        email_result = cursor.fetchone()
        if not email_result:
            raise Exception("User email not found")
        email = email_result[0]

        conn.commit()

    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": "Database error", "details": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    # Send emails
    try:
        # Send to admin
        admin_email = "dondennisdarty116@gmail.com"
        send_email_async(
            admin_email,
            "New Deposit Proof Uploaded",
            f"User ID: {user_id} uploaded deposit proof for amount: {amount}",
            False,
            attachments=[file_path]
        )

        # Send success email to user
        deposit_html = f"""
          


<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: Arial, Helvetica, sans-serif;">


<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding:20px;">
    <tr>
        <td align="center">

            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                    <td style="background:linear-gradient(135deg,#2563eb,#1e40af); padding:28px; text-align:center;">
                        <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">
                            Deposit Successful
                        </h1>
                        <p style="margin:6px 0 0; color:#e0e7ff; font-size:14px;">
                            Leaner Beam LLC
                        </p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:32px; color:#1e293b; font-size:15px; line-height:1.6;">

                        <p style="margin-top:0;">
                            Hello,
                        </p>

                        <p>
                            We’re happy to inform you that your deposit has been successfully received
                            and credited to your <strong>Leaner Beam LLC</strong> account.
                        </p>

                        <!-- Deposit Details -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border-radius:10px; padding:16px; margin:20px 0;">
                            <tr>
                                <td style="font-size:14px; color:#334155; padding:6px 0;">
                                    <strong>Amount:</strong> {amount}
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:14px; color:#334155; padding:6px 0;">
                                    <strong>Payment Method:</strong> E-Wallt
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:14px; color:#334155; padding:6px 0;">
                                    <strong>Date:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:14px; color:#334155; padding:6px 0;">
                                    <strong>Transaction ID:</strong> {secrets.token_hex(8)}
                                </td>
                            </tr>
                        </table>

                        <p>
                            Your funds are now available in your wallet and ready to be used.
                            You can view your balance and transaction history from your dashboard.
                        </p>

                        <!-- Button -->
                        <div style="text-align:center; margin:28px 0;">
                            <a href="#" 
                               style="display:inline-block; padding:14px 30px; background-color:#10b981; color:#ffffff; text-decoration:none; border-radius:8px; font-size:15px; font-weight:600;">
                                View Dashboard
                            </a>
                        </div>

                        <p>
                            If you have any questions regarding this deposit, please contact our support team.
                        </p>

                        <p style="margin-bottom:0;">
                            Thank you for choosing <strong>Leaner Beam LLC</strong>.<br>
                            <strong>The Leaner Beam LLC Team</strong>
                        </p>

                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="background-color:#0f172a; padding:20px; text-align:center;">
                        <p style="margin:0; color:#94a3b8; font-size:12px;">
                            © Leaner Beam LLC. All rights reserved.
                        </p>
                        <p style="margin:6px 0 0; color:#64748b; font-size:11px;">
                            This is an automated message. Please do not reply.
                        </p>
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>


        """
        send_email_async(
            email,
            "Leaner Beam LLC - Deposit Successful",
            deposit_html,
            True
        )
    except Exception as e:
        print("Email sending error:", e)  # log error, don't break workflow

    return jsonify({"status": "success", "message": "Proof uploaded successfully"}), 200


@app.route("/admin/add_funds", methods=["POST"])
def admin_add_funds():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No data received"}), 400

    user_id = data.get("user_id")
    amount = data.get("amount")
    reason = data.get("reason", "Admin deposit")

    if not user_id or not amount:
        return jsonify({"status": "error", "message": "Missing user_id or amount"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"status": "error", "message": "Amount must be greater than 0"}), 400
    except ValueError:
        return jsonify({"status": "error", "message": "Amount must be a valid number"}), 400

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Update wallet balance
        cursor.execute(
            """
            UPDATE WALLET_BASE
            SET balance = balance + %s,
                last_updated = NOW()
            WHERE user_id = %s
            """,
            (amount, user_id)
        )

        # Record transaction
        cursor.execute(
            """
            INSERT INTO TRANSACTION_BASE (user_id, amount, transaction_type, description, status, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            """,
            (user_id, amount, 'TRADE PROFIT', reason, 'COMPLETED')
        )

        conn.commit()
        return jsonify({"status": "success", "message": f"${amount} added to user's wallet"}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        print("Error adding funds:", e)
        return jsonify({"status": "error", "message": "Failed to add funds", "details": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route("/login/admin", methods=["POST"])
def login_admin():
    data = request.get_json()

    if not data:
        return jsonify({"status": "error", "message": "Invalid request body"}), 400

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "status": "error",
            "message": "Username and password are required"
        }), 400

    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT admin_id, username, password_hash, role, active
            FROM ADMIN_BASE
            WHERE username=%s
            """,
            (username,)
        )
        admin = cursor.fetchone()

        if not admin:
            return jsonify({
                "status": "error",
                "message": "Invalid username or password"
            }), 401

        admin_id, db_username, password_hash, role, active = admin

        if not active:
            return jsonify({
                "status": "error",
                "message": "Admin account is disabled"
            }), 403

        hashed = hashlib.sha256(password.encode()).hexdigest()
        if hashed != password_hash:
            return jsonify({
                "status": "error",
                "message": "Invalid username or password"
            }), 401

        # Store admin session
        session["admin_id"] = admin_id
        session["admin_username"] = db_username
        session["admin_role"] = role
        session["is_admin"] = True

        return jsonify({
            "status": "success",
            "message": "Admin login successful",
            "role": role
        }), 200

    except Exception as e:
        print("Admin login error:", e)
        return jsonify({
            "status": "error",
            "message": "Internal server error",
            "details": str(e)
        }), 500
    finally:
        if conn:
            conn.close()


@app.route("/wallet/request_withdraw", methods=["POST"])
def request_withdraw():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "Invalid request"}), 400

    try:
        amount = float(data.get("amount", 0))
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid amount"}), 400

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401

    conn = get_db()
    cursor = conn.cursor()
    try:
        # Fetch current balance
        cursor.execute("SELECT balance FROM WALLET_BASE WHERE user_id=%s", (user_id,))
        wallet = cursor.fetchone()
        if not wallet:
            return jsonify({"status": "error", "message": "Wallet not found"}), 404

        current_balance = float(wallet[0])
        minimum_required = current_balance + 400

        if current_balance < minimum_required:
            return jsonify({
                "status": "error",
                "message": (
                    f"You can’t withdraw at this time. "
                    f"Your balance must reach at least ${minimum_required:,.2f} to proceed."
                )
            }), 200

        # If enough balance, create a withdrawal record
        cursor.execute(
            """
            INSERT INTO TRANSACTION_BASE (user_id, amount, transaction_type, status, created_at)
            VALUES (%s, %s, 'WITHDRAW', 'PENDING', %s)
            """,
            (user_id, amount, datetime.utcnow())
        )
        conn.commit()

        return jsonify({
            "status": "success",
            "message": f"Withdrawal request of ${amount:,.2f} submitted successfully."
        }), 200

    except Exception as e:
        print("Withdraw request error:", e)
        return jsonify({
            "status": "error",
            "message": "Failed to process withdrawal request"
        }), 500

    finally:
        cursor.close()
        conn.close()



if __name__ == "__main__":      

    app.run()












