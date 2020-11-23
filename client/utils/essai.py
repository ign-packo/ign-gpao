import sys
import re
import json
import numpy as np
import pandas as pan



if __name__ == '__main__':
	#ar = np.array([[1.1, 2, 3.3, 4], [2.7, 10, 5.4, 7], [5.3, 9, 1.5, 15]])
	#df = pan.DataFrame(ar, index = ['a1', 'a2', 'a3'], columns = ['A', 'B', 'C', 'D'])
	i=0
	l={'JOBS':{}}
	df = pan.DataFrame({'JOBS':{}})
	#df = df.astype({"JOBS": int})

	while i < 10:
		j_i='jobs'+str(i)
		print(i)
		df.loc[j_i, 'JOBS'] = i
		# df = pan.DataFrame(l.append(i), index = [ind])
		# print(f"{j_i}")
		i+=1


 
	print(f"{df}")
	print(int(df['JOBS']['jobs5']))
