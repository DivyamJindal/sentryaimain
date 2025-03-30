import modal

MODEL_ID = "NousResearch/Meta-Llama-3.1-70B-Instruct"
MODEL_REVISION = "d50656ee28e2c2906d317cbbb6fcb55eb4055a84"

image = modal.Image.debian_slim().pip_install("transformers", "torch", "accelerate")
app = modal.App("llama-inference", image=image)

GPU_CONFIG = "H100:2"

CACHE_DIR = "/cache"
cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)


@app.cls(
    gpu=GPU_CONFIG,
    volumes={CACHE_DIR: cache_vol},
    allow_concurrent_inputs=15,
    scaledown_window=60 * 10,
    timeout=60 * 60,
)
class Model:
    @modal.enter()
    def setup(self):
        import torch

        from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

        from huggingface_hub import snapshot_download

        # Download the model to the cache directory
        model_path = snapshot_download(repo_id=MODEL_ID, cache_dir=CACHE_DIR)

        print(f"Model downloaded to: {model_path}")

        # Specify cache directory if needed
        model = AutoModelForCausalLM.from_pretrained(MODEL_ID, cache_dir=CACHE_DIR)
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, cache_dir=CACHE_DIR)

        self.pipeline = pipeline(
            "text-generation",
            model=model,
            revision=MODEL_REVISION,
            tokenizer=tokenizer,
            model_kwargs={"torch_dtype": torch.bfloat16},
            device_map="auto",
        )

    @modal.method()
    def generate(self, input: str):
        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant.",
            },
            {"role": "user", "content": input},
        ]

        outputs = self.pipeline(
            messages,
            max_new_tokens=256,
        )

        # Extract the assistant's response
        try:
            return outputs[0]["generated_text"][-1]["content"]
        except (KeyError, IndexError, TypeError):
            # Fallback extraction in case the output format is different
            return str(outputs[0]["generated_text"])


# For testing and deployment
@app.local_entrypoint()
def main(prompt: str = None):
    if prompt is None:
        prompt = "Please write a Python function to compute the Fibonacci numbers."
    print("Testing the model with prompt:", prompt)
    response = Model().generate.remote(prompt)
    print("Response:", response)