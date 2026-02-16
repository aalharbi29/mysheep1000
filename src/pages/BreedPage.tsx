import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import AnimalGrid from '@/components/AnimalGrid';
import { useLivestock } from '@/context/LivestockContext';

const breeds = [
  { id: 'harri', label: 'حري' },
  { id: 'najdi', label: 'نجدي' },
];

const BreedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { animals } = useLivestock();

  const isGoat = location.pathname.includes('goat');

  if (isGoat) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <PageHeader title="ماعز" subtitle="بطاقات الماعز" backTo="/flock" />
          <AnimalGrid breed="goat" category="goat" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="ضأن" subtitle="اختر السلالة" backTo="/flock" />

        <div className="grid grid-cols-2 gap-4">
          {breeds.map((breed) => {
            const count = animals.filter(
              a => a.category === 'sheep' && a.breed === breed.id
            ).length;
            return (
              <button
                key={breed.id}
                onClick={() => navigate(`/flock/sheep/${breed.id}`)}
                className="rounded-xl bg-card p-6 text-center transition-all duration-200 card-shadow hover:card-shadow-hover hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-4xl block mb-3">🐑</span>
                <h2 className="text-xl font-bold text-card-foreground">{breed.label}</h2>
                <p className="text-sm text-muted-foreground mt-1">{count} رأس</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BreedPage;
