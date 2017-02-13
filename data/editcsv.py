import csv
with open('HUD median incomes 1985-2009.csv', 'rb') as csvfile:
    lineReader = csv.reader(csvfile, delimiter=' ', quotechar='|')
    lineWriter = csv.writer(csvfile, delimiter=' ', quotechar='|')
    for row in lineReader:
        if row[0].isdigit == False:
            lineWriter.writerow[row]

with open('HUD median incomes 1985-2009_new.csv', 'wb') as csvfile:
    for row in lineWriter:
        lineWriter.writerow(row)
