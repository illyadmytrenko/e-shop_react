import { CustomInput } from "@/common/components/custom-input/custom-input";
import { Order } from "@/common/types/order";
import { Product } from "@/common/types/product";
import { UserInfo } from "@/common/types/user-info";

interface AdminInputProps {
  name: keyof Product | keyof Order | keyof UserInfo;
  type: string;
  value: string | number;
  handleChange?: (
    id: number,
    field: keyof Product | keyof Order | keyof UserInfo,
    value: string | number
  ) => void;
  handleNewChange?: (
    field: keyof Product | keyof Order | keyof UserInfo,
    value: string | number
  ) => void;
  id?: number;
  inputId?: string;
  className?: string;
  isEditable?: boolean;
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
  isEditable = true,
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
      name={name}
      type={type}
      value={value}
      id={inputId}
      onChange={handleInputChange}
      className={`p-2 bg-lime-700 border-2 border-solid border-gray-400 rounded-md ${className}`}
      isEditable={isEditable}
    />
  );
}
