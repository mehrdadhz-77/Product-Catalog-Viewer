import React, { useState } from 'react';
import products from './product_details.json';
import './App.css';

function App() {

  // initialize the variables considered for each part 
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [nlpQuery, setNlpQuery] = useState('');

  // get all of the possible categories from the data 
  const categories = ['All', ...new Set(products.map(p => p.category.trim()))];

  // the characters that should be skipped with matching to the search term 
  const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // clean the filter term, turn everything to the lower case and separate them by sapce
  const terms = filterTerm.trim().toLowerCase().split(/\s+/).filter(t => t);

  // the products that have been filtered based on the conditions set 
  const filteredProducts = products.filter(p => {
      
      // the category of of the product should be either ALL or matched to the passed one 
      const matchCategory = category === 'All' || p.category === category;

      // the price of the product should be less than the price set for the filter 
      const matchPrice = maxPrice === '' || p.price <= parseFloat(maxPrice);

      // the files that we need to check the existency 
      // of the terms from the products (name, description, category)
      const product_filter_fields = [p.product_name?.toLowerCase() || '',
                                     p.description?.toLowerCase() || '',
                                     p.category?.toLowerCase() || ''];

      // for all of the terms in the filter term, check their existency in the interested fields 
      const matchTerms = terms.every(term => { 
        const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
        
        // check for this term if it exists in one of the fileds
        return product_filter_fields.some(field => re.test(field));
      });
      
      // return True so that the product be selected if it respects all of the conditions 
      return matchCategory && matchPrice && matchTerms;
    }).sort((a, b) => b.rating - a.rating); // at the end, sort the products based on their rating

  // truncates the description field to be up to 200 characters
  const truncate_desc = (text, max = 200) => text.length > max ? text.slice(0, max) + '...' : text;

  // this function takes care of the possible nlp issues search
  const handleNlpSearch = async () => {
    // if there is no query, then don't do anything 
    if (!nlpQuery.trim()) return;

    // otherwise, pass the query to the python app to get the response from chatgpt 
    try {

      // prepare the request and sent it to python app 
      const res = await fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: nlpQuery })});

      // get the respnse of the python app  and if something is wrong, generate error 
      const response = await res.json();
      if (!res.ok) throw new Error(response.error || 'Unknown server error');
      
      // separate the interesting filed from the response
      const { category, maxPrice, filterTerm } = response;

      // set the category to the retrieved category 
      setCategory(category || 'All');

      // set the price to the retrieved maximum prices 
      setMaxPrice(maxPrice != null ? String(maxPrice) : '');

      // set the filter term based on the retirieved filtered term 
      setFilterTerm(filterTerm ? filterTerm.trim().toLowerCase() : '');
    } 
    
    // if any error happend, raise an alert
    catch (err) {
      alert(`NLP Search failed: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      <h1>Product Catalog</h1>

      <div className="filters">
        {/* Keyword filtering */}
        <label>
          Filter by keyword:
          <input
            type="text"
            placeholder="red t-shirt"
            value={filterTerm}
            onChange={e => setFilterTerm(e.target.value)}
          />
        </label>

        {/* Category filter */}
        <label>
          Category:
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>

        {/* Max price filter */}
        <label>
          Max Price (₹):
          <input
            type="number"
            placeholder="1000"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </label>

        {/* NLP-powered search */}
        <label>
          NLP Search:
          <input
            type="text"
            placeholder="show me the t-shirt less than 1000"
            value={nlpQuery}
            onChange={e => setNlpQuery(e.target.value)}
          />
        </label>
        <button onClick={handleNlpSearch}>Process the query</button>
      </div>

      <div className="product-list">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <h2>{product.product_name}</h2>
            <p><strong>Price:</strong> ₹{product.price.toFixed(2)}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Description:</strong> {truncate_desc(product.description)}</p>
            <p><strong>Rating:</strong> {product.rating} ⭐</p>
          </div>
        ))}
        {filteredProducts.length === 0 && <p>No products match the filter.</p>}
      </div>
    </div>
  );
}

export default App;