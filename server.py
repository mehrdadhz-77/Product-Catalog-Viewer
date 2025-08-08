# Necessary packages 
from flask import Flask, request, jsonify
from openai import OpenAI
from api.api import openai_key
import json, re

# setting up the openai client 
# replace this with your openai api_key
client = OpenAI(api_key=openai_key)
app = Flask(__name__)

# loading dynamically the possible categories from the data itself

with open('src/product_details.json', 'r', encoding='utf-8') as f:
    products = json.load(f)
CATEGORIES = sorted({p.get('category', '') for p in products if p.get('category')})

# the query to be passed to the chatgpt and get the processed response
def parse_query_to_filters(query):

    # engineer the prompt. 
    prompt = f"""
            You receive a user query about filtering a product catalog.
            Return ONLY a JSON object with exactly three keys:
            - category: one of {CATEGORIES} or All if you are unsure""
            - maxPrice: a number or ""
            - filterTerm: important features of the product such as name, color, gender, usecase without stopwords and verbs ""

            with this format {{"category":str,"maxPrice":int,"filterTerm":str}}    

            Example:
            Input: "The white bags under 5000"
            Output: {{"category":"Footwear","maxPrice":5000,"filterTerm":"running shoes"}}

            Now parse:
            "{query}"
        """
    
    # pass the prompt to chatgpt and get back the response 
    response = client.chat.completions.create(
        model="gpt-4.1-nano",
        messages=[{"role": "user", "content": prompt}],
        temperature=0)

    # retrieve the response and get the json block 
    raw = response.choices[0].message.content.strip()
    match = re.search(r'\{.*\}', raw, re.DOTALL)

    # check for any possible mismath in the requested response 
    if not match:
        raise ValueError(f"Could not find JSON in reply: {raw}")

    # return the respnse from chatgpt 
    return json.loads(match.group(0))

# let the search function to be called through request 
@app.route("/search", methods=["POST"])
def search():

    # retrieve the query issued by the user 
    data = request.get_json() or {}
    try:

        # pass the query to the chatgpt and get back the response 
        filters = parse_query_to_filters(data.get("query",""))

        # return the json of the filters 
        return jsonify(filters)
    
    # return the error if that happens
    except Exception as e:
        return jsonify(error=str(e)), 400

# keep the server running on port 5000
if __name__ == "__main__":
    app.run(port=5000)