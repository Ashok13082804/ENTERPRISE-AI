"""
Inference pipeline for Fashion Image Classification — CNN + Fashion-MNIST
"""
import torch
from model import ResNet_50Model

class Predictor:
    def __init__(self, weights_path=None):
        self.device = torch.device("cpu")
        self.model = ResNet_50Model().to(self.device)
        self.model.eval()

    def predict(self, input_tensor):
        with torch.no_grad():
            output = self.model(input_tensor)
            probs = torch.softmax(output, dim=-1)
            conf, pred = torch.max(probs, dim=-1)
            return {
                "class_id": int(pred.item()),
                "confidence": round(float(conf.item()), 4),
                "probabilities": probs.squeeze().tolist()
            }

if __name__ == "__main__":
    predictor = Predictor()
    dummy = torch.randn(1, 3, 224, 224)
    res = predictor.predict(dummy)
    print("Prediction result:", res)
