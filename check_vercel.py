import requests
import re

r = requests.get('https://nexus-six-kappa-43.vercel.app')
match = re.search(r'src="(/assets/index-[^"]+\.js)"', r.text)
if match:
    js_url = 'https://nexus-six-kappa-43.vercel.app' + match.group(1)
    js_code = requests.get(js_url).text
    print("Found JS file.")
    if "nexus-backend-rzxg" in js_code:
        print("Backend URL IS in the bundle!")
    else:
        print("Backend URL IS NOT in the bundle!")
    
    if "/api" in js_code[:1000]:
        print("Starts with /api?")
else:
    print("Not found")
