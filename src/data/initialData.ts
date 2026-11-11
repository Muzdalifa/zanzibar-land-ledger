import { LandPlot, LocationEstate, PlotRecord, PlotRecordStatus } from '../types/land';

export const INITIAL_LOCATIONS: LocationEstate[] = [
  {
    id: 'chwaka-kijindu',
    name: 'Chwaka Kijindu',
    region: 'Unguja Central / South',
    mapImageUrl: '/assets/aistudio/chwaka_c548172a.png',
    description: 'Residential site plan (Scale 1:1200) - Zones 1 & 2',
  },
  {
    id: 'paje-coastal',
    name: 'Paje Coastal',
    region: 'Unguja South East',
    description: 'Commercial & hospitality beachfront parcels',
  },
  {
    id: 'nungwi-north',
    name: 'Nungwi North',
    region: 'Unguja North',
    description: 'Mixed-size agricultural and residential plots',
  },
];

const RAW_PLOTS: Array<{ n: number; a: number; x: number; y: number; s?: PlotRecordStatus }> = [
  { n: 88, a: 1020.485, x: 22.3, y: 16.5, s: 'available' },
  { n: 89, a: 327.564, x: 21.5, y: 22.8, s: 'available' },
  { n: 90, a: 335.643, x: 25.2, y: 22.8, s: 'available' },
  { n: 92, a: 435.557, x: 21.0, y: 29.5, s: 'available' },
  { n: 91, a: 335.857, x: 25.2, y: 28.5, s: 'available' },
  { n: 93, a: 373.024, x: 25.2, y: 34.0, s: 'available' },

  { n: 87, a: 369.045, x: 29.8, y: 19.5, s: 'installment' },
  { n: 86, a: 375.747, x: 34.2, y: 19.5, s: 'sold' },
  { n: 85, a: 400.678, x: 29.8, y: 25.5, s: 'available' },
  { n: 84, a: 400.763, x: 34.2, y: 25.5, s: 'available' },
  { n: 82, a: 396.183, x: 29.8, y: 32.0, s: 'available' },
  { n: 83, a: 396.258, x: 34.2, y: 32.0, s: 'available' },

  { n: 65, a: 400.067, x: 39.2, y: 19.5, s: 'available' },
  { n: 64, a: 394.722, x: 43.2, y: 19.5, s: 'installment' },
  { n: 66, a: 400.678, x: 39.2, y: 25.5, s: 'available' },
  { n: 67, a: 400.678, x: 43.2, y: 25.5, s: 'available' },
  { n: 69, a: 396.178, x: 39.2, y: 32.0, s: 'available' },
  { n: 68, a: 396.178, x: 43.2, y: 32.0, s: 'available' },

  { n: 63, a: 466.52, x: 48.2, y: 21.5, s: 'sold' },
  { n: 61, a: 375.497, x: 48.2, y: 27.5, s: 'available' },
  { n: 60, a: 370.808, x: 48.2, y: 33.5, s: 'available' },
  { n: 62, a: 533.571, x: 53.2, y: 25.5, s: 'available' },
  { n: 59, a: 497.578, x: 53.2, y: 32.0, s: 'available' },

  { n: 3, a: 400.14, x: 58.2, y: 26.5, s: 'available' },
  { n: 2, a: 421.994, x: 62.2, y: 26.5, s: 'available' },
  { n: 1, a: 443.848, x: 66.2, y: 26.5, s: 'sold' },
  { n: 4, a: 428.516, x: 58.2, y: 33.0, s: 'available' },
  { n: 5, a: 433.205, x: 62.2, y: 33.0, s: 'available' },
  { n: 6, a: 430.08, x: 66.2, y: 33.0, s: 'available' },

  { n: 81, a: 303.877, x: 29.8, y: 41.0, s: 'available' },
  { n: 80, a: 342.262, x: 33.8, y: 41.0, s: 'available' },
  { n: 79, a: 387.108, x: 33.8, y: 47.5, s: 'available' },
  { n: 78, a: 137.218, x: 34.5, y: 53.0, s: 'available' },
  { n: 70, a: 342.208, x: 39.2, y: 41.0, s: 'available' },
  { n: 71, a: 342.208, x: 43.2, y: 41.0, s: 'available' },
  { n: 73, a: 348.938, x: 39.2, y: 47.5, s: 'available' },
  { n: 72, a: 348.938, x: 43.2, y: 47.5, s: 'available' },
  { n: 74, a: 348.938, x: 39.2, y: 54.0, s: 'available' },
  { n: 75, a: 348.938, x: 43.2, y: 54.0, s: 'available' },
  { n: 77, a: 332.277, x: 38.8, y: 60.5, s: 'available' },
  { n: 76, a: 350.197, x: 43.2, y: 60.5, s: 'available' },

  { n: 57, a: 402.778, x: 48.5, y: 41.0, s: 'available' },
  { n: 58, a: 402.406, x: 53.2, y: 41.0, s: 'available' },
  { n: 56, a: 407.095, x: 48.5, y: 47.5, s: 'available' },
  { n: 55, a: 407.095, x: 53.2, y: 47.5, s: 'available' },
  { n: 53, a: 407.095, x: 48.5, y: 54.0, s: 'available' },
  { n: 54, a: 407.095, x: 53.2, y: 54.0, s: 'available' },
  { n: 52, a: 402.406, x: 48.5, y: 60.5, s: 'available' },
  { n: 51, a: 402.778, x: 53.2, y: 60.5, s: 'available' },

  { n: 7, a: 426.489, x: 58.2, y: 42.0, s: 'available' },
  { n: 8, a: 435.495, x: 62.2, y: 42.0, s: 'available' },
  { n: 9, a: 434.009, x: 66.2, y: 42.0, s: 'available' },
  { n: 10, a: 488.597, x: 70.5, y: 41.5, s: 'available' },
  { n: 11, a: 500.631, x: 74.5, y: 41.5, s: 'available' },
  { n: 12, a: 530.539, x: 78.5, y: 41.5, s: 'available' },
  { n: 18, a: 427.794, x: 58.2, y: 51.0, s: 'available' },
  { n: 17, a: 432.111, x: 62.2, y: 51.0, s: 'available' },
  { n: 16, a: 435.007, x: 66.2, y: 51.0, s: 'available' },
  { n: 15, a: 426.133, x: 70.2, y: 50.5, s: 'available' },
  { n: 14, a: 386.083, x: 74.0, y: 50.5, s: 'available' },
  { n: 13, a: 363.531, x: 77.5, y: 50.0, s: 'available' },
  { n: 19, a: 427.422, x: 58.2, y: 58.5, s: 'available' },
  { n: 20, a: 432.111, x: 62.2, y: 58.5, s: 'available' },
  { n: 21, a: 446.696, x: 66.2, y: 58.5, s: 'available' },
  { n: 22, a: 426.133, x: 70.2, y: 58.5, s: 'available' },
  { n: 23, a: 530.245, x: 74.5, y: 58.5, s: 'available' },

  { n: 48, a: 484.358, x: 43.5, y: 68.0, s: 'available' },
  { n: 49, a: 458.509, x: 48.2, y: 68.0, s: 'available' },
  { n: 50, a: 453.62, x: 52.8, y: 68.0, s: 'available' },
  { n: 47, a: 321.744, x: 43.5, y: 74.5, s: 'available' },
  { n: 46, a: 398.919, x: 48.2, y: 74.5, s: 'available' },
  { n: 45, a: 394.602, x: 52.8, y: 74.5, s: 'available' },
  { n: 42, a: 311.392, x: 43.5, y: 82.0, s: 'available' },
  { n: 43, a: 460.164, x: 47.5, y: 82.0, s: 'available' },
  { n: 44, a: 455.475, x: 52.2, y: 82.0, s: 'available' },
  { n: 41, a: 597.223, x: 47.5, y: 89.5, s: 'available' },
  { n: 40, a: 629.534, x: 52.5, y: 89.5, s: 'available' },

  { n: 28, a: 396.618, x: 58.2, y: 68.0, s: 'available' },
  { n: 27, a: 400.935, x: 62.2, y: 68.0, s: 'available' },
  { n: 26, a: 400.935, x: 66.2, y: 68.0, s: 'available' },
  { n: 25, a: 405.86, x: 70.0, y: 68.0, s: 'available' },
  { n: 24, a: 426.725, x: 73.8, y: 68.0, s: 'available' },
  { n: 29, a: 344.139, x: 58.2, y: 74.5, s: 'available' },
  { n: 30, a: 348.828, x: 62.2, y: 74.5, s: 'available' },
  { n: 31, a: 348.828, x: 66.2, y: 74.5, s: 'available' },
  { n: 32, a: 361.125, x: 70.0, y: 74.5, s: 'available' },
  { n: 33, a: 413.227, x: 74.2, y: 74.5, s: 'available' },
  { n: 38, a: 398.065, x: 58.2, y: 82.0, s: 'available' },
  { n: 37, a: 631.745, x: 62.2, y: 82.5, s: 'available' },
  { n: 36, a: 442.332, x: 66.5, y: 81.5, s: 'available' },
  { n: 35, a: 406.832, x: 70.5, y: 81.0, s: 'available' },
  { n: 34, a: 413.146, x: 74.8, y: 80.5, s: 'available' },
  { n: 39, a: 353.39, x: 58.2, y: 88.5, s: 'available' },
];

export const INITIAL_PLOT_RECORDS: PlotRecord[] = RAW_PLOTS.map((p) => {
  const base: PlotRecord = {
    id: `plot-${p.n}`,
    plotNumber: p.n,
    areaSqm: p.a,
    location: 'Chwaka Kijindu',
    status: p.s ?? 'available',
    x: p.x,
    y: p.y,
  };

  if (p.n === 87) {
    return {
      ...base,
      paymentType: 'installment',
      soldBy: 'Ali Khamis',
      soldTo: 'Amina Hassan',
      buyerPhone: '+255 777 412 890',
      totalPriceTzs: 18500000,
      amountPaidTzs: 9250000,
      reminderDayOfMonth: 5,
      notes: '50% deposit paid. Monthly installment due on the 5th.',
    };
  }

  if (p.n === 86) {
    return {
      ...base,
      paymentType: 'cash',
      soldBy: 'Ali Khamis',
      soldTo: 'Juma Omar',
      buyerPhone: '+255 713 882 104',
      totalPriceTzs: 19000000,
      amountPaidTzs: 19000000,
      notes: 'Paid in full cash.',
    };
  }

  if (p.n === 64) {
    return {
      ...base,
      paymentType: 'half',
      soldBy: 'Muzdalifa Ali',
      soldTo: 'Salma Rashid',
      buyerPhone: '+255 773 509 211',
      totalPriceTzs: 20000000,
      amountPaidTzs: 10000000,
      reminderDayOfMonth: 15,
    };
  }

  if (p.n === 63) {
    return {
      ...base,
      paymentType: 'cash',
      soldBy: 'Muzdalifa Ali',
      soldTo: 'Hassan Mwinyi',
      totalPriceTzs: 23500000,
      amountPaidTzs: 23500000,
    };
  }

  if (p.n === 1) {
    return {
      ...base,
      paymentType: 'cash',
      soldBy: 'Ali Khamis',
      soldTo: 'Fatma Said',
      totalPriceTzs: 22000000,
      amountPaidTzs: 22000000,
    };
  }

  return base;
});

const toLandPlot = (record: PlotRecord): LandPlot => ({
  id: record.id,
  locationId: record.location === 'Chwaka Kijindu' ? 'chwaka-kijindu' : 'chwaka-kijindu',
  plotNumber: `Plot ${record.plotNumber}`,
  zone: record.plotNumber >= 41 ? 'Zone 2' : 'Zone 1',
  areaValue: record.areaSqm,
  areaUnit: 'm²',
  status: record.status,
  totalPrice: record.totalPriceTzs ?? 0,
  amountPaid: record.amountPaidTzs ?? 0,
  paymentType: record.paymentType ?? 'none',
  soldBy: record.soldBy ?? '',
  buyerName: record.soldTo ?? '',
  buyerPhone: record.buyerPhone ?? '',
  saleDate: '',
  installmentDayOfMonth: record.reminderDayOfMonth,
  monthlyInstallmentAmount:
    record.paymentType === 'installment' && record.totalPriceTzs && record.amountPaidTzs
      ? Math.max(0, Math.round((record.totalPriceTzs - record.amountPaidTzs) / 12))
      : undefined,
  notes: record.notes,
  mapX: record.x,
  mapY: record.y,
});

export const INITIAL_PLOTS: LandPlot[] = INITIAL_PLOT_RECORDS.map(toLandPlot);
