import { HeroSection } from '@/components/store/HeroSection';
import { CategorySection } from '@/components/store/CategorySection';
import { FeaturedProducts } from '@/components/store/FeaturedProducts';

const Index = () => {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
    </>
  );
};

export default Index;
