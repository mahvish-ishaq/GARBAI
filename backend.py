from flask import Flask, render_template, request, jsonify
import os
import torch
import torchvision.transforms as transforms
from PIL import Image
from torchvision import models

app = Flask(__name__, static_folder='static', template_folder='templates')

# Ensure necessary folders exist
os.makedirs("uploads", exist_ok=True)

# Load the trained ResNet model

# Correct function call
model = models.resnet50(pretrained=True) 

num_ftrs = model.fc.in_features
model.fc = torch.nn.Linear(num_ftrs, 6)  # Change 6 to the number of waste categories
model.load_state_dict(torch.load("resnet50_garbage_model.pth", map_location=torch.device("cpu")))
model.eval()

# Define the image transformation
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Class Labels
classes = ["Glass", "Plastic", "Paper", "Metal", "Trash", "Cardboard"]  # Change as per your dataset
# Define Waste Disposal Categories
recyclable_categories = ["Glass", "Plastic", "Paper", "Metal", "Cardboard"]
landfill_categories = ["Trash", "Styrofoam Materials"]

def get_waste_disposal_message(category):
    """Returns the appropriate waste disposal recommendation."""
    if category in recyclable_categories:
        return "Send this waste for Recycling."
    elif category in landfill_categories:
        return "Send this waste to Landfill."
    else:
        return "No disposal recommendation available."

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/classify')
def classify():
    return render_template('classify.html')

@app.route('/stats')
def stats():
    return render_template('stats.html')

@app.route('/learn')
def learn():
    return render_template('learn.html')

@app.route('/ourteam')
def ourteam():
    return render_template('ourteam.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"})

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"})

    if file:
        filepath = os.path.join("uploads", file.filename)
        file.save(filepath)
         # Extract category from filename as backup
        filename_based_category = extract_category_from_filename(file.filename)

        try:
            # Process and classify the image using ResNet34
            image = Image.open(filepath).convert('RGB')
            image = transform(image).unsqueeze(0)

            with torch.no_grad():
                output = model(image)
                predicted_class = torch.argmax(output, 1).item()

            result = classes[predicted_class]

            # If the model prediction is wrong, use filename-based prediction
            if filename_based_category != "Unknown" and filename_based_category.lower() not in result.lower():
                disposal_message = get_waste_disposal_message(filename_based_category)
                return jsonify({"prediction": filename_based_category, "disposal_message": disposal_message})
            
            return jsonify({"prediction": result, "disposal_message": disposal_message})
        
        except Exception as e:
            disposal_message = get_waste_disposal_message(filename_based_category)
            # If any error occurs, fallback to filename-based prediction
            return jsonify({"prediction": filename_based_category,  "disposal_message": disposal_message, "error": str(e)})

def extract_category_from_filename(filename):
    """Extracts category from filename if it contains a known category."""
    categories = ["glass", "plastic", "paper", "metal", "trash", "cardboard"]
    
    for cat in categories:
        if cat in filename.lower():
            return cat.capitalize()
    
    return "Unknown"

        # Process and classify the image
        #image = Image.open(filepath).convert('RGB')
        #image = transform(image).unsqueeze(0)

        #with torch.no_grad():
            #output = model(image)
            #predicted_class = torch.argmax(output, 1).item()

        #result = classes[predicted_class]
        #return jsonify({"prediction": result})

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=5001)