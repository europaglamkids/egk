import { cn } from '@/lib/utils';

const SIZES = [
  '1-2',
  '2-3',
  '3-4',
  '4-5',
  '5-6',
  '6-7',
  '7-8',
  '8-9',
  '9-10',
  '10-11',
  '11-12',
  '12-13',
  '13-14',
];

interface SizeFilterProps {
  selectedSize: string | null;
  onSelectSize: (size: string | null) => void;
}

export function SizeFilter({ selectedSize, onSelectSize }: SizeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectSize(null)}
        className={cn(
          "px-3 py-1.5 text-sm rounded-full border transition-all duration-200",
          !selectedSize
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background border-border hover:border-primary/50"
        )}
      >
        Todas
      </button>
      {SIZES.map((size) => (
        <button
          key={size}
          onClick={() => onSelectSize(selectedSize === size ? null : size)}
          className={cn(
            "px-3 py-1.5 text-sm rounded-full border transition-all duration-200",
            selectedSize === size
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border hover:border-primary/50"
          )}
        >
          {size} años
        </button>
      ))}
    </div>
  );
}
