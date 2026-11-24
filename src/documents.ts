// An ID stamp in words, as Your checks shows it, from three of its facts, Didit's own fields (the
// verifier's README, The stamp): the kind of document (`document_type`: "Identity Card" is "ID card",
// "Passport" is "Passport"), the country that issued it (`issuing_state`, ISO 3166's three letters,
// named as the device's browser names a country, in English: MEX is Mexico) and when it runs out
// (`expiration_date`, its year: until 2031). A kind or a country it doesn't know reads as it was
// written.

import type { IdShown } from './device.ts'

/** ISO 3166's three-letter codes, each with its two-letter one, which a browser names (Intl.DisplayNames); Kosovo's as Didit and the ICAO write it. */
const TWO = Object.fromEntries(
  (
    'AFG AF ALA AX ALB AL DZA DZ ASM AS AND AD AGO AO AIA AI ATA AQ ATG AG ARG AR ARM AM ABW AW AUS AU AUT AT AZE AZ BHS BS BHR BH ' +
    'BGD BD BRB BB BLR BY BEL BE BLZ BZ BEN BJ BMU BM BTN BT BOL BO BES BQ BIH BA BWA BW BVT BV BRA BR IOT IO BRN BN BGR BG BFA BF ' +
    'BDI BI CPV CV KHM KH CMR CM CAN CA CYM KY CAF CF TCD TD CHL CL CHN CN CXR CX CCK CC COL CO COM KM COG CG COD CD COK CK CRI CR ' +
    'CIV CI HRV HR CUB CU CUW CW CYP CY CZE CZ DNK DK DJI DJ DMA DM DOM DO ECU EC EGY EG SLV SV GNQ GQ ERI ER EST EE SWZ SZ ETH ET ' +
    'FLK FK FRO FO FJI FJ FIN FI FRA FR GUF GF PYF PF ATF TF GAB GA GMB GM GEO GE DEU DE GHA GH GIB GI GRC GR GRL GL GRD GD GLP GP ' +
    'GUM GU GTM GT GGY GG GIN GN GNB GW GUY GY HTI HT HMD HM VAT VA HND HN HKG HK HUN HU ISL IS IND IN IDN ID IRN IR IRQ IQ IRL IE ' +
    'IMN IM ISR IL ITA IT JAM JM JPN JP JEY JE JOR JO KAZ KZ KEN KE KIR KI PRK KP KOR KR KWT KW KGZ KG LAO LA LVA LV LBN LB LSO LS ' +
    'LBR LR LBY LY LIE LI LTU LT LUX LU MAC MO MDG MG MWI MW MYS MY MDV MV MLI ML MLT MT MHL MH MTQ MQ MRT MR MUS MU MYT YT MEX MX ' +
    'FSM FM MDA MD MCO MC MNG MN MNE ME MSR MS MAR MA MOZ MZ MMR MM NAM NA NRU NR NPL NP NLD NL NCL NC NZL NZ NIC NI NER NE NGA NG ' +
    'NIU NU NFK NF MKD MK MNP MP NOR NO OMN OM PAK PK PLW PW PSE PS PAN PA PNG PG PRY PY PER PE PHL PH PCN PN POL PL PRT PT PRI PR ' +
    'QAT QA REU RE ROU RO RUS RU RWA RW BLM BL SHN SH KNA KN LCA LC MAF MF SPM PM VCT VC WSM WS SMR SM STP ST SAU SA SEN SN SRB RS ' +
    'SYC SC SLE SL SGP SG SXM SX SVK SK SVN SI SLB SB SOM SO ZAF ZA SGS GS SSD SS ESP ES LKA LK SDN SD SUR SR SJM SJ SWE SE CHE CH ' +
    'SYR SY TWN TW TJK TJ TZA TZ THA TH TLS TL TGO TG TKL TK TON TO TTO TT TUN TN TUR TR TKM TM TCA TC TUV TV UGA UG UKR UA ARE AE ' +
    'GBR GB USA US UMI UM URY UY UZB UZ VUT VU VEN VE VNM VN VGB VG VIR VI WLF WF ESH EH YEM YE ZMB ZM ZWE ZW XKX XK RKS XK'
  )
    .match(/[A-Z]{3} [A-Z]{2}/g)!
    .map((pair) => pair.split(' ') as [string, string]),
)

/** The country a three-letter code names, as the browser says it in English: MEX is Mexico; a code it doesn't know, as it was written. */
export function countryOf(code: string): string {
  const two = TWO[code.trim().toUpperCase()]
  if (!two) return code
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(two) ?? code
  } catch {
    return code
  }
}

/** A kind of document as people say it: Identity Card is ID card, Passport is Passport, Driver's License is Driver's license; any other with its first letter alone capital. */
export function documentWords(kind: string): string {
  const k = kind.trim().toLowerCase()
  if (/^(identity|id|national id(entity)?)( card)?$/.test(k) || k === 'national identity card') return 'ID card'
  return k.charAt(0).toUpperCase() + k.slice(1)
}

/** An ID stamp's name in Your checks: its kind of document, or ID for one kept without its list. */
export const idName = (id: IdShown) => (id.kind ? documentWords(id.kind) : 'ID')

/** An ID stamp's line in Your checks: its country, then until the year it runs out: Mexico · until 2031; empty for one kept without its list. */
export function idLine(id: IdShown): string {
  const year = id.until && /^\d{4}/.exec(id.until)?.[0]
  return [id.country && countryOf(id.country), year && `until ${year}`].filter(Boolean).join(' · ')
}
