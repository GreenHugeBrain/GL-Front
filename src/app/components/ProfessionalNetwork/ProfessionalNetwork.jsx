'use client'
import { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from './ProfessionalNetwork.module.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

// Lazy load non-critical components
const ProfessionalCard = dynamic(() => import('../ProfessionalCard/ProfessionalCard'), {
  ssr: true
});
const SearchBar = dynamic(() => import('../SearchBar/SearchBar'), {
  ssr: true
});
const EmptyState = dynamic(() => import('../EmptyState/EmptyState'), {
  ssr: true
});

const ProfessionalNetwork = () => {
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [professionalSearchTerm, setProfessionalSearchTerm] = useState('');

  // Memoize filtered professionals to avoid unnecessary recalculations
  const filteredProfessionals = useMemo(() => {
    if (professionalSearchTerm === '') {
      return professionals;
    }
    
    const searchTerm = professionalSearchTerm.toLowerCase().trim();
    return professionals.filter(person => 
      person.name?.toLowerCase().includes(searchTerm) ||
      person.role?.toLowerCase().includes(searchTerm) ||
      person.job?.toLowerCase().includes(searchTerm)
    );
  }, [professionalSearchTerm, professionals]);

  // Debounced search to improve performance
  const debouncedSearch = useCallback((value) => {
    const timeoutId = setTimeout(() => {
      setProfessionalSearchTerm(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const handleProfessionalSearch = useCallback((value) => {
    debouncedSearch(value);
  }, [debouncedSearch]);

  const clearProfessionalSearch = useCallback(() => {
    setProfessionalSearchTerm('');
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProfessionals = async () => {
      try {
        setError(null);
        const response = await fetch('http://127.0.0.1:25608/professional_network', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setProfessionals(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Error fetching professionals:', error);
          setError('მონაცემების ჩატვირთვა ვერ მოხერხდა');
          setProfessionals([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfessionals();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className={styles.error_container}>
          <i className="bi bi-exclamation-triangle"></i>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retry_btn}
          >
            თავიდან ცდა
          </button>
        </div>
      );
    }

    if (filteredProfessionals.length === 0) {
      if (professionalSearchTerm) {
        return (
          <EmptyState
            type="no-results"
            searchTerm={professionalSearchTerm}
            onClearSearch={clearProfessionalSearch}
          />
        );
      } else {
        return <EmptyState type="empty" />;
      }
    }

    return (
      <div className={styles.pro_list} role="list">
        {filteredProfessionals.map((person, index) => (
          <ProfessionalCard 
            key={person.id || `professional-${index}`}
            person={person}
          />
        ))}
      </div>
    );
  };

  return (
    <section className={styles.pro_web} aria-labelledby="professionals-heading">
      <div className={styles.pro_text}>
        <h1 id="professionals-heading">პროფესიული ქსელი</h1>
        <h2>დაამყარეთ კავშირები და განავითარეთ თქვენი პროფესიული პორტფოლიო</h2>
        
        <SearchBar
          searchTerm={professionalSearchTerm}
          onSearchChange={handleProfessionalSearch}
          onClearSearch={clearProfessionalSearch}
          placeholder="მოძებნეთ მამხმარებელი სახელით, როლით ან სამუშაოთ..."
          resultsCount={filteredProfessionals.length}
        />
      </div>
      
      {renderContent()}
    </section>
  );
};

export default ProfessionalNetwork;