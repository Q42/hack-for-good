# Cloud functions
Cloud functions, running on Google Cloud Platform. Used to query APIs and run models.

## Deploy
To deploy, run:
- `gcloud functions deploy check-for-anomalies --entry-point check_for_anomalies --runtime python37 --trigger-topic scheduled-anomaly-check --project casebuilder-pro-3000`