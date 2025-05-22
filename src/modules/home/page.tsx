"use client";

import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/common/shared/redux";
import { productsApi } from "@/modules/products/api";
import { Product } from "@/common/types/product";
import { useCallback, useMemo } from "react";
import { setProductsCategory } from "@/modules/products/products.slice";
import { HomeLayout } from "@/modules/home/ui/home-layout";

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: products, isLoading: productsLoading } =
    productsApi.useGetProductsQuery();
  const { data: productOnMainPage } = productsApi.useGetProductQuery(111);

  const newestProducts: Product[] = useMemo(() => {
    if (!products) return [];
    return products
      .slice()
      .sort(
        (a, b) =>
          new Date(b.releaseDate ?? 0).getTime() -
          new Date(a.releaseDate ?? 0).getTime()
      )
      .slice(0, 4);
  }, [products]);
  const bestSellersProducts: Product[] = useMemo(() => {
    if (!products) return [];
    return products
      .slice()
      .sort((a, b) => (b.sellsAmount ?? 0) - (a.sellsAmount ?? 0))
      .slice(0, 4);
  }, [products]);

  const handleExploreMore = useCallback((): void => {
    navigate("/products");
  }, [navigate]);

  const handleCategoryClick = useCallback(
    (category: string): void => {
      navigate("/products", { state: { category } });
    },
    [navigate]
  );

  const handleViewPS5Click = useCallback((): void => {
    if (productOnMainPage?.id) {
      navigate(`/products/${productOnMainPage.id}`);
    }
  }, [navigate, productOnMainPage]);

  const handleTradeInLearnClick = useCallback((): void => {
    navigate("/reprocessing");
  }, [navigate]);

  const handleViewWatchClick = useCallback((): void => {
    navigate("/products", { state: { category: "Wearable" } });
    dispatch(setProductsCategory({ category: "Wearable" }));
  }, [navigate, dispatch]);

  if (productsLoading) return <div>Loading...</div>;

  return (
    <HomeLayout
      handleExploreMore={handleExploreMore}
      handleCategoryClick={handleCategoryClick}
      handleViewWatchClick={handleViewWatchClick}
      handleViewPS5Click={handleViewPS5Click}
      handleTradeInLearnClick={handleTradeInLearnClick}
      newestProducts={newestProducts}
      bestSellersProducts={bestSellersProducts}
    />
  );
}
