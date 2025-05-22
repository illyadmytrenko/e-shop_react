"use client";

import { UserInfo } from "@/common/types/user-info";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import type { AlertColor } from "@mui/material/Alert";
import { CategoryTop } from "../category-top";
import { CustomButton } from "@/common/components/custom-button/custom-button";
import clsx from "clsx";
import { useAppDispatch } from "@/common/shared/redux";
import { setUserInfo } from "@/modules/users/user-info.slice";

interface PageProps {
  userInfo: UserInfo | null;
  userDiscount: number;
}

export default function Discounts({ userInfo, userDiscount }: PageProps) {
  const [alertState, setAlertState] = useState<{
    visible: [string, AlertColor];
    exiting: boolean;
  }>({ visible: ["", "success"], exiting: false });

  const [discount, setDiscount] = useState<number>(userDiscount);

  const dispatch = useAppDispatch();

  const getDiscount = async (price: number): Promise<void> => {
    if (userInfo?.userBonusPoints !== undefined) {
      if (userInfo?.userBonusPoints < price) {
        setAlertState({
          visible: ["You don't have enough bonus points", "warning"],
          exiting: false,
        });
        setTimeout(
          () => setAlertState((prev) => ({ ...prev, exiting: true })),
          2600
        );
        setTimeout(
          () => setAlertState({ visible: ["", "success"], exiting: false }),
          3000
        );
      } else {
        try {
          let userDiscount: number = 0;
          switch (price) {
            case 1000:
              userDiscount = 10;
              break;
            case 2000:
              userDiscount = 25;
              break;
            case 3500:
              userDiscount = 50;
              break;
          }
          const response = await fetch(
            "http://localhost:5000/user/user-discount",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: userInfo?.userId ?? 0,
                bonusPoints: price,
                userDiscount: userDiscount,
              }),
            }
          );

          const data = await response.json();

          if (response.status === 400) {
            setAlertState({
              visible: [data.error, "warning"],
              exiting: false,
            });
            setTimeout(
              () => setAlertState((prev) => ({ ...prev, exiting: true })),
              2600
            );
            setTimeout(
              () => setAlertState({ visible: ["", "success"], exiting: false }),
              3000
            );
            return;
          }

          if (response.status === 500) {
            console.error("Server error: 500. User discount adding aborted.");
            return;
          }

          const updatedUserInfo: UserInfo = {
            ...userInfo,
            userBonusPoints: userInfo?.userBonusPoints - price,
          };
          dispatch(setUserInfo(updatedUserInfo));
          setDiscount(userDiscount);

          setAlertState({
            visible: ["Bonus added successfully!", "success"],
            exiting: false,
          });
          setTimeout(
            () => setAlertState((prev) => ({ ...prev, exiting: true })),
            2600
          );
          setTimeout(
            () => setAlertState({ visible: ["", "success"], exiting: false }),
            3000
          );

          if (typeof window !== "undefined") {
            window.location.reload();
          }
        } catch (error) {
          console.error("Error adding bonus:", error);
        }
      }
    }
  };

  return (
    <div>
      <CategoryTop
        h5="Discounts"
        p="Use your bonus points to get the discount"
      />
      <p className="font-bold text-lg">
        You have {userInfo?.userBonusPoints ?? 0} bonus points
      </p>
      <p className="font-bold text-lg">Your current discount is {discount}%</p>
      <p> The value of the maximum discount is 2000</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <CustomButton
          className="p-4 border rounded-2xl shadow-md bg-yellow-100 text-center hover:bg-yellow-200 transition-colors"
          onClick={() => getDiscount(1000)}
          activeAnimation="yDropdown"
        >
          <h3 className="text-xl font-semibold">10% Discount</h3>
          <p className="text-gray-700">Redeem for 1000 points</p>
        </CustomButton>

        <CustomButton
          className="p-4 border rounded-2xl shadow-md bg-blue-100 text-center hover:bg-blue-200 transition-colors"
          onClick={() => getDiscount(2000)}
          activeAnimation="yDropdown"
        >
          <h3 className="text-xl font-semibold">25% Discount</h3>
          <p className="text-gray-700">Redeem for 2000 points</p>
        </CustomButton>

        <CustomButton
          className="p-4 border rounded-2xl shadow-md bg-green-200 text-center hover:bg-green-300 transition-colors"
          onClick={() => getDiscount(3500)}
          activeAnimation="yDropdown"
        >
          <h3 className="text-xl font-semibold">50% Discount</h3>
          <p className="text-gray-700">Redeem for 3500 points</p>
        </CustomButton>
      </div>
      {alertState.visible[0] && (
        <Alert
          className={clsx(
            "fixed top-10 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out",
            alertState.exiting ? "animate-slide-up" : "animate-slide-down"
          )}
          severity={alertState.visible[1]}
        >
          {alertState.visible[0]}
        </Alert>
      )}
    </div>
  );
}
