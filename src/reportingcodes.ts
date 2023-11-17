export enum ReportingCodes {
  BC_SCORE = "007",
  ICC = "004",
  SCORE_NO_HIT = "006",
  ESTIMATE_DUE = "016"
}

export const reasonCodes = [
  {
    name: "Nivel de endeudamiento",
    value: "001"
  },
  {
    name: "Consulta reciente",
    value: "004"
  },
  {
    name: "Pago vencido reciente",
    value: "005"
  },
  {
    name: "Cuentas abiertas con morosidad",
    value: "007"
  },
  {
    name: "Bajo promedio de antigüedad en créditos abiertos",
    value: "009"
  },
  {
    name: "Tipo de crédito con mayor riesgo",
    value: "012"
  },
  {
    name: "Número de cuentas abiertas",
    value: "013"
  },
  {
    name: "Relación entre créditos revolventes y no revolventes",
    value: "014"
  },
  {
    name: "Utilización significativa de límites de crédito revolventes",
    value: "015"
  },
  {
    name: "Tiempo desde última cuenta aperturada",
    value: "016"
  },
  {
    name: "Meses desde último atraso",
    value: "017"
  },
  {
    name: "Duración de cuenta abierta más antigua",
    value: "018"
  },
  {
    name: "Relación entre cuentas con morosidad y sin morosidad",
    value: "020"
  },
  {
    name: "Atrasos frecuentes o recientes",
    value: "021"
  },
  {
    name: "Créditos con morosidad importante",
    value: "024"
  },
  {
    name: "Varios créditos cerrados",
    value: "027"
  },
  {
    name: "Proporción alta de saldos contra crédito máximo",
    value: "028"
  },
  {
    name: "Proporción de cuentas nuevas en los últimos 24 meses",
    value: "029"
  },
  {
    name: "Atrasos frecuentes o recientes",
    value: "031"
  },
  {
    name: "Relación entre experiencias con y sin morosidad",
    value: "032"
  },
  {
    name: "Tipo de crédito con mayor riesgo",
    value: "033"
  },
  {
    name: "Cuentas con morosidad reciente",
    value: "034"
  },
  {
    name: "Pago adecuado del crédito",
    value: "051"
  },
  {
    name: "Pago adecuado del crédito",
    value: "052"
  },
  {
    name: "Pagos adecuados de los créditos",
    value: "053"
  },
  {
    name: "Pagos adecuados de los créditos",
    value: "054"
  },
  {
    name: "Créditos con morosidad",
    value: "055"
  },
  {
    name: "Créditos nuevos con morosidad",
    value: "056"
  }
];

export class classUser {
  creditBureauScore:
    | {
        mops: number | undefined;
        amountPay: number | undefined;
        balanceDue: number | undefined;
        valueScore: number | undefined;
        reasonCodes: any[] | undefined;
        hasDeathDate: number | undefined;
        activeAccounts: number | undefined;
        closedAccounts: number | undefined;
        valueScoreNoHit: number | undefined;
        consultationsNumber: number | undefined;
        negativePaymentAccs: number | undefined;
        percentageAccsOnMop1: number | undefined;
        creditBureauExperience: number | undefined;
        differenceLastOpenedAcc: number | undefined;
        last6MonthsRequestsTotal: number | undefined;
      }
    | undefined;
}

export const constUser: any = {
  creditBureauScore: {
    mops: 0,
    amountPay: 0,
    balanceDue: 0,
    valueScore: 0,
    reasonCodes: 0,
    hasDeathDate: 0,
    activeAccounts: 0,
    closedAccounts: 0,
    valueScoreNoHit: 0,
    consultationsNumber: 0,
    negativePaymentAccs: 0,
    percentageAccsOnMop1: 0,
    creditBureauExperience: 0,
    differenceLastOpenedAcc: 0,
    last6MonthsRequestsTotal: 0
  }
};

export enum BureauStatus {
  CUENTA_LS = "LS", //Cuenta LS
  CUENTA_CORRIENTE = "CA", //Cuenta al corriente o vencida
  CUENTA_COBRANZA = "CL", //Cuenta en cobranza
  CUENTA_CERRADA = "CC", //Cuenta cerrada
  CUENTA_CD = "CD", // CUenta CD
  CUENTA_CV = "CV" // Cuenta CV
}
