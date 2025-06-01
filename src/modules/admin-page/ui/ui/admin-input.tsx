import { CustomInput } from "@/common/components/custom-input/custom-input";
import { Order } from "@/common/types/order";
import { Product } from "@/common/types/product";
import { ProductCharacteristics } from "@/common/types/product-characteristics";
import { UserInfo } from "@/common/types/user-info";

interface AdminInputProps {
  name:
    | keyof Product
    | keyof Order
    | keyof UserInfo
    | keyof ProductCharacteristics
    | string;
  type: string;
  value: string | number;
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
  id?: number;
  stringId?: string;
  inputId?: string;
  className?: string;
  isReadOnly?: boolean;
}

export function AdminInput({
  name,
  type,
  value,
  handleChange,
  handleNewChange,
  id = 0,
  inputId,
  className = "",
  isReadOnly = false,
}: AdminInputProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (handleChange) {
      handleChange(id, name, e.target.value);
    } else if (handleNewChange) {
      handleNewChange(name, e.target.value);
    }
  };

  return (
    <CustomInput
      name={name as string}
      type={type}
      value={value}
      id={inputId}
      onChange={handleInputChange}
      className={`p-2 bg-lime-700 border-2 border-solid border-gray-400 rounded-md ${className}`}
      isReadOnly={isReadOnly}
    />
  );
}
