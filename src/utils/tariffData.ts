interface TariffItem {
  id: string;
  description: string;
  unit: string;
  rate: number;
  quantity: number;
  totalAmount: number;
  selected: boolean;
}

export const getMagistrateTariffs = (scale: string, filePages: number): TariffItem[] => {
  // Simplified tariff data based on the Magistrate Court Fee Tariffs
  return [
    {
      id: "Part I - 07",
      description: "Filing of documents at court",
      unit: "Per document",
      rate: scale === "B" ? 36.50 : scale === "C" ? 36.50 : 36.50,
      quantity: 1,
      totalAmount: scale === "B" ? 36.50 : scale === "C" ? 36.50 : 36.50,
      selected: false
    },
    {
      id: "Part I - 08",
      description: "Necessary attendances",
      unit: "Per folio",
      rate: scale === "B" ? 36.50 : scale === "C" ? 36.50 : 36.50,
      quantity: 1,
      totalAmount: scale === "B" ? 36.50 : scale === "C" ? 36.50 : 36.50,
      selected: false
    },
    {
      id: "Part I - 11",
      description: "Perusal of document or pleading",
      unit: "Per folio",
      rate: scale === "B" ? 14.00 : scale === "C" ? 14.00 : 14.00,
      quantity: filePages,
      totalAmount: scale === "B" ? 14.00 * filePages : scale === "C" ? 14.00 * filePages : 14.00 * filePages,
      selected: false
    },
    {
      id: "Part I - 11(b)",
      description: "Attendance, copies",
      unit: "Per A4 size",
      rate: scale === "B" ? 4.00 : scale === "C" ? 6.00 : 9.00,
      quantity: filePages,
      totalAmount: scale === "B" ? 4.00 * filePages : scale === "C" ? 6.00 * filePages : 9.00 * filePages,
      selected: false
    },
    {
      id: "Part I - 13",
      description: "Collection commission on each installment",
      unit: "Percentage",
      rate: scale === "B" ? 10 : scale === "C" ? 10 : 10,
      quantity: 1,
      totalAmount: 0, // Will be calculated based on other items
      selected: false
    },
    {
      id: "Part II - 01",
      description: "Registered letter of demand",
      unit: "Per letter",
      rate: scale === "B" ? 52.50 : scale === "C" ? 52.50 : 72.50,
      quantity: 1,
      totalAmount: scale === "B" ? 52.50 : scale === "C" ? 52.50 : 72.50,
      selected: false
    },
    {
      id: "Part II - 02",
      description: "Summons (simple), incl. letter of demand",
      unit: "Per summons",
      rate: scale === "B" ? 940.00 : scale === "C" ? 1227.50 : 1471.00,
      quantity: 1,
      totalAmount: scale === "B" ? 940.00 : scale === "C" ? 1227.50 : 1471.00,
      selected: false
    },
    {
      id: "Part II - 03",
      description: "Judgment",
      unit: "Per judgment",
      rate: scale === "B" ? 170.00 : scale === "C" ? 434.00 : 741.00,
      quantity: 1,
      totalAmount: scale === "B" ? 170.00 : scale === "C" ? 434.00 : 741.00,
      selected: false
    }
  ];
};

export const getHighCourtTariffs = (scale: string, filePages: number): TariffItem[] => {
  // Simplified tariff data based on the High Court Fee Tariffs
  const rateMultiplier = scale === "ATTORNEY" ? 1.5 : scale === "CANDIDATE" ? 1 : 1.25;
  
  return [
    {
      id: "A - 01",
      description: "Consultation with a client and witnesses to institute or defend an action",
      unit: "Per 15 min",
      rate: scale === "ATTORNEY" ? 120.50 : scale === "CANDIDATE" ? 80.00 : 188.00,
      quantity: 4, // 1 hour consultation
      totalAmount: (scale === "ATTORNEY" ? 120.50 : scale === "CANDIDATE" ? 80.00 : 188.00) * 4,
      selected: false
    },
    {
      id: "A - 03",
      description: "Court attendance at proceedings in terms of Rule 37",
      unit: "Per 15 min",
      rate: scale === "ATTORNEY" ? 120.50 : scale === "CANDIDATE" ? 80.00 : 188.00,
      quantity: 2,
      totalAmount: (scale === "ATTORNEY" ? 120.50 : scale === "CANDIDATE" ? 80.00 : 188.00) * 2,
      selected: false
    },
    {
      id: "B - 01",
      description: "Formal statement in a matrimonial matter, verifying affidavits",
      unit: "Per page",
      rate: 156.50 * rateMultiplier,
      quantity: 1,
      totalAmount: 156.50 * rateMultiplier,
      selected: false
    },
    {
      id: "B - 02",
      description: "Notices (other than formal notice)",
      unit: "Per page",
      rate: 388.00 * rateMultiplier,
      quantity: 1,
      totalAmount: 388.00 * rateMultiplier,
      selected: false
    },
    {
      id: "B - 03",
      description: "Letters, including letters electronically transmitted",
      unit: "Per page",
      rate: 156.50 * rateMultiplier,
      quantity: 10,
      totalAmount: 156.50 * 10 * rateMultiplier,
      selected: false
    },
    {
      id: "C - 01",
      description: "Attending the record, entry, perusing, considering, and filing of any pleading",
      unit: "Per page",
      rate: 78.00 * rateMultiplier,
      quantity: filePages,
      totalAmount: 78.00 * filePages * rateMultiplier,
      selected: false
    },
    {
      id: "D - 01",
      description: "Making necessary copies, including photocopies, not already provided for",
      unit: "Per A4 Page",
      rate: 6.00,
      quantity: filePages,
      totalAmount: 6.00 * filePages,
      selected: false
    }
  ];
};

export type { TariffItem };
