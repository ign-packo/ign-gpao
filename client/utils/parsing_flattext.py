import sys
import re
import json

# import pandas as pd
save_rank=0

rx_dict = {
    'PROJECT' :    re.compile(r'\[(P|p)\](?P<p_name>.*),(?P<p_comment>.*)'),
    # 'JOB' :        re.compile(r'\t{1}\[(J|j)\](?P<j_name>.*),(?P<j_command>.*)'),
    # 'DEP_JOB':     re.compile(r'\t{2}\[(DJ|dj)\](?P<j_name>.*)'),
    # 'DEP_PROJECT': re.compile(r'\t{1}\[(DP|dp)\](?P<p_name>.*)')
    'JOB' :        re.compile(r'\t?\[(J|j)\](?P<j_name>.*),(?P<j_command>.*)'),
    'DEP_JOB':     re.compile(r'\t{0,2}\[(DJ|dj)\](?P<j_name>.*)'),
    'DEP_PROJECT': re.compile(r'\t?\[(DP|dp)\](?P<p_name>.*)')
    }

def print_JSON(data_dict):
    print(json.dumps(data_dict,indent=2))


def print_TEXT(data_dict):
    i=1 
    for key, value in data.items():
        print(f"--({i}) {key} -- {value}\n")
        i+=1


def write_TEXT(file_out, data_dict):
    print(f"--> write_TEXT")

    
def write_JSON(key, match):
    if key=='PROJECT' :
        name = match.group('p_name')
        comm = match.group('p_comment')
        print(f" project name:{name} comment:{comm}")

    if key=='JOB' :
        name = match.group('j_name')
        cmd = match.group('j_command')
        print(f" job name:{name} comment:{cmd}")

    if key=='DEP_JOB' :
        name = match.group('j_name')
        print(f" dep job name:{name}")

    if key=='DEP_PROJECT' :
        name = match.group('p_name')
        print(f" dep project name:{name}")


def parse_line(line):
    for key, rx in rx_dict.items():
        match = rx.search(line)
        if match:
            return key, match
    return None, None

def get_last_key(data_dict): return list(data_dict)[-1]
def get_first_key(data_dict):return list(data_dict)[0]
def get_lenght(data_dict):return len(data_dict)
def get_last_index (data_dict):return len(data_dict)-1


def read_next(key, match, file_object, data):
    #print('--> in read_next')
    global parent
    if key=='PROJECT':
        data[match.group('p_name')] = {"COM": (match.group('p_comment')), "JOBS":{}, "DEP_PROJECTS":[]}

    elif key=='JOB':
        data[get_last_key(data)]['JOBS'][match.group('j_name')]={"CMD": (match.group('j_command')), "DEP_JOBS":[] }

    elif key == 'DEP_JOB':
        data[get_last_key(data)]['JOBS'][get_last_key(data[get_last_key(data)]['JOBS'])]['DEP_JOBS'].append(match.group('j_name'))

    elif key == 'DEP_PROJECT':
        data[get_last_key(data)]['DEP_PROJECTS'].append(match.group('p_name'))
              
    line = file_object.readline()
    key, match = parse_line(line)
    print(f"key:[{key}] match:[{match}]")

    if key != None: read_next(key, match, file_object, data)
    #print('--> out read_next') 

def parse_file(filepath):
    save_rank = 0
    data={"PROJECTS":{}} 
    with open(filepath, 'r') as file_object:
        dict_data=data['PROJECTS']
        line = file_object.readline()
        key, match = parse_line(line)    
        read_next(key, match, file_object, dict_data)
        
        # i=1 
        # for key, value in data.items():
        #     print(f"--({i}) {key} -- {value}\n")
        #     i+=1
        print_JSON(dict_data)

if __name__ == '__main__':

    if len(sys.argv) == 1:
        print(f"Usage: python parsing_flat_project.py inputfile.flat")
        sys.exit(1)

    filepath = sys.argv[1]

    parse_file(filepath)
           
