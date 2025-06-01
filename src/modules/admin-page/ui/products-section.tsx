import { Product } from "@/common/types/product";
import { AdminInput } from "../ui/ui/admin-input";
import { CustomButton } from "@/common/components/custom-button/custom-button";
import { Order } from "@/common/types/order";
import { UserInfo } from "@/common/types/user-info";
import { productsCharacteristicsApi } from "@/modules/products/api";
import { useCallback, useMemo } from "react";
import { ProductCharacteristics } from "@/common/types/product-characteristics";
import { FilterCategories } from "@/common/constants/filter-categories";

interface ProductsSectionProps {
  productsSectionRef: React.RefObject<HTMLDivElement>;
  products: Product[] | undefined;
  editedProducts: {
    [key: number]: Product & {
      characteristics?: Record<string, string | number>;
    };
  };
  handleChange?: (
    id: number,
    field:
      | keyof Product
      | keyof Order
      | keyof UserInfo
      | keyof ProductCharacteristics
      | string,
    value: string | number
  ) => void;
  handleNewChange?: (
    field:
      | keyof Product
      | keyof Order
      | keyof UserInfo
      | keyof ProductCharacteristics
      | string,
    value: string | number
  ) => void;
  newProduct: Product;
  handleAddProduct: () => void;
  handleSave: (id: number) => void;
  deleteProduct: (id: number) => void;
}

const productFields: {
  name: keyof Product;
  label: string;
  type: "text" | "date";
}[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "description", label: "Description", type: "text" },
  { name: "price", label: "Price", type: "text" },
  { name: "category", label: "Category", type: "text" },
  { name: "brand", label: "Brand", type: "text" },
  { name: "releaseDate", label: "Release Date", type: "date" },
  { name: "color", label: "Color", type: "text" },
  { name: "image", label: "Image URL", type: "text" },
];

export function ProductsSection({
  productsSectionRef,
  products,
  editedProducts,
  handleChange,
  handleNewChange,
  newProduct,
  handleAddProduct,
  handleSave,
  deleteProduct,
}: ProductsSectionProps) {
  const { data: productsCharacteristics, isLoading: characteristicsLoading } =
    productsCharacteristicsApi.useGetCharacteristicsQuery();

  const renderInputs = (
    product: Product & {
      characteristics?: Record<string, string | number>;
    },
    id?: number,
    isNew: boolean = false
  ) => {
    const currentCategory = useMemo(
      () =>
        FilterCategories.find((category) => category.name === product.category),
      [product.category]
    );

    const baseInputs = productFields.map((field) => (
      <div key={field.name}>
        <label className="tb-1" htmlFor={`${field.name}-${id ?? "new"}`}>
          {field.label}
        </label>
        <AdminInput
          name={field.name}
          type={field.type}
          value={product[field.name] ?? ""}
          id={id}
          inputId={`${field.name}-${id ?? "new"}`}
          {...(isNew
            ? { handleNewChange }
            : { handleChange, id: id as number })}
        />
      </div>
    ));

    const extraInputs =
      currentCategory &&
      Object.keys(currentCategory)
        .filter(
          (key) =>
            key !== "name" && !productFields.some((field) => field.name === key)
        )
        .map((key) => (
          <div key={key}>
            <label className="mb-1" htmlFor={`${key}-${id ?? "new"}`}>
              {currentCategory[key as keyof typeof currentCategory] || key}
            </label>
            <AdminInput
              name={key}
              type="text"
              value={product.characteristics?.[key] ?? ""}
              id={id}
              inputId={`${key}-${id ?? "new"}`}
              {...(isNew
                ? {
                    handleNewChange,
                  }
                : {
                    handleChange,
                    id: id as number,
                  })}
            />
          </div>
        ));

    return [...baseInputs, ...(extraInputs ?? [])];
  };

  if (characteristicsLoading || !productsCharacteristics || !products)
    return <div>Loading...</div>;

  const extractCharacteristics = (
    productCharacteristics?: ProductCharacteristics
  ): Record<string, string | number> => {
    if (!productCharacteristics) return {};

    const result: Record<string, string | number> = {};
    for (let i = 1; i <= 8; i++) {
      const key = `char${i}` as keyof ProductCharacteristics;
      const value = productCharacteristics[key];
      if (value !== null) {
        result[`char${i}`] = value;
      }
    }
    return result;
  };

  return (
    <div
      className="max-h-[80vh] overflow-y-auto flex flex-col gap-6 px-3"
      ref={productsSectionRef}
    >
      <ul className="flex flex-col gap-6">
        {products.map((product) => {
          const productCharacteristics = productsCharacteristics.find(
            (char) => char.productId === product.id
          );

          const edited = editedProducts[product.id];

          const editedProduct: Product & {
            characteristics?: Record<string, string | number>;
          } = {
            ...product,
            ...edited,
            characteristics: {
              ...extractCharacteristics(productCharacteristics),
              ...(edited?.characteristics ?? {}),
            },
          };

          return (
            <li
              key={product.id}
              className="border-2 border-black rounded-md p-3"
            >
              <div className="flex gap-5 mb-5 pb-1 items-center overflow-x-auto">
                {renderInputs(editedProduct, product.id)}
              </div>
              <div className="flex gap-12 mt-4">
                <CustomButton
                  size="md"
                  variant="blue"
                  onClick={() => handleSave(product.id)}
                  activeAnimation="yDropdown"
                >
                  Save
                </CustomButton>
                <CustomButton
                  size="md"
                  variant="orange"
                  onClick={() => deleteProduct(product.id)}
                  activeAnimation="yDropdown"
                >
                  Delete
                </CustomButton>
              </div>
            </li>
          );
        })}
      </ul>
      <div>
        <div className="grid grid-cols-6 gap-5 mb-5">
          {renderInputs(newProduct, undefined, true)}
        </div>
        <CustomButton
          size="md"
          variant="orange"
          onClick={handleAddProduct}
          activeAnimation="yDropdown"
        >
          Add New Product
        </CustomButton>
      </div>
    </div>
  );
}
