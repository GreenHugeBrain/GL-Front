import styles from './SearchBar.module.css';

const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  onClearSearch, 
  placeholder, 
  resultsCount 
}) => {
  return (
    <div className={styles.professional_search}>
      <div className={styles.search_input_container}>
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.professional_search_input}
        />
        {searchTerm && (
          <button 
            type="button" 
            onClick={onClearSearch}
            className={styles.clear_search_btn}
          >
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>
      {searchTerm && (
        <div className={styles.search_results_info}>
          ნაპოვნია {resultsCount} შედეგი "{searchTerm}"-სთვის
        </div>
      )}
    </div>
  );
};

export default SearchBar;