import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression as Lin_Reg
from sklearn.linear_model import Ridge as Ridge_Reg
from sklearn.linear_model import Lasso as Lasso_Reg
from sklearn.cross_validation import train_test_split as sk_split
from sklearn.neighbors import KNeighborsRegressor as KNN
import sklearn as sk
from statsmodels.regression.linear_model import OLS
import sklearn.preprocessing as Preprocessing
import itertools as it
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.cm as cmx
import matplotlib.colors as colors
import scipy as sp
import numbers
import decimal
from itertools import combinations
from bs4 import BeautifulSoup
import urllib2
import unirest
from scipy.spatial.distance import cosine
%matplotlib inline




def find_suggestions(user_vec):

    similarity_mat = pd.read_csx("datasets/similarity_mat.txt");

    index_games = similarity_mat.index

    user_suggestions = pd.DataFrame(index=index_games,columns=['similarity'])
    user_suggestions.ix[:,'similarity'] = 0

    temp_df = pd.DataFrame(index=index_games) 
    rated_games = []

    user_vector = pd.Dataframe(index=index_games,columns=['rating'])
    user_vector.ix[:,'rating'] = 0
    for i in range(len(user_vec)):
        game = user_vec[i][0]
        rating = user_vec[i][1]
        user_vector.ix[game,'rating'] = rating

    for game in user_vector.ix[:,0]:
        if user_vector.get_value(game,'rating') > 0:
            rated_games.append(game)
            temp_vec = pd.DataFrame(index=index_games,columns=[game])
            # final_mat is what is called "similarity_mat" that i printed to csv below
            temp_vec = (float(user_vector.get_value(game,'rating'))/10)*final_mat.ix[:,game]
            parts = [temp_df,temp_vec]
            temp_df = pd.concat(parts,axis=1)

    for game in user_suggestions.index:
        user_suggestions.ix[game,'similarity'] = sum(temp_df.ix[game,:])
        if game in rated_games:
            user_suggestions.ix[game,'similarity'] = 0 

    user_suggest_names = user_suggestions.ix[:,'similarity'].sort_values(ascending=False)[0:10].index
    return user_suggest_names