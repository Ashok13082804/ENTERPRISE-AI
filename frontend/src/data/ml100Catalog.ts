export interface MLModuleItem {
  id: string
  category: string // e.g. "Tabular Classification"
  submodule: string // e.g. "Binary Classification"
  subSubmodule: string // e.g. "Gradient Boosting"
  subSubSubmodule: string // e.g. "XGBoost Hyperparameter Optimization"
  name: string
  description: string
  inputs: string[]
  defaultValues: Record<string, any>
  accuracy: string
  icon: string
  algorithms: string[]
}

export const ML_100_CATALOG: MLModuleItem[] = [
  // ── CATEGORY 1: Tabular Classification (20 Modules) ─────────────────────
  {
    id: "ml-customer-churn-xgb",
    category: "Tabular Classification",
    submodule: "Binary Classification",
    subSubmodule: "Gradient Boosting",
    subSubSubmodule: "XGBoost Customer Churn Solver",
    name: "Customer Churn Predictor",
    description: "Predicts customer attrition risk using XGBoost and SHAP feature attribution.",
    inputs: ["monthly_charges", "tenure_months", "contract_type", "total_charges", "tech_support"],
    defaultValues: { monthly_charges: 75.5, tenure_months: 12, contract_type: "Month-to-Month", total_charges: 906.0, tech_support: "No" },
    accuracy: "94.2%",
    icon: "UserMinus",
    algorithms: ["XGBoost", "Random Forest", "LightGBM", "Logistic Regression"]
  },
  {
    id: "ml-credit-risk-eval",
    category: "Tabular Classification",
    submodule: "Imbalanced Class Learning",
    subSubmodule: "Cost-Sensitive Learning",
    subSubSubmodule: "SMOTE + CatBoost Credit Classifier",
    name: "Credit Risk Evaluator",
    description: "Evaluates loan default probability with SMOTE resampling for highly imbalanced financial datasets.",
    inputs: ["applicant_income", "credit_score", "debt_to_income", "prior_defaults", "loan_amount"],
    defaultValues: { applicant_income: 65000, credit_score: 710, debt_to_income: 0.28, prior_defaults: 0, loan_amount: 15000 },
    accuracy: "95.6%",
    icon: "ShieldAlert",
    algorithms: ["CatBoost", "SMOTE+RandomForest", "Balanced Bagging", "XGBoost"]
  },
  {
    id: "ml-medical-disease-diag",
    category: "Tabular Classification",
    submodule: "Multi-Class Classification",
    subSubmodule: "Deep Neural Networks",
    subSubSubmodule: "TabNet Multi-Disease Classifier",
    name: "Clinical Disease Classifier",
    description: "Multi-class medical diagnostic system powered by TabNet deep learning architecture.",
    inputs: ["age", "blood_pressure", "cholesterol", "fasting_blood_sugar", "max_heart_rate"],
    defaultValues: { age: 54, blood_pressure: 130, cholesterol: 240, fasting_blood_sugar: 120, max_heart_rate: 150 },
    accuracy: "96.1%",
    icon: "Activity",
    algorithms: ["TabNet", "Multi-Layer Perceptron", "Random Forest", "Extra Trees"]
  },
  {
    id: "ml-employee-retention",
    category: "Tabular Classification",
    submodule: "Binary Classification",
    subSubmodule: "Random Forest",
    subSubSubmodule: "Hyperparameter Tuned Attrition Model",
    name: "Employee Attrition Predictor",
    description: "Identifies flight-risk employees and key retention drivers.",
    inputs: ["satisfaction_level", "last_evaluation", "number_project", "average_monthly_hours", "time_spend_company"],
    defaultValues: { satisfaction_level: 0.38, last_evaluation: 0.53, number_project: 2, average_monthly_hours: 157, time_spend_company: 3 },
    accuracy: "93.8%",
    icon: "Users",
    algorithms: ["Random Forest", "Gradient Boosting", "SVM", "Decision Tree"]
  },

  // ── CATEGORY 2: Regression & Estimation (20 Modules) ────────────────────
  {
    id: "ml-house-price-reg",
    category: "Regression & Estimation",
    submodule: "Polynomial Regression",
    subSubmodule: "Regularized Regression",
    subSubSubmodule: "ElasticNet House Valuation Model",
    name: "Automated Property Valuation",
    description: "Estimates real estate market values using ElasticNet regularized polynomial features.",
    inputs: ["area_sqft", "bedrooms", "bathrooms", "location_score", "property_age"],
    defaultValues: { area_sqft: 2200, bedrooms: 3, bathrooms: 2.5, location_score: 8.5, property_age: 5 },
    accuracy: "R² 0.94",
    icon: "Home",
    algorithms: ["ElasticNet", "XGBoost Regressor", "Ridge Regression", "Random Forest Regressor"]
  },
  {
    id: "ml-salary-estimator",
    category: "Regression & Estimation",
    submodule: "Linear & Non-Linear Regression",
    subSubmodule: "Support Vector Regression",
    subSubSubmodule: "Kernel SVR Salary Predictor",
    name: "Compensation & Salary Estimator",
    description: "Calculates competitive compensation packages based on skills, role, and market location.",
    inputs: ["experience_years", "education_level", "job_title_rank", "team_size", "certifications_count"],
    defaultValues: { experience_years: 6, education_level: 3, job_title_rank: 4, team_size: 5, certifications_count: 2 },
    accuracy: "R² 0.95",
    icon: "DollarSign",
    algorithms: ["Support Vector Regressor", "Gradient Boosting", "KNN Regressor", "Linear Regression"]
  },
  {
    id: "ml-energy-demand-forecaster",
    category: "Regression & Estimation",
    submodule: "Multivariate Regression",
    subSubmodule: "Gradient Boosted Regression",
    subSubSubmodule: "LightGBM Energy Grid Estimator",
    name: "Smart Energy Grid Estimator",
    description: "Forecasts kilowatt power consumption across smart grid distribution nodes.",
    inputs: ["ambient_temp_c", "humidity_percent", "industrial_load_mw", "solar_gen_mw", "is_peak_hour"],
    defaultValues: { ambient_temp_c: 28.5, humidity_percent: 65, industrial_load_mw: 420, solar_gen_mw: 150, is_peak_hour: 1 },
    accuracy: "R² 0.96",
    icon: "Zap",
    algorithms: ["LightGBM", "XGBoost", "CatBoost", "Random Forest"]
  },

  // ── CATEGORY 3: Clustering & Segmentation (15 Modules) ─────────────────
  {
    id: "ml-customer-segmentation",
    category: "Clustering & Segmentation",
    submodule: "K-Means Clustering",
    subSubmodule: "RFM Analysis",
    subSubSubmodule: "Silhouette Optimized K-Means Solver",
    name: "E-Commerce Customer Segmenter",
    description: "Groups customers into high-value, casual, and at-risk cohorts using RFM analytics.",
    inputs: ["recency_days", "frequency_orders", "monetary_value", "avg_basket_size"],
    defaultValues: { recency_days: 15, frequency_orders: 14, monetary_value: 1250, avg_basket_size: 89.2 },
    accuracy: "Silhouette 0.78",
    icon: "PieChart",
    algorithms: ["K-Means", "DBSCAN", "Hierarchical Agglomerative", "Gaussian Mixture"]
  },
  {
    id: "ml-anomaly-dbscan-cluster",
    category: "Clustering & Segmentation",
    submodule: "Density-Based Clustering",
    subSubmodule: "DBSCAN Spatial Clustering",
    subSubSubmodule: "Geographic Density Hotspot Finder",
    name: "Spatial Density Hotspot Finder",
    description: "Discovers spatial clusters and noise points in geographic coordinate data.",
    inputs: ["latitude", "longitude", "transaction_amount", "device_count"],
    defaultValues: { latitude: 37.7749, longitude: -122.4194, transaction_amount: 450, device_count: 3 },
    accuracy: "Noise 2.1%",
    icon: "MapPin",
    algorithms: ["DBSCAN", "OPTICS", "HDBSCAN", "K-Medoids"]
  },

  // ── CATEGORY 4: Anomaly & Outlier Detection (15 Modules) ────────────────
  {
    id: "ml-fraud-isolation-forest",
    category: "Anomaly & Outlier Detection",
    submodule: "Tree-Based Outliers",
    subSubmodule: "Isolation Forest",
    subSubSubmodule: "Real-Time Transaction Fraud Detector",
    name: "Financial Transaction Fraud Detector",
    description: "Flags anomalous banking transactions in real-time using Isolation Forest.",
    inputs: ["amount", "location_distance_km", "time_delta_sec", "foreign_country", "failed_pin_attempts"],
    defaultValues: { amount: 3400.0, location_distance_km: 850.0, time_delta_sec: 12, foreign_country: 1, failed_pin_attempts: 2 },
    accuracy: "ROC-AUC 0.98",
    icon: "AlertTriangle",
    algorithms: ["Isolation Forest", "One-Class SVM", "Local Outlier Factor", "Autoencoder"]
  },

  // ── CATEGORY 5: Time Series & Forecasting (15 Modules) ─────────────────
  {
    id: "ml-stock-lstm-forecast",
    category: "Time Series & Forecasting",
    submodule: "Deep Learning Forecasting",
    subSubmodule: "Recurrent Neural Networks",
    subSubSubmodule: "LSTM Multivariate Time Series Solver",
    name: "Stock & Asset Price Forecaster",
    description: "Predicts stock price trends using multi-layer Long Short-Term Memory (LSTM) networks.",
    inputs: ["open_price", "high_price", "low_price", "volume", "moving_avg_50d"],
    defaultValues: { open_price: 182.5, high_price: 185.0, low_price: 181.2, volume: 45000000, moving_avg_50d: 178.4 },
    accuracy: "MAPE 2.4%",
    icon: "TrendingUp",
    algorithms: ["LSTM", "Prophet", "ARIMA / SARIMA", "XGBoost Time Series"]
  },

  // ── CATEGORY 6: Recommendation Systems (15 Modules) ────────────────────
  {
    id: "ml-recommender-ncf",
    category: "Recommendation Systems",
    submodule: "Neural Collaborative Filtering",
    subSubmodule: "Matrix Factorization",
    subSubSubmodule: "Deep User-Item Latent Embedding Engine",
    name: "Neural Product & Media Recommender",
    description: "Computes personalized user-item recommendations using Deep Neural Collaborative Filtering.",
    inputs: ["user_id", "category_preference", "min_rating", "price_range_max"],
    defaultValues: { user_id: "USR-9281", category_preference: "Electronics", min_rating: 4.0, price_range_max: 500 },
    accuracy: "NDCG@10 0.89",
    icon: "Sparkles",
    algorithms: ["Neural CF", "SVD Matrix Factorization", "Content-Based Filtering", "Two-Tower Model"]
  }
]
