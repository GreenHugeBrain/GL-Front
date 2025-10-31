'use client'
import { Suspense } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HeroSection from './components/HeroSection/HeroSection';
import PopularJobs from './components/PopularJobs/PopularJobs';
import ProfessionalNetwork from './components/ProfessionalNetwork/ProfessionalNetwork';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <PopularJobs />
        <Suspense fallback={<div>იტვირთება პროფესიონალები...</div>}>
          <ProfessionalNetwork />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}