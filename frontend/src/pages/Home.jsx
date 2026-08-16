import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import '../styles/product.css';

const PRODUCTS_PER_CATEGORY = 4;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // First call just to discover the list of categories.
        const res = await fetch('/api/products?limit=1');
        const data = await res.json();
        const cats = data.categories || [];
        setCategories(cats);

        // Then fetch a handful of products for each category in parallel.
        const results = await Promise.all(
          cats.map(async (cat) => {
            const catRes = await fetch(
              `/api/products?category=${encodeURIComponent(cat)}&limit=${PRODUCTS_PER_CATEGORY}`
            );
            const catData = await catRes.json();
            return [cat, catData.products || []];
          })
        );

        setCategoryProducts(Object.fromEntries(results));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const scrollToCategory = (cat) => {
    const el = document.getElementById(`category-${cat}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="home-container">
      <div className="hero-banner">
        <h1>Welcome to ShopNest</h1>
        <p>Discover the best products at unbeatable prices.</p>
      </div>

      {!loading && categories.length > 0 && (
        <div className="category-filters">
          {categories.map((cat) => (
            <button key={cat} className="category-pill" onClick={() => scrollToCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        categories.map((cat) => (
          <section key={cat} id={`category-${cat}`} className="home-category-section">
            <div className="home-category-header">
              <h2>{cat}</h2>
              <Link to={`/shop?category=${encodeURIComponent(cat)}`} className="btn">
                View All
              </Link>
            </div>
            <div className="product-grid">
              {(categoryProducts[cat] || []).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default Home;