# 🔮 FinShield - AI-Powered Credit Risk & Loan Recommendation Engine 📊

**FinShield** is a comprehensive AI tool designed to assist banks and financial institutions in making informed lending decisions. It leverages a multi-model machine learning system to assess an applicant's credit risk, predict their repayment ability, and provide intelligent loan recommendations. This ensures a balanced approach to risk management, helping to maximize approvals for qualified customers while minimizing potential defaults.

***

## ✨ Features

- 🤖 **Multi-Model AI Prediction:** Utilizes a combination of a Random Forest Classifier and Gradient Boosting Regressors to provide a holistic risk assessment.
- 🧠 **Balanced Risk Assessment:** A custom risk calculation methodology ensures a more realistic and fair distribution of risk categories (Low, Medium, High).
- 📈 **Comprehensive Metrics:** Predicts key metrics including **Default Probability**, **Repayment Ability Score**, and **Payment Timeliness Score**.
- 📊 **Dynamic Loan Recommendations:** Generates personalized loan offers with recommended amounts, terms, and interest rates based on the applicant's risk profile.
- 📁 **Batch Processing:** Can process a CSV file of applicants, providing a portfolio-level overview and individual applicant reports.
- 🖼️ **Data Visualization:** Generates a JSON output that includes data for a loan approval funnel and risk distribution charts, ideal for web dashboard integration.

***

## 🛠️ Technical Details

FinShield's core functionality is built on a robust machine learning pipeline. The system processes raw applicant data, engineers new features, and then feeds this information into three distinct models to produce a comprehensive risk profile.

### Model Architecture

The system uses a pipeline-based approach to ensure data consistency and accuracy.

1.  **Feature Preparation:** Raw data (e.g., income, employment history) is enriched with calculated financial ratios (e.g., `debt_to_income_ratio`, `savings_rate`).
2.  **Preprocessing:** Categorical data is encoded using `LabelEncoder`, and all numerical features are standardized using `StandardScaler`.
3.  **Model Predictions:**
    -   **Default Prediction:** A **RandomForestClassifier** determines the probability of a loan default, categorizing the applicant as Low, Medium, or High risk.
    -   **Repayment & Timeliness:** Two **GradientBoostingRegressor** models predict the applicant's likelihood of timely payments and overall repayment ability, providing a score out of 100.
4.  **Loan Recommendation Logic:** A post-processing step uses the model outputs to generate practical loan recommendations, including a max loan amount and suggested interest rate range.

### Model Design Flow
![FinShield Model Design Flowchart](https://i.imgur.com/your-image-id.png)  
*(You can replace the image URL with a link to a diagram of your model's workflow.)*

***

## 🎮 Try It Without an Account

The login screen has a **demo mode** — pick a role and you are straight into the
app, no signup required:

-   **Continue as Customer** — fill in a single application form and get back a
    default probability, repayment ability score, and the loan amount, term and
    interest rate you would qualify for.
-   **Continue as Banker** — upload a batch of applicants (use the
    *Download Template* link on the Analyze page, which ships 12 sample
    applicants spread evenly across all four risk bands) and review the whole
    portfolio at once.

Both roles start with a pre-scored analysis already in their history, so the
dashboard is populated on arrival. Predictions are real output from the model
API. A demo session never touches the accounts database — everything it
produces is stored in the browser and cleared when you exit the demo.

***

## 📂 Repository Layout

The three pieces of the system live in separate directories. Note that the
frontend directory name **contains a space**, so it has to be quoted in shell
commands.

```
RiskAnalyzer/
├── api_endpoint.py          # Flask ML API — serves predictions (port 5000)
├── modelonly.py             # Model training pipeline
├── credit_risk_output/      # Trained model .pkl + aligned datasets
├── Server/                  # Node/Express auth + saved-results API (port 4000)
└── Default Prediction/      # React + Vite frontend (port 5173)
```

***

## 🚀 Quick Start

The frontend is the only piece you need to run to use the app. It is configured
to call the **already-deployed** ML and auth APIs, so a fresh clone works with
just these three commands:

```bash
git clone https://github.com/GlyphCoder/RiskAnalyzer.git
cd RiskAnalyzer/"Default Prediction"
npm install
npm run dev
```

Open **http://localhost:5173**, and on the login screen pick
**Continue as Customer** or **Continue as Banker**. No account or database
needed — see [Try It Without an Account](#-try-it-without-an-account) above.

> **Heads up:** the deployed services are on a free tier that sleeps when idle.
> The first analysis after a quiet period can take up to a minute while the ML
> service wakes up. Later requests are fast.

***

## 🛠️ Running the Backends Locally (Optional)

You only need this if you are changing the model or the auth/results API. See
[Pointing the Frontend at Local Backends](#pointing-the-frontend-at-local-backends)
below — running these alone does **not** make the frontend use them.

### Prerequisites

-   Python 3.8+ and `pip`
-   Node.js 18+
-   MongoDB (only for the Node server — a local instance or an Atlas cluster)

### ML API (Flask)

The trained model is committed at
`credit_risk_output/best_credit_risk_model.pkl`, so there is **no need to
retrain** before serving predictions.

```bash
pip install -r requirements.txt
python api_endpoint.py          # serves on http://localhost:5000
```

Check it came up cleanly — `model_loaded` must be `true`:

```bash
curl http://localhost:5000/api/credit_risk/health
```

Endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/credit_risk/analyze` | Score a batch — send a file as multipart form field `file` |
| `GET` | `/api/credit_risk/model_info` | Feature list and risk labels |
| `GET` | `/api/credit_risk/health` | Liveness + whether the model loaded |

`/analyze` accepts `.csv`, `.xlsx`, `.xls`, `.xlsm`, `.xlsb`, `.ods` and
`.json`, and requires at minimum the columns `age`, `monthly_income_inr` and
`outstanding_loan_amount_inr`. It returns a JSON array with one 56-field record
per applicant. Try it against the bundled sample:

```bash
curl -X POST -F "file=@Default Prediction/public/templates/sample.csv" \
  http://localhost:5000/api/credit_risk/analyze
```

### Auth / Results Server (Node)

Needed only for real accounts and server-saved history. Demo mode never calls
it.

```bash
cd Server
cp .env.example .env    # then fill in MONGODB_URL and JWT_SECRET
npm install
npm start               # serves on http://localhost:4000
```

On success you will see `Server Running on port 4000` followed by
`MongoDB connected successfully`. If instead you get a `querySrv ENOTFOUND`
error, the `MONGODB_URL` in your `.env` points at a cluster that no longer
resolves — create a new one and update the value.

### Retraining the Model

Only needed if you want to rebuild the model from the raw dataset. This
retrains all three models, picks the best, and rewrites `credit_risk_output/`.

```bash
python modelonly.py
```

### Pointing the Frontend at Local Backends

The API base URLs are currently **hardcoded** in the frontend, so local
backends are ignored until you edit them. Replace the
`https://...onrender.com` URLs with your local ones in:

-   `Default Prediction/src/App.jsx` — the ML `/analyze` call plus the three
    results calls
-   `Default Prediction/src/components/Authentication/Login/Login.jsx` — `URL`
-   `Default Prediction/src/components/Authentication/Signup/Signup.jsx` — `URL`

Use `http://localhost:5000` for the ML API and `http://localhost:4000` for the
Node server. The Node server's CORS allowlist in `Server/new.js` already
permits `http://localhost:5173`.

***

## 🩺 Troubleshooting

**`npm error enoent ... could not read package.json`** — you are in the repo
root. There is no root-level Node project; the frontend lives in
`Default Prediction/`. Quote the path: `cd "Default Prediction"`.

**`sh: .../node_modules/.bin/nodemon: Permission denied`** — the installed
dependencies came from a different OS. Reinstall them:

```bash
cd Server && rm -rf node_modules && npm install
```

**`npm install` fails with `ETIMEDOUT`** — npm is opening too many parallel
connections. Retry with fewer:

```bash
npm install --maxsockets=3
```

**An analysis hangs or times out on the first try** — the free-tier ML service
is waking up. Give it a minute and retry.

**Login or signup returns a server error** — the accounts database is
unreachable. Demo mode is unaffected and needs no database.

***

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request