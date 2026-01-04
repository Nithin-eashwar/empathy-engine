import pandas as pd
from transformers import (
    T5Tokenizer, 
    T5ForConditionalGeneration, 
    Seq2SeqTrainer, 
    Seq2SeqTrainingArguments,
    DataCollatorForSeq2Seq
)
from datasets import Dataset
from sklearn.model_selection import train_test_split

# --- CONFIGURATION ---
DATA_PATH = "../data/synthetic_dataset.csv"
MODEL_NAME = "t5-small"  # Fast, lightweight, perfect for CPU training
OUTPUT_DIR = "../saved_models/empathy_rewriter"
NUM_EPOCHS = 20          # T5 needs a bit more time than BERT
BATCH_SIZE = 4

def main():
    print(f"📂 Loading data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()

    # We need 'original_message' (Input) and 'rewritten_message' (Target)
    df = df[['original_message', 'rewritten_message']].dropna()
    
    # Add a prefix so T5 knows what task to do (standard T5 practice)
    df['input_text'] = "rewrite harsh to polite: " + df['original_message']
    df['target_text'] = df['rewritten_message']

    train_df, val_df = train_test_split(df, test_size=0.1, random_state=42)
    train_dataset = Dataset.from_pandas(train_df)
    val_dataset = Dataset.from_pandas(val_df)

    print("🧠 Loading T5 Tokenizer...")
    tokenizer = T5Tokenizer.from_pretrained(MODEL_NAME, legacy=False)

    def preprocess_function(examples):
        # Tokenize Inputs
        model_inputs = tokenizer(
            examples["input_text"], 
            max_length=128, 
            truncation=True, 
            padding="max_length"
        )
        # Tokenize Targets (The polite versions)
        labels = tokenizer(
            examples["target_text"], 
            max_length=128, 
            truncation=True, 
            padding="max_length"
        )
        model_inputs["labels"] = labels["input_ids"]
        return model_inputs

    train_dataset = train_dataset.map(preprocess_function, batched=True)
    val_dataset = val_dataset.map(preprocess_function, batched=True)

    print("🧠 Loading T5 Model...")
    model = T5ForConditionalGeneration.from_pretrained(MODEL_NAME)

    args = Seq2SeqTrainingArguments(
        output_dir="./results_t5",
        eval_strategy="epoch",  # Updated for new transformers
        learning_rate=2e-4,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        save_total_limit=2,
        num_train_epochs=NUM_EPOCHS,
        predict_with_generate=True,
        logging_steps=10
    )

    trainer = Seq2SeqTrainer(
        model=model,
        args=args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        tokenizer=tokenizer,
        data_collator=DataCollatorForSeq2Seq(tokenizer, model=model)
    )

    print("🚀 Starting T5 Training...")
    trainer.train()

    print(f"💾 Saving model to {OUTPUT_DIR}...")
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print("✅ Rewriter Training Complete!")

if __name__ == "__main__":
    main()