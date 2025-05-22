"use client";

import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/common/shared/redux";
import { userInfoSlice, setUserInfo } from "../../users/user-info.slice";
import { UserInfo } from "@/common/types/user-info";
import { cartSlice, clearCartState } from "../cart.slice";
import { PaymentUserInfo } from "@/common/types/payment-user-info";
import { productsSlice } from "../../products/products.slice";
import { CustomButton } from "@/common/components/custom-button/custom-button";
import { CustomImage } from "@/common/components/custom-image/custom-image";

export default function CartSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orderData, setOrderData] = useState<any>(null);
  const hasRun = useRef(false);

  const userInfo: UserInfo | null = useAppSelector(
    userInfoSlice.selectors.selectUserInfo
  );

  const paymentUserInfoFromStore: PaymentUserInfo = useAppSelector((state) =>
    cartSlice.selectors.selectPaymentUserInfo(state, userInfo?.userId ?? 0)
  );

  const chosenProductsIds: string[] = useAppSelector((state) =>
    userInfo
      ? productsSlice.selectors.selectChosenProductsIds(state, userInfo.userId)
      : []
  );
  const chosenProductsCounts: number[] = useAppSelector((state) =>
    chosenProductsIds.map((productId) =>
      productsSlice.selectors.selectChosenProductCount(
        state,
        userInfo?.userId ?? 0,
        Number(productId)
      )
    )
  );
  const chosenProductsIdsString: string = chosenProductsIds.join(",");

  const queryParams = new URLSearchParams(location.search);
  const sessionId: string | null = queryParams.get("session_id");
  const subtotal: string | null = queryParams.get("subtotal");
  const serviseCommission: string | null = queryParams.get("serviseCommission");

  const handleReturn = (): void => {
    navigate("/home");
  };

  useEffect(() => {
    if (sessionId && !hasRun.current) {
      hasRun.current = true;
      const saveOrderData = async () => {
        try {
          const response = await fetch(
            "https://e-shopreact-production-3eb1.up.railway.app/cart/save-order",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionId,
                userId: userInfo?.userId ?? 0,
                productsIds: chosenProductsIdsString,
                productsCounts: chosenProductsCounts,
                ...paymentUserInfoFromStore,
                userEmail: userInfo?.userEmail ?? "",
                subtotal: subtotal,
                serviseCommission: serviseCommission,
              }),
            }
          );

          if (response.status === 500) {
            console.error("Server error: 500. Order saving aborted.");
            return;
          }

          const data = await response.json();
          setOrderData(data);

          const removeDiscount = async () => {
            try {
              const discountResponse = await fetch(
                "https://e-shopreact-production-3eb1.up.railway.app/user/remove-discount",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userId: userInfo?.userId ?? 0,
                  }),
                }
              );

              if (discountResponse.status === 500) {
                console.error("Server error: 500. Discount removal failed.");
                return;
              }
            } catch (error) {
              console.error("Error removing discount:", error);
            }
          };

          removeDiscount();

          if (userInfo?.userId) {
            chosenProductsIds.forEach((productId) => {
              dispatch(
                productsSlice.actions.removeProductFromCart({
                  userId: userInfo.userId,
                  productId,
                })
              );
            });
            dispatch(clearCartState({ userId: userInfo?.userId }));
          }
        } catch (error) {
          console.error("Error saving order:", error);
        }
      };

      const addBonus = async () => {
        try {
          const shipmentCost =
            paymentUserInfoFromStore.shippingMethod === "free"
              ? 0
              : paymentUserInfoFromStore.shippingMethod === "regular"
              ? 7.5
              : 22.5;

          const response = await fetch(
            "e-shopreact-production-3eb1.up.railway.app/user/add-bonus",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                userId: userInfo?.userId ?? 0,
                bonusPoints: Math.ceil(
                  (1 - paymentUserInfoFromStore.discount * 0.01) *
                    Number(subtotal) +
                    Number(serviseCommission) +
                    shipmentCost
                ),
              }),
            }
          );

          if (response.status === 500) {
            console.error("Server error: 500. Bonus adding aborted.");
            return;
          }

          if (!userInfo) {
            return;
          }

          const updatedUserInfo: UserInfo = {
            ...userInfo,
            userBonusPoints:
              (userInfo?.userBonusPoints ?? 0) +
              Math.ceil(
                (1 - paymentUserInfoFromStore.discount * 0.01) *
                  Number(subtotal) +
                  Number(serviseCommission) +
                  shipmentCost
              ),
          };

          dispatch(setUserInfo(updatedUserInfo));
        } catch (error) {
          console.error("Error adding bonus:", error);
        }
      };

      saveOrderData();
      addBonus();
    }
  }, [
    sessionId,
    userInfo,
    chosenProductsIdsString,
    dispatch,
    chosenProductsIds,
    paymentUserInfoFromStore,
    chosenProductsCounts,
    hasRun,
    serviseCommission,
    subtotal,
  ]);

  if (!orderData) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4 items-center">
      <CustomImage
        alt="error icon"
        src="/cart/cart-success.svg"
        width={400}
        height={400}
      />
      <h3 className="text-3xl font-bold text-green-700">Successful Payment</h3>
      <div className="hidden sm:flex gap-5 sm:gap-20">
        <ul className="text-gray-500">
          <li>Payment Type</li>
          <li>Email</li>
          <li>Order Date</li>
          <li className="font-semibold">Amount paid</li>
        </ul>
        {orderData ? (
          <ul className="text-gray-500 text-right">
            <li>Net Banking</li>
            <li>{orderData.email}</li>
            <li>{orderData.orderDate}</li>
            <li className="font-semibold">${orderData.totalPrice}</li>
          </ul>
        ) : (
          <p className="text-gray-300">Loading...</p>
        )}
      </div>
      <div className="sm:hidden">
        {orderData ? (
          <ul className="text-gray-500 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <li>Payment Type</li>
              <li>Net Banking</li>
            </div>
            <div className="flex flex-col gap-1">
              <li>Email</li>
              <li>{orderData.email}</li>
            </div>
            <div className="flex flex-col gap-1">
              <li>Order Date</li>
              <li>{orderData.orderDate}</li>
            </div>
            <div className="flex flex-col gap-1">
              <li className="font-semibold">Amount paid</li>
              <li className="font-semibold">${orderData.totalPrice}</li>
            </div>
          </ul>
        ) : (
          <p className="text-gray-300">Loading...</p>
        )}
      </div>
      <CustomButton variant="blue" size="md" onClick={handleReturn}>
        Return
      </CustomButton>
    </div>
  );
}
