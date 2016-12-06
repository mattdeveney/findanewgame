import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression as Lin_Reg
from sklearn.linear_model import Ridge as Ridge_Reg
from sklearn.linear_model import Lasso as Lasso_Reg
from sklearn.cross_validation import train_test_split as sk_split
from sklearn.neighbors import KNeighborsRegressor as KNN
import sklearn as sk
import sklearn.preprocessing as Preprocessing
import itertools as it
import scipy as sp
import numbers
import decimal
from itertools import combinations
from flask import Flask
from flask import render_template
from flask import request
from flask import url_for
from flask import redirect
import json
import urllib2
import unirest
from scipy.spatial.distance import cosine

application = Flask(__name__)

@application.route('/', methods=['GET','POST'])
def index():
	print 'running'
	return render_template('index.html', title='Home')

@application.route('/suggestions', methods=['POST'])
def suggestions():

	jsonData = request.get_json(force=True)

	ratings = pd.DataFrame(jsonData)

	similarity_mat = pd.read_csv("static/datasets/similarity_mat.txt")

	index_games = similarity_mat.ix[:,0]

	similarity_mat = similarity_mat.ix[:,1:]

	user_suggestions = pd.DataFrame(index=index_games,columns=['similarity'])
	user_suggestions.ix[:,'similarity'] = 0

	temp_df = pd.DataFrame(index=index_games) 
	rated_games = []

	user_vector = pd.DataFrame(index=index_games,columns=['rating'])
	user_vector.ix[:,'rating'] = 0

	for i in range(ratings.shape[0]):
		game = ratings.ix[i,'title']
		rating = ratings.ix[i,'rating']
		user_vector.ix[game,'rating'] = rating

	for game in user_vector.index:
		if user_vector.ix[game,'rating'] > 0:
			rated_games.append(game)
			temp_vec = pd.DataFrame(index=index_games,columns=[game])
			# final_mat is what is called "similarity_mat" that i printed to csv below
			temp_vec.ix[:,game] = (float(user_vector.ix[game,'rating'])/10)*similarity_mat.ix[:,game]
			parts = [temp_df,temp_vec]
			temp_df = pd.concat(parts,axis=1)
			print temp_df

	for game in user_suggestions.index:
		user_suggestions.ix[game,'similarity'] = sum(temp_df.ix[game,:])
		if game in rated_games:
			user_suggestions.ix[game,'similarity'] = 0 

	user_suggest_ind = user_suggestions.ix[:,'similarity'].sort_values(ascending=False)[0:10].index
	return json.dumps(user_suggest_names.tolist())

if __name__ == "__main__":
	application.run(debug=True,use_reloader=False)

