"""
Training script for Project #2: Fashion Image Classification — CNN + Fashion-MNIST
Optimization: AdamW + Cosine Annealing
"""
import torch
import torch.nn as nn
import torch.optim as optim
from model import ResNet_50Model
from dataset import get_dataloaders

def train(epochs=5, lr=3e-4):
    device = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))
    print(f"Training on device: {device}")

    model = ResNet_50Model().to(device)
    train_loader, val_loader = get_dataloaders(batch_size=16)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-2)

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            out = model(x)
            loss = criterion(out, y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        print(f"Epoch [{epoch+1}/{epochs}] - Loss: {avg_loss:.4f}")

    torch.save(model.state_dict(), "weights.pth")
    print("Training finished! Saved model to weights.pth")

if __name__ == "__main__":
    train(epochs=3)
