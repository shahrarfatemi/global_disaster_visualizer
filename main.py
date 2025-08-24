import json
import glob
import sys
import datetime
import numpy as np
import pandas as pd
import pylab as plt
from flask import Flask,render_template
from flask import request, jsonify
from sodapy import Socrata
import math
app = Flask(__name__)



@app.route('/top_countries', methods=['POST'])
def top_countries_detect():

    year = request.json['year'] if 'year' in request.json else None
    print('year in histogram : ', year)
    subtype = request.json['subtype']
    print("subtypeee.......",subtype)
    subtype = subtype.strip()
    df = pd.read_csv('./data/1970-2021_DISASTERS_emdat_data.csv', na_values='NaN').fillna(0)
    df = df[(df['Start Year'] >= 2010) & (df['Start Year'] <= 2021)]
    if year:
        if(year != "All"):
            df = df[df['Start Year'] == int(year)]
    print('df hist : ', df)
    df['Disaster Type'] = df['Disaster Type'].str.strip()
    df['Disaster Subgroup'] = df['Disaster Subgroup'].str.strip()
    df['Disaster Type'] = df['Disaster Type'].replace('Extreme temperature', 'Temp')
    disaster_subgroups = [dis for dis in df['Disaster Type'].unique()]
    print(disaster_subgroups)
    subtypes = ['Meteorological', 'Geophysical', 'Hydrological', 'Climatological', 'Biological', 'Extra-terrestrial']
    types=['Flood', 'Storm', 'Drought', 'Landslide', 'Earthquake', 'Epidemic', 'Wildfire', 'Mass movement (dry)', 'Temp', 'Volcanic activity', 'Insect infestation', 'Impact', 'Animal accident', 'Glacial lake outburst']
    if subtype in subtypes:
        print("dhuksee")
        df_filtered = df[df['Disaster Subgroup'] == subtype]
    elif subtype in types :
        df_filtered = df[df['Disaster Type'] == subtype]
    else :
        df_filtered=df
    top_countries = df_filtered.groupby('Country')['Total Affected'].sum().sort_values(ascending=False).head(10)
    histogram = top_countries.reset_index().to_dict(orient='records')
    print("subtypeee.......",subtype)
    print("histoogram..",histogram)
    return {'top_countries': histogram}

def load_compute_data():
    disaster_df = pd.read_csv('./data/1970-2021_DISASTERS_emdat_data.csv', na_values='NaN').fillna(0)
    density_df = pd.read_csv('./data/API_EN.POP.DNST_DS2_en_csv_v2_245686/API_EN.POP.DNST_DS2_en_csv_v2_245686.csv', skiprows=4)
    density_df = density_df[['Country Name', '2021']]
    density_df.rename(columns={'Country Name': 'Country', '2021': 'Density'}, inplace=True)
    merged_df = disaster_df.merge(density_df, on='Country', how='left')
    merged_df['Density'] = merged_df['Density'].fillna(0)
    df=merged_df
    #doing this for the sunburst chart
    df['Disaster Type'] = df['Disaster Type'].replace('Extreme temperature ', 'Temp')
    #taking only 20120-2021
    df = df[(df['Year'] >= 2010) & (df['Year'] <= 2021)]
    #histogram
    top_countries = df.groupby('Country')['Total Affected'].sum().sort_values(ascending=False).head(10)
    print("toppp..",top_countries)
    histogram = top_countries.reset_index().to_dict(orient='records')
    df.rename(columns={"Total Damages ('000 US$)": "Total Damages"}, inplace=True)
    df["Insured Damages ('000 US$)"] = df["Insured Damages ('000 US$)"] + 100000000  # 10,000 in '000 US$ is 10 million
    print(df["Insured Damages ('000 US$)"].describe())
    unique_values = df['Disaster Type'].unique()
    print(df.columns)
    grouped_df = df.groupby('Disaster Type').agg({
       
        "Reconstruction Costs ('000 US$)" : 'sum',
        'Total Damages': 'sum'

    }).reset_index()
    subtype_data = grouped_df.to_dict(orient='records')
    number_of_nulls = df['Aid Contribution'].isnull().sum()
    number_of_zeros = df['Dis Mag Value'].isnull().sum()
    number_of_zeros = df["Aid Contribution"].eq(0.0).sum()
    print(f"The number of zero values in 'column_name' is: {number_of_zeros}")
    df['Damages per Affected'] = df['Total Damages'] / df['Total Affected']
    df['Damages per Affected'] = df['Damages per Affected'].fillna(1)  # Fill NA with 0, in case of division by zero
    bubble_df = df[['Total Damages', 'Total Affected', 'Disaster Type', 'Total Deaths', 'Damages per Affected','Dis Mag Value','Density','Aid Contribution']]
    bubble_data = bubble_df.to_dict(orient='records')
    filtered_df = df[(df['Year'] >= 2010) & (df['Year'] <= 2021)]
    sunburst_data = df.groupby(['Disaster Group','Disaster Subgroup','Disaster Type']).size().reset_index(name='Count')
    sunburst_data = sunburst_data.to_dict(orient='records')
    del df
    disaster_subgroups = [dis for dis in filtered_df['Disaster Subgroup'].unique()]
    print(disaster_subgroups)
    countries = [country for country in filtered_df['Country'].unique()]
    disaster_frequencies = {}
    for country in countries:
        t_dict = {}
        t_df = filtered_df[filtered_df['Country'] == country]
        for dis in disaster_subgroups:
            t_dict[dis] = len(t_df[t_df['Disaster Subgroup'] == dis])
        disaster_frequencies[country] = t_dict

    print("histogram,,,",histogram)
    return [{
        'disaster_subgroups' : disaster_subgroups,
        'disaster_frequencies' : disaster_frequencies,
        'subtype_data': subtype_data,
        'sunburst_data': sunburst_data,
        'bubble_data': bubble_data,
        'top_countries': histogram
        }]


@app.route('/worldmap')
def world_map():
    year = request.args.get('year')  # Retrieve the query parameter, returns None if not provided
    print('map : ', year)
    year = int(year) if year!="All" else year

    group = request.args.get('group')
    group = 'All' if not group else group

    sub_type = request.args.get('sub_type')
    sub_type = 'All' if not sub_type else sub_type
    print('map : ', year, group, sub_type)
    df = pd.read_csv('./data/1970-2021_DISASTERS_emdat_data.csv', na_values='NaN').fillna(0)
    
    filtered_df = df[(df['Start Year'] >= 2010) & (df['Start Year'] <= 2021)] if year == "All" else df[(df['Start Year'] == year)]
    filtered_df['Disaster Type'] = filtered_df['Disaster Type'].replace('Extreme temperature ', 'Temp')

    if(group != "All"):
        if(group == "subgroup"):
            filtered_df = filtered_df[(filtered_df['Disaster Subgroup'] == sub_type)]
        elif(group == "subtype"):
            filtered_df = filtered_df[(filtered_df['Disaster Type'] == sub_type)]
        else:
            return jsonify({"error": "No query provided"}), 400  # Return an error message and a 400 Bad Request status
    
    subgroups = {}
    # print('dis subgroups : ', disaster_subgroups)

    countries = [country for country in filtered_df['Country'].unique()]
    disaster_frequencies = {}
    for country in countries:
        t_dict = {}
        t_df = filtered_df[filtered_df['Country'] == country]
        if(group == "All"):
            disaster_subgroups = [dis for dis in filtered_df['Disaster Subgroup'].unique()]
            v = 0
            mx_group = ""
            for dis in disaster_subgroups:
                n = len(t_df[t_df['Disaster Subgroup'] == dis])
                t_dict[dis] = n
                if(n > v):
                    mx_group = dis
                    v = n
            subgroups[country] = mx_group
        else:
            if(group == 'subgroup'):
                n = len(t_df[t_df['Disaster Subgroup'] == sub_type])
                t_dict[sub_type] = n
                subgroups[country] = sub_type
            elif(group == 'subtype'):
                n = len(t_df[t_df['Disaster Type'] == sub_type])
                t_dict[sub_type] = n
                subgroups[country] = sub_type
        disaster_frequencies[country] = t_dict
    
    # print(subgroups)
    return {'disaster_frequencies' : disaster_frequencies, 'disaster_subgroups' : subgroups}


@app.route('/radviz')
def radviz():
    year = request.args.get('year')  # Retrieve the query parameter, returns None if not provided
    year = int(year) if year != 'All' else year

    df = pd.read_csv('./data/1970-2021_DISASTERS_emdat_data.csv', na_values='NaN').fillna(0)
    
    filtered_df = df[(df['Start Year'] >= 2010) & (df['Start Year'] <= 2021)] if year == "All" else df[(df['Start Year'] == year)]
    filtered_df['Disaster Type'] = filtered_df['Disaster Type'].replace('Extreme temperature ', 'Temp')
    print('India : epidemic -> ', len(filtered_df[(filtered_df['Disaster Type'] == 'Epidemic') & (filtered_df['Country'] == 'India')]))
    print('India : flood -> ', len(filtered_df[(filtered_df['Disaster Type'] == 'Flood') & (filtered_df['Country'] == 'India')]))
    print('India : storm -> ', len(filtered_df[(filtered_df['Disaster Type'] == 'Storm') & (filtered_df['Country'] == 'India')]))
    
    countries = [m for m in df['Country'].unique()] 
    # dis_types = [d for d in df['Disaster Type'].unique()]
    dis_types = ['Flood', 'Landslide', 'Temp', 'Storm', 'Earthquake', 'Drought', 'Wildfire', 'Epidemic'] #, 
    # print('dis types : ', dis_types)
    radviz_data = []
    for country in countries:
        t_data = {}
        for dis in dis_types:
            n = len(filtered_df[(filtered_df['Disaster Type'] == dis) & (filtered_df['Country'] == country)])
            t_data[dis] = n #min(math.log(n, 2), 3) if n > 3 else n # n / 2
            # min(math.log(n, 2), 3)
        t_data['name'] = country
        radviz_data.append(t_data)
    
    min_data = {}
    max_data = {}
    for c_data in radviz_data:
        # c_data = radviz_data[key]
        for key2 in c_data:
            if(key2 != 'name'):
                if(key2 not in min_data):
                    min_data[key2] = c_data[key2]
                elif(min_data[key2] > c_data[key2]):
                    min_data[key2] = c_data[key2]
                
                if(key2 not in max_data):
                    max_data[key2] = c_data[key2]
                elif(max_data[key2] < c_data[key2]):
                    max_data[key2] = c_data[key2]

    print("Radviz min : ", min_data)
    print("Radviz max : ", max_data)
    for c_data in radviz_data:
        for k in c_data:
            if(k != 'name'):
                c_data[k] = (c_data[k] - min_data[k]) / (max_data[k] - min_data[k]) if((max_data[k] - min_data[k]) > 0) else (c_data[k] - min_data[k])

    sub_groups = [g for g in df['Disaster Subgroup'].unique()]
    
    parent_groups = {}
    for sub in sub_groups:
        t_df = filtered_df[(filtered_df['Disaster Subgroup'] == sub)]
        t_types = [g for g in t_df['Disaster Type'].unique()]
        for t in t_types:
            parent_groups[t] = sub

    print(parent_groups)
    return {"data": radviz_data, "dimensions": dis_types, "parent_groups": parent_groups}

@app.route('/barchart')
def search():
    print("HEREEEEEEEEEEEEEEEEEEEEEE")
    year = request.args.get('year')  # Retrieve the query parameter, returns None if not provided
    dis_type = request.args.get('dis_type')
    country = request.args.get('country')
    
    year = int(year) if year != 'All' else year
    dis_type = 'All' if not dis_type else dis_type
    country = 'All' if not country else country
    
    

    print('fetched : ', year, dis_type, country)

    # loading df
    df = pd.read_csv('./data/1970-2021_DISASTERS_emdat_data.csv', na_values='NaN').fillna(0)
    
    years = [m for m in df['Start Year'].unique()]
    years.append("All")
    print('years : ', years)
    
    dis_types = [m for m in df['Disaster Type'].unique()]
    dis_types.append("All")
    # print('dis types : ', dis_types)
    
    countries = [m for m in df['Country'].unique()] 
    countries.append("All")
    # print('countries : ', countries)
    
    # print('fetched again : ', year, dis_type, country)

    if (year not in years) or (dis_type not in dis_types) or (country not in countries):  # Check if query is None or empty
        print('year : ', type(year), str(year in years))
        return jsonify({"error": "No query provided"}), 400  # Return an error message and a 400 Bad Request status



    filtered_df = df[(df['Start Year'] >= 2010) & (df['Start Year'] <= 2021)] if year == "All" else df[(df['Start Year'] == year)]
    filtered_df = filtered_df if dis_type == "All" else filtered_df[(filtered_df['Disaster Type'] == dis_type)]
    filtered_df = filtered_df if country == "All" else filtered_df[(filtered_df['Country'] == country)]
    
    disaster_trend_data = {}
    # dis_types = [d for d in filtered_df['Disaster Type'].unique()]
    months = [m for m in df['Start Month'].unique()] # using df here, careful!!!!
    # print('months : ', months)
    # out_months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for month in months:
        n = len(filtered_df[filtered_df['Start Month'] == month])
        m = int(month)
        if(m < 12):
            disaster_trend_data[m] = n
    print('dis trend : ', disaster_trend_data)
    return {"disaster_trend_data": disaster_trend_data}

@app.route('/timeseries')
def time_series():

    year = request.args.get('year')  # Retrieve the query parameter, returns None if not provided
    year = int(year) if year!="All" else year

    country = request.args.get('country')
    country = 'All' if not country else country

    group = request.args.get('group')
    group = 'All' if not group else group

    sub_type = request.args.get('sub_type')
    sub_type = 'All' if not sub_type else sub_type

    df = pd.read_csv('./data/1970-2021_DISASTERS_emdat_data.csv', na_values='NaN').fillna(0)
    
    filtered_df = df[(df['Start Year'] >= 2010) & (df['Start Year'] <= 2021)] if year == "All" else df[(df['Start Year'] == year)]
    filtered_df['Disaster Type'] = filtered_df['Disaster Type'].replace('Extreme temperature ', 'Temp')
    filtered_df = filtered_df[(filtered_df['Country'] == country)] if country != "All" else filtered_df

    if(group != "All"):
        if(group == "subgroup"):
            filtered_df = filtered_df[(filtered_df['Disaster Subgroup'] == sub_type)]
        elif(group == "subtype"):
            filtered_df = filtered_df[(filtered_df['Disaster Type'] == sub_type)]
        else:
            return jsonify({"error": "No query provided"}), 400  # Return an error message and a 400 Bad Request status
    
    countries = [country for country in filtered_df['Country'].unique()]

    total_affected_data = {}
  
    for country in countries:
        t_dict = {}
        t_df = filtered_df[filtered_df['Country'] == country]
        for i, row in t_df.iterrows():
            # print(row)

            country = row["Country"]
            year = int(row["Start Year"])
            month = int(row["Start Month"])
            # day = int(row["Start Day"]) # sending no day info, so clumsy.
            date = str(year) + "-" + str(month) #+ "-" + str(day)
            # total_affected_data[date] = 0
            value = row["No Injured"] #Total Affected

            # print('row : ', date)
            # d2 = "2021-5-0"
            # print(date != d2)
            # if(date.lower() != d2.lower()):
                # print('inside ', "2021-5-0")
            if(date in t_dict):
            #    print(total_affected_data[date])
                t_dict[date] += value 
            else:
            #    print('wrong')
                t_dict[date] = value
        total_affected_data[country] = t_dict

    for key in total_affected_data:
        # Iterate over each key-value pair in the nested dictionaries
        for inner_key in total_affected_data[key]:
            # Divide each value by 30 and update the dictionary in place
            total_affected_data[key][inner_key] /= 30
            total_affected_data[key][inner_key] = max(0, math.log(total_affected_data[key][inner_key], 2)) if total_affected_data[key][inner_key] > 0 else total_affected_data[key][inner_key]

    total_death_data = {}
  
    for country in countries:
        t_dict = {}
        t_df = filtered_df[filtered_df['Country'] == country]
        for i, row in t_df.iterrows():
            # print(row)

            country = row["Country"]
            year = int(row["Start Year"])
            month = int(row["Start Month"])
            # day = int(row["Start Day"]) # sending no day info, so clumsy.
            date = str(year) + "-" + str(month) #+ "-" + str(day)
            # total_affected_data[date] = 0
            value = row["Total Deaths"]

            # print('row : ', date)
            # d2 = "2021-5-0"
            # print(date != d2)
            # if(date.lower() != d2.lower()):
                # print('inside ', "2021-5-0")
            if(date in t_dict):
            #    print(total_affected_data[date])
                t_dict[date] += value 
            else:
            #    print('wrong')
                t_dict[date] = value
        total_death_data[country] = t_dict

    for key in total_death_data:
        # Iterate over each key-value pair in the nested dictionaries
        for inner_key in total_death_data[key]:
            # Divide each value by 30 and update the dictionary in place
            total_death_data[key][inner_key] /= 60
            # total_death_data[key][inner_key] = math.log(total_death_data[key][inner_key], 2) if total_death_data[key][inner_key] > 0 else total_death_data[key][inner_key]

    return {'total_affected_data' : total_affected_data, 'total_death_data' : total_death_data,}


@app.route("/")
def index():
    return render_template("index.html", data=load_compute_data())


if __name__ == "__main__":
    app.run('localhost', '8000')
