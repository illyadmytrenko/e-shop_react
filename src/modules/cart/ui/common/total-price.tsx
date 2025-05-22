"use client";

import { useMemo } from "react";

interface TotalPriceProps {
  subtotal: number;
  serviseCommission: number;
  discountToUse?: number;
  shipmentCost?: number;
}

export function TotalPrice({
  subtotal,
  serviseCommission,
  discountToUse = 0,
  shipmentCost = 0,
}: TotalPriceProps) {
  const grandTotal: number = useMemo(() => {
    return Math.floor(
      subtotal +
        serviseCommission -
        Math.min(2000, Math.floor(discountToUse * 0.01 * subtotal)) +
        shipmentCost
    );
  }, [subtotal, serviseCommission, discountToUse, shipmentCost]);

  return (
    <>
      <div className="flex flex-col gap-2 text-gray-500 text-sm relative after:absolute after:w-full after:h-[2px] after:bg-gray-300 after:-bottom-3">
        <p className="flex justify-between gap-2">
          Subtotal <span>${subtotal}</span>
        </p>
        <p className="flex justify-between gap-2">
          Service commission <span>${serviseCommission}</span>
        </p>
        {discountToUse !== 0 && (
          <p className="flex justify-between gap-2">
            Discount{" "}
            <span>
              -${Math.min(2000, Math.floor(discountToUse * 0.01 * subtotal))}
            </span>
          </p>
        )}
        {shipmentCost !== 0 && (
          <p className="flex justify-between gap-2">
            Shipment cost <span>${shipmentCost}</span>
          </p>
        )}
      </div>
      <h6 className="flex justify-between gap-2 font-bold text-black">
        Grand Total <span>${grandTotal}</span>
      </h6>
    </>
  );
}
