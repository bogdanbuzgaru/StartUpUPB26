import { OFFICIAL, OFFICIAL_CAMPAIGN_URL, TEAM_CODE } from "./facts";
import { formatLei } from "./format";
import type { Lang } from "./dictionary";

export const AMBASSADOR_CHANNELS = ["linkedin", "whatsapp", "email"] as const;
export type AmbassadorChannel = (typeof AMBASSADOR_CHANNELS)[number];

const P1 = formatLei(OFFICIAL.phase1Ron);
const TOTAL = formatLei(OFFICIAL.totalInvestmentRon);

/**
 * Builds a factual, pressure-free ambassador message. The message language is chosen
 * independently of the UI language, and only verified official figures are used.
 */
export function buildAmbassadorMessage(
  lang: Lang,
  channel: AmbassadorChannel,
  amount: string,
  pct: string,
): string {
  if (lang === "ro") {
    if (channel === "whatsapp") {
      return `Salut! Fundația HIPOLITECH are o campanie pentru un nou cămin al studenților POLITEHNICA: „Un loc în cămin poate schimba un destin!”.\n\nPrima etapă (proiectare, avize, autorizații) e estimată de Fundație la ${P1}. Într-un prototip educațional (Cod Echipă: ${TEAM_CODE}) am calculat că ${amount} ar însemna ${pct} din această etapă.\n\nDacă vrei să afli mai multe, pagina oficială e aici — decizia îți aparține în întregime: ${OFFICIAL_CAMPAIGN_URL}`;
    }
    if (channel === "email") {
      return `Subiect: Campania HIPOLITECH „Un loc în cămin poate schimba un destin!”\n\nBună ziua,\n\nVă scriu pentru a vă semnala campania Fundației HIPOLITECH pentru un nou cămin destinat studenților Universității Politehnica din București.\n\nConform estimărilor publicate de Fundație:\n- Faza 1 (proiectare, avize, autorizații): ${P1}\n- Investiția totală estimată: ${TOTAL}\n- Beneficiari prioritari: studenți cu rezultate academice deosebite și studenți cu nevoi financiare.\n\nÎntr-un prototip educațional (Cod Echipă: ${TEAM_CODE}) am simulat o contribuție de ${amount}, adică ${pct} din Faza 1. O contribuție nu este asociată unui loc, unei camere sau unui pat anume.\n\nInformații și donații oficiale: ${OFFICIAL_CAMPAIGN_URL}\n\nCu stimă,`;
    }
    return `Susțin campania Fundației HIPOLITECH „Un loc în cămin poate schimba un destin!”.\n\nPrima etapă — proiectare, avize și autorizații — este estimată de Fundație la ${P1}, dintr-o investiție totală estimată la ${TOTAL}. Noul cămin vizează cu prioritate studenți cu rezultate academice deosebite și studenți cu nevoi financiare.\n\nÎntr-un prototip educațional (Cod Echipă: ${TEAM_CODE}) am simulat o contribuție de ${amount}, adică ${pct} din Faza 1. Fiecare decide liber dacă și cât contribuie.\n\nInformații și donații oficiale: ${OFFICIAL_CAMPAIGN_URL}\n\n#POLITEHNICA #HIPOLITECH #UPB`;
  }

  if (channel === "whatsapp") {
    return `Hi! The HIPOLITECH Foundation is running a campaign for a new POLITEHNICA Bucharest student dormitory: “A place in a dorm can change a destiny!” („Un loc în cămin poate schimba un destin!”).\n\nThe first stage (design, approvals, permits) is estimated by the Foundation at ${P1}. In an educational prototype (Team Code: ${TEAM_CODE}) I worked out that ${amount} would be ${pct} of that stage.\n\nIf you'd like to know more, here is the official page — the decision is entirely yours: ${OFFICIAL_CAMPAIGN_URL}`;
  }
  if (channel === "email") {
    return `Subject: HIPOLITECH campaign “A place in a dorm can change a destiny!”\n\nHello,\n\nI'm writing to point you to the HIPOLITECH Foundation campaign for a new dormitory for students of the National University of Science and Technology POLITEHNICA Bucharest.\n\nAccording to the estimates published by the Foundation:\n- Phase 1 (design, approvals, permits): ${P1}\n- Estimated total investment: ${TOTAL}\n- Priority beneficiaries: students with outstanding academic results and students with financial needs.\n\nIn an educational prototype (Team Code: ${TEAM_CODE}) I simulated a contribution of ${amount}, i.e. ${pct} of Phase 1. A contribution is not tied to any specific place, room or bed.\n\nOfficial information and donations: ${OFFICIAL_CAMPAIGN_URL}\n\nKind regards,`;
  }
  return `I support the HIPOLITECH Foundation campaign “A place in a dorm can change a destiny!” („Un loc în cămin poate schimba un destin!”).\n\nThe first stage — design, approvals and permits — is estimated by the Foundation at ${P1}, out of an estimated total investment of ${TOTAL}. The new dormitory prioritises students with outstanding academic results and students with financial needs.\n\nIn an educational prototype (Team Code: ${TEAM_CODE}) I simulated a contribution of ${amount}, i.e. ${pct} of Phase 1. Everyone is free to decide whether and how much to contribute.\n\nOfficial information and donations: ${OFFICIAL_CAMPAIGN_URL}\n\n#POLITEHNICA #HIPOLITECH #UPB`;
}
