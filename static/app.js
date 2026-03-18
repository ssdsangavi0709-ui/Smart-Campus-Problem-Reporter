document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("complaintForm");
    const preview = document.getElementById("preview");
    const imageInput = document.getElementById("imageInput");
    const searchInput = document.getElementById("searchInput");

    // 1. Image Preview Logic
    if (imageInput && preview) {
        imageInput.addEventListener("change", function () {
            const file = imageInput.files[0];
            if (file) {
                preview.src = URL.createObjectURL(file);
                preview.style.display = "block";
            }
        });
    }

    // 2. Search/Filter Logic
    if (searchInput) {
        searchInput.addEventListener("keyup", function () {
            let value = this.value.toLowerCase();
            let cards = document.querySelectorAll(".complaint-card");

            cards.forEach(card => {
                if (card.innerText.toLowerCase().includes(value)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // 3. Handle Form Submission
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            let formData = new FormData(form);

            // ✅ FIXED HERE (removed localhost URL)
            fetch("/submit", {
                method: "POST",
                body: formData
            })
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(data => {
                alert(data.message || "Complaint submitted successfully!");
                form.reset();
                if (preview) preview.style.display = "none"; 
                loadComplaints();
            })
            .catch(error => {
                console.error("Error submitting complaint:", error);
                alert("Failed to submit complaint.");
            });
        });
    }

    // Initial load
    loadComplaints();
});

// --- CRUD Functions ---

// 4. Load all complaints
function loadComplaints() {
    const list = document.getElementById("complaintList");
    if (!list) return;

    // ✅ FIXED HERE
    fetch("/complaints")
        .then(response => response.json())
        .then(data => {
            list.innerHTML = "";

            if (!data || data.length === 0) {
                list.innerHTML = "<p>No complaints yet.</p>";
                return;
            }

            data.forEach(item => {
                const div = document.createElement("div");
                div.className = "complaint-card";
                div.style.border = "1px solid #ccc";
                div.style.padding = "12px";
                div.style.marginBottom = "12px";
                div.style.borderRadius = "8px";
                div.style.backgroundColor = "#f9f9f9";

                div.innerHTML = `
                    <p><strong>Name:</strong> ${item.name}</p>
                    <p><strong>Department:</strong> ${item.department}</p>
                    <p><strong>Location:</strong> ${item.location}</p>
                    <p><strong>Category:</strong> ${item.category}</p>
                    <p><strong>Description:</strong> ${item.description}</p>
                    <p><strong>Status:</strong> 
                        <span style="color:${item.status === 'Pending' ? 'red' : 'green'}; font-weight:bold;">
                            ${item.status}
                        </span>
                    </p>
                    <button onclick="toggleStatus(${item.id})" style="margin-right:10px; cursor:pointer;">
                        Toggle Status
                    </button>
                    <button onclick="deleteComplaint(${item.id})" style="cursor:pointer; color: white; background-color: #d9534f; border: none; padding: 5px 10px; border-radius: 4px;">
                        Delete
                    </button>
                `;
                list.appendChild(div);
            });
        })
        .catch(error => {
            console.error("Error loading complaints:", error);
        });
}

// 5. Delete complaint
function deleteComplaint(id) {
    if (!confirm("Are you sure you want to delete this complaint?")) return;

    // ✅ FIXED HERE
    fetch(`/delete/${id}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadComplaints();
    })
    .catch(error => {
        console.error("Error deleting complaint:", error);
    });
}

// 6. Toggle status
function toggleStatus(id) {
    // ✅ FIXED HERE
    fetch(`/update_status/${id}`, {
        method: "PUT"
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadComplaints();
    })
    .catch(error => {
        console.error("Error updating status:", error);
    });
}