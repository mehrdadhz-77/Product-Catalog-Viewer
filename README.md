# Product Catalog Viewer

A full-stack demo that turns raw Kaggle data into an interactive, NLP-powered product catalog.

---

## Repository structure

```
.
├── api/
│   └── api.py                # your openai api key should be placed here 
├── data/
│   └── product_clean.ipynb   # notebook to clean & export products details from kaggle dataset
├── environment.yml           # Conda env spec & packages
├── package.json              # React deps & proxy
├── public/
│   └── index.html
├── server.py                 # Flask `/search` endpoint, talks to chatgpt and gets the response 
└── src/
    ├── App.js                # React UI + filters + NLP hook
    ├── App.css
    ├── index.js              # React bootstrap
    └── product_details.json  # products details data, generated from the product_clean.ipynb
```

---

## Setup & Run

1. **Clone the repo**  
   ```bash
   git clone https://github.com/mehrdadhz-77/Product-Catalog-Viewer.git
   cd Product-Catalog-Viewer
   ```

2. **Create & activate Python environment**  
   ```bash
   conda env create -f environment.yml
   conda activate product-catalog-env
   ```

3. **Generate product data**  
   - Download the "Ecommerce Product dataset" dataset from kaggle. Access it from [here](https://www.kaggle.com/datasets/aaditshukla/flipkart-fasion-products-dataset?resource=download)
   - Place the 'output.xlsx' in the `data` directory 
   - Run the cleaning notebook
   This will write `src/product_details.json`.

4. **Start the backend**  
   ```bash
   python server.py
   ```
   - The NLP API is available at `http://localhost:5000/search`.

5. **Start the frontend**  
   ```bash
   npm install
   npm start
   ```
   - The React app runs at `http://localhost:3000` (with `/search` proxied).
---

## Features

- **Keyword Filter**: Enter multiple terms separated by spaces. The list filters products so that each term appears (as a whole word) in at least one of the fields (name, description, or category).
- **Category Filter**: Select a category from the dropdown (populated from the product data) or All
- **Max Price**: Enter a maximum price, the list will include only products whose price is at or below that value.
- **NLP Search**: Enter queries such “show me red shoes under 3000”) which will be parsed by OpenAI into structured filters.

---

## Customization

- Styles live in `src/App.css`.  
- Openai api key in `api/api.py`.  
- Proxy settings in `package.json`.
