function previewImage() {
    let fileInput = document.getElementById("imageInput");
    let imagePreview = document.getElementById("imagePreview");
    let file = fileInput.files[0];

    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = "none";
    }
}

function uploadImage() {
    let fileInput = document.getElementById("imageInput");
    let file = fileInput.files[0];

    if (!file) {
        showPopup("⚠️ Please select an image to classify!", []);
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    fetch("/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showPopup("❌ Error: " + data.error, []);
        } else {
            let predictedCategory = data.prediction;
            classifyWaste(predictedCategory);
        }
    })
    .catch(error => {
        showPopup("❌ Error: " + error, []);
    });
}

function classifyWaste(predictedCategory) {
    let messageElement = document.getElementById("classification-result");
    const recyclableCategories = ["Plastic", "Paper", "Glass", "Metal", "Cardboard"];
    const landfillCategories = ["Trash", "Styrofoam"];

    let title = "";
    let points = [];
    let boxMessage = "";

    if (recyclableCategories.includes(predictedCategory)) {
        title = `♻️ ${predictedCategory} is Recyclable!`;
        points = [
            "✅ This material can be processed and reused.",
            "🌍 Helps reduce landfill waste.",
            "🔄 Contributes to a circular economy.",
            "💡 Consider rinsing before recycling."
        ];
        boxMessage = `Predicted Category: ${predictedCategory} \n Send this waste for Recycling.`;
        messageElement.style.color = "yellow";
    } 
    else if (landfillCategories.includes(predictedCategory)) {
        title = `🚮 ${predictedCategory} is Non-Recyclable!`;
        points = [
            "❌ Cannot be recycled.",
            "🗑️ Should be disposed of in a landfill bin.",
            "🌱 Try reducing such waste.",
            "🔥 Consider waste-to-energy solutions.",
            "♻️ Explore eco-friendly alternatives."
        ];
        boxMessage = ` Predicted Category: ${predictedCategory} \n Send this waste to Landfill.`;
        messageElement.style.color = "#00FF7F";
    } else {
        title = "❓ Unknown Waste Category";
        points = [
            "⚠️ The classification system does not recognize this material.",
            "🔍 Please ensure the waste type is correct."
        ];
        boxMessage = `❓ Predicted Category: ${predictedCategory} \n Unknown waste type.`;
        messageElement.style.color = "black";
    }

    // Set classification result box content
    messageElement.innerText = boxMessage;
    messageElement.style.display = "block"; // Ensure the box is visible

// Adjust size and visibility
messageElement.style.width = "auto";  // Auto-size based on content
messageElement.style.maxWidth = "400px";  // Restrict width to avoid stretching
messageElement.style.textAlign = "center";  // Align text
messageElement.style.wordWrap = "break-word";  // Wrap long text
messageElement.style.fontSize = "24px"; // Bigger text
messageElement.style.fontWeight = "bold"; // Bold
messageElement.style.borderRadius = "6px"; // Slight rounding

    // Show popup with detailed information
    showPopup(title, points);
}

function showPopup(title, points) {
    let popupContent = `<h3>${title}</h3><ul>`;
    points.forEach(point => {
        popupContent += `<li>${point}</li>`;
    });
    popupContent += `</ul><button onclick="closePopup()">OK</button>`;

    document.getElementById("popup-result").innerHTML = popupContent;
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}
messageElement.innerText = boxMessage;
messageElement.style.display = "block"; // Ensure visibility

