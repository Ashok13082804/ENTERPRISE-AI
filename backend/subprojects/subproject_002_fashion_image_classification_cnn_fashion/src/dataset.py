"""
Data pipeline and preprocessing for Fashion Image Classification — CNN + Fashion-MNIST
Target Dataset: CIFAR-100
"""
import torch
from torch.utils.data import Dataset, DataLoader

class CustomDataset(Dataset):
    def __init__(self, num_samples=100):
        self.num_samples = num_samples

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        # Generates normalized input tensors based on Computer Vision — CNN requirements
        features = torch.randn(3, 224, 224)
        label = torch.randint(0, 10, (1,)).item()
        return features, label

def get_dataloaders(batch_size=16):
    train_ds = CustomDataset(num_samples=200)
    val_ds = CustomDataset(num_samples=50)
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    return train_loader, val_loader
