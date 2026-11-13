export type AreaUnit = 'm²' | 'ha' | 'acres';

export type PlotStatus = 'available' | 'installment' | 'sold' | 'half_paid';

export type PaymentType = 'none' | 'cash' | 'half' | 'installment';

export type PlotRecordStatus = 'available' | 'installment' | 'sold';

export type PlotRecordPaymentType = 'cash' | 'half' | 'installment';

export interface PlotRecord {
  id: string;
  plotNumber: number;
  areaSqm: number;
  location: string;
  status: PlotRecordStatus;
  paymentType?: PlotRecordPaymentType;
  soldBy?: string;
  soldTo?: string;
  buyerPhone?: string;
  totalPriceTzs?: number;
  amountPaidTzs?: number;
  reminderDayOfMonth?: number;
  notes?: string;
  x: number;
  y: number;
}

export interface LocationEstate {
  id: string;
  name: string;
  region: string;
  mapImageUrl?: string;
  gridRows?: number;
  gridCols?: number;
  description: string;
}

export interface LandPlot {
  id: string;
  locationId: string;
  plotNumber: string;
  zone: string;
  areaValue: number;
  areaUnit: AreaUnit;
  status: PlotStatus;
  totalPrice: number;
  amountPaid: number;
  paymentType: PaymentType;
  soldBy: string;
  buyerName: string;
  buyerPhone: string;
  saleDate: string;
  installmentDayOfMonth?: number;
  monthlyInstallmentAmount?: number;
  lastPaymentDate?: string;
  receiptNumber?: string;
  receiptDate?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque';
  notes?: string;
  mapX?: number;
  mapY?: number;
  country?: string;
  imageUrl?: string;
}
