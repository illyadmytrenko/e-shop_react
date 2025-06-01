"use client";

import { Product } from "@/common/types/product";
import { ProductCharacteristics } from "@/common/types/product-characteristics";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import ProductsFiltersBlock from "./ui/products-filters-block";
import { FilterCategories } from "@/common/constants/filter-categories";

interface ProductsFilterProps {
  selectedCategory: string;
  products: Product[];
  productsCharacteristics: ProductCharacteristics[];
  applyFiltersChange: (newFilteredProducts: Product[]) => void;
  filterParams: Record<string, string[]>;
  setFilterParams: Dispatch<SetStateAction<Record<string, string[]>>>;
  handleFiltersChange: (filterType: string, value: string) => void;
}

export function ProductsFilter({
  selectedCategory,
  products,
  productsCharacteristics,
  applyFiltersChange,
  filterParams,
  setFilterParams,
  handleFiltersChange,
}: ProductsFilterProps) {
  const [allProducts] = useState<Product[]>(products);

  const filterCategory = useMemo(
    () =>
      FilterCategories.find((category) => category.name === selectedCategory),
    [selectedCategory]
  );

  console.log(filterCategory);

  const getCounts = useCallback(
    (property: string): Record<string, number> => {
      const productIds = new Set(products.map((product) => product.id));
      return productsCharacteristics.reduce<Record<string, number>>(
        (acc, product) => {
          if (!productIds.has(product.id)) return acc;

          const value = product[property as keyof ProductCharacteristics];
          if (typeof value === "string" || typeof value === "number") {
            const key = value.toString();
            acc[key] = (acc[key] || 0) + 1;
          }

          return acc;
        },
        {}
      );
    },
    [products, productsCharacteristics]
  );

  const characteristicsKeys = useMemo(
    () => [
      ...Object.keys(productsCharacteristics[0] || {}).filter(
        (key) => key !== "productId" && key !== "id"
      ),
      "price",
    ],
    [productsCharacteristics]
  );

  const counts = useMemo(() => {
    return characteristicsKeys.reduce((acc, key) => {
      acc[key] = getCounts(key);
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }, [characteristicsKeys, getCounts]);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  useEffect(() => {
    const prices = products.map((product) => product.price);
    setMinPrice(Math.min(...prices));
    setMaxPrice(Math.max(...prices));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!productsCharacteristics) return [];

    const priceRange = filterParams.price as [string, string] | undefined;

    const [minPrice, maxPrice] = priceRange?.length
      ? [Number(priceRange[0]), Number(priceRange[1])]
      : [
          Math.min(...products.map((product) => product.price)),
          Math.max(...products.map((product) => product.price)),
        ];

    return products.filter((product) => {
      const characteristics = productsCharacteristics.find(
        (char) => char.productId === product.id
      );
      if (!characteristics) return false;

      const passesCharacteristicFilters = Object.entries(filterParams).every(
        ([key, values]) => {
          if (key === "price") return true;
          return (
            values.length === 0 ||
            values.includes(
              characteristics[key as keyof ProductCharacteristics] as string
            )
          );
        }
      );

      const passesPriceFilter =
        !priceRange || (product.price >= minPrice && product.price <= maxPrice);

      return passesCharacteristicFilters && passesPriceFilter;
    });
  }, [products, productsCharacteristics, filterParams]);

  const clearAllFilters = useMemo(() => {
    if (Object.values(filterParams).every((arr) => arr.length === 0))
      return () => {};
    return () => {
      applyFiltersChange(allProducts);
      setFilterParams(
        Object.keys(filterParams).reduce(
          (acc, key) => ({ ...acc, [key]: [] }),
          {}
        )
      );
    };
  }, [filterParams, allProducts, applyFiltersChange, setFilterParams]);

  useEffect(() => {
    applyFiltersChange(filteredProducts);
  }, [filteredProducts, applyFiltersChange]);

  if (!filterCategory) {
    return <div>Category not found</div>;
  }

  if (minPrice === 0 || maxPrice === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md p-4 shadow-[-1px_1px_5px_3px_#e2e2e2] w-full sm:w-auto sm:min-w-[250px] lg:min-w-[300px] max-h-[90vh] overflow-y-auto">
      <div className="flex gap-3 justify-between">
        <h5 className="text-xl font-bold">Filters</h5>
        <span
          className="text-blue-600 cursor-pointer"
          onClick={clearAllFilters}
        >
          Clear all
        </span>
      </div>
      {characteristicsKeys.map((key) => {
        if (
          !counts[key] ||
          (Object.keys(counts[key]).length === 0 && key !== "price")
        ) {
          return null;
        }

        return (
          <ProductsFiltersBlock
            key={key}
            text={filterCategory[key as keyof typeof filterCategory] || key}
            filtersWithCounts={counts[key]}
            handleFiltersChange={handleFiltersChange}
            filterType={key}
            filterParams={filterParams}
            setFilterParams={setFilterParams}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        );
      })}
    </div>
  );
}
