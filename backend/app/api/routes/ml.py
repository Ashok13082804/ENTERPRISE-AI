"""ML API Routes"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.ml.ml_service import ml_service

router = APIRouter()


class SegmentationRequest(BaseModel):
    data: List[Dict[str, Any]]
    n_clusters: int = 4


class SalesPredictionRequest(BaseModel):
    historical_data: List[Dict[str, Any]]
    periods: int = 12


class AnomalyRequest(BaseModel):
    data: List[Dict[str, Any]]
    contamination: float = 0.05


class ClassificationRequest(BaseModel):
    train_data: List[Dict[str, Any]]
    target_column: str
    test_data: Optional[List[Dict[str, Any]]] = None


class ClusterRequest(BaseModel):
    data: List[Dict[str, Any]]
    n_clusters: int = 3
    method: str = "kmeans"


class DemandForecastRequest(BaseModel):
    dates: List[str]
    values: List[float]
    periods: int = 30


@router.post("/segmentation")
async def customer_segmentation(
    body: SegmentationRequest,
    current_user=Depends(get_current_user),
):
    """Customer segmentation using K-Means."""
    if not body.data:
        raise HTTPException(400, "No data provided")
    result = ml_service.customer_segmentation(body.data, body.n_clusters)
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result


@router.post("/sales-prediction")
async def predict_sales(
    body: SalesPredictionRequest,
    current_user=Depends(get_current_user),
):
    """Sales prediction using Gradient Boosting."""
    result = ml_service.predict_sales(body.historical_data, body.periods)
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result


@router.post("/anomaly-detection")
async def detect_anomalies(
    body: AnomalyRequest,
    current_user=Depends(get_current_user),
):
    """Anomaly detection using Isolation Forest."""
    result = ml_service.detect_anomalies(body.data, body.contamination)
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result


@router.post("/classification")
async def classify(
    body: ClassificationRequest,
    current_user=Depends(get_current_user),
):
    """Multi-class classification using Random Forest."""
    result = ml_service.classify_data(body.train_data, body.target_column, body.test_data)
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result


@router.post("/clustering")
async def cluster(
    body: ClusterRequest,
    current_user=Depends(get_current_user),
):
    """Data clustering."""
    result = ml_service.cluster_data(body.data, body.n_clusters, body.method)
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result


@router.post("/demand-forecast")
async def demand_forecast(
    body: DemandForecastRequest,
    current_user=Depends(get_current_user),
):
    """Demand forecasting."""
    result = ml_service.demand_forecast(body.dates, body.values, body.periods)
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result


@router.get("/sample-data/segmentation")
async def get_segmentation_sample():
    """Return sample data for segmentation demo."""
    import random
    data = [
        {
            "customer_id": i,
            "age": random.randint(20, 70),
            "annual_income": random.randint(20000, 150000),
            "spending_score": random.randint(1, 100),
            "purchase_count": random.randint(1, 50),
        }
        for i in range(1, 101)
    ]
    return {"data": data, "description": "Sample customer data for segmentation"}


@router.get("/sample-data/sales")
async def get_sales_sample():
    """Return sample sales data for prediction demo."""
    import random
    base = 1000
    data = []
    for i in range(24):
        base += random.randint(-100, 200)
        data.append({
            "month": i + 1,
            "sales": max(500, base + random.randint(-200, 200)),
        })
    return {"data": data, "description": "24 months of sample sales data"}


class MLSolveRequest(BaseModel):
    algorithm: str
    problem_description: str


ALGORITHMS_REGISTRY = {
    # REGRESSION
    "linear regression": {
        "category": "Regression",
        "formula": r"y = \beta_0 + \beta_1 x_1 + \dots + \beta_p x_p + \epsilon",
        "explanation": "Finds the linear relationship between independent variables and a dependent target. Solved using Ordinary Least Squares (OLS).",
        "code": "from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\ny_pred = model.predict(X_test)",
        "metrics": {"R2_Score": 0.945, "MAE": 12.4, "MSE": 240.2}
    },
    "polynomial regression": {
        "category": "Regression",
        "formula": r"y = \beta_0 + \beta_1 x + \beta_2 x^2 + \dots + \beta_d x^d + \epsilon",
        "explanation": "Models non-linear relationships by creating polynomial features of the input variables.",
        "code": "from sklearn.preprocessing import PolynomialFeatures\nfrom sklearn.linear_model import LinearRegression\npoly = PolynomialFeatures(degree=2)\nX_poly = poly.fit_transform(X)\nmodel = LinearRegression()\nmodel.fit(X_poly, y)",
        "metrics": {"R2_Score": 0.972, "MAE": 8.5, "MSE": 115.4}
    },
    "lasso regression": {
        "category": "Regression",
        "formula": r"\min_{\beta} \left\{ \frac{1}{2n} \|y - X\beta\|_2^2 + \alpha \|\beta\|_1 \right\}",
        "explanation": "Linear regression with L1 regularization. Drives coefficients of non-important features to absolute zero (performs feature selection).",
        "code": "from sklearn.linear_model import Lasso\nmodel = Lasso(alpha=0.1)\nmodel.fit(X_train, y_train)",
        "metrics": {"R2_Score": 0.932, "MAE": 13.1, "MSE": 265.8}
    },
    "ridge regression": {
        "category": "Regression",
        "formula": r"\min_{\beta} \left\{ \|y - X\beta\|_2^2 + \alpha \|\beta\|_2^2 \right\}",
        "explanation": "Linear regression with L2 regularization. Shinks coefficients to reduce model variance and collinearity.",
        "code": "from sklearn.linear_model import Ridge\nmodel = Ridge(alpha=1.0)\nmodel.fit(X_train, y_train)",
        "metrics": {"R2_Score": 0.941, "MAE": 12.8, "MSE": 250.1}
    },
    "elasticnet regression": {
        "category": "Regression",
        "formula": r"\min_{\beta} \left\{ \frac{1}{2n} \|y - X\beta\|_2^2 + \alpha \rho \|\beta\|_1 + \frac{\alpha(1-\rho)}{2} \|_2^2 \right\}",
        "explanation": "Combines both L1 (Lasso) and L2 (Ridge) regularizations to balance parameter shrinking and sparse feature selection.",
        "code": "from sklearn.linear_model import ElasticNet\nmodel = ElasticNet(alpha=0.5, l1_ratio=0.5)\nmodel.fit(X_train, y_train)",
        "metrics": {"R2_Score": 0.938, "MAE": 12.9, "MSE": 255.4}
    },
    "svr": {
        "category": "Regression",
        "formula": r"\min \frac{1}{2}\|\beta\|^2 \quad \text{s.t.} \quad |y_i - x_i\beta| \le \epsilon",
        "explanation": "Support Vector Regression finds a tube around the regression line containing the maximum points, ignoring errors outside the tube boundaries.",
        "code": "from sklearn.svm import SVR\nmodel = SVR(kernel='rbf', C=1.0, epsilon=0.1)\nmodel.fit(X_train, y_train)",
        "metrics": {"R2_Score": 0.912, "MAE": 15.2, "MSE": 312.4}
    },
    "decision tree regression": {
        "category": "Regression",
        "formula": r"\text{MSE} = \sum (y_i - \hat{y})^2",
        "explanation": "Builds a tree structure by partitioning the feature space recursively based on variance reduction.",
        "code": "from sklearn.tree import DecisionTreeRegressor\nmodel = DecisionTreeRegressor(max_depth=5)\nmodel.fit(X_train, y_train)",
        "metrics": {"R2_Score": 0.885, "MAE": 18.5, "MSE": 450.2}
    },
    "random forest regression": {
        "category": "Regression",
        "formula": r"\hat{f}(x) = \frac{1}{B} \sum_{b=1}^B f_b(x)",
        "explanation": "Ensemble learning method combining predictions from multiple decision trees trained on bootstrapped subsets.",
        "code": "from sklearn.ensemble import RandomForestRegressor\nmodel = RandomForestRegressor(n_estimators=100)\nmodel.fit(X_train, y_train)",
        "metrics": {"R2_Score": 0.958, "MAE": 10.2, "MSE": 180.5}
    },
    # CLASSIFICATION
    "logistic regression": {
        "category": "Classification",
        "formula": r"p(x) = \frac{e^{\beta_0 + \beta_1 x}}{1 + e^{\beta_0 + \beta_1 x}}",
        "explanation": "Predicts probabilities of binary outcomes using the sigmoid logistic function.",
        "code": "from sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression()\nmodel.fit(X_train, y_train)",
        "metrics": {"Accuracy": 0.92, "Precision": 0.91, "Recall": 0.93, "F1_Score": 0.92}
    },
    "knn": {
        "category": "Classification",
        "formula": r"d(p, q) = \sqrt{\sum (p_i - q_i)^2}",
        "explanation": "Classifies a query point based on vote majority of its K closest spatial neighbors using Euclidean distance.",
        "code": "from sklearn.neighbors import KNeighborsClassifier\nmodel = KNeighborsClassifier(n_neighbors=5)\nmodel.fit(X_train, y_train)",
        "metrics": {"Accuracy": 0.89, "Precision": 0.88, "Recall": 0.90, "F1_Score": 0.89}
    },
    "svm": {
        "category": "Classification",
        "formula": r"\vec{w}\cdot\vec{x} - b = 0 \quad \text{(Maximum Margin Hyperplane)}",
        "explanation": "Finds the optimal separating hyperplane that maximizes the geometric margin between classes.",
        "code": "from sklearn.svm import SVC\nmodel = SVC(kernel='linear', C=1.0)\nmodel.fit(X_train, y_train)",
        "metrics": {"Accuracy": 0.94, "Precision": 0.93, "Recall": 0.95, "F1_Score": 0.94}
    },
    "naive bayes": {
        "category": "Classification",
        "formula": r"P(y|x_1,\dots,x_n) \propto P(y) \prod_{i=1}^n P(x_i|y)",
        "explanation": "Probabilistic classifier based on Bayes' theorem, assuming strong conditional independence between features.",
        "code": "from sklearn.naive_bayes import GaussianNB\nmodel = GaussianNB()\nmodel.fit(X_train, y_train)",
        "metrics": {"Accuracy": 0.85, "Precision": 0.83, "Recall": 0.87, "F1_Score": 0.85}
    },
    "decision tree classifier": {
        "category": "Classification",
        "formula": r"\text{Gini} = 1 - \sum p_i^2 \quad \text{or} \quad \text{Entropy} = -\sum p_i \log_2(p_i)",
        "explanation": "Recursive splitting of sample subsets based on Gini impurity or Information Gain.",
        "code": "from sklearn.tree import DecisionTreeClassifier\nmodel = DecisionTreeClassifier(criterion='gini', max_depth=6)\nmodel.fit(X_train, y_train)",
        "metrics": {"Accuracy": 0.87, "Precision": 0.86, "Recall": 0.88, "F1_Score": 0.87}
    },
    "random forest classifier": {
        "category": "Classification",
        "formula": r"\text{Majority Vote across trees } T_1, \dots, T_B",
        "explanation": "Bagging classifier ensemble training separate decision trees to aggregate classification votes, reducing variance.",
        "code": "from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(n_estimators=100)\nmodel.fit(X_train, y_train)",
        "metrics": {"Accuracy": 0.95, "Precision": 0.94, "Recall": 0.96, "F1_Score": 0.95}
    },
    "xgboost": {
        "category": "Classification",
        "formula": r"\mathcal{L}^{(t)} = \sum l(y_i, \hat{y}_i^{(t-1)} + f_t(x_i)) + \Omega(f_t)",
        "explanation": "Optimized gradient boosted decision tree library designed for highly efficient, structured tabular inputs.",
        "code": "from xgboost import XGBClassifier\nmodel = XGBClassifier()\nmodel.fit(X_train, y_train)",
        "metrics": {"Accuracy": 0.97, "Precision": 0.96, "Recall": 0.98, "F1_Score": 0.97}
    },
    "lightgbm": {
        "category": "Classification",
        "formula": r"\text{Leaf-wise tree growth with GOSS and EFB}",
        "explanation": "Fast, high-performance gradient boosting framework utilizing leaf-wise splitting and feature bundling.",
        "code": "from lightgbm import LGBMClassifier\nmodel = LGBMClassifier()\nmodel.fit(X_train, y_train)",
        "metrics": {"Accuracy": 0.965, "Precision": 0.958, "Recall": 0.972, "F1_Score": 0.965}
    },
    "catboost": {
        "category": "Classification",
        "formula": r"\text{Symmetric trees resolving categorical features target stats}",
        "explanation": "Gradient boosting framework designed with optimized native handling of categorical attributes.",
        "code": "from catboost import CatBoostClassifier\nmodel = CatBoostClassifier(iterations=100, verbose=0)\nmodel.fit(X_train, y_train)",
        "metrics": {"Accuracy": 0.968, "Precision": 0.961, "Recall": 0.975, "F1_Score": 0.968}
    },
    # CLUSTERING
    "k-means": {
        "category": "Clustering",
        "formula": r"J = \sum_{i=1}^k \sum_{x \in S_i} \|x - \mu_i\|^2",
        "explanation": "Partitions data into K disjoint clusters by iteratively assigning points to the nearest cluster centroid.",
        "code": "from sklearn.cluster import KMeans\nkmeans = KMeans(n_clusters=3)\nkmeans.fit(X)",
        "metrics": {"Silhouette_Score": 0.584, "Inertia": 420.2, "Calinski_Harabasz": 341.2}
    },
    "dbscan": {
        "category": "Clustering",
        "formula": r"\text{Density-based clustering scanning eps-neighborhood}",
        "explanation": "Clusters arbitrary shapes based on spatial density checkpoints, grouping core, border, and noise outliers.",
        "code": "from sklearn.cluster import DBSCAN\ndb = DBSCAN(eps=0.5, min_samples=5)\ndb.fit(X)",
        "metrics": {"Silhouette_Score": 0.412, "Noise_Ratio_Pct": 5.4}
    },
    "gmm": {
        "category": "Clustering",
        "formula": r"p(\vec{x}) = \sum_{k=1}^K \pi_k \mathcal{N}(\vec{x}|\vec{\mu}_k, \mathbf{\Sigma}_k)",
        "explanation": "Soft clustering method modeling data as a mixture of multiple Gaussian probability distributions using Expectation-Maximization (EM).",
        "code": "from sklearn.mixture import GaussianMixture\ngmm = GaussianMixture(n_components=3)\ngmm.fit(X)",
        "metrics": {"AIC": -1204.5, "BIC": -1180.2}
    },
    # DIMENSIONALITY REDUCTION
    "pca": {
        "category": "Dimensionality Reduction",
        "formula": r"\text{maximize } \mathbf{w}^T \mathbf{\Sigma} \mathbf{w} \quad \text{s.t.} \quad \mathbf{w}^T\mathbf{w}=1",
        "explanation": "Linear projection mapping high dimensional inputs to orthogonal axes of maximum variance.",
        "code": "from sklearn.decomposition import PCA\npca = PCA(n_components=2)\nX_reduced = pca.fit_transform(X)",
        "metrics": {"Explained_Variance_Ratio_PC1": 0.642, "Explained_Variance_PC2": 0.215}
    },
    "t-sne": {
        "category": "Dimensionality Reduction",
        "formula": r"KL(P||Q) = \sum_i \sum_j p_{j|i} \log \frac{p_{j|i}}{q_{j|i}}",
        "explanation": "Non-linear manifold scaling mapping similar spatial points closely together in low dimensional views.",
        "code": "from sklearn.manifold import TSNE\ntsne = TSNE(n_components=2, perplexity=30)\nX_2d = tsne.fit_transform(X)",
        "metrics": {"KL_Divergence": 0.285}
    },
    # DEEP LEARNING & RL
    "cnn": {
        "category": "Deep Learning",
        "formula": r"S(i,j) = (I * K)(i,j) = \sum_m \sum_n I(i-m, j-n) K(m,n)",
        "explanation": "Neural networks extracting structural features (images/grids) using mathematical conv filters.",
        "code": "import torch.nn as nn\nclass CNN(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.conv = nn.Conv2d(1, 32, 3)\n        self.pool = nn.MaxPool2d(2)\n    def forward(self, x): return self.pool(self.conv(x))",
        "metrics": {"Epochs": 50, "Loss": 0.045, "Accuracy": 0.985}
    },
    "lstm": {
        "category": "Deep Learning",
        "formula": r"f_t = \sigma(W_f[h_{t-1}, x_t] + b_f) \quad \text{(Forget Gate)}",
        "explanation": "Recurrent units tracking temporal arrays via cell state gates mitigating vanishing gradients.",
        "code": "import torch.nn as nn\nlstm = nn.LSTM(input_size=10, hidden_size=20, num_layers=2)",
        "metrics": {"Seq_Length": 128, "Loss": 0.082, "Accuracy": 0.942}
    },
    "transformers": {
        "category": "Deep Learning",
        "formula": r"\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V",
        "explanation": "Sequence transducer using parallel self-attention pathways mapping long dependencies.",
        "code": "from transformers import AutoModel\ntransformer = AutoModel.from_pretrained('bert-base-uncased')",
        "metrics": {"Parameters": "110M", "Loss": 0.12, "Accuracy": 0.925}
    },
    "dqn": {
        "category": "Reinforcement Learning",
        "formula": r"Q(s,a) \leftarrow Q(s,a) + \alpha [r + \gamma \max_{a'} Q(s',a') - Q(s,a)]",
        "explanation": "Off-policy model training an ANN to approximate Q-value reward maps.",
        "code": "import numpy as np\n# DQN targets temporal differences\ntarget = reward + gamma * np.max(Q_next_state)",
        "metrics": {"Episodes": 2000, "Avg_Reward": 480.2}
    },
    "ppo": {
        "category": "Reinforcement Learning",
        "formula": r"L^{CLIP}(\theta) = \hat{\mathbb{E}}_t \left[ \min(r_t(\theta)\hat{A}_t, \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_t) \right]",
        "explanation": "On-policy policy gradient algorithm utilizing clipped surrogate objectives to limit excessive policy shifts during training updates.",
        "code": "# PPO objective\nratio = policy_prob_new / policy_prob_old\nclipped_ratio = clip(ratio, 1 - eps, 1 + eps)\nloss = -min(ratio * advantage, clipped_ratio * advantage)",
        "metrics": {"Steps": 100000, "Mean_Episode_Reward": 940.5}
    }
}


@router.post("/solver")
async def ml_solver(
    body: MLSolveRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Offline ML algorithms solution engine."""
    alg_key = body.algorithm.lower().strip()
    
    # Try finding matching algorithm
    match = None
    for k, v in ALGORITHMS_REGISTRY.items():
        if alg_key in k or k in alg_key:
            match = v
            match["algorithm_name"] = k.title()
            break
            
    if not match:
        # Fallback to general linear regression if no match
        match = ALGORITHMS_REGISTRY["linear regression"].copy()
        match["algorithm_name"] = body.algorithm
        
    # Seed description in RAG/Ollama context if available
    try:
        from app.ai.ollama_client import ollama_client
        prompt = (
            f"You are a machine learning scientist. Explain how to solve this problem:\n"
            f"Problem: {body.problem_description}\n"
            f"Algorithm: {match['algorithm_name']}\n"
            f"Give a brief explanation and return a sample python code snippet."
        )
        ai_resp = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
        match["explanation"] = ai_resp
    except Exception:
        pass
        
    return {
        "algorithm": match["algorithm_name"],
        "category": match["category"],
        "formula_latex": match["formula"],
        "explanation": match["explanation"],
        "python_code": match["code"],
        "metrics_simulation": match["metrics"],
        "academic_reference": "Hastie, Tibshirani, Friedman: Elements of Statistical Learning"
    }

