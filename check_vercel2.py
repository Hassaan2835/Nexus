import requests
import re

r = requests.get('https://nexus-six-kappa-43.vercel.app')
match = re.search(r'src="(/assets/index-[^"]+\.js)"', r.text)
if match:
    js_url = 'https://nexus-six-kappa-43.vercel.app' + match.group(1)
    js_code = requests.get(js_url).text
    idx = js_code.find("nexus-backend-rzxg")
    if idx != -1:
        start = max(0, idx - 100)
        end = min(len(js_code), idx + 100)
        print("CONTEXT:", js_code[start:end])
    else:
        print("Not found")
