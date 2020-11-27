# Background Cloud Function to be triggered by Pub/Sub.
import requests

# Entrypoint
def check_for_anomalies(event, context):
    print('Inform about anomalies!')
    inform_about_anomaly()

def inform_about_anomaly():
    try:
        requests.post(
            'https://us-central1-casebuilder-pro-3000.cloudfunctions.net/postEvent',
            json = {
                'source': 'hollandse-luchten',
                'sensorId': '99',
                'anomaly': {
                    'type': 'exceeded-static-threshold',
                    'value': 9001
                }
            }
        )
    except requests.exceptions.RequestException as e:
        print('Something went wrong while informing backend about anomaly: ', e)