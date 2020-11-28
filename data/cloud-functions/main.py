# Background Cloud Function to be triggered by Pub/Sub.

import json
import requests
from dateutil.parser import parse
from collections import defaultdict
from datetime import datetime, timezone, timedelta

# Entrypoint
def check_for_anomalies(event, context):
    print('Fetch current state and check for anomalies')

    api = API()

    # Get current situation
    current_situation = get_current_situation(api)

    # Send current situation to backend
    send_current_situation(api, current_situation)

    # Check for anamolies
    for formula in current_situation['measurements']:
        evaluated_measurement = current_situation['measurements'][formula]['ONE_DAY']
        if not evaluated_measurement['level'] is "NO_ANOMALY":
            send_anomaly(api, formula, evaluated_measurement, current_situation['timestamp'])

def get_current_situation(api):
    formulas = ['PM10', 'PM25', 'NO2', 'NO', 'O3']
    time_deltas = []
    time_deltas.append(("ONE_HOUR", timedelta(hours=1))) # one hour
    time_deltas.append(("ONE_DAY", timedelta(days=1))) # one day
    time_deltas.append(("ONE_WEEK", timedelta(days=7))) # one day
    time_deltas.append(("ONE_MONTH", timedelta(days=30))) # one day
    time_deltas.append(("ONE_YEAR", timedelta(days=365))) # one day

    data = LuchtmeetnetData(api, formulas)
    return data.get_current_report(time_deltas)

def send_current_situation(api, current_situation):
    payload = {
        "source": api.source,
        "sensorId": api.sensor_id,
        "shouldNotify": False,
        "current_situation": current_situation
    }
    send_to_backend(payload)

def send_anomaly(api, formula, anomaly, timestamp):
    payload = {
        "source": api.source,
        "sensorId": api.sensor_id,
        "shouldNotify": False, # Muted, for now
        "anomaly": {
            "type": anomaly['level'],
            "formula": formula,
            "diff": anomaly['value'],
            "timestamp": timestamp
        }
    }
    send_to_backend(payload)


def send_to_backend(payload):
    print(json.dumps(payload))
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
        qsp_to_add = ["station_number=NL10404"]
        
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
        
        response_data = response_json['data']
                
        return response_data

class LuchtmeetnetData:
    metrics = dict()
    measurements = defaultdict(dict)
    
    def __init__(self, api, formulas):
        self.api = api
        for formula in formulas:
            self.metrics[formula] = Metric(formula)
        self.add(api.get())

    def add(self, data):
        for item in data:
            formula = item['formula']
            value = item['value']
            timestamp = item['timestamp_measured']

            metric = self.metrics[formula]
            
            self.measurements[formula][timestamp] = Measurement(metric, value, timestamp)
    
    def get_timestamp(self, metric, timestamp):
        if timestamp in self.measurements[metric]:
#             print("already there")
            delta_measurement = self.measurements[metric][timestamp]
            return delta_measurement
        else:
#             print("api call")
            new_data = self.api.get(start=timestamp, end=timestamp)

            if len(new_data) > 0:
                self.add(new_data)
                return self.get_timestamp(metric, timestamp)
            return None

    def get_current_report(self, time_deltas):
        the_report = defaultdict()
        timestamp = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0).isoformat()
        the_report['timestamp'] = timestamp
        the_report['measurements'] = defaultdict(dict)
        
        for metric in self.measurements:
            if timestamp in self.measurements[metric]:
                current_measurement = self.measurements[metric][timestamp]
                the_report['measurements'][metric]["NOW"] = {
                    'value': current_measurement.value,
                    'level': current_measurement.evaluate()
                }
                
                for enum, time_delta in time_deltas:
                    result_time = current_measurement.timestamp - time_delta
                    delta_time_string = result_time.isoformat()
                    
                    delta_measurement = self.get_timestamp(metric, delta_time_string)
                    the_report['measurements'][metric][enum] = {
                        'value': current_measurement.compare(delta_measurement),
                        'level': current_measurement.evaluate_change(delta_measurement)
                    }
        
        return the_report

class Metric:
    metric_types = dict()
    metric_types['NO2'] = {'ub_good': 30, 'ub_med': 80, 'ub_bad': 100}
    metric_types['NO'] = {'ub_good': 30, 'ub_med': 100}
    metric_types['O3'] = {'ub_good': 40, 'ub_med': 180}
    metric_types['PM10'] = {'ub_good': 30, 'ub_med': 70, 'ub_bad': 100}
    metric_types['PM25'] = {'ub_good': 20, 'ub_med': 50, 'ub_bad': 100}

    ub_bad = float('inf') # why not?
    
    def __repr__(self):
        return f"{self.formula}"
    
    def __init__(self, formula):    
        self.formula = formula
        metric_info = self.metric_types[self.formula]
        if 'ub_good' in metric_info:
            self.ub_good = metric_info['ub_good']
        if 'ub_med' in metric_info:
            self.ub_med = metric_info['ub_med']
        if 'ub_bad' in metric_info:
            self.ub_bad = metric_info['ub_bad']
            
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
        return f"{self.metric.formula}, {self.value}, {self.timestamp}"
    
    def __init__(self, metric, value, timestamp):
        self.metric = metric
        self.value = float(value) # better safe than sorry
        self.timestamp = parse(timestamp)
        
    def evaluate(self):
        judgement = self.metric.judgement(self.value)
        return judgement
    
    def compare(self, other_measurement):
        diff = self.value - other_measurement.value
        return diff

    def evaluate_change(self, other_measurement):
        diff = self.compare(other_measurement)
        change = diff / self.value
        if change <= -0.5:
            return "ANOMALOUS_DECREASE"
        elif change >= 0.5:
            return "ANOMALOUS_INCREASE"
        else:
            return "NO_ANOMALY"