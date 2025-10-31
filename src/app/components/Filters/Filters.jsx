import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, Plus, X } from 'lucide-react';
import styles from './Filters.module.css';

const Filters = ({ onFilterResults }) => {
  const API_BASE_URL = 'http://127.0.0.1:25608';
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    keywords: '',
    min_budget: '',
    max_budget: '',
    author_role: '',
    author_id: '',
    sort_by: ''
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordTags, setKeywordTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywordTags.includes(keywordInput.trim())) {
      const newKeyword = keywordInput.trim();
      setKeywordTags(prev => [...prev, newKeyword]);
      setKeywordInput('');
      
      // Update the keywords filter
      setFilters(prev => ({
        ...prev,
        keywords: [...keywordTags, newKeyword].join(',')
      }));
    }
  };

  const removeKeyword = (keywordToRemove) => {
    const updatedTags = keywordTags.filter(tag => tag !== keywordToRemove);
    setKeywordTags(updatedTags);
    setFilters(prev => ({
      ...prev,
      keywords: updatedTags.join(',')
    }));
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare query parameters
      const params = new URLSearchParams();
      for (const key in filters) {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      }

      const response = await axios.get(`${API_BASE_URL}/jobs/filter`, { params });
      onFilterResults(response.data.jobs);
    } catch (err) {
      setError('ვაკანსიების მოძიება ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.');
      console.error('Error fetching filtered jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      title: '',
      keywords: '',
      min_budget: '',
      max_budget: '',
      author_role: '',
      author_id: '',
      sort_by: ''
    });
    setKeywordTags([]);
    setKeywordInput('');
    onFilterResults([]);
  };

  return (
    <div className={styles.filtersContainer}>
      <div 
        className={styles.filtersHeader} 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>ფილტრები</h3>
        <button className={styles.expandToggle}>
          <ChevronDown 
            className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
          />
        </button>
      </div>

      <div className={`${styles.filtersContent} ${isExpanded ? styles.expanded : ''}`}>
        {error && (
          <div style={{ 
            color: '#ef4444', 
            marginBottom: '16px', 
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.filterGroupRow}>
            <div className={styles.filterGroup}>
              <label>სამუშაოს სახელი:</label>
              <input
                className={styles.filterInput}
                type="text"
                name="title"
                value={filters.title}
                onChange={handleInputChange}
                placeholder="მაგ: ვებ დიზაინი"
              />
            </div>

            <div className={styles.filterGroup}>
              <label>ავტორის როლი:</label>
              <select
                className={styles.filterSelect}
                name="author_role"
                value={filters.author_role}
                onChange={handleInputChange}
              >
                <option value="">ყველა როლი</option>
                <option value="client">კლიენტი</option>
                <option value="freelancer">ფრილანსერი</option>
              </select>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>საკვანძო სიტყვები:</label>
            <div className={styles.keywordInput}>
              <input
                className={styles.filterInput}
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder="დაამატეთ საკვანძო სიტყვა"
              />
              <button 
                type="button" 
                className={styles.addKeywordBtn}
                onClick={addKeyword}
              >
                <Plus size={16} />
                დამატება
              </button>
            </div>
            {keywordTags.length > 0 && (
              <div className={styles.keywordTags}>
                {keywordTags.map((keyword, index) => (
                  <span key={index} className={styles.keywordTag}>
                    {keyword}
                    <button
                      type="button"
                      className={styles.removeKeyword}
                      onClick={() => removeKeyword(keyword)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.filterGroupRow}>
            <div className={styles.filterGroup}>
              <label>მინიმალური ბიუჯეტი (₾):</label>
              <input
                className={styles.filterInput}
                type="number"
                name="min_budget"
                value={filters.min_budget}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className={styles.filterGroup}>
              <label>მაქსიმალური ბიუჯეტი (₾):</label>
              <input
                className={styles.filterInput}
                type="number"
                name="max_budget"
                value={filters.max_budget}
                onChange={handleInputChange}
                placeholder="10000"
                min="0"
              />
            </div>
          </div>

          <div className={styles.filterGroupRow}>
            <div className={styles.filterGroup}>
              <label>ავტორის ID:</label>
              <input
                className={styles.filterInput}
                type="number"
                name="author_id"
                value={filters.author_id}
                onChange={handleInputChange}
                placeholder="კონკრეტული ავტორის ID"
                min="1"
              />
            </div>

            <div className={styles.filterGroup}>
              <label>დალაგება:</label>
              <select
                className={styles.filterSelect}
                name="sort_by"
                value={filters.sort_by}
                onChange={handleInputChange}
              >
                <option value="">ნაგულისხმები (ყველაზე მაღალი ბიუჯეტი)</option>
                <option value="highest_budget">ყველაზე მაღალი ბიუჯეტი</option>
                <option value="lowest_budget">ყველაზე დაბალი ბიუჯეტი</option>
              </select>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button 
              type="submit" 
              className={styles.applyBtn}
              disabled={loading}
            >
              {loading ? 'იტვირთება...' : 'ფილტრების გამოყენება'}
            </button>
            <button 
              type="button" 
              className={styles.resetBtn}
              onClick={handleReset}
            >
              გასუფთავება
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Filters;