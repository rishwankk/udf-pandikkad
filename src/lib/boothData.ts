export interface BoothObserver {
  booth: number;
  boothName: string;
  observer: string;
  contact: string;
  ward?: string;
}

export const boothData: BoothObserver[] = [
  { booth: 51, boothName: "GLPS PUKKOOTH", observer: "NISAR POOLAMANNA", contact: "9746076040", ward: "Pukkooth" },
  { booth: 52, boothName: "GLPS PUKKOOTH", observer: "SUNEER POOLAMANNA STU", contact: "9446134793", ward: "Pukkooth" },
  { booth: 53, boothName: "GLPS PUKKOOTH", observer: "FAROOK ODOMPATTA", contact: "7994459167", ward: "Pukkooth" },
  { booth: 54, boothName: "GLPS PUKKOOTH", observer: "SHIHAB FAISY", contact: "9495492584", ward: "Pukkooth" },
  { booth: 55, boothName: "GLPS PUKKOOTH", observer: "SUNEER KUNJU", contact: "9447845540", ward: "Pukkooth" },
  { booth: 56, boothName: "CMLPS PANDIKKAD", observer: "SHAMEEM PAYYAPARAMBU", contact: "7510720285", ward: "Pandikkad" },
  { booth: 57, boothName: "CMLPS PANDIKKAD", observer: "IRSHAD PAPPY", contact: "9995336618", ward: "Pandikkad" },
  { booth: 58, boothName: "CMLPS PANDIKKAD", observer: "SAFWAN VAHABI", contact: "9744800313", ward: "Pandikkad" },
  { booth: 59, boothName: "ALPS PANDIKKAD", observer: "MUNEES KUYIKKATTU PARAMB", contact: "8113818053", ward: "Pandikkad" },
  { booth: 60, boothName: "GHSS PANDIKKAD", observer: "NAJI KALANKAVU", contact: "8943693916", ward: "Pandikkad" },
  { booth: 61, boothName: "GHSS PANDIKKAD", observer: "SHAHLAN VALLIKA PARAMB", contact: "9895473279", ward: "Pandikkad" },
  { booth: 62, boothName: "PRATHIKSHA DAY CARE", observer: "SINAN VALARAD", contact: "7902300357", ward: "Pandikkad" },
  { booth: 63, boothName: "PRATHIKSHA DAY CARE", observer: "KAMARUDHEEN VALARAD", contact: "8943992633", ward: "Pandikkad" },
  { booth: 64, boothName: "GMLP PANDIKKAD", observer: "ASHIK VALARAD", contact: "7592087693", ward: "Pandikkad" },
  { booth: 65, boothName: "SHANKARA MOOSATH PANDIIKAD", observer: "ASIL VALARAD", contact: "7025970051", ward: "Pandikkad" },
  { booth: 66, boothName: "SHANKARA MOOSATH PANDIIKAD", observer: "FIROS KHAN POOLAMANNA", contact: "6282606885", ward: "Pandikkad" },
  { booth: 67, boothName: "GMLPS KODASSERI", observer: "SIDHEEK KARAYA", contact: "9846512728", ward: "Kodasseri" },
  { booth: 68, boothName: "GMLPS KODASSERI", observer: "NISHAD KALANKAV", contact: "9645425229", ward: "Kodasseri" },
  { booth: 69, boothName: "GMLPS KODASSERI", observer: "UNAIS KUYIKKATTU PARAMB", contact: "9947610041", ward: "Kodasseri" },
  { booth: 70, boothName: "GMLPS KODASSERI", observer: "RINSHAD VAPPANU", contact: "9961411459", ward: "Kodasseri" },
  { booth: 71, boothName: "AUPS CHEMBRASSERI", observer: "JASHIR MARATTAPADI", contact: "9946282198", ward: "Chembrasseri" },
  { booth: 72, boothName: "AUPS CHEMBRASSERI", observer: "SAFWAN PULIKKAL PARAMB", contact: "8606679850", ward: "Chembrasseri" },
  { booth: 73, boothName: "AUPS CHEMBRASSERI", observer: "RIYAS KARATTAL", contact: "8606637994", ward: "Chembrasseri" },
  { booth: 74, boothName: "GMPLS ODOMPATTA", observer: "SUNIL MARATTAPADI", contact: "8086380910", ward: "Odompatta" },
  { booth: 75, boothName: "GMPLS ODOMPATTA", observer: "JISHAR PULIKKAL PARAMB", contact: "9747764727", ward: "Odompatta" },
  { booth: 76, boothName: "AUPS CHEMBRASSERI", observer: "ADHIL POOLAMANNA", contact: "8301844163", ward: "Chembrasseri" },
  { booth: 77, boothName: "AUPS CHEMBRASSERI", observer: "HASEEB TH", contact: "9746202625", ward: "Chembrasseri" },
  { booth: 78, boothName: "AUPS CHEMBRASSERI", observer: "KAREEM KARSHAKAN", contact: "9630511190", ward: "Chembrasseri" },
  { booth: 79, boothName: "GLPS THEYYAMPADIKKUTH", observer: "MOIDEEN TH", contact: "9447830261", ward: "Theyyampadikkuth" },
  { booth: 80, boothName: "GLPS THEYYAMPADIKKUTH", observer: "JISHAD EK", contact: "9567335059", ward: "Theyyampadikkuth" },
  { booth: 81, boothName: "GMLPS VALARAD", observer: "AJSAL VALLUVANGAD", contact: "9061498135", ward: "Valarad" },
  { booth: 82, boothName: "GMLPS VALARAD", observer: "MANSOOR VALLUVANGAD", contact: "9447597372", ward: "Valarad" },
  { booth: 83, boothName: "GLPS VETTIKKATTIRI", observer: "BASITH VALARAD", contact: "9745201271", ward: "Vettikkattiri" },
  { booth: 84, boothName: "GLPS VETTIKKATTIRI", observer: "UBAID PARAMBAN POOLA", contact: "9562959505", ward: "Vettikkattiri" },
  { booth: 85, boothName: "GLPS VETTIKKATTIRI", observer: "DILSHAJ VALLUVANGAD", contact: "94473769301", ward: "Vettikkattiri" },
  { booth: 86, boothName: "AMLPS VELLUVANGAD SOUTH", observer: "JABIR VETTIKKATIRI", contact: "9048266714", ward: "Velluvangad" },
  { booth: 87, boothName: "AMLPS VELLUVANGAD SOUTH", observer: "SHADHIL THAMBANAGADI", contact: "7034585624", ward: "Velluvangad" },
  { booth: 88, boothName: "AMLPS VELLUVANGAD SOUTH", observer: "FASAL VALANI", contact: "9483425936", ward: "Velluvangad" },
  { booth: 89, boothName: "AMLPS VELLUVANGAD NORHT", observer: "SALMAN THARIPADI", contact: "7306432411", ward: "Velluvangad" },
  { booth: 90, boothName: "AMLPS VELLUVANGAD NORHT", observer: "SALEEM NADUKKUNDU", contact: "9495488773", ward: "Velluvangad" },
  { booth: 91, boothName: "AMLPS VELLUVANGAD NORHT", observer: "SHAREEF VALLUVANGAD", contact: "7736172111", ward: "Velluvangad" },
  { booth: 92, boothName: "ALPS MANDAKAKKKUNNU", observer: "SHIHAB VALLUVANGAD", contact: "8943035973", ward: "Mandakakkkunnu" },
  { booth: 93, boothName: "ALPS MANDAKAKKKUNNU", observer: "USMAN FAISY", contact: "9745763151", ward: "Mandakakkkunnu" },
  { booth: 94, boothName: "GMUPS VETTIKKATTIRI", observer: "SAINU MANDAKA KUNNU", contact: "8848862527", ward: "Vettikkattiri" },
  { booth: 95, boothName: "GMUPS VETTIKKATTIRI", observer: "HANEEFA VALARAD", contact: "9061657909", ward: "Vettikkattiri" },
  { booth: 96, boothName: "ALPS PODIYATT", observer: "NASEER MANGOD", contact: "9072418448", ward: "Podiyatt" },
  { booth: 97, boothName: "ALPS PODIYATT", observer: "JALEEL MASTER VALLUVANGAD", contact: "9809032714", ward: "Podiyatt" },
];

export function getBoothByNumber(booth: number): BoothObserver | undefined {
  return boothData.find((b) => b.booth === booth);
}

export const wards = [...new Set(boothData.map((b) => b.ward))];
