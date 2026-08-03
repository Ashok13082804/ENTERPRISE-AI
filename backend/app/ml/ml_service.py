"""
Machine Learning Services
Customer Segmentation, Sales Prediction, Anomaly Detection, etc.
Using scikit-learn and XGBoost (all local, no cloud)
"""
import json
from typing import Dict, Any, List, Optional
from pathlib import Path

import numpy as np
import pandas as pd
from loguru import logger


class MLService:
    """Local ML model service using scikit-learn."""

    def __init__(self):
        self.models_dir = Path("./models")
        self.models_dir.mkdir(exist_ok=True)

    def customer_segmentation(
        self, data: List[Dict[str, Any]], n_clusters: int = 4
    ) -> Dict[str, Any]:
        """K-Means customer segmentation."""
        try:
            from sklearn.cluster import KMeans
            from sklearn.preprocessing import StandardScaler

            df = pd.DataFrame(data)
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            if not numeric_cols:
                return {"error": "No numeric columns found"}

            X = df[numeric_cols].fillna(0)
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            labels = kmeans.fit_predict(X_scaled)

            df["segment"] = labels
            segment_stats = {}
            for i in range(n_clusters):
                mask = labels == i
                segment_stats[f"Segment {i+1}"] = {
                    "count": int(mask.sum()),
                    "percentage": round(float(mask.mean()) * 100, 2),
                    "centroid": {col: round(float(kmeans.cluster_centers_[i][j]), 2) for j, col in enumerate(numeric_cols)},
                }

            return {
                "segments": segment_stats,
                "inertia": round(float(kmeans.inertia_), 2),
                "n_clusters": n_clusters,
                "labels": labels.tolist(),
                "feature_columns": numeric_cols,
            }
        except Exception as e:
            logger.error(f"Segmentation error: {e}")
            return {"error": str(e)}

    def predict_sales(
        self, historical_data: List[Dict[str, Any]], periods: int = 12
    ) -> Dict[str, Any]:
        """Sales forecasting using XGBoost."""
        try:
            from sklearn.ensemble import GradientBoostingRegressor
            
            df = pd.DataFrame(historical_data)
            if "sales" not in df.columns:
                return {"error": "Column 'sales' required"}
            
            # Create time features
            df = df.reset_index(drop=True)
            df["period"] = range(len(df))
            df["lag_1"] = df["sales"].shift(1).fillna(df["sales"].mean())
            df["lag_2"] = df["sales"].shift(2).fillna(df["sales"].mean())
            df["rolling_3"] = df["sales"].rolling(3, min_periods=1).mean()
            
            X = df[["period", "lag_1", "lag_2", "rolling_3"]].values
            y = df["sales"].values
            
            model = GradientBoostingRegressor(n_estimators=100, random_state=42)
            model.fit(X, y)
            
            # Forecast
            forecasts = []
            last_sales = list(df["sales"].values[-3:])
            
            for i in range(periods):
                period = len(df) + i
                lag_1 = last_sales[-1]
                lag_2 = last_sales[-2] if len(last_sales) >= 2 else lag_1
                rolling_3 = np.mean(last_sales[-3:]) if len(last_sales) >= 3 else lag_1
                
                pred = float(model.predict([[period, lag_1, lag_2, rolling_3]])[0])
                pred = max(0, pred)
                forecasts.append(round(pred, 2))
                last_sales.append(pred)
            
            train_score = round(float(model.score(X, y)), 4)
            
            return {
                "forecast": forecasts,
                "periods": periods,
                "r2_score": train_score,
                "historical_mean": round(float(np.mean(y)), 2),
                "forecast_mean": round(float(np.mean(forecasts)), 2),
                "trend": "increasing" if forecasts[-1] > forecasts[0] else "decreasing",
            }
        except Exception as e:
            logger.error(f"Sales prediction error: {e}")
            return {"error": str(e)}

    def detect_anomalies(
        self, data: List[Dict[str, Any]], contamination: float = 0.05
    ) -> Dict[str, Any]:
        """Anomaly detection using Isolation Forest."""
        try:
            from sklearn.ensemble import IsolationForest
            from sklearn.preprocessing import StandardScaler

            df = pd.DataFrame(data)
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            if not numeric_cols:
                return {"error": "No numeric columns"}

            X = df[numeric_cols].fillna(0)
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            iso = IsolationForest(contamination=contamination, random_state=42)
            predictions = iso.fit_predict(X_scaled)
            scores = iso.decision_function(X_scaled)

            anomaly_mask = predictions == -1
            anomaly_indices = [int(i) for i, v in enumerate(anomaly_mask) if v]

            return {
                "total_records": len(df),
                "anomalies_count": int(anomaly_mask.sum()),
                "anomaly_rate": round(float(anomaly_mask.mean()) * 100, 2),
                "anomaly_indices": anomaly_indices[:50],
                "anomaly_scores": [round(float(s), 4) for s in scores[anomaly_mask].tolist()[:50]],
                "threshold": round(float(iso.offset_), 4),
            }
        except Exception as e:
            logger.error(f"Anomaly detection error: {e}")
            return {"error": str(e)}

    def classify_data(
        self,
        train_data: List[Dict[str, Any]],
        target_column: str,
        test_data: List[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Multi-class classification using Random Forest."""
        try:
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.model_selection import train_test_split
            from sklearn.metrics import classification_report, accuracy_score
            from sklearn.preprocessing import LabelEncoder

            df = pd.DataFrame(train_data)
            if target_column not in df.columns:
                return {"error": f"Target column '{target_column}' not found"}

            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            if target_column in numeric_cols:
                numeric_cols.remove(target_column)

            X = df[numeric_cols].fillna(0)
            y = df[target_column]

            # Encode labels
            le = LabelEncoder()
            y_encoded = le.fit_transform(y)

            X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

            clf = RandomForestClassifier(n_estimators=100, random_state=42)
            clf.fit(X_train, y_train)

            y_pred = clf.predict(X_test)
            accuracy = float(accuracy_score(y_test, y_pred))

            # Feature importance
            importance = dict(zip(numeric_cols, clf.feature_importances_.tolist()))
            importance = {k: round(v, 4) for k, v in sorted(importance.items(), key=lambda x: -x[1])[:10]}

            result = {
                "accuracy": round(accuracy, 4),
                "classes": le.classes_.tolist(),
                "feature_importance": importance,
                "n_estimators": 100,
            }

            if test_data:
                test_df = pd.DataFrame(test_data)
                X_new = test_df[numeric_cols].fillna(0)
                preds = clf.predict(X_new)
                result["predictions"] = le.inverse_transform(preds).tolist()
                result["probabilities"] = clf.predict_proba(X_new).max(axis=1).round(4).tolist()

            return result
        except Exception as e:
            logger.error(f"Classification error: {e}")
            return {"error": str(e)}

    def cluster_data(
        self, data: List[Dict[str, Any]], n_clusters: int = 3, method: str = "kmeans"
    ) -> Dict[str, Any]:
        """Clustering with multiple algorithms."""
        try:
            from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
            from sklearn.preprocessing import StandardScaler
            from sklearn.metrics import silhouette_score

            df = pd.DataFrame(data)
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            X = df[numeric_cols].fillna(0)

            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            if method == "kmeans":
                model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
                labels = model.fit_predict(X_scaled)
            elif method == "dbscan":
                model = DBSCAN(eps=0.5, min_samples=5)
                labels = model.fit_predict(X_scaled)
            else:
                model = AgglomerativeClustering(n_clusters=n_clusters)
                labels = model.fit_predict(X_scaled)

            unique_labels = list(set(labels.tolist()))
            if len(unique_labels) > 1:
                sil = float(silhouette_score(X_scaled, labels))
            else:
                sil = 0.0

            return {
                "labels": labels.tolist(),
                "n_clusters_found": len(unique_labels),
                "silhouette_score": round(sil, 4),
                "method": method,
            }
        except Exception as e:
            logger.error(f"Clustering error: {e}")
            return {"error": str(e)}

    def demand_forecast(
        self, dates: List[str], values: List[float], periods: int = 30
    ) -> Dict[str, Any]:
        """Time series demand forecasting."""
        try:
            from sklearn.linear_model import Ridge
            
            n = len(values)
            X = np.array(range(n)).reshape(-1, 1)
            y = np.array(values)
            
            # Polynomial features
            X_poly = np.column_stack([X, X**2, np.sin(X * 2 * np.pi / 12)])
            
            model = Ridge(alpha=1.0)
            model.fit(X_poly, y)
            
            # Forecast
            X_future = np.array(range(n, n + periods)).reshape(-1, 1)
            X_future_poly = np.column_stack([
                X_future, X_future**2,
                np.sin(X_future * 2 * np.pi / 12)
            ])
            forecast = model.predict(X_future_poly)
            forecast = np.maximum(0, forecast)
            
            return {
                "forecast": forecast.round(2).tolist(),
                "periods": periods,
                "r2_score": round(float(model.score(X_poly, y)), 4),
                "trend": float(model.coef_[0]),
            }
        except Exception as e:
            logger.error(f"Demand forecast error: {e}")
            return {"error": str(e)}


# Singleton
ml_service = MLService()
