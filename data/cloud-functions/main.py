# Background Cloud Function to be triggered by Pub/Sub.

import json
import requests
from dateutil.parser import parse
import datetime as datetime

# Entrypoint
def check_for_anomalies(event, context):
    print('Inform about anomalies!')

    current_situation = get_current_situation()
    inform_backend(current_situation)

def get_current_situation():
    api = API()
    formula = "PM25"
    todays_measurement = api.get(formula=formula)[0]
    return {
        "source": api.source,
        "sensorId": api.sensor_id,
        "shouldNotify": False,
        "current-situation": {
            "metric": formula,
            "value": todays_measurement.value,
            "level": todays_measurement.evaluate()
        }
    }

def inform_backend(payload):
    try:
        requests.post(
            'https://us-central1-casebuilder-pro-3000.cloudfunctions.net/postEvent',
            json = payload
        )
    except requests.exceptions.RequestException as e:
        print('Something went wrong while informing backend about anomaly: ', e)

class API:
    source = "luchtmeetnet"
    sensor_id = "NL10404"
    url = f"https://api.luchtmeetnet.nl/open_api/measurements"
    
    def get(self, station=None, start=None, end=None, formula=None):
        request_url = self.url
        
        # blegh - query string params
        # TODO something with station
        qsp_to_add = [f"station_number={self.sensor_id}"]
        
        if start and end:
            qsp_to_add.append(f"start={start}")
            qsp_to_add.append(f"end={end}")
        if formula:
            qsp_to_add.append(f"formula={formula}")
            
        if len(qsp_to_add) > 0:
            stuff = "&".join(qsp_to_add)
            request_url += f"?{stuff}" 
        
        try:
            response = requests.get(request_url) 
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print('Something went wrong while getting data from api: ', e)
            return []
        
        response_json = response.json()
            
        if 'pagination' in response_json:
            current_page = response_json['pagination']['current_page']
            last_page = response_json['pagination']['last_page']
            if current_page != last_page:
                print("TODO - pagination needed")
        
        data = response_json['data']
        measurements = []
        for item in data:
            measurements.append(Measurement(item['formula'], item['value'], item['timestamp_measured']))
        
        return measurements

class Metric:
    metric_types = dict()
    metric_types['NO2'] = {'ub_good': 30, 'ub_med': 80, 'ub_bad': 100}
    metric_types['NO'] = {'ub_good': 30, 'ub_med': 100}
    metric_types['O3'] = {'ub_good': 40, 'ub_med': 180}
    metric_types['PM10'] = {'ub_good': 30, 'ub_med': 70, 'ub_bad': 100}
    metric_types['PM25'] = {'ub_good': 20, 'ub_med': 50, 'ub_bad': 100}

    ub_bad = float('inf') # why not?
    
    def __repr__(self):
        return f"{self.formula}-object"
    
    def __init__(self, formula):    
        self.formula = formula
        
        if self.metric_types[self.formula]['ub_good']:
            self.ub_good = self.metric_types[self.formula]['ub_good']
        if self.metric_types[self.formula]['ub_med']:
            self.ub_med = self.metric_types[self.formula]['ub_med']
        if self.metric_types[self.formula]['ub_bad']:
            self.ub_bad = self.metric_types[self.formula]['ub_bad']
            
    def judgement(self, value):
        if value <= self.ub_good:
            return "GOOD"
        elif value <= self.ub_med:
            return "MEDIOCRE"
        elif value <= self.ub_bad:
            return "BAD"
        else:
            return f"PANIC - {value}"

class Measurement:
    def __repr__(self):
        return f"{self.metric.formula}, {self.value}"
    
    def __init__(self, formula, value, timestamp):
        self.metric = Metric(formula)
        self.value = float(value) # better safe than sorry
        self.timestamp = parse(timestamp)
        
    def evaluate(self):
        judgement = self.metric.judgement(self.value)
        return judgement
    
    def compare(self, other_measurement):
        diff = self.value - other_measurement.value
        return diff