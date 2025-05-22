"use client";

import { CustomImage } from "@/common/components/custom-image/custom-image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface ProductsFiltersBlockProps {
  text: string;
  filtersWithCounts: Record<string, number>;
  handleFiltersChange: (filterType: string, value: string) => void;
  filterType: string;
  filterParams: Record<string, string[]>;
  setFilterParams: Dispatch<SetStateAction<Record<string, string[]>>>;
  minPrice: number;
  maxPrice: number;
}

export function ProductsFiltersBlock({
  text,
  filtersWithCounts,
  handleFiltersChange,
  filterType,
  filterParams,
  setFilterParams,
  minPrice,
  maxPrice,
}: ProductsFiltersBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice,
    maxPrice,
  ]);

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const upperText = text.charAt(0).toUpperCase() + text.slice(1);

  const toggleVisibility = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    if (willOpen && !hasOpened) {
      setFilterParams((prevState) => ({
        ...prevState,
        [filterType]: [],
      }));
      setHasOpened(true);
    }
  };

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newRange: [number, number] = [...priceRange];
    newRange[index] = Number(e.target.value);
    if (newRange[0] <= newRange[1]) {
      setPriceRange(newRange);
      setFilterParams((prevState) => ({
        ...prevState,
        [filterType]: [String(newRange[0]), String(newRange[1])],
      }));
    }
  };

  return (
    <div className="mb-6 mt-2 relative after:absolute after:w-full after:h-[1px] after:bg-gray-300 after:-bottom-3">
      <div
        className="flex justify-between cursor-pointer"
        onClick={() => toggleVisibility()}
      >
        <span className="text-xl">{upperText}</span>
        <CustomImage
          alt="arrow-down"
          className={`transition-transform transform ${
            isOpen ? "rotate-180" : ""
          }`}
          src="/faqs/arrow-down.svg"
          width={24}
          height={24}
          style={{
            filter: isOpen
              ? "invert(33%) sepia(100%) saturate(750%) hue-rotate(180deg)"
              : "none",
          }}
        />
      </div>

      {isOpen && (
        <div className="mt-2">
          {filterType === "price" ? (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-base">
                <span>From: {priceRange[0]}</span>
                <span>To: {priceRange[1]}</span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  className="w-full"
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {Object.entries(filtersWithCounts).map(([filter, count]) => (
                <li key={filter} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterParams[filterType].includes(filter)}
                    onChange={() => handleFiltersChange(filterType, filter)}
                    className="w-5 h-5"
                  />
                  <p className="text-xl">
                    {filter}
                    <span className="text-gray-400 inline-block ml-1">
                      ({count})
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductsFiltersBlock;
