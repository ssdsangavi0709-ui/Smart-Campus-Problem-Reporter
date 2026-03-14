import json
import os
from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

app = Flask(__name__)
app.secret_key = "supersecretkey"
CORS(app)
UPLOAD_FOLDER = "static/uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

if os.path.exists("complaints.json"):
    with open("complaints.json", "r") as f:
        complaints = json.load(f)
else:
    complaints = []

# ---------------- Home ----------------
@app.route('/')
def home():
    return render_template("index.html")

# ---------------- Admin Login Page ----------------
@app.route('/admin')
def admin_login():
    return render_template("admin_login.html")

# ---------------- Handle Admin Login ----------------
@app.route('/admin_login', methods=['POST'])
def handle_admin_login():
    username = request.form.get("username")
    password = request.form.get("password")

    if username == "admin" and password == "1234":
        session["admin"] = True
        return redirect(url_for("dashboard"))
    else:
        return "Invalid Credentials"

# ---------------- Admin Dashboard ----------------
@app.route('/dashboard')
def dashboard():

    if "admin" not in session:
        return redirect(url_for("admin_login"))

    total = len(complaints)
    pending = len([c for c in complaints if c["status"] == "Pending"])
    resolved = len([c for c in complaints if c["status"] == "Resolved"])

    return render_template(
        "admin_dashboard.html",
        complaints=complaints,
        total=total,
        pending=pending,
        resolved=resolved
    )
@app.route('/logout')
def logout():
    session.pop("admin", None)
    return redirect(url_for("admin_login"))

# ---------------- Submit Complaint ----------------
@app.route('/submit', methods=['POST'])
def submit():

    name = request.form.get("name")
    department = request.form.get("department")
    location = request.form.get("location")
    category = request.form.get("category")
    description = request.form.get("description")

    image = request.files.get("image")
    filename = ""

    if image and image.filename != "":
        filename = image.filename
        image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

    complaint = {
        "id": len(complaints) + 1,
        "name": name,
        "department": department,
        "location": location,
        "category": category,
        "description": description,
        "status": "Pending",
        "image": filename
    }

    complaints.append(complaint)

    with open("complaints.json", "w") as f:
        json.dump(complaints, f, indent=4)

    return jsonify({"message": "Complaint submitted successfully!"})
   
# ---------------- Get All Complaints ----------------
@app.route('/complaints', methods=['GET'])
def get_complaints():
    return jsonify(complaints)

# ---------------- Delete Complaint ----------------
@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_complaint(id):
    global complaints
    complaints = [c for c in complaints if c["id"] != id]

    with open("complaints.json", "w") as f:
        json.dump(complaints, f, indent=4)

    return jsonify({"message": "Deleted successfully"})

# ---------------- Toggle Status ----------------
@app.route('/update_status/<int:id>', methods=['PUT'])
def update_status(id):
    for complaint in complaints:
        if complaint["id"] == id:
            if complaint["status"] == "Pending":
                complaint["status"] = "Resolved"
            else:
                complaint["status"] = "Pending"

            with open("complaints.json", "w") as f:
                json.dump(complaints, f, indent=4)

            return jsonify({"message": "Status updated"})

    return jsonify({"message": "Complaint not found"})

if __name__ == "__main__":
    app.run(debug=True)