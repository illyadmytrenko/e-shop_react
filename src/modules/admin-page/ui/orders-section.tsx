import { Order } from "@/common/types/order";
import { AdminInput } from "../ui/ui/admin-input";
import { CustomButton } from "@/common/components/custom-button/custom-button";
import { Product } from "@/common/types/product";
import { UserInfo } from "@/common/types/user-info";

interface OrdersSectionProps {
  ordersSectionRef: React.RefObject<HTMLDivElement>;
  orders: Order[] | undefined;
  editedOrders: { [key: string]: Order };
  handleChange: (
    id: number,
    field: keyof Product | keyof Order | keyof UserInfo,
    value: string | number
  ) => void;
  handleSave: (id: number) => void;
  deleteOrder: (id: number) => void;
}

const orderFields: {
  name: keyof Order;
  label: string;
  isEditable?: boolean;
}[] = [
  { name: "orderId", label: "Order Id", isEditable: false },
  { name: "orderDate", label: "Order Date", isEditable: false },
  { name: "userName", label: "User Name", isEditable: false },
  { name: "userPhoneNumber", label: "User Phone Number", isEditable: false },
  { name: "userAddress", label: "User Address", isEditable: false },
  { name: "orderStatus", label: "Order Status" },
];

export function OrdersSection({
  ordersSectionRef,
  orders,
  editedOrders,
  handleChange,
  handleSave,
  deleteOrder,
}: OrdersSectionProps) {
  const renderInputs = (order: Order) =>
    orderFields.map(({ name, label, isEditable }) => {
      return (
        <div key={name}>
          <label
            className="text-xl mb-1 whitespace-nowrap"
            htmlFor={`${name}${order.orderId ?? 0}`}
          >
            {label}
          </label>
          <AdminInput
            name={name}
            type="text"
            value={order[name] ?? ""}
            inputId={`${name}${order.orderId ?? 0}`}
            handleChange={handleChange}
            isEditable={isEditable}
          />
        </div>
      );
    });

  return (
    <div
      className="max-h-[80vh] overflow-y-auto flex flex-col gap-6 px-3"
      ref={ordersSectionRef}
    >
      <ul className="flex flex-col gap-6">
        {orders?.map((order) => {
          const editedOrder = editedOrders[order.orderId] || order;
          return (
            <li
              key={order.orderId}
              className="border-2 border-solid border-black rounded-md p-3"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 mb-5 items-center">
                {renderInputs(editedOrder)}
              </div>
              <div className="flex gap-12">
                <CustomButton
                  size="md"
                  variant="blue"
                  onClick={() => handleSave(Number(order.orderId))}
                >
                  Save
                </CustomButton>
                <CustomButton
                  size="md"
                  variant="orange"
                  onClick={() => deleteOrder(Number(order.orderId))}
                >
                  Delete
                </CustomButton>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
