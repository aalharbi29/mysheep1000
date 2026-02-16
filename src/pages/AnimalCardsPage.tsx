import { useParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import AnimalGrid from '@/components/AnimalGrid';
import { CATEGORY_LABELS } from '@/types/animals';

const AnimalCardsPage = () => {
  const { breed } = useParams<{ breed: string }>();

  const breedLabel = CATEGORY_LABELS[breed || ''] || breed;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title={`بطاقات ${breedLabel}`}
          subtitle={`عرض جميع بطاقات ${breedLabel}`}
          backTo="/flock/sheep"
        />
        <AnimalGrid breed={breed || ''} category="sheep" />
      </div>
    </div>
  );
};

export default AnimalCardsPage;
