import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Dispatch, SetStateAction } from "react";

interface AdminSortSelectProps {
  orderStatusType: "current" | "delivered" | "canceled" | "returned";
  setOrderStatusType: Dispatch<
    SetStateAction<"current" | "delivered" | "canceled" | "returned">
  >;
}

export function AdminSortSelect({
  orderStatusType,
  setOrderStatusType,
}: AdminSortSelectProps) {
  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value as
      | "current"
      | "delivered"
      | "canceled"
      | "returned";
      setOrderStatusType(value);
  };

  return (
    <div className="mb-5">
      <FormControl
        sx={{
          m: 1,
          minWidth: 80,
          display: "flex",
          justifySelf: "start",
          "@media (min-width: 640px)": {
            justifySelf: "end",
          },
        }}
      >
        <InputLabel id="sortSelectLabel">Sorted by:</InputLabel>
        <Select
          labelId="sortSelectLabel"
          value={orderStatusType}
          onChange={handleChange}
          autoWidth
          label="Sorted by:"
        >
          <MenuItem value="current">Current</MenuItem>
          <MenuItem value="delivered">Delivered</MenuItem>
          <MenuItem value="canceled">Canceled</MenuItem>
          <MenuItem value="returned">Returned</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
