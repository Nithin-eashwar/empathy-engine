import pandas as pd
import torch
from datasets import Dataset
from transformers import (
    DistilBertTokenizer, 
    DistilBertForSequenceClassification, 
    Trainer, 
    TrainingArguments
)
from sklearn.model_selection import train_test_split

# --- CONFIGURATION ---
DATA_PATH = "../data/synthetic_dataset.csv"
MODEL_NAME = "distilbert-base-uncased"
OUTPUT_DIR = "../saved_models/empathy_scorer"
NUM_EPOCHS = 3 
BATCH_SIZE = 8

def main():
    print(f"📂 Loading data from {DATA_PATH}...")
    
    # 1. Load Data
    df = pd.read_csv(DATA_PATH)
    
    # Clean column names (strip whitespace just in case)
    df.columns = df.columns.str.strip()
    
    # Ensure we have the right columns
    required_cols = ['original_message', 'empathy_score_warmth', 'empathy_score_validation']
    if not all(col in df.columns for col in required_cols):
        raise ValueError(f"CSV is missing columns. Found: {df.columns}")

    # 2. Preprocess Data
    # We combine the two scores into a list for the model to predict both at once
    # This is called "Multi-Output Regression"
    df['labels'] = df.apply(lambda row: [float(row['empathy_score_warmth']), float(row['empathy_score_validation'])], axis=1)
    
    # Split into Train/Test (80% train, 20% test)
    train_df, val_df = train_test_split(df, test_size=0.2, random_state=42)
    
    # Convert to HuggingFace Dataset format
    train_dataset = Dataset.from_pandas(train_df)
    val_dataset = Dataset.from_pandas(val_df)

    print("🧠 Initializing Tokenizer and Model...")
    tokenizer = DistilBertTokenizer.from_pretrained(MODEL_NAME)

    # 3. Tokenization Function
    def tokenize_function(examples):
        return tokenizer(examples["original_message"], padding="max_length", truncation=True, max_length=128)

    # Apply tokenization
    train_dataset = train_dataset.map(tokenize_function, batched=True)
    val_dataset = val_dataset.map(tokenize_function, batched=True)
    
    # Remove raw text columns, keep only tensors
    train_dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "labels"])
    val_dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "labels"])

    # 4. Initialize Model
    # num_labels=2 because we are predicting [warmth, validation]
    model = DistilBertForSequenceClassification.from_pretrained(
        MODEL_NAME, 
        num_labels=2, 
        problem_type="regression"
    )

    # 5. Define Training Arguments
    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=NUM_EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        eval_strategy="epoch",
        save_strategy="epoch",
        logging_dir="./logs",
        logging_steps=10,
        load_best_model_at_end=True
    )

    # 6. Initialize Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
    )

    print("🚀 Starting Training...")
    trainer.train()

    print(f"💾 Saving model to {OUTPUT_DIR}...")
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print("✅ Training Complete. You are ready to score messages!")

if __name__ == "__main__":
    main()