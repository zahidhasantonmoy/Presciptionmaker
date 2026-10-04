// ─────────────────────────────────────────────────────────────────────────────
// EasyPad – Clinical Safety & Drug Alert Utilities
// ─────────────────────────────────────────────────────────────────────────────

interface AllergyGroup {
  name: string;
  aliases: string[];
  drugs: string[];
  warningBn: string;
}

const ALLERGY_GROUPS: AllergyGroup[] = [
  {
    name: 'Penicillins',
    aliases: ['penicillin', 'penicilin', 'amoxicillin', 'amoxil', 'ampicillin', 'moxaclav', 'augmentin'],
    drugs: ['amoxicillin', 'moxaclav', 'ampicillin', 'augmentin', 'cloxacillin', 'flucloxacillin', 'penicillin', 'penimax'],
    warningBn: 'রোগীর পেনিসিলিন গ্রুপে অ্যালার্জির রেকর্ড রয়েছে!',
  },
  {
    name: 'Cephalosporins',
    aliases: ['cephalosporin', 'cefixime', 'ceftriaxone', 'cef-3', 'cefuroxime', 'seclo'],
    drugs: ['cef-3', 'cefixime', 'ceftriaxone', 'cefuroxime', 'cephalexin', 'cefaclor', 'cefepime', 'cefpodoxime'],
    warningBn: 'রোগীর সেফালোস্পোরিন গ্রুপে অ্যালার্জির রেকর্ড রয়েছে!',
  },
  {
    name: 'NSAIDs / Painkillers',
    aliases: ['nsaid', 'nsaids', 'aspirin', 'painkiller', 'pain killer', 'naproxen', 'ibuprofen', 'diclofenac'],
    drugs: ['naprosyn', 'naproxen', 'torax', 'ketorolac', 'diclofenac', 'ibuprofen', 'aceclofenac', 'indomethacin', 'meloxicam', 'aspirin', 'disprin', 'ecospirin', 'anadol'],
    warningBn: 'রোগীর ব্যথানাশক / এনএসএআইডি (NSAIDs) ওষুধে অ্যালার্জির রেকর্ড রয়েছে!',
  },
  {
    name: 'Sulfa Drugs',
    aliases: ['sulfa', 'sulphonamide', 'sulfonamide', 'cotrimoxazole', 'bactrim'],
    drugs: ['cotrimoxazole', 'sulfamethoxazole', 'bactrim', 'sulfasalazine'],
    warningBn: 'রোগীর সালফা গ্রুপে অ্যালার্জির রেকর্ড রয়েছে!',
  },
  {
    name: 'Quinolones',
    aliases: ['quinolone', 'ciprofloxacin', 'levofloxacin'],
    drugs: ['ciprocin', 'ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'ofloxacin'],
    warningBn: 'রোগীর কুইনোলোন অ্যান্টিবায়োটিক গ্রুপে অ্যালার্জির রেকর্ড রয়েছে!',
  },
  {
    name: 'Paracetamol',
    aliases: ['paracetamol', 'napa', 'ace', 'acetaminophen'],
    drugs: ['napa', 'ace', 'paracetamol', 'acetaminophen', 'reset', 'pyralgin', 'fast'],
    warningBn: 'রোগীর প্যারাসিটামলে অ্যালার্জির রেকর্ড রয়েছে!',
  },
];

export interface AllergyAlert {
  hasAlert: boolean;
  groupName?: string;
  warningEn?: string;
  warningBn?: string;
}

export function checkDrugAllergy(
  medicineName: string,
  genericName?: string,
  patientAllergies?: string
): AllergyAlert {
  if (!patientAllergies || !patientAllergies.trim() || !medicineName) {
    return { hasAlert: false };
  }

  const patientAllergyText = patientAllergies.toLowerCase();
  const medText = `${medicineName} ${genericName ?? ''}`.toLowerCase();

  for (const group of ALLERGY_GROUPS) {
    const isPatientAllergicToGroup = group.aliases.some(alias => patientAllergyText.includes(alias));
    if (!isPatientAllergicToGroup) continue;

    const isMedInGroup = group.drugs.some(drug => medText.includes(drug));
    if (isMedInGroup) {
      return {
        hasAlert: true,
        groupName: group.name,
        warningEn: `⚠️ Allergy Warning: Patient is allergic to ${group.name}!`,
        warningBn: group.warningBn,
      };
    }
  }

  return { hasAlert: false };
}

// ─── Pregnancy Safety ────────────────────────────────────────────────────────
export interface PregnancySafetyInfo {
  category: 'A' | 'B' | 'C' | 'D' | 'X' | 'Unknown';
  level: 'safe' | 'caution' | 'danger' | 'unknown';
  warningEn?: string;
  warningBn?: string;
}

export function getPregnancySafety(
  medicineName: string,
  genericName?: string
): PregnancySafetyInfo {
  const text = `${medicineName} ${genericName ?? ''}`.toLowerCase();

  // Category X (Absolute Contraindication)
  if (
    text.includes('methotrexate') ||
    text.includes('isotretinoin') ||
    text.includes('warfarin') ||
    text.includes('thalidomide')
  ) {
    return {
      category: 'X',
      level: 'danger',
      warningEn: 'Category X: Strictly contraindicated in pregnancy (teratogenic)!',
      warningBn: 'গর্ভকালীন সময়ে এই ওষুধ সম্পূর্ণ নিষিদ্ধ (Category X)!',
    };
  }

  // Category D (Positive evidence of human fetal risk, e.g. ACEi / ARBs)
  if (
    text.includes('losartan') ||
    text.includes('olmesartan') ||
    text.includes('bizoran') ||
    text.includes('camlosart') ||
    text.includes('enalapril') ||
    text.includes('ramipril') ||
    text.includes('doxycycline') ||
    text.includes('tetracycline') ||
    text.includes('clonazepam') ||
    text.includes('rivotril') ||
    text.includes('disopan')
  ) {
    return {
      category: 'D',
      level: 'danger',
      warningEn: 'Category D: Potential fetal risk. Avoid in pregnancy, especially 2nd/3rd trimester!',
      warningBn: 'গর্ভকালীন সময়ে ঝুঁকিপূর্ণ (Category D)। বিশেষত ২য় ও ৩য় ট্রাইমেস্টারে পরিহার করুন।',
    };
  }

  // Category C (Risk cannot be ruled out)
  if (
    text.includes('ciprofloxacin') ||
    text.includes('ciprocin') ||
    text.includes('tramadol') ||
    text.includes('anadol') ||
    text.includes('fluconazole') ||
    text.includes('amlodipine')
  ) {
    return {
      category: 'C',
      level: 'caution',
      warningEn: 'Category C: Use only if benefit outweighs fetal risk.',
      warningBn: 'সতর্কতা: গর্ভাবস্থায় অত্যন্ত প্রয়োজন ছাড়া ব্যবহার না করাই শ্রেয় (Category C)।',
    };
  }

  // Category B (Presumed safe in pregnancy)
  if (
    text.includes('paracetamol') ||
    text.includes('napa') ||
    text.includes('ace') ||
    text.includes('amoxicillin') ||
    text.includes('moxaclav') ||
    text.includes('cefixime') ||
    text.includes('cef-3') ||
    text.includes('azithromycin') ||
    text.includes('azithrocin') ||
    text.includes('esomeprazole') ||
    text.includes('sergel') ||
    text.includes('maxpro') ||
    text.includes('omeprazole') ||
    text.includes('seclo') ||
    text.includes('montelukast') ||
    text.includes('monas')
  ) {
    return {
      category: 'B',
      level: 'safe',
      warningEn: 'Category B: Generally considered safe during pregnancy.',
      warningBn: 'গর্ভকালীন সময়ে সাধারণত নিরাপদ (Category B)।',
    };
  }

  return { category: 'Unknown', level: 'unknown' };
}
