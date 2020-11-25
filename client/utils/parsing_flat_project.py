import sys
import os
import unittest
import re
import json
import pandas as pan


save_rank=0

left_bracket='['
right_bracket=']'
left_brace='{'
right_brace='}'
double_quotes='"'
tab='\t'
colon=':'
comma=','

kw_name="name"
return_code=0
errFile=None



rx_dict = {
    'PROJECT' :    re.compile(r'\[(P|p)\](?P<p_name>.*),(?P<p_comment>.*)'),
    # 'JOB' :        re.compile(r'\t{1}\[(J|j)\](?P<j_name>.*),(?P<j_command>.*)'),
    # 'DEP_JOB':     re.compile(r'\t{2}\[(DJ|dj)\](?P<j_name>.*)'),
    # 'DEP_PROJECT': re.compile(r'\t{1}\[(DP|dp)\](?P<p_name>.*)')
    'JOB' :        re.compile(r'\t?\[(J|j)\](?P<j_name>.*),(?P<j_command>.*)'),
    'DEP_JOB':     re.compile(r'\t{0,2}\[(DJ|dj)\](?P<j_name>.*)'),
    'DEP_PROJECT': re.compile(r'\t?\[(DP|dp)\](?P<p_name>.*)')
    }

def generate_empty_project():
    print(f"[P]FIRST_PROJECT_NAME, A simple project")
    print(f"\t[J]JOB_1,echo \"this is job named JOB_1\"")
    print(f"\t[J]JOB_2,echo \"this is job named JOB_2\"")
    print(f"\t\t[DJ]JOB_1")
    print(f"[P]SECOND_PROJECT_NAME, An over simple project")
    print(f"\t[J]JOB_20,echo \"this is job named JOB_20\"")
    print(f"\t\t[DJ]JOB_23")
    print(f"\t[J]JOB_21,echo \"this is job named JOB_21\"")
    print(f"\t[J]JOB_22,echo \"this is job named JOB_22\"")
    print(f"\t\t[DJ]JOB_20")
    print(f"\t\t[DJ]JOB_21")
    print(f"\t[J]JOB_23,echo \"this is job named JOB_23\"")
    print(f"\t[DP]FIRST_PROJECT_NAME")


def print_JSON(data_dict):
    print(json.dumps(data_dict,indent=2))

def print_format():
    print(f"[P]<Name of project>,<Comment about this current project.> ")
    print(f"\t[J]<Name of first job>,<Command,script,program associated with this first job (ex: dir c:).>")
    print(f"\t[J]<Name of second job>,<Command,script,program associated with this second job (ex: cd d:).>")
    print(f"\t\t[DJ]<Name of the job on which the current job depends.>")
    print(f"[P]<Name of project>,<Comment about this current project.> ")
    print(f"\t[J]<Name of first job>,<Command,script,program associated with this job (ex: dir c:).>")
    print(f"\t[J]<Name of second job>,<Command,script,program associated with this second job (ex: cd d:).>")
    print(f"\t\t[DJ]<Name of the job on which the current job depends.>")
    print(f"\t[J]<Name of third job>,<Command,script,program associated with this third job (ex: ogr2ogr -p EPSG:4128 mydata).>")
    print(f"\t[DP]<Name of the project on which the current project depends.>")

def print_help():
    print(f"-----------------------------------------------------------------------------")
    print(f"Usage: python parsing_flat_project.py format|generate|print|my_project.flat my_project.json")
    print(f"-----------------------------------------------------------------------------")
    print(f"\tTranslates a project flat file into project JSON file usable by GPAO V2.0.")
    print(f"\tformat        : Print help about flat format syntax.")
    print(f"\tgenerate      : Print on screen a simple project in flat format.")
    print(f"\tprint         : Print on screen result of translate (output file is ignore).")
    print(f"\tinputfile.flat: Translates a project \"my_project.flat\" \n\t\t\tinto \"my_project.json\".")
    print(f"-----------------------------------------------------------------------------")


def check_idName(data):
    global return_code
    # print(f"{json.dumps(data, indent=2)}")

    projects_dict={}   
    index_project=0
    #Init dict with project id and rank {key=id_project, value=rank}
    for key_project in data.keys():
        projects_dict[key_project]=index_project
        index_project+=1

    for key_project in data.keys():

        jobs_dict={}
        index_job=0
        #Init dict with job id and rank {key=id_job, value=rank}
        for key_job in data[key_project]['JOBS'].keys():
            jobs_dict[key_job]=index_job
            index_job+=1

        for key_job in data[key_project]['JOBS'].keys():
            index_depjob=0
            for dep_job in data[key_project]['JOBS'][key_job]['DEP_JOBS']:
                try:
                    #Exit? test by jobs_dict[dep_job['id_job']]
                    #If NOT Exit replace id_name by rank else exception
                    data[key_project]['JOBS'][key_job]['DEP_JOBS'][index_depjob]['id_job']=jobs_dict[dep_job['id_job']]
                    
                except KeyError as e:
                    errFile.write(f"DEPENDENCY ERROR (line:{dep_job['NUMLINE']}): jobs \"{dep_job['id_job']}\" doesn't exist\n")                  
                    return_code=1

                index_depjob+=1
        
        index_depproject=0   
        for dep_project in data[key_project]['DEP_PROJECTS']:
            #print(f"{dep_project}")
            try:
                #Exit? test by jobs_dict[dep_job['id_job']]
                #If NOT Exit replace id_name by rank else exception
                data[key_project]['DEP_PROJECTS'][index_depproject]['id_project']=projects_dict[dep_project['id_project']]
            except KeyError as e:
                    errFile.write(f"DEPENDENCY ERROR (line:{dep_project['NUMLINE']}): project \"{dep_project['id_project']}\" doesn't exist\n")
                    return_code=1

            index_depproject+=1   
        
    #print(f"---{projects_dict}")
    #print(f"---{jobs_dict}")

    #print(f"{json.dumps(data, indent=2)}") 

    return 
    
def switch_idName_id(data_f, data_dict):
    for v in data_dict:
        if 'deps' in v.keys():
            l=len(v['deps'])
            i=0
            while i < l:
                try:
                    v['deps'][i]['id']=int(data_f['C_TARGET'][v['deps'][i]['id']])
                except KeyError as e:
                    print(f"**** WARNING: la clef : {v['deps'][i]['id']} N'EXISTE PAS")
                    global return_code
                    return_code=1
                    #exit(1)
                i+=1


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


def write_Elt_JSON(key, data):
	if key == 'PROJECTS':
		for key, values in data['PROJECTS'].items():
			print(f"{double_quotes}{kw_name}{double_quotes}{colon}{double_quotes}{key}{double_quotes}")
	elif key == 'JOBS':
		prinf(f"{key}")
	elif key == 'DEP_JOB':
		prinf(f"{key}")
	elif key == 'DEP_POJECT':
		prinf(f"{key}")
	
def parse_line(line):
    p=re.compile(r'(\  {2,})')
    line=p.sub(' ', line)
    p=re.compile(r',\ ')
    line=p.sub(',', line)
    for key, rx in rx_dict.items():
        match = rx.search(line)
        if match:
            return key, match
    return None, None

def get_last_key(data_dict): return list(data_dict)[-1]
def get_first_key(data_dict):return list(data_dict)[0]
def get_lenght(data_dict):return len(data_dict)
def get_last_index (data_dict):return len(data_dict)-1


def read_next(numline, file_object, data):
    global return_code
    #line = "\n"
    line = file_object.readline()

    while line.isspace(): 
        line = file_object.readline()
        numline+=1

    key, match = parse_line(line)

    if key=='PROJECT':
        if match.group('p_name') in data :
            errFile.write(f"PROJECT ERROR, DUPLICATE NAME(line:{numline}): project \"{match.group('p_name')}\" already exist\n")
            return_code=1
        else:
            data[match.group('p_name')] = {"COM": (match.group('p_comment')), "JOBS":{}, "DEP_PROJECTS":[], "NUMLINE":numline}

    elif key=='JOB':
        if match.group('j_name') in data[get_last_key(data)]['JOBS'] :
            errFile.write(f"JOB ERROR, DUPLICATE NAME(line:{numline}): job \"{match.group('j_name')}\" already exist\n")
            return_code=1
        else:
            data[get_last_key(data)]['JOBS'][match.group('j_name')]={"CMD": (match.group('j_command')), "DEP_JOBS":[], "NUMLINE":numline }

    elif key == 'DEP_JOB':
        data[get_last_key(data)]['JOBS'][get_last_key(data[get_last_key(data)]['JOBS'])]['DEP_JOBS'].append({ "id_job":match.group('j_name'), "NUMLINE":numline})
        #data[get_last_key(data)]['JOBS'][get_last_key(data[get_last_key(data)]['JOBS'])]['DEP_JOBS'].append(numline)

    elif key == 'DEP_PROJECT':
        #data[get_last_key(data)]['DEP_PROJECTS'].append(match.group('p_name'))
        data[get_last_key(data)]['DEP_PROJECTS'].append({"id_project":match.group('p_name'), "NUMLINE":numline})
    
    numline+=1
    if key != None: read_next(numline, file_object, data)
    #print('--> out read_next') 


def write_JSON4GPAO(data, data_json):
    data_json['PROJECTS']=[]

    df_p=pan.DataFrame({'C_TARGET':{}})
    i_p=0

    for key_project, values in data['PROJECTS'].items():
        dict_project={}
        dict_project['name']=key_project

        df_p.loc[key_project,'C_TARGET']=i_p
        i_p+=1

        dict_project['jobs']=[]

        df_j=pan.DataFrame({'C_TARGET':{}})
        i_j=0
        for key_job in data['PROJECTS'][key_project]['JOBS'].keys():
            dict_job={}
            dict_job['name']=key_job
            dict_job['command']=data['PROJECTS'][key_project]['JOBS'][key_job]['CMD']

            df_j.loc[key_job,'C_TARGET']=i_j
            i_j+=1

            len_dep_jobs=len(data['PROJECTS'][key_project]['JOBS'][key_job]['DEP_JOBS'])
            if len_dep_jobs > 0:
                dict_job['deps']=[]
                i=0
                while i < len_dep_jobs:
                    dict_dep_job={}
                    dict_dep_job['id']=data['PROJECTS'][key_project]['JOBS'][key_job]['DEP_JOBS'][i]['id_job']
                    dict_job['deps'].append(dict_dep_job)
                    i+=1

            dict_project['jobs'].append(dict_job)

        #switch_idName_id(df_j, dict_project['jobs'])
        # End for key_job in.....

        len_dep_projects=len(data['PROJECTS'][key_project]['DEP_PROJECTS'])
        if len_dep_projects > 0:
            dict_project['deps']=[]
            i=0
            while i < len_dep_projects:
                dict_dep_project={}
                dict_dep_project['id']=data['PROJECTS'][key_project]['DEP_PROJECTS'][i]['id_project']
                dict_project['deps'].append(dict_dep_project)
                i+=1

        data_json['PROJECTS'].append(dict_project)
    # end for key_project.......
    #switch_idName_id(df_p, data_json['PROJECTS'])
    return data_json
    
        
		
def parse_flat_file(infile):
    data={"PROJECTS":{}} 
    numline=1
    with open(infile, 'r') as file_object:
        projects_dict=data['PROJECTS']    
        read_next(numline, file_object, projects_dict)
    
    check_idName(projects_dict)

    # print(f"{json.dumps(projects_dict, indent=2)}")
    # exit (1)

    if return_code==0:
        data_json = {"PROJECTS":[]} 
        data_json = write_JSON4GPAO(data, data_json)
        return data_json
    else :
        return None
    
       
def parse_json_file(infile):
    print(f'function not implented yet.......')
    return None

def parse_file(infile):
    a_infile=infile.split('.')
    errFileName=a_infile[0]+".err"
    if os.path.exists(errFileName):
        os.remove(errFileName)
    global errFile
    errFile = open(errFileName, "x")

    if a_infile[1]=="flat" :
        dj=parse_flat_file(in_filepath)
    elif a_infile[1]=="json":
        dj=parse_json_file(in_filepath)
    else:
        dj=None 
        print(f"WARNING: [{a_infile[1]}] unprocessed file type")
        exit(1)

    return dj

if __name__ == '__main__':

    if len(sys.argv) == 1:
        print_help()
    elif sys.argv[1]=='format':
        print_format()
    elif sys.argv[1]=='generate':
        generate_empty_project()
    elif sys.argv[1]=='print':
        in_filepath = sys.argv[2]
        dj=parse_file(in_filepath)

        if dj!=None:
            mstr=json.dumps(dj, indent=2)
            print(f"{mstr}")
    else:
        in_filepath = sys.argv[1]
        dj=parse_file(in_filepath)

        if dj != None:
            out_filepath = sys.argv[2]
            with open(out_filepath, 'w') as outfile:
                json.dump(dj, outfile, indent=2)

     
    if return_code !=0:
        print(f"ENDED WITH ERROR(s) see output file errors !!!!")
    else :
        print(f"ENDED WITH NO ERROR")   
