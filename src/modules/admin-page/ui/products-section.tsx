import { Product } from "@/common/types/product";
import { AdminInput } from "../ui/ui/admin-input";
import { CustomButton } from "@/common/components/custom-button/custom-button";
import { Order } from "@/common/types/order";
import { UserInfo } from "@/common/types/user-info";

interface ProductsSectionProps {
  productsSectionRef: React.RefObject<HTMLDivElement>;
  products: Product[] | undefined;
  editedProducts: { [key: number]: Product };
  handleChange?: (
    id: number,
    field: keyof Product | keyof Order | keyof UserInfo,
    value: string | number
  ) => void;
  handleNewChange?: (
    field: keyof Product | keyof Order | keyof UserInfo,
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
  const renderInputs = (
    product: Product,
    id?: number,
    isNew: boolean = false
  ) =>
    productFields.map((field) => (
      <div key={field.name}>
        <label
          className="text-xl mb-1"
          htmlFor={`${product[field.name]}${id ?? 0}`}
        >
          {field.label}
        </label>
        <AdminInput
          name={field.name}
          type={field.type}
          value={product[field.name] ?? ""}
          id={id}
          inputId={`${product[field.name]}${id ?? 0}`}
          {...(isNew
            ? { handleNewChange }
            : { handleChange, id: id as number })}
        />
      </div>
    ));

  return (
    <div
      className="max-h-[80vh] overflow-y-auto flex flex-col gap-6 px-3"
      ref={productsSectionRef}
    >
      <ul className="flex flex-col gap-6">
        {products?.map((product) => {
          const editedProduct = editedProducts[product.id] || product;
          return (
            <li
              key={product.id}
              className="border-2 border-black rounded-md p-3"
            >
              <div className="flex gap-5 mb-5 pb-1 items-center overflow-x-auto">
                {renderInputs(editedProduct, product.id)}
              </div>
              <div className="flex gap-12">
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
