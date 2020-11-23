import win32com.client as win32          # Module pour client COM
from win32com.client import constants as c
import sys, os  	            # Gestion des fichiers
#import win32gui 	            # MessageBox

#ExcelApp= win32.gencache.EnsureDispatch(Excel.Application)


ExcelApp = win32.DispatchEx("Excel.Application")

ExcelApp.Visible = True

Wb=ExcelApp.Workbooks.Add()
print(Wb.name)
print(type(Wb))

print(type(c.__dicts__.__module__))
#print(len(c.__dicts__))