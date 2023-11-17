import { creditBureau } from "./creditBureau";
import {
  ReportingCodes,
  reasonCodes,
  constUser,
  BureauStatus
} from "./reportingcodes";
import moment from "moment";

function getMops(accounts: Array<any>): number {
  let mops = -1;

  if (accounts != null && accounts !== undefined) {
    try {
      accounts.forEach((acount) => {
        if (
          acount.ClaveObservacion === BureauStatus.CUENTA_LS ||
          acount.ClaveObservacion === BureauStatus.CUENTA_CORRIENTE ||
          acount.ClaveObservacion === BureauStatus.CUENTA_COBRANZA ||
          acount.ClaveObservacion === BureauStatus.CUENTA_CERRADA ||
          acount.ClaveObservacion === undefined
        ) {
          //IF VALID ACCOUNTS
          //Check for period without paying an account
          if (
            acount.FormaPagoActual === "03" ||
            acount.FormaPagoActual === "04" ||
            acount.FormaPagoActual === "05" ||
            acount.FormaPagoActual === "06" ||
            acount.FormaPagoActual === "07" ||
            acount.FormaPagoActual === "96" ||
            acount.FormaPagoActual === "97" ||
            acount.FormaPagoActual === "99"
          ) {
            throw "Break";
          } else {
            mops = 0;
          }
        } else {
          //DIRECTLY TO 9
          throw "Break";
        }
      });
    } catch (e) {
      //DIRECTLY TO 9
      if (e === "Break") mops = 9;
      else throw e;
    }
  }

  return Number(mops.toFixed(2));
}

function getScoreBC(creditBureau: any, userId: string) {
  const user = constUser;
  if (
    null !== creditBureau.ScoreBuroCredito &&
    0 !== creditBureau.ScoreBuroCredito.ScoreBC?.length
  ) {
    const scores: Array<any> = creditBureau.ScoreBuroCredito.ScoreBC;
    let userReasonCodes: any[] = [];
    const scoreBC = scores.find(
      (element) => ReportingCodes.BC_SCORE === element.CodigoScore
    );
    const scoreEstimateDue = scores.find(
      (element) => ReportingCodes.ESTIMATE_DUE === element.CodigoScore
    );
    const scoreIcc = scores.find(
      (element) => ReportingCodes.ICC === element.CodigoScore
    );
    const scoreNoHit = scores.find(
      (element) => ReportingCodes.SCORE_NO_HIT === element.CodigoScore
    );
    if (undefined !== scoreBC) {
      const valueScore =
        "" !== scoreBC.ValorScore && undefined !== scoreBC.ValorScore
          ? Number(scoreBC.ValorScore)
          : -1;
      scoreBC.CodigoRazon?.forEach((code: any) => {
        const reasonCode = reasonCodes.find(
          (element) => Number(element.value) === Number(code)
        );
        if (undefined !== reasonCode) userReasonCodes.push(reasonCode);
      });
      user.creditBureauScore["valueScore"] = valueScore;
      user.creditBureauScore["reasonCodes"] = userReasonCodes;
      user.creditBureauScore["valueScoreNoHit"] = -1;
    }
    if (undefined !== scoreEstimateDue) {
      const scoreEstimateDueValue =
        "" !== scoreEstimateDue.ValorScore &&
        undefined !== scoreEstimateDue.ValorScore
          ? Number(scoreEstimateDue.ValorScore)
          : -1;
      user.creditBureauScore["estimateDue"] = scoreEstimateDueValue;
    }
    if (undefined !== scoreIcc) {
      const scoreIccValue =
        "" !== scoreIcc.ValorScore && undefined !== scoreIcc.ValorScore
          ? Number(scoreIcc.ValorScore)
          : -1;
      user.creditBureauScore["icc"] = scoreIccValue;
    }
    if (undefined !== scoreNoHit && undefined === scoreBC) {
      const scoreNoHitValue =
        "" !== scoreNoHit.ValorScore && undefined !== scoreNoHit.ValorScore
          ? Number(scoreNoHit.ValorScore)
          : -1;
      user.creditBureauScore["valueScoreNoHit"] = scoreNoHitValue;
      user.creditBureauScore["valueScore"] = -1;
    }
  }

  if (
    null !== creditBureau.Cuentas &&
    undefined !== creditBureau.Cuentas?.Cuenta &&
    0 !== creditBureau.Cuentas.Cuenta?.length
  ) {
    const accounts: Array<any> = creditBureau.Cuentas.Cuenta;
    const resume = creditBureau.ResumenReporte.ResumenReporte[0];
    //filtro cuentas MOp1
    const accsOnMop1 = accounts.filter(
      (acc) => acc.FormaPagoActual === "01" && !acc.FechaCierreCuenta
    ).length;

    const observationKeys = accounts
      .map((d) => d.ClaveObservacion)
      .filter((d) => d !== undefined);
    //const totalSaldosActualesPagosFijos = Number(resume.TotalSaldosActualesPagosFijos?.replace(/[^0-9]/, "")) ?? 0
    const totalSaldosVencidosPagosFijos =
      Number(resume.TotalSaldosVencidosPagosFijos?.replace(/[^0-9]/, "")) ?? -1;
    //const totalSaldosActualesRevolventes = Number(resume.TotalSaldosActualesRevolventes?.replace(/[^0-9]/, "")) ?? 0
    const totalSaldosVencidosRevolventes =
      Number(resume.TotalSaldosVencidosRevolventes?.replace(/[^0-9]/, "")) ??
      -1;
    const startDate = moment();
    const endDate = moment().subtract(6, "months");
    let amountPay = -1;
    let balanceDue =
      totalSaldosVencidosPagosFijos + totalSaldosVencidosRevolventes;
    // restar numero de cuentas menos cuentas cerradas
    let activeAccounts =
      Number(resume.NumeroCuentas) - Number(resume.CuentasCerradas);

    accounts.reduce((accumulator, account, index) => {
      const validAccType = Boolean(
        Object.values(account).includes(BureauStatus.CUENTA_CD) ||
          Object.values(account).includes(BureauStatus.CUENTA_CV) ||
          Object.values(account).includes(BureauStatus.CUENTA_CORRIENTE)
      );

      const accountUpdateDate = account.FechaActualizacion;
      const accountDate = moment(
        `${accountUpdateDate.slice(0, 2)}-${accountUpdateDate.slice(
          2,
          4
        )}-${accountUpdateDate.slice(4)}`,
        "DD-MM-YYYY"
      );
      if (accountDate.isBetween(endDate, startDate) && validAccType) {
        amountPay +=
          "" !== account.MontoPagar && undefined !== account.MontoPagar
            ? Number(account.MontoPagar)
            : -1;

        return accumulator + 1;
      }
      return accumulator;
    }, 0);

    if (
      undefined === activeAccounts ||
      null === activeAccounts ||
      0 === activeAccounts
    )
      activeAccounts = -1;
    user.creditBureauScore["activeAccounts"] = activeAccounts;
    user.creditBureauScore["amountPay"] = amountPay < 0 ? -1 : amountPay;
    user.creditBureauScore["balanceDue"] = balanceDue < 0 ? -1 : balanceDue;
    user.creditBureauScore["mops"] = getMops(accounts);
    user.creditBureauScore["observationKeys"] = observationKeys;
    user.creditBureauScore["percentageAccsOnMop1"] =
      ((accsOnMop1 * 100) / activeAccounts).toFixed(2) ?? -1;
  }

  let hasDeathDate = false;
  if (
    undefined !== creditBureau.Nombre.FechaDefuncion &&
    "" !== creditBureau.Nombre.FechaDefuncion
  ) {
    const date = creditBureau.Nombre.FechaDefuncion;
    const deathDate = moment(
      `${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4)}`,
      "DD-MM-YYYY"
    );
    if (deathDate.isValid()) hasDeathDate = true;
  }
  user.creditBureauScore["hasDeathDate"] = hasDeathDate ? 1 : -1;

  if (
    null !== creditBureau.ResumenReporte &&
    0 !== creditBureau.ResumenReporte.ResumenReporte?.length &&
    "" !== creditBureau.ResumenReporte.ResumenReporte[0]?.FechaIngresoBD
  ) {
    const resumedReport = creditBureau.ResumenReporte.ResumenReporte[0];
    const date = resumedReport.FechaIngresoBD;
    const AccDate = resumedReport.FechaAperturaCuentaMasReciente;

    const registrationDate = moment(
      `${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4)}`,
      "DD-MM-YYYY"
    );
    const parsedAccDate = moment(
      `${AccDate.slice(0, 2)}-${AccDate.slice(2, 4)}-${AccDate.slice(4)}`,
      "DD-MM-YYYY"
    );
    const currentDate = moment();
    const creditBureauExperience = currentDate.diff(registrationDate, "months");
    const diffLastOpenedAccDate = currentDate.diff(parsedAccDate, "months");
    user.creditBureauScore["creditBureauExperience"] =
      creditBureauExperience ?? -1;
    user.creditBureauScore["closedAccounts"] =
      Number(resumedReport.CuentasCerradas) ?? -1;
    user.creditBureauScore["negativePaymentAccs"] =
      Number(resumedReport.CuentasClavesHistoriaNegativa) ?? -1;
    user.creditBureauScore["differenceLastOpenedAcc"] =
      diffLastOpenedAccDate ?? -1;
    user.creditBureauScore["last6MonthsRequestsTotal"] =
      Number(resumedReport.NumeroSolicitudesUltimos6Meses) ?? -1;
  }

  if (
    null !== creditBureau.ConsultasEfectuadas &&
    undefined !== creditBureau.ConsultasEfectuadas.ConsultaEfectuada &&
    0 !== creditBureau.ConsultasEfectuadas.ConsultaEfectuada?.length
  ) {
    const creditBureauRequest: Array<any> =
      creditBureau.ConsultasEfectuadas.ConsultaEfectuada;
    const currentDate = moment();
    const weekNumber = currentDate.isoWeek();
    const startWeekDate = moment(`${currentDate.year()}`)
      .add(weekNumber, "weeks")
      .startOf("isoWeek");
    let consultationsNumber = creditBureauRequest.reduce(
      (accumulator, consultation) => {
        const consultationDate = moment(
          `${consultation.FechaConsulta.slice(
            0,
            2
          )}-${consultation.FechaConsulta.slice(
            2,
            4
          )}-${consultation.FechaConsulta.slice(4)}`,
          "DD-MM-YYYY"
        );
        if (consultationDate.isBetween(startWeekDate, currentDate)) {
          return accumulator + 1;
        }
        return accumulator;
      },
      0
    );
    if (
      undefined === consultationsNumber ||
      null === consultationsNumber ||
      0 === consultationsNumber
    )
      consultationsNumber = -1;
    user.creditBureauScore["consultationsNumber"] = consultationsNumber;
  }

  return user;
}

const score = getScoreBC(creditBureau, "123");

document.getElementById("app").innerHTML = `
<h1>Test de Buro de Credito!!</h1>
<div>
${JSON.stringify(score)}
</div>`;
