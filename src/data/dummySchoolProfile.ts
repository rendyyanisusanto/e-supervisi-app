import type { SchoolProfile } from '../types/schoolProfile';

export const dummySchoolProfile: SchoolProfile = {
  id: 1,
  name: "SMK IT Asy-Syadzili",
  npsn: "20500000",
  address: "Jl. Pesantren No. 1, Malang",
  phone: "081234567890",
  email: "info@smkitasy-syadzili.sch.id",
  website: "https://smkitasy-syadzili.sch.id",
  principalName: "Drs. Budi Raharjo, M.Si.",
  principalNip: "197502102000031005",
  curriculumName: "Siti Aminah, M.Pd.",
  curriculumNip: "198005122005012003",
  city: "Malang",
  province: "Jawa Timur",
  reportFooter: "Dokumen ini dicetak melalui Sistem E-Supervisi SMK.",
  updatedAt: new Date().toISOString()
};
