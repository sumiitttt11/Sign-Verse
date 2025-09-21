import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.metrics import classification_report
import os

# -------------------------------
# STEP 1: Setup Mediapipe for Hand Detection
# -------------------------------
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

def extract_hand_landmarks(image):
    """Extract hand keypoints from an image using Mediapipe."""
    with mp_hands.Hands(static_image_mode=True, max_num_hands=1) as hands:
        results = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        if results.multi_hand_landmarks:
            landmarks = []
            for lm in results.multi_hand_landmarks[0].landmark:
                landmarks.extend([lm.x, lm.y, lm.z])
            return np.array(landmarks)
    return None

# -------------------------------
# STEP 2: Load Dataset (Train + Test)
# -------------------------------
def load_dataset(folder_path, classes):
    X, y = [], []
    for label, sign in enumerate(classes):
        folder = os.path.join(folder_path, sign)
        if not os.path.exists(folder):
            continue
        for file in os.listdir(folder):
            img_path = os.path.join(folder, file)
            img = cv2.imread(img_path)
            if img is None:
                continue
            landmarks = extract_hand_landmarks(img)
            if landmarks is not None:
                X.append(landmarks)
                y.append(label)
    return np.array(X), np.array(y)

CLASSES = ["A", "B", "C"]  # adjust based on your dataset

train_dir = "sign_dataset/train"
test_dir = "sign_dataset/test"

X_train, y_train = load_dataset(train_dir, CLASSES)
X_test, y_test = load_dataset(test_dir, CLASSES)

print("Train shape:", X_train.shape, y_train.shape)
print("Test shape:", X_test.shape, y_test.shape)

# Normalize dataset for better training
X_train = X_train / np.max(X_train)
X_test = X_test / np.max(X_test)

# -------------------------------
# STEP 3: Build Advanced Neural Network
# -------------------------------
model = models.Sequential([
    layers.Input(shape=(X_train.shape[1],)),   
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.3),   # prevent overfitting
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(64, activation='relu'),
    layers.Dense(len(CLASSES), activation='softmax')   
])

model.compile(optimizer='adam', 
              loss='sparse_categorical_crossentropy', 
              metrics=['accuracy'])

# -------------------------------
# STEP 4: Train the Model
# -------------------------------
history = model.fit(X_train, y_train, epochs=20, batch_size=16, validation_data=(X_test, y_test))

# -------------------------------
# STEP 5: Evaluate Model
# -------------------------------
y_pred = np.argmax(model.predict(X_test), axis=1)
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred, target_names=CLASSES))

# -------------------------------
# STEP 6: Translation Dictionary (English + Hindi)
# -------------------------------
translation_dict = {
    "A": {"en": "Apple", "hi": "सेब"},
    "B": {"en": "Ball", "hi": "गेंद"},
    "C": {"en": "Cat", "hi": "बिल्ली"}
}

# -------------------------------
# STEP 7: Real-Time Demo with Translations
# -------------------------------
cap = cv2.VideoCapture(0)
with mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7) as hands:
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # Extract landmarks for prediction
            landmarks = []
            for lm in results.multi_hand_landmarks[0].landmark:
                landmarks.extend([lm.x, lm.y, lm.z])

            prediction = model.predict(np.expand_dims(landmarks, axis=0), verbose=0)
            class_id = np.argmax(prediction)
            sign_name = CLASSES[class_id]

            # English + Hindi translation
            en_text = translation_dict[sign_name]["en"]
            hi_text = translation_dict[sign_name]["hi"]

            cv2.putText(frame, f"Sign: {sign_name}", (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, f"EN: {en_text}", (10, 80),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)
            cv2.putText(frame, f"HI: {hi_text}", (10, 120),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 200, 255), 2)

        cv2.imshow("Advanced Sign Language Translator", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
