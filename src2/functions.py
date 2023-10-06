import os
from datetime import timedelta
from datetime import datetime
import xmltodict
import xml.etree.ElementTree as ET

from config import *


def merge_by_timestamp(arr):
    print('merge by timestamp')
    merged_data = {}

    # Loop over each dictionary in the list
    for item in arr:
        timestamp = item['timestamp']

        # If the timestamp doesn't exist in merged_data, create a new dictionary with the timestamp
        if timestamp not in merged_data:
            merged_data[timestamp] = {'timestamp': timestamp}

        # If the item has a valueEinspesung, add or overwrite it in the merged_data
        if 'valueEinspesung' in item:
            if 'valueEinspesung' not in merged_data[timestamp] or item['valueEinspesung'] > merged_data[timestamp]['valueEinspesung']:
                merged_data[timestamp]['valueEinspesung'] = item['valueEinspesung']

        # If the item has a valueBezug, add or overwrite it in the merged_data
        if 'valueBezug' in item:
            if 'valueBezug' not in merged_data[timestamp] or item['valueBezug'] > merged_data[timestamp]['valueBezug']:
                merged_data[timestamp]['valueBezug'] = item['valueBezug']

    # Convert the merged data dictionary back into a list
    return list(merged_data.values())


def sort_by_timestamp(arr):
    print('sort by timestamp')
    return sorted(arr, key=lambda x: x['timestamp'])


def remove_redundant(data):
    print('remove redundant data')
    seen = set()
    result = []

    for entry in data:
        if entry['timestamp'] not in seen:
            seen.add(entry['timestamp'])
            result.append(entry)

    return result


def cumulative_sum(sdat, esl):
    # Timestamp-Format konvertieren
    format_str = "%Y-%m-%d %H:%M:%S"

    # Erstelle ein Wörterbuch aus der zweiten Liste für einfachen Zugriff
    reset_values = {item['timestamp']: (item['valueBezug'], item['valueEinspesung']) for item in esl}

    new_list = []
    prev_values = (0, 0)

    for item in sdat:
        timestamp = item['timestamp']

        # Wenn das Datum vor dem Startdatum der zweiten Liste liegt, überspringen
        if timestamp < esl[0]['timestamp']:
            continue

        # Wenn ein Resetwert für diesen Timestamp vorhanden ist
        if timestamp in reset_values:
            prev_values = reset_values[timestamp]
            new_list.append({
                "timestamp": timestamp,
                "valueBezug": prev_values[0],
                "valueEinspesung": prev_values[1]
            })
            continue
        try:            
            # Summe von valueBezug und valueEinspesung
            valueBezug = prev_values[0] + float(item['valueBezug'])
            valueEinspesung = prev_values[1] + float(item['valueEinspesung'])

            # Zur Liste hinzufügen
            new_list.append({
                "timestamp": timestamp,
                "valueBezug": valueBezug,
                "valueEinspesung": valueEinspesung
            })

            # Aktualisiere die vorherigen Werte
            prev_values = (valueBezug, valueEinspesung)

        except:
            print('something went wrong')
            
    return new_list


def load_sdat():
    print('loading SDAT files...')
    big_list = []
    # List all files and directories in the specified path
    contents = os.listdir(xml_files)
    for item in contents:
        # read each file
        with open(os.path.join(os.getcwd(), xml_files, item)) as file:
            xml_string = file.read()
            data_dict = xmltodict.parse(xml_string)
            for key in data_dict.keys():
                if key.startswith('rsm:ValidatedMeteredData_'):
                    document_id = data_dict[key]['rsm:ValidatedMeteredData_HeaderInformation']['rsm:InstanceDocument'][
                                      'rsm:DocumentID'][-3:]
                    observation = data_dict[key]['rsm:MeteringData']['rsm:Observation']
                    start_time_document = data_dict[key]['rsm:MeteringData']['rsm:Interval']['rsm:StartDateTime']

                    # formatting
                    document_id = int(document_id)
                    start_time_formatted = datetime.fromisoformat(start_time_document.replace("Z", ""))
                    # print(start_time_formatted)
                    # start_time = start_time_formatted + timedelta(hours=1)
                    # loop through each observation
                    for o in observation:
                        sequence = o['rsm:Position']['rsm:Sequence']
                        volume = o['rsm:Volume']
                        timestamp = start_time_formatted + timedelta(minutes=15 * (int(sequence) - 1))

                        if document_id == 735:  # Einspesung
                            big_list.append({
                                "timestamp": str(timestamp),
                                "valueEinspesung": volume
                            })
                        if document_id == 742:  # Bezug
                            big_list.append({
                                "timestamp": str(timestamp),
                                "valueBezug": volume
                            })
                    break

    # print('finished loading SDAT files')
    big_list = merge_by_timestamp(big_list)
    big_list = sort_by_timestamp(big_list)
    return big_list


def load_esl():
    print('loading ESL files...')
    big_list = []
    # List all files and directories in the specified path
    contents = os.listdir(esl_files)
    for item in contents:
        # read each file
        with open(os.path.join(os.getcwd(), esl_files, item)) as file:
            xml_string = file.read()
            # Parse the XML string
            root = ET.fromstring(xml_string)

            for time_period in root.findall(".//TimePeriod"):
                timestamp = time_period.get("end")
                timestamp = datetime.fromisoformat(timestamp)
                # print(timestamp)
                valueBezug = next(
                    (row.get("value") for row in time_period.findall(".//ValueRow") if row.get("obis") == "1-1:1.8.1"),
                    None)
                valueBezugNieder = next(
                    (row.get("value") for row in time_period.findall(".//ValueRow") if row.get("obis") == "1-1:1.8.2"),
                    None)
                valueEinspesung = next(
                    (row.get("value") for row in time_period.findall(".//ValueRow") if row.get("obis") == "1-1:2.8.1"),
                    None)
                valueEinspesungNieder = next(
                    (row.get("value") for row in time_period.findall(".//ValueRow") if row.get("obis") == "1-1:2.8.2"),
                    None)

                if not isinstance(valueEinspesung, str):
                    valueEinspesung = 0

                if not isinstance(valueBezug, str):
                    valueBezug = 0

                if not isinstance(valueEinspesungNieder, str):
                    valueEinspesungNieder = 0

                if not isinstance(valueBezugNieder, str):
                    valueBezugNieder = 0
                # deal with it

                big_list.append({
                    "timestamp": str(timestamp),
                    "valueBezug": float(valueBezug) + float(valueBezugNieder),
                    "valueEinspesung": float(valueEinspesung) + float(valueEinspesungNieder)
                })

    print('finished loading ESL files')
    big_list = sort_by_timestamp(big_list)
    big_list = remove_redundant(big_list)
    return big_list
