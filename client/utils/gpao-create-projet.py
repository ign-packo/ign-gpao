
class projects:
	def __init__(self, dict_project):
		self.dict_project=dict_project

class project:
	def __init__(self, name, ident):
		self.name = name
		self.ident = ident

class projectsdependencies:
	def __init__(self, name, ident):
		self.name = name
		self.ident = ident

class jobs:
	def __init__(self, sons):
		self.sons = sons


class job:
	def __init__(self, name, ident, cmd):
		self.name = name
		self.ident = ident
		self.cmd = cmd

	def initSchema(self, id, name, start_date, start_end, command, status, return_code, log, id_project, id_session):
		self.schema["id"]=id
		self.schema["name"]=name
		self.schema["start_date"]=start_date
		self.schema["start_end"]=start_end
		self.schema["command"]=command
		self.schema["status"]=status
		self.schema["return_code"]=return_code
		self.schema["log"]=log
		self.schema["id_project"]=id_project
		self.schema["id_session"]=id_session

	def autoInitSchema(self):
		self.schema["id"]=self.id
		self.schema["name"]=self.name
		self.schema["start_date"]=self.start_date
		self.schema["start_end"]=self.start_end
		self.schema["command"]=self.command
		self.schema["status"]=self.status
		self.schema["return_code"]=self.return_code
		self.schema["log"]=self.log
		self.schema["id_project"]=self.id_project


class jobsdependencies:
	def __init__(self, name, ident):
		self.name = name
		self.ident = ident

class jsonWriter:
	def __init__(self, fileOut):
		self.fileOut = fileOut

	def writeElt(self, keyElt):
		self.elt = keyElt


class jsonLoader:
	def __init__(self, fileRead):
		self.fileRead = fileRead

class schemaJson:
	def __init__(self, schema):
		self.schema = schema

j1 = job("job1", 1, "echo \"job1\"")
j2 = job("job2", 2, "echo \"job2\"")
j3 = job("job3", 3, "echo \"job2\"")
j4 = job("job4", 4, "echo \"job2\"")

dictionary_jobs={}
dictionary_jobs[j1.name] = j2.ident
dictionary_jobs[j2.name] = j2.ident
dictionary_jobs[j3.name] = j3.ident
dictionary_jobs[j4.name] = j4.ident

print (dictionary_jobs)
