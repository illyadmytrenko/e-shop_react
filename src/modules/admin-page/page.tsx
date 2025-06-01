"use client";

import { Product } from "@/common/types/product";
import { productsApi, productsCharacteristicsApi } from "../products/api";
import { UserInfo } from "@/common/types/user-info";
import { Order } from "@/common/types/order";
import { useEffect, useState, useRef } from "react";
import { ordersApi } from "../account/api";
import { userApi } from "../users/api";
import { ProductsSection } from "./ui/products-section";
import { UsersSection } from "./ui/users-section";
import { OrdersSection } from "./ui/orders-section";
import { OrdersStatsChart } from "./ui/orders-stats-chart";
import { MoneyAmountStatsChart } from "./ui/money-amount-stats-chart";
import { ProductCharacteristics } from "@/common/types/product-characteristics";

export default function AdminPage() {
  const { data: products, isLoading: productsLoading } =
    productsApi.useGetProductsQuery();
  const { data: productsCharacteristics, isLoading: characteristicsLoading } =
    productsCharacteristicsApi.useGetCharacteristicsQuery();

  const { data: users, isLoading: usersLoading } = userApi.useGetUsersQuery();

  const { data: orders, isLoading: ordersLoading } =
    ordersApi.useGetAllOrdersQuery();

  const isLoading =
    productsLoading || characteristicsLoading || ordersLoading || usersLoading;

  const [createProduct] = productsApi.useAddProductMutation();
  const [updateProduct] = productsApi.useUpdateProductMutation();
  const [deleteProduct] = productsApi.useDeleteProductMutation();

  const [createCharacteristics] =
    productsCharacteristicsApi.useCreateCharacteristicsMutation();
  const [updateCharacteristics] =
    productsCharacteristicsApi.useUpdateCharacteristicsMutation();

  const [updateUser] = userApi.useUpdateUserMutation();
  const [deleteUser] = userApi.useDeleteUserMutation();

  const [updateOrder] = ordersApi.useUpdateOrderMutation();
  const [deleteOrder] = ordersApi.useDeleteOrderMutation();

  const [maxId, setMaxId] = useState<number>(0);

  useEffect(() => {
    setMaxId(
      products?.reduce((max, product) => Math.max(max, product.id), 0) ?? 0
    );
  }, [products]);

  useEffect(() => {
    setNewProduct((prev) => ({
      ...prev,
      id: maxId + 1,
    }));
  }, [maxId]);

  const [editedProducts, setEditedProducts] = useState<{
    [key: number]: Product & {
      characteristics?: Record<string, string | number>;
    };
  }>({});

  const [newProduct, setNewProduct] = useState<
    Product & { characteristics?: Record<string, string | number> }
  >({
    id: maxId + 1,
    name: "",
    description: "",
    price: 0,
    category: "",
    brand: "",
    releaseDate: "",
    rating: 0,
    sellsAmount: 0,
    color: "",
    image: "",
    characteristics: {},
  });

  const [editedUsers, setEditedUsers] = useState<{
    [key: number]: UserInfo;
  }>({});

  const [editedOrders, setEditedOrders] = useState<{
    [key: number]: Order;
  }>({});

  const handleChangeProducts = (
    id: number,
    field:
      | keyof Product
      | keyof Order
      | keyof UserInfo
      | keyof ProductCharacteristics
      | string,
    value: string | number
  ) => {
    const isCustomField = ![
      "id",
      "name",
      "description",
      "price",
      "category",
      "brand",
      "releaseDate",
      "rating",
      "sellsAmount",
      "color",
      "image",
    ].includes(field);

    setEditedProducts((prev) => ({
      ...prev,
      [id]: {
        ...products?.find((p) => p.id === id),
        ...prev[id],
        ...(isCustomField
          ? {
              characteristics: { ...prev[id]?.characteristics, [field]: value },
            }
          : { [field]: value }),
      },
    }));
  };

  const handleChangeUsers = (
    id: number,
    field: keyof Product | keyof Order | keyof UserInfo | string,
    value: string | number
  ) => {
    setEditedUsers((prev) => ({
      ...prev,
      [id]: {
        ...users?.find((user) => user.userId === id),
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleChangeOrders = (
    id: number,
    field: keyof Product | keyof Order | keyof UserInfo | string,
    value: string | number
  ) => {
    setEditedOrders((prev) => ({
      ...prev,
      [id]: {
        ...orders?.find((order) => Number(order.orderId) === id),
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSaveProduct = async (id: number) => {
    const edited = editedProducts[id];
    if (!edited) return;

    await updateProduct({ id, data: edited });

    if (edited.characteristics) {
      const characteristics = productsCharacteristics?.find(
        (char) => char.productId === id
      );

      if (characteristics) {
        await updateCharacteristics({
          id: characteristics.id,
          data: edited.characteristics,
        });
      }
      window.location.reload();
    }

    setEditedProducts((prev) => {
      const updatedState = { ...prev };
      delete updatedState[id];
      return updatedState;
    });
  };

  const handleSaveUser = async (id: number) => {
    if (!editedUsers[id]) return;

    await updateUser({ id, data: editedUsers[id] });
    setEditedUsers((prev) => {
      const updatedState = { ...prev };
      delete updatedState[id];
      return updatedState;
    });
  };

  const handleSaveOrder = async (id: number) => {
    if (!editedOrders[id]) return;

    await updateOrder({ id, data: editedOrders[id] });
    setEditedOrders((prev) => {
      const updatedState = { ...prev };
      delete updatedState[id];
      return updatedState;
    });
  };

  const handleNewChangeProducts = (
    field:
      | keyof Product
      | keyof Order
      | keyof UserInfo
      | keyof ProductCharacteristics
      | string,
    value: string | number
  ) => {
    const isCustomField = ![
      "id",
      "name",
      "description",
      "price",
      "category",
      "brand",
      "releaseDate",
      "rating",
      "sellsAmount",
      "color",
      "image",
    ].includes(field);

    setNewProduct((prev) => {
      if (field === "category") {
        return {
          ...prev,
          category: value as string,
          characteristics: {},
        };
      }

      return {
        ...prev,
        ...(isCustomField
          ? {
              characteristics: {
                ...prev.characteristics,
                [field]: value,
              },
            }
          : { [field]: value }),
      };
    });
  };

  const handleAddProduct = async () => {
    try {
      console.log(newProduct);
      await createProduct(newProduct);
      if (newProduct.characteristics) {
        await createCharacteristics({
          productId: newProduct.id,
          characteristics: {
            id: newProduct.id,
            productId: newProduct.id,
            brand: newProduct.brand,
            char1: (newProduct.characteristics.char1 as string) ?? "",
            char2: (newProduct.characteristics.char2 as string) ?? "",
            char3: (newProduct.characteristics.char3 as string) ?? "",
            char4: (newProduct.characteristics.char4 as string) ?? "",
            char5: (newProduct.characteristics.char5 as string) ?? "",
            char6: (newProduct.characteristics.char6 as string) ?? "",
            char7: (newProduct.characteristics.char7 as string) ?? "",
            char8: (newProduct.characteristics.char8 as string) ?? "",
          },
        });
      }
      setNewProduct({
        id: maxId + 1,
        name: "",
        description: "",
        price: 0,
        category: "",
        brand: "",
        releaseDate: "",
        rating: 0,
        sellsAmount: 0,
        color: "",
        image: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const productsSectionRef = useRef<HTMLDivElement>(null);
  const usersSectionRef = useRef<HTMLDivElement>(null);
  const ordersSectionRef = useRef<HTMLDivElement>(null);
  const statsSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="mt-5 sm:mt-8 lg:mt-12">
      <div
        className="flex flex-col md:flex-row gap-4 md:gap-6 mb-10 text-lg relative after:absolute after:w-[2px] md:after:w-full
        after:h-full md:after:h-[2px] after:bg-gray-500 after:-bottom-2"
      >
        <span
          className="cursor-pointer hover:text-blue-500 relative after:absolute after:bg-blue-500 after:h-full md:after:h-[2px] hover:after:w-[2px] md:hover:after:w-full
          after:left-0 after:-bottom-2 after:z-20 px-2"
          onClick={() => scrollToSection(productsSectionRef)}
        >
          Products Section
        </span>
        <span
          className="cursor-pointer hover:text-blue-500 relative after:absolute after:bg-blue-500 after:h-full md:after:h-[2px] hover:after:w-[2px] md:hover:after:w-full
          after:left-0 after:-bottom-2 after:z-20 px-2"
          onClick={() => scrollToSection(usersSectionRef)}
        >
          Users Section
        </span>
        <span
          className="cursor-pointer hover:text-blue-500 relative after:absolute after:bg-blue-500 after:h-full md:after:h-[2px] hover:after:w-[2px] md:hover:after:w-full
          after:left-0 after:-bottom-2 after:z-20 px-2"
          onClick={() => scrollToSection(ordersSectionRef)}
        >
          Orders Section
        </span>
        <span
          className="cursor-pointer hover:text-blue-500 relative after:absolute after:bg-blue-500 after:h-full md:after:h-[2px] hover:after:w-[2px] md:hover:after:w-full
          after:left-0 after:-bottom-2 after:z-20 px-2"
          onClick={() => scrollToSection(statsSectionRef)}
        >
          E-shop Statistics
        </span>
      </div>
      <div className="flex flex-col gap-8">
        <ProductsSection
          productsSectionRef={productsSectionRef}
          products={products}
          editedProducts={editedProducts}
          handleChange={handleChangeProducts}
          handleNewChange={handleNewChangeProducts}
          newProduct={newProduct}
          handleAddProduct={handleAddProduct}
          handleSave={handleSaveProduct}
          deleteProduct={deleteProduct}
        />
        <UsersSection
          usersSectionRef={usersSectionRef}
          users={users}
          editedUsers={editedUsers}
          handleChange={handleChangeUsers}
          handleSave={handleSaveUser}
          deleteUser={deleteUser}
        />
        <OrdersSection
          ordersSectionRef={ordersSectionRef}
          orders={orders}
          editedOrders={editedOrders}
          handleChange={handleChangeOrders}
          handleSave={handleSaveOrder}
          deleteOrder={deleteOrder}
        />
        <div ref={statsSectionRef} className="flex flex-col gap-8">
          <OrdersStatsChart />
          <MoneyAmountStatsChart />
        </div>
      </div>
    </div>
  );
}
