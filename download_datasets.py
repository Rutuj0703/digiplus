import datasets
import os

os.makedirs('data', exist_ok=True)
configs = ['agents', 'categories', 'comments', 'tickets']

for c in configs:
    d = datasets.load_dataset('mindweave/help-desk-tickets', c)
    d['train'].to_csv(f'data/{c}.csv')
    print(f"Downloaded {c}.csv with {len(d['train'])} rows")
