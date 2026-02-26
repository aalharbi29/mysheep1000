import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { SHEEP_BREEDS, GOAT_BREEDS } from '@/types/animals';

const BreedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const isGoat = location.pathname.startsWith('/flock/goat');
  const breeds = isGoat ? GOAT_BREEDS : SHEEP_BREEDS;
  const title = isGoat ? 'ماعز' : 'ضأن';
  const emoji = isGoat ? '🐐' : '🐑';
  const basePath = isGoat ? '/flock/goat' : '/flock/sheep';
  const category = isGoat ? 'goat' : 'sheep';

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto mt-[100px] pb-[15px] bg-[#d3cfcf] shadow-2xl rounded-3xl">
        <PageHeader title={title} subtitle="اختر السلالة" backTo="/flock" />

        <div className="grid grid-cols-2 gap-4 rounded-3xl">
          {breeds.map((breed) => {
            return (
              <button
                key={breed.id}
                onClick={() => navigate(`${basePath}/${breed.id}`)}
                className="rounded-xl bg-card p-6 text-center transition-all duration-200 card-shadow hover:card-shadow-hover hover:scale-[1.02] active:scale-[0.98] shadow-2xl">

                <span className="text-4xl block mb-3">{emoji}</span>
                <h2 className="text-xl font-bold text-card-foreground">{breed.label}</h2>
              </button>);

          })}
        </div>
      </div>
    </div>);

};

export default BreedPage;