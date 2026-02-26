import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import {
  CATEGORY_LABELS,
  SUB_CATEGORY_LABELS,
  SUB_CATEGORY_ICONS,
  type AnimalSubCategory } from
'@/types/animals';

const subCategories: AnimalSubCategory[] = ['mothers', 'young', 'rams'];

const SubCategoryPage = () => {
  const { breed } = useParams<{breed: string;}>();
  const location = useLocation();
  const navigate = useNavigate();
  const { animals } = useLivestock();

  const isGoat = location.pathname.startsWith('/flock/goat');
  const breedLabel = CATEGORY_LABELS[breed || ''] || breed;
  const backTo = isGoat ? '/flock/goat' : '/flock/sheep';

  const getCount = (sub: AnimalSubCategory) =>
  animals.filter((a) => a.breed === breed && a.subCategory === sub && a.status !== 'dead' && a.confirmed === true).length;

  const basePath = isGoat ? `/flock/goat/${breed}` : `/flock/sheep/${breed}`;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto mt-[100px] pb-[15px]">
        <PageHeader title={breedLabel} subtitle="اختر القسم" backTo={backTo} />

        <div className="grid grid-cols-3 gap-4">
          {subCategories.map((sub) =>
          <button
            key={sub}
            onClick={() => navigate(`${basePath}/${sub}`)}
            className="rounded-xl bg-card p-5 text-center transition-all duration-200 card-shadow hover:card-shadow-hover hover:scale-[1.02] active:scale-[0.98]">

              <span className="text-4xl block mb-3">{SUB_CATEGORY_ICONS[sub]}</span>
              <h2 className="text-lg font-bold text-card-foreground">{SUB_CATEGORY_LABELS[sub]}</h2>
              <p className="text-sm text-muted-foreground mt-1">{getCount(sub)} رأس</p>
            </button>
          )}
        </div>
      </div>
    </div>);

};

export default SubCategoryPage;