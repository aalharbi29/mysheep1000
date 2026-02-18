import { useNavigate } from 'react-router-dom';
import { useLivestock } from '@/context/LivestockContext';
import { ANIMAL_COLORS, GENDER_LABELS, CATEGORY_LABELS, SUB_CATEGORY_LABELS, type AnimalSubCategory } from '@/types/animals';

interface AnimalGridProps {
  breed: string;
  category: string;
  subCategory: AnimalSubCategory;
}

const AnimalGrid = ({ breed, category, subCategory }: AnimalGridProps) => {
  const navigate = useNavigate();
  const { animals } = useLivestock();

  const filtered = animals
    .filter(a => {
      const matchBreed = category === 'goat' ? a.category === 'goat' : (a.category === category && a.breed === breed);
      return matchBreed && a.subCategory === subCategory;
    })
    .sort((a, b) => a.number - b.number);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {filtered.length === 0 && (
        <p className="col-span-full text-center text-muted-foreground py-8">
          لا توجد بطاقات في قسم {SUB_CATEGORY_LABELS[subCategory]}
        </p>
      )}
      {filtered.map((animal) => {
        const bgColor = ANIMAL_COLORS[animal.color] || '#F5F0E8';
        const isDark = ['بني', 'أزرق', 'بنفسجي'].includes(animal.color);

        return (
          <button
            key={animal.id}
            onClick={() => navigate(`/animal/${animal.id}`)}
            className="rounded-xl p-3 text-center transition-all duration-200 card-shadow hover:card-shadow-hover hover:scale-[1.03] active:scale-[0.97] relative overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            <span className={`text-2xl font-extrabold block ${isDark ? 'text-primary-foreground' : 'text-foreground'}`}>
              {animal.number}
            </span>
            <span className={`text-[10px] block mt-1 ${isDark ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {CATEGORY_LABELS[animal.breed] || animal.breed}
            </span>
            <span className={`text-[10px] block ${isDark ? 'text-primary-foreground/70' : 'text-muted-foreground/80'}`}>
              {GENDER_LABELS[animal.gender]}
            </span>
            {animal.birthDate && (
              <span className={`text-[9px] block mt-0.5 ${isDark ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>
                {animal.birthDate}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AnimalGrid;
