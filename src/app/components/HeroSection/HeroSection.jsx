'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/pages/Hire?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.hero_div}>
        <div className={styles.hero_text}>
          <h1>შენი უნარები</h1>
          <h2>შენი წარმატებაა</h2>
          <p>დაუკავშირდით საუკეთესო კლიენტებს და აჩვენეთ თქვენი პროფესიული გამოცდილება</p>
          <form className={styles.input_div} onSubmit={handleSearch}>
            <i className="bi bi-search"></i>
            <input 
              name='search' 
              placeholder='სამუშაო' 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={styles.linee}></div>
            <button type="submit">ძებნა</button>
          </form>
        </div>
      </div>
      <picture>
        <Image
          src="/hero.webp"
          alt="Professional platform hero illustration"
          width={800}
          height={600}
          priority
          fetchPriority="high"
          className={styles.hero_image}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOGZmIi8+PC9zdmc+"
        />
      </picture>
    </section>
  );
};

export default HeroSection;