export interface Order {
  orderId: string;
  userId: number;
  productsIds: string;
  productsCounts: string;
  orderDate: string;
  totalPrice: number;
  orderStatus: string;
  userAddress: string;
  userPhoneNumber: string;
  userName: string;
  userPostalCode: string;
  userEmail: string;
}
