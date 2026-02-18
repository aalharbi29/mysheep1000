import { useParams, useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import AnimalGrid from '@/components/AnimalGrid';
import { CATEGORY_LABELS, SUB_CATEGORY_LABELS, type AnimalSubCategory } from '@/types/animals';

const AnimalCardsPage = () => {
  const { breed: breedParam, subCategory } = useParams<{ breed: string; subCategory: string }>();
  const location = useLocation();

  const isGoat = location.pathname.startsWith('/flock/goat');
  // For goat routes: /flock/goat/:subCategory — subCategory comes as breedParam or subCategory
  const breed = isGoat ? 'goat' : (breedParam || '');
  const sub = (isGoat ? (breedParam || subCategory) : subCategory) as AnimalSubCategory || 'mothers';

  const breedLabel = CATEGORY_LABELS[breed] || breed;
  const subLabel = SUB_CATEGORY_LABELS[sub] || sub;
  const backTo = isGoat ? '/flock/goat' : `/flock/sheep/${breed}`;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title={`${subLabel} - ${breedLabel}`}
          subtitle={`عرض بطاقات ${subLabel}`}
          backTo={backTo}
        />
        <AnimalGrid
          breed={breed}
          category={isGoat ? 'goat' : 'sheep'}
          subCategory={sub}
        />
      </div>
    </div>
  );
};

export default AnimalCardsPage;
