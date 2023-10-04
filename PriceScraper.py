import json
from bs4 import BeautifulSoup
import requests
import logging
import time
from random import randint
from datetime import datetime


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

HDDFile = "HDD.json"
with open(HDDFile, 'r') as file:
	data = json.load(file)

headers = {
	'User-Agent': 'HDDPriceScraper'
}



def get_price(url):
	response = requests.get(url, headers=headers)
	if response.status_code != 200:
		logging.warning(f"Failed to retrieve {url}. Status code: {response.status_code}")
		return None
	
	soup = BeautifulSoup(response.content, 'html.parser')
	if "dustinhome" in url:
		price_tag = soup.find('span', class_='c-price')
	else:
		logging.warning(f"No scraper exists for {url}")
		return None
	if price_tag:
		return price_tag.text.strip()
	else:
		logging.info(f"No price found for URL: {url}")
		return None


priceUpdatedCount = 0
logging.info(f"Scraping price for {len(data)} items")
for item in data:

	urls = item.get('url')
	
	for url in urls:

		print(url)
		logging.info(f"Scraping URL: {url}")
		lprice = get_price(url)
		if lprice != None:
			new_price = float(''.join([char for char in lprice if char.isdigit()]))
			if new_price and (not item.get('price') or item.get('price') != new_price):
				logging.info(f"Updating price for {url} to {new_price}")
				priceUpdatedCount += 1
				item['price'] = new_price
				item['updateTime'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
			elif not new_price:
				logging.warning(f"No price scraped for {url}")
	wait_time = randint(1, 5) 
	print(f"Waiting {wait_time} seconds")
	time.sleep(wait_time)

print(f"Updated price on {priceUpdatedCount} item(s).")


with open(HDDFile, 'w', newline='') as file:
	json.dump(data, file, indent=4)
