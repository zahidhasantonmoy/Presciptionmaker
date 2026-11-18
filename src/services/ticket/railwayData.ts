// Comprehensive Bangladesh Railway Master Dataset: All Stations, Intercity & Commuter Trains, Fares & Helpers

export interface RailwayStation {
  name: string;
  nameBn: string;
  code: string;
  district: string;
}

export interface RailwayTrain {
  number: string;
  name: string;
  nameBn: string;
  fromStation: string;
  toStation: string;
  departureTime: string; // HH:mm (24h)
  arrivalTime: string;   // HH:mm (24h)
  offDay: string;
  fares: Record<string, number>;
}

export const RAILWAY_CLASSES: { code: string; label: string; labelBn: string; defaultFare: number }[] = [
  { code: 'S_CHAIR', label: 'S_CHAIR', labelBn: 'শো.চেয়ার', defaultFare: 450 },
  { code: 'SNIGDHA', label: 'SNIGDHA', labelBn: 'স্নিগ্ধা', defaultFare: 865 },
  { code: 'AC_S', label: 'AC_S', labelBn: 'এসি সিট', defaultFare: 1035 },
  { code: 'AC_B', label: 'AC_B', labelBn: 'এসি বার্থ', defaultFare: 1555 },
  { code: 'F_BERTH', label: 'F_BERTH', labelBn: 'এফ_বার্থ', defaultFare: 1100 },
  { code: 'F_SEAT', label: 'F_SEAT', labelBn: 'ফার্স্ট সিট', defaultFare: 750 },
  { code: 'SHOVON', label: 'SHOVON', labelBn: 'শোভন', defaultFare: 375 },
  { code: 'AC_CHAIR', label: 'AC_CHAIR', labelBn: 'এসি চেয়ার', defaultFare: 865 },
  { code: 'SHULOV', label: 'SHULOV', labelBn: 'সুলভ', defaultFare: 180 },
];

export const RAILWAY_STATIONS: RailwayStation[] = [
  // Dhaka Division
  { name: 'Dhaka', nameBn: 'ঢাকা', code: 'DA', district: 'Dhaka' },
  { name: 'Dhaka Biman Bandar', nameBn: 'ঢাকা বিমান বন্দর', code: 'BBA', district: 'Dhaka' },
  { name: 'Dhaka Cantonment', nameBn: 'ঢাকা ক্যান্টনমেন্ট', code: 'DAC', district: 'Dhaka' },
  { name: 'Tejgaon', nameBn: 'তেজগাঁও', code: 'TJG', district: 'Dhaka' },
  { name: 'Gandaria', nameBn: 'গেন্ডারিয়া', code: 'GDA', district: 'Dhaka' },
  { name: 'Tongi', nameBn: 'টঙ্গী', code: 'TGI', district: 'Gazipur' },
  { name: 'Joydebpur', nameBn: 'জয়দেবপুর', code: 'JDP', district: 'Gazipur' },
  { name: 'Gazipur', nameBn: 'গাজীপুর', code: 'GZP', district: 'Gazipur' },
  { name: 'Narsingdi', nameBn: 'নরসিংদী', code: 'NSD', district: 'Narsingdi' },
  { name: 'Ghorashal', nameBn: 'ঘোড়াশাল', code: 'GHS', district: 'Narsingdi' },
  { name: 'Methikanda', nameBn: 'মেথিকান্দা', code: 'MKD', district: 'Narsingdi' },
  { name: 'Bhairab Bazar', nameBn: 'ভৈরব বাজার', code: 'BBR', district: 'Kishoreganj' },
  { name: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', code: 'KSG', district: 'Kishoreganj' },
  { name: 'Kuliarchar', nameBn: 'কুলিয়ারচর', code: 'KLC', district: 'Kishoreganj' },
  { name: 'Bajitpur', nameBn: 'বাজিতপুর', code: 'BJP', district: 'Kishoreganj' },
  { name: 'Sararchar', nameBn: 'সরারচর', code: 'SRC', district: 'Kishoreganj' },
  { name: 'Manikkhali', nameBn: 'মানিকখালী', code: 'MKL', district: 'Kishoreganj' },
  { name: 'Tangail', nameBn: 'টাঙ্গাইল', code: 'TG', district: 'Tangail' },
  { name: 'Mirzapur', nameBn: 'মির্জাপুর', code: 'MZP', district: 'Tangail' },
  { name: 'Bangabandhu Setu East', nameBn: 'বঙ্গবন্ধু সেতু পূর্ব', code: 'BBE', district: 'Tangail' },
  { name: 'Bangabandhu Setu West', nameBn: 'বঙ্গবন্ধু সেতু পশ্চিম', code: 'BBW', district: 'Sirajganj' },
  { name: 'Faridpur', nameBn: 'ফরিদপুর', code: 'FDP', district: 'Faridpur' },
  { name: 'Bhanga', nameBn: 'ভাঙ্গা', code: 'BNG', district: 'Faridpur' },
  { name: 'Bhanga Junction', nameBn: 'ভাঙ্গা জংশন', code: 'BNJ', district: 'Faridpur' },
  { name: 'Rajbari', nameBn: 'রাজবাড়ী', code: 'RJB', district: 'Rajbari' },
  { name: 'Pangsha', nameBn: 'পাংশা', code: 'PGS', district: 'Rajbari' },
  { name: 'Goalando Ghat', nameBn: 'গোয়ালন্দ ঘাট', code: 'GLG', district: 'Rajbari' },
  { name: 'Padma', nameBn: 'পদ্মা', code: 'PDM', district: 'Munshiganj' },
  { name: 'Mawa', nameBn: 'মাওয়া', code: 'MWA', district: 'Munshiganj' },
  { name: 'Shibchar', nameBn: 'শিবচর', code: 'SBC', district: 'Madaripur' },
  { name: 'Madaripur', nameBn: 'মাদারীপুর', code: 'MDP', district: 'Madaripur' },
  { name: 'Gopalganj', nameBn: 'গোপালগঞ্জ', code: 'GPJ', district: 'Gopalganj' },
  { name: 'Kashiani Junction', nameBn: 'কাশিয়ানী জংশন', code: 'KSJ', district: 'Gopalganj' },

  // Chittagong Division
  { name: 'Chittagong', nameBn: 'চট্টগ্রাম', code: 'CG', district: 'Chittagong' },
  { name: 'Chattogram Cantonment', nameBn: 'চট্টগ্রাম ক্যান্টনমেন্ট', code: 'CGC', district: 'Chittagong' },
  { name: 'Sitakunda', nameBn: 'সীতাকুণ্ড', code: 'SKD', district: 'Chittagong' },
  { name: 'Mirsharai', nameBn: 'মীরসরাই', code: 'MSR', district: 'Chittagong' },
  { name: 'Baraiyarhat', nameBn: 'বারৈয়ারহাট', code: 'BYH', district: 'Chittagong' },
  { name: 'Dohazari', nameBn: 'দোহাজারী', code: 'DHZ', district: 'Chittagong' },
  { name: 'Lohagara', nameBn: 'লোহাগাড়া', code: 'LHG', district: 'Chittagong' },
  { name: 'Harbang', nameBn: 'হারবাং', code: 'HBG', district: 'Cox\'s Bazar' },
  { name: 'Chakaria', nameBn: 'চকোরিয়া', code: 'CKR', district: 'Cox\'s Bazar' },
  { name: 'Dulahazra', nameBn: 'ডুলাহাজরা', code: 'DLH', district: 'Cox\'s Bazar' },
  { name: 'Islamabad', nameBn: 'ইসলামাবাদ', code: 'ISL', district: 'Cox\'s Bazar' },
  { name: 'Ramu', nameBn: 'রামু', code: 'RMU', district: 'Cox\'s Bazar' },
  { name: 'Cox\'s Bazar', nameBn: 'কক্সবাজার', code: 'CXB', district: 'Cox\'s Bazar' },
  { name: 'Feni', nameBn: 'ফেনী', code: 'FN', district: 'Feni' },
  { name: 'Muhuriganj', nameBn: 'মুহুরীগঞ্জ', code: 'MHG', district: 'Feni' },
  { name: 'Fazilpur', nameBn: 'ফাজিলপুর', code: 'FZP', district: 'Feni' },
  { name: 'Gunabati', nameBn: 'গুণবতী', code: 'GNB', district: 'Cumilla' },
  { name: 'Hasanpur', nameBn: 'হাসানপুর', code: 'HNP', district: 'Cumilla' },
  { name: 'Nangalkot', nameBn: 'নাঙ্গলকোট', code: 'NKT', district: 'Cumilla' },
  { name: 'Laksham', nameBn: 'লাকসাম', code: 'LKM', district: 'Cumilla' },
  { name: 'Cumilla', nameBn: 'কুমিল্লা', code: 'CUM', district: 'Cumilla' },
  { name: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', code: 'BB', district: 'Brahmanbaria' },
  { name: 'Akhaura', nameBn: 'আখাউড়া', code: 'AKH', district: 'Brahmanbaria' },
  { name: 'Kasba', nameBn: 'কসবা', code: 'KSB', district: 'Brahmanbaria' },
  { name: 'Mandabag', nameBn: 'মন্দভাগ', code: 'MDB', district: 'Brahmanbaria' },
  { name: 'Chandpur', nameBn: 'চাঁদপুর', code: 'CDP', district: 'Chandpur' },
  { name: 'Chandpur Court', nameBn: 'চাঁদপুর কোর্ট', code: 'CPC', district: 'Chandpur' },
  { name: 'Hajiganj', nameBn: 'হাজীগঞ্জ', code: 'HJG', district: 'Chandpur' },
  { name: 'Noakhali', nameBn: 'নোয়াখালী', code: 'NKL', district: 'Noakhali' },
  { name: 'Maijdee Court', nameBn: 'মাইজদী কোর্ট', code: 'MJC', district: 'Noakhali' },
  { name: 'Sonaimuri', nameBn: 'সোনাইমুড়ী', code: 'SNM', district: 'Noakhali' },
  { name: 'Chowmuhani', nameBn: 'চৌমুহনী', code: 'CMH', district: 'Noakhali' },

  // Sylhet Division
  { name: 'Sylhet', nameBn: 'সিলেট', code: 'SY', district: 'Sylhet' },
  { name: 'Moglabazar', nameBn: 'মোগলাবাজার', code: 'MGB', district: 'Sylhet' },
  { name: 'Maijgaon', nameBn: 'মাইজগাঁও', code: 'MJG', district: 'Sylhet' },
  { name: 'Kulaura', nameBn: 'কুলাউড়া', code: 'KLR', district: 'Moulvibazar' },
  { name: 'Shamshernagar', nameBn: 'শমশেরনগর', code: 'SMN', district: 'Moulvibazar' },
  { name: 'Bhanugach', nameBn: 'ভানুগাছ', code: 'BNG', district: 'Moulvibazar' },
  { name: 'Srimangal', nameBn: 'শ্রীমঙ্গল', code: 'SMG', district: 'Moulvibazar' },
  { name: 'Shayestaganj', nameBn: 'শায়েস্তাগঞ্জ', code: 'STG', district: 'Habiganj' },
  { name: 'Nayapara', nameBn: 'নয়াপাড়া', code: 'NYP', district: 'Habiganj' },
  { name: 'Mantala', nameBn: 'মনতলা', code: 'MTL', district: 'Habiganj' },
  { name: 'Chhatak Bazar', nameBn: 'ছাতক বাজার', code: 'CTB', district: 'Sunamganj' },

  // Rajshahi Division
  { name: 'Rajshahi', nameBn: 'রাজশাহী', code: 'RJ', district: 'Rajshahi' },
  { name: 'Rajshahi Court', nameBn: 'রাজশাহী কোর্ট', code: 'RJC', district: 'Rajshahi' },
  { name: 'Sardah Road', nameBn: 'সারদা রোড', code: 'SRD', district: 'Rajshahi' },
  { name: 'Abdulpur', nameBn: 'আব্দুলপুর', code: 'ADP', district: 'Natore' },
  { name: 'Natore', nameBn: 'নাটোর', code: 'NTR', district: 'Natore' },
  { name: 'Ishwardi', nameBn: 'ঈশ্বরদী', code: 'ISD', district: 'Pabna' },
  { name: 'Ishwardi Bypass', nameBn: 'ঈশ্বরদী বাইপাস', code: 'IBP', district: 'Pabna' },
  { name: 'Pabna', nameBn: 'পাবনা', code: 'PB', district: 'Pabna' },
  { name: 'Chatmohar', nameBn: 'চাটমোহর', code: 'CTM', district: 'Pabna' },
  { name: 'Pakshi', nameBn: 'পাকশী', code: 'PKS', district: 'Pabna' },
  { name: 'Ullapara', nameBn: 'উল্লাপাড়া', code: 'ULP', district: 'Sirajganj' },
  { name: 'Jamtail', nameBn: 'জামতৈল', code: 'JMT', district: 'Sirajganj' },
  { name: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', code: 'SG', district: 'Sirajganj' },
  { name: 'Sirajganj Bazar', nameBn: 'সিরাজগঞ্জ বাজার', code: 'SGB', district: 'Sirajganj' },
  { name: 'Santahar', nameBn: 'সান্তাহার', code: 'STH', district: 'Bogra' },
  { name: 'Bogra', nameBn: 'বগুড়া', code: 'BG', district: 'Bogra' },
  { name: 'Sonatola', nameBn: 'সোনাতলা', code: 'SNT', district: 'Bogra' },
  { name: 'Joypurhat', nameBn: 'জয়পুরহাট', code: 'JPH', district: 'Joypurhat' },
  { name: 'Panchbibi', nameBn: 'পাঁচবিবি', code: 'PCB', district: 'Joypurhat' },

  // Rangpur Division
  { name: 'Rangpur', nameBn: 'রংপুর', code: 'RP', district: 'Rangpur' },
  { name: 'Badarganj', nameBn: 'বদরগঞ্জ', code: 'BDG', district: 'Rangpur' },
  { name: 'Kaunia', nameBn: 'কাউনিয়া', code: 'KNA', district: 'Rangpur' },
  { name: 'Kurigram', nameBn: 'কুড়িগ্রাম', code: 'KRG', district: 'Kurigram' },
  { name: 'Chilmari', nameBn: 'চিলমারী', code: 'CLM', district: 'Kurigram' },
  { name: 'Lalmonirhat', nameBn: 'লালমনিরহাট', code: 'LMH', district: 'Lalmonirhat' },
  { name: 'Patgram', nameBn: 'পাটগ্রাম', code: 'PTG', district: 'Lalmonirhat' },
  { name: 'Burimari', nameBn: 'বুড়িমারী', code: 'BRM', district: 'Lalmonirhat' },
  { name: 'Gaibandha', nameBn: 'গাইবান্ধা', code: 'GBN', district: 'Gaibandha' },
  { name: 'Bonarpara', nameBn: 'বোনারপাড়া', code: 'BNP', district: 'Gaibandha' },
  { name: 'Bamandanga', nameBn: 'বামনডাঙ্গা', code: 'BMD', district: 'Gaibandha' },
  { name: 'Mahimaganj', nameBn: 'মহিমাগঞ্জ', code: 'MHJ', district: 'Gaibandha' },
  { name: 'Saidpur', nameBn: 'সৈয়দপুর', code: 'SPD', district: 'Nilphamari' },
  { name: 'Nilphamari', nameBn: 'নীলফামারী', code: 'NLP', district: 'Nilphamari' },
  { name: 'Domar', nameBn: 'ডোমার', code: 'DMR', district: 'Nilphamari' },
  { name: 'Chilahati', nameBn: 'চিলাহাটি', code: 'CLH', district: 'Nilphamari' },
  { name: 'Parbatipur', nameBn: 'পার্বতীপুর', code: 'PBP', district: 'Dinajpur' },
  { name: 'Dinajpur', nameBn: 'দিনাজপুর', code: 'DJ', district: 'Dinajpur' },
  { name: 'Birampur', nameBn: 'বিরামপুর', code: 'BMP', district: 'Dinajpur' },
  { name: 'Fulbari', nameBn: 'ফুলবাড়ী', code: 'FLB', district: 'Dinajpur' },
  { name: 'Setabganj', nameBn: 'সেতাবগঞ্জ', code: 'STB', district: 'Dinajpur' },
  { name: 'Pirganj', nameBn: 'পীরগঞ্জ', code: 'PRG', district: 'Thakurgaon' },
  { name: 'Thakurgaon Road', nameBn: 'ঠাকুরগাঁও রোড', code: 'TKR', district: 'Thakurgaon' },
  { name: 'Ruhia', nameBn: 'রুহিয়া', code: 'RHA', district: 'Thakurgaon' },
  { name: 'Shibganj', nameBn: 'শিবগঞ্জ', code: 'SBJ', district: 'Thakurgaon' },
  { name: 'Panchagarh', nameBn: 'পঞ্চগড়', code: 'PG', district: 'Panchagarh' },

  // Khulna Division
  { name: 'Khulna', nameBn: 'খুলনা', code: 'KL', district: 'Khulna' },
  { name: 'Daulatpur', nameBn: 'দৌলতপুর', code: 'DLP', district: 'Khulna' },
  { name: 'Phultala', nameBn: 'ফুলতলা', code: 'PLT', district: 'Khulna' },
  { name: 'Noapara', nameBn: 'নওয়াপাড়া', code: 'NWP', district: 'Jashore' },
  { name: 'Jashore', nameBn: 'যশোর', code: 'JSR', district: 'Jashore' },
  { name: 'Jhikargachha', nameBn: 'ঝিকরগাছা', code: 'JKG', district: 'Jashore' },
  { name: 'Benapole', nameBn: 'বেনাপোল', code: 'BNP', district: 'Jashore' },
  { name: 'Kotchandpur', nameBn: 'কোটচাঁদপুর', code: 'KCP', district: 'Jhenaidah' },
  { name: 'Mubarakganj', nameBn: 'মোবারকগঞ্জ', code: 'MBG', district: 'Jhenaidah' },
  { name: 'Safdarpur', nameBn: 'সফদারপুর', code: 'SFP', district: 'Jhenaidah' },
  { name: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', code: 'CDG', district: 'Chuadanga' },
  { name: 'Darshana', nameBn: 'দর্শনা', code: 'DSN', district: 'Chuadanga' },
  { name: 'Darshana Halt', nameBn: 'দর্শনা হল্ট', code: 'DSH', district: 'Chuadanga' },
  { name: 'Alamdanga', nameBn: 'আলমডাঙ্গা', code: 'ALD', district: 'Chuadanga' },
  { name: 'Poradaha', nameBn: 'পোড়াদহ', code: 'PRD', district: 'Kushtia' },
  { name: 'Kushtia', nameBn: 'কুষ্টিয়া', code: 'KST', district: 'Kushtia' },
  { name: 'Kushtia Court', nameBn: 'কুষ্টিয়া কোর্ট', code: 'KSC', district: 'Kushtia' },
  { name: 'Bheramara', nameBn: 'ভেড়ামারা', code: 'VRM', district: 'Kushtia' },
  { name: 'Narail', nameBn: 'নড়াইল', code: 'NRL', district: 'Narail' },
  { name: 'Magura', nameBn: 'মাগুরা', code: 'MGR', district: 'Magura' },
  { name: 'Meherpur', nameBn: 'মেহেরপুর', code: 'MHP', district: 'Meherpur' },

  // Mymensingh Division
  { name: 'Mymensingh', nameBn: 'ময়মনসিংহ', code: 'MS', district: 'Mymensingh' },
  { name: 'Gafargaon', nameBn: 'গফরগাঁও', code: 'GFG', district: 'Mymensingh' },
  { name: 'Gouripur', nameBn: 'গৌরীপুর', code: 'GRP', district: 'Mymensingh' },
  { name: 'Piyarpur', nameBn: 'পিয়ারপুর', code: 'PYP', district: 'Mymensingh' },
  { name: 'Jamalpur', nameBn: 'জামালপুর', code: 'JML', district: 'Jamalpur' },
  { name: 'Bhuapur', nameBn: 'ভুয়াপুর', code: 'BHP', district: 'Tangail' },
  { name: 'Sarishabari', nameBn: 'সরিষাবাড়ী', code: 'SSB', district: 'Jamalpur' },
  { name: 'Tarakandi', nameBn: 'তারাকান্দি', code: 'TKD', district: 'Jamalpur' },
  { name: 'Adv. Motiur Rahman', nameBn: 'এডভোকেট মতিউর রহমান', code: 'AMR', district: 'Jamalpur' },
  { name: 'Dewanganj Bazar', nameBn: 'দেওয়ানগঞ্জ বাজার', code: 'DGB', district: 'Jamalpur' },
  { name: 'Bahadurabad Ghat', nameBn: 'বাহাদুরাবাদ ঘাট', code: 'BBG', district: 'Jamalpur' },
  { name: 'Netrokona', nameBn: 'নেত্রকোণা', code: 'NTK', district: 'Netrokona' },
  { name: 'Mohanganj', nameBn: 'মোহনগঞ্জ', code: 'MHG', district: 'Netrokona' },
  { name: 'Barhatta', nameBn: 'বারহাট্টা', code: 'BHT', district: 'Netrokona' },
  { name: 'Kendua', nameBn: 'কেন্দুয়া', code: 'KND', district: 'Netrokona' },

  // Natore / Rajshahi Division extra stations
  { name: 'Ibrahimabad', nameBn: 'ইব্রাহিমাবাদ', code: 'IBD', district: 'Natore' },
  { name: 'Ahsanganj', nameBn: 'আহসানগঞ্জ', code: 'ASG', district: 'Natore' },
  { name: 'Atrai', nameBn: 'আত্রাই', code: 'ATR', district: 'Naogaon' },
  { name: 'Naogaon', nameBn: 'নওগাঁ', code: 'NOG', district: 'Naogaon' },
  { name: 'Akkelpur', nameBn: 'আক্কেলপুর', code: 'AKP', district: 'Joypurhat' },
  { name: 'Nowdapara', nameBn: 'নওদাপাড়া', code: 'NDP', district: 'Rajshahi' },
  { name: 'Chapai Nawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', code: 'CNJ', district: 'Chapai Nawabganj' },
  { name: 'Rohanpur', nameBn: 'রোহনপুর', code: 'RHP', district: 'Chapai Nawabganj' },
];

export const RAILWAY_TRAINS: RailwayTrain[] = [
  // ─── Dhaka <-> Rajshahi ───
  {
    number: '760',
    name: 'PADMA EXPRESS',
    nameBn: 'পদ্মা এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Dhaka',
    departureTime: '16:00',
    arrivalTime: '21:40',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '759',
    name: 'PADMA EXPRESS',
    nameBn: 'পদ্মা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Rajshahi',
    departureTime: '23:00',
    arrivalTime: '04:30',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '754',
    name: 'SILKCITY EXPRESS',
    nameBn: 'সিল্কসিটি এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Dhaka',
    departureTime: '07:40',
    arrivalTime: '13:30',
    offDay: 'Sunday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '753',
    name: 'SILKCITY EXPRESS',
    nameBn: 'সিল্কসিটি এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Rajshahi',
    departureTime: '14:45',
    arrivalTime: '20:35',
    offDay: 'Sunday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '770',
    name: 'DHUMKETU EXPRESS',
    nameBn: 'ধূমকেতু এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Dhaka',
    departureTime: '23:20',
    arrivalTime: '04:55',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '769',
    name: 'DHUMKETU EXPRESS',
    nameBn: 'ধূমকেতু এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Rajshahi',
    departureTime: '06:00',
    arrivalTime: '11:40',
    offDay: 'Thursday',
    fares: { S_CHAIR: 450, SNIGDHA: 865, AC_S: 1035, AC_B: 1555, SHOVON: 375 },
  },
  {
    number: '792',
    name: 'BANALATA EXPRESS',
    nameBn: 'বনলতা এক্সপ্রেস',
    fromStation: 'Chapai Nawabganj',
    toStation: 'Dhaka',
    departureTime: '04:30',
    arrivalTime: '10:45',
    offDay: 'Friday',
    fares: { S_CHAIR: 580, SNIGDHA: 1115, AC_S: 1335, AC_B: 2005, SHOVON: 485 },
  },
  {
    number: '791',
    name: 'BANALATA EXPRESS',
    nameBn: 'বনলতা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Chapai Nawabganj',
    departureTime: '13:30',
    arrivalTime: '20:00',
    offDay: 'Friday',
    fares: { S_CHAIR: 580, SNIGDHA: 1115, AC_S: 1335, AC_B: 2005, SHOVON: 485 },
  },

  // ─── Dhaka <-> Chittagong ───
  {
    number: '702',
    name: 'SUBORNO EXPRESS',
    nameBn: 'সুবর্ণ এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Chittagong',
    departureTime: '16:30',
    arrivalTime: '21:50',
    offDay: 'Monday',
    fares: { S_CHAIR: 500, SNIGDHA: 960, AC_S: 1150, SHOVON: 420 },
  },
  {
    number: '701',
    name: 'SUBORNO EXPRESS',
    nameBn: 'সুবর্ণ এক্সপ্রেস',
    fromStation: 'Chittagong',
    toStation: 'Dhaka',
    departureTime: '07:00',
    arrivalTime: '12:20',
    offDay: 'Monday',
    fares: { S_CHAIR: 500, SNIGDHA: 960, AC_S: 1150, SHOVON: 420 },
  },
  {
    number: '788',
    name: 'SONAR BANGLA EXPRESS',
    nameBn: 'সোনার বাংলা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Chittagong',
    departureTime: '07:00',
    arrivalTime: '12:15',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 520, SNIGDHA: 1000, AC_S: 1200, SHOVON: 430 },
  },
  {
    number: '787',
    name: 'SONAR BANGLA EXPRESS',
    nameBn: 'সোনার বাংলা এক্সপ্রেস',
    fromStation: 'Chittagong',
    toStation: 'Dhaka',
    departureTime: '17:00',
    arrivalTime: '22:15',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 520, SNIGDHA: 1000, AC_S: 1200, SHOVON: 430 },
  },
  {
    number: '704',
    name: 'MOHANAGAR PROVATI',
    nameBn: 'মহানগর প্রভাতী',
    fromStation: 'Dhaka',
    toStation: 'Chittagong',
    departureTime: '07:45',
    arrivalTime: '14:00',
    offDay: 'None',
    fares: { S_CHAIR: 440, SNIGDHA: 845, AC_S: 1010, SHOVON: 360 },
  },
  {
    number: '703',
    name: 'MOHANAGAR GODHULI',
    nameBn: 'মহানগর গোধূলী',
    fromStation: 'Chittagong',
    toStation: 'Dhaka',
    departureTime: '15:00',
    arrivalTime: '21:15',
    offDay: 'None',
    fares: { S_CHAIR: 440, SNIGDHA: 845, AC_S: 1010, SHOVON: 360 },
  },
  {
    number: '722',
    name: 'MOHANAGAR EXPRESS',
    nameBn: 'মহানগর এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Chittagong',
    departureTime: '21:20',
    arrivalTime: '04:15',
    offDay: 'Sunday',
    fares: { S_CHAIR: 440, SNIGDHA: 845, AC_S: 1010, SHOVON: 360 },
  },
  {
    number: '721',
    name: 'MOHANAGAR EXPRESS',
    nameBn: 'মহানগর এক্সপ্রেস',
    fromStation: 'Chittagong',
    toStation: 'Dhaka',
    departureTime: '12:30',
    arrivalTime: '19:10',
    offDay: 'Sunday',
    fares: { S_CHAIR: 440, SNIGDHA: 845, AC_S: 1010, SHOVON: 360 },
  },
  {
    number: '742',
    name: 'TURNA EXPRESS',
    nameBn: 'তূর্ণা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Chittagong',
    departureTime: '23:30',
    arrivalTime: '05:40',
    offDay: 'None',
    fares: { S_CHAIR: 440, SNIGDHA: 845, AC_S: 1010, AC_B: 1515, SHOVON: 360 },
  },
  {
    number: '741',
    name: 'TURNA EXPRESS',
    nameBn: 'তূর্ণা এক্সপ্রেস',
    fromStation: 'Chittagong',
    toStation: 'Dhaka',
    departureTime: '23:00',
    arrivalTime: '05:15',
    offDay: 'None',
    fares: { S_CHAIR: 440, SNIGDHA: 845, AC_S: 1010, AC_B: 1515, SHOVON: 360 },
  },
  {
    number: '68',
    name: 'CHATTALA EXPRESS',
    nameBn: 'চট্টলা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Chittagong',
    departureTime: '13:45',
    arrivalTime: '20:30',
    offDay: 'Friday',
    fares: { S_CHAIR: 380, SNIGDHA: 730, SHOVON: 310 },
  },
  {
    number: '67',
    name: 'CHATTALA EXPRESS',
    nameBn: 'চট্টলা এক্সপ্রেস',
    fromStation: 'Chittagong',
    toStation: 'Dhaka',
    departureTime: '06:00',
    arrivalTime: '12:50',
    offDay: 'Friday',
    fares: { S_CHAIR: 380, SNIGDHA: 730, SHOVON: 310 },
  },

  // ─── Dhaka <-> Cox's Bazar ───
  {
    number: '814',
    name: 'COX\'S BAZAR EXPRESS',
    nameBn: 'কক্সবাজার এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Cox\'s Bazar',
    departureTime: '22:30',
    arrivalTime: '06:40',
    offDay: 'Monday',
    fares: { S_CHAIR: 695, SNIGDHA: 1325, AC_S: 1590, AC_B: 2380, SHOVON: 590 },
  },
  {
    number: '813',
    name: 'COX\'S BAZAR EXPRESS',
    nameBn: 'কক্সবাজার এক্সপ্রেস',
    fromStation: 'Cox\'s Bazar',
    toStation: 'Dhaka',
    departureTime: '12:30',
    arrivalTime: '21:10',
    offDay: 'Monday',
    fares: { S_CHAIR: 695, SNIGDHA: 1325, AC_S: 1590, AC_B: 2380, SHOVON: 590 },
  },
  {
    number: '816',
    name: 'PARJATAK EXPRESS',
    nameBn: 'পর্যটক এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Cox\'s Bazar',
    departureTime: '06:15',
    arrivalTime: '15:00',
    offDay: 'Sunday',
    fares: { S_CHAIR: 695, SNIGDHA: 1325, AC_S: 1590, AC_B: 2380, SHOVON: 590 },
  },
  {
    number: '815',
    name: 'PARJATAK EXPRESS',
    nameBn: 'পর্যটক এক্সপ্রেস',
    fromStation: 'Cox\'s Bazar',
    toStation: 'Dhaka',
    departureTime: '20:00',
    arrivalTime: '04:30',
    offDay: 'Sunday',
    fares: { S_CHAIR: 695, SNIGDHA: 1325, AC_S: 1590, AC_B: 2380, SHOVON: 590 },
  },

  // ─── Dhaka <-> Sylhet ───
  {
    number: '709',
    name: 'PARABAT EXPRESS',
    nameBn: 'পারাবত এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Sylhet',
    departureTime: '06:20',
    arrivalTime: '13:00',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 410, SNIGDHA: 785, AC_S: 940, SHOVON: 345 },
  },
  {
    number: '710',
    name: 'PARABAT EXPRESS',
    nameBn: 'পারাবত এক্সপ্রেস',
    fromStation: 'Sylhet',
    toStation: 'Dhaka',
    departureTime: '15:45',
    arrivalTime: '22:40',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 410, SNIGDHA: 785, AC_S: 940, SHOVON: 345 },
  },
  {
    number: '717',
    name: 'JAYANTIKA EXPRESS',
    nameBn: 'জয়ন্তিকা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Sylhet',
    departureTime: '11:15',
    arrivalTime: '19:00',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 410, SNIGDHA: 785, AC_S: 940, SHOVON: 345 },
  },
  {
    number: '718',
    name: 'JAYANTIKA EXPRESS',
    nameBn: 'জয়ন্তিকা এক্সপ্রেস',
    fromStation: 'Sylhet',
    toStation: 'Dhaka',
    departureTime: '08:45',
    arrivalTime: '16:00',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 410, SNIGDHA: 785, AC_S: 940, SHOVON: 345 },
  },
  {
    number: '739',
    name: 'UPABAN EXPRESS',
    nameBn: 'উপবন এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Sylhet',
    departureTime: '20:30',
    arrivalTime: '05:00',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 410, SNIGDHA: 785, AC_S: 940, AC_B: 1410, SHOVON: 345 },
  },
  {
    number: '740',
    name: 'UPABAN EXPRESS',
    nameBn: 'উপবন এক্সপ্রেস',
    fromStation: 'Sylhet',
    toStation: 'Dhaka',
    departureTime: '23:00',
    arrivalTime: '06:45',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 410, SNIGDHA: 785, AC_S: 940, AC_B: 1410, SHOVON: 345 },
  },
  {
    number: '773',
    name: 'KALNI EXPRESS',
    nameBn: 'কালনী এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Sylhet',
    departureTime: '13:00',
    arrivalTime: '19:45',
    offDay: 'Friday',
    fares: { S_CHAIR: 410, SNIGDHA: 785, AC_S: 940, SHOVON: 345 },
  },
  {
    number: '774',
    name: 'KALNI EXPRESS',
    nameBn: 'কালনী এক্সপ্রেস',
    fromStation: 'Sylhet',
    toStation: 'Dhaka',
    departureTime: '06:15',
    arrivalTime: '13:00',
    offDay: 'Friday',
    fares: { S_CHAIR: 410, SNIGDHA: 785, AC_S: 940, SHOVON: 345 },
  },

  // ─── Chittagong <-> Sylhet ───
  {
    number: '719',
    name: 'PAHARIKA EXPRESS',
    nameBn: 'পাহাড়িকা এক্সপ্রেস',
    fromStation: 'Chittagong',
    toStation: 'Sylhet',
    departureTime: '07:50',
    arrivalTime: '16:30',
    offDay: 'Monday',
    fares: { S_CHAIR: 440, SNIGDHA: 845, AC_S: 1010, SHOVON: 365 },
  },
  {
    number: '720',
    name: 'PAHARIKA EXPRESS',
    nameBn: 'পাহাড়িকা এক্সপ্রেস',
    fromStation: 'Sylhet',
    toStation: 'Chittagong',
    departureTime: '10:15',
    arrivalTime: '19:45',
    offDay: 'Monday',
    fares: { S_CHAIR: 440, SNIGDHA: 845, AC_S: 1010, SHOVON: 365 },
  },
  {
    number: '723',
    name: 'UDAYAN EXPRESS',
    nameBn: 'উদয়ন এক্সপ্রেস',
    fromStation: 'Chittagong',
    toStation: 'Sylhet',
    departureTime: '21:45',
    arrivalTime: '06:00',
    offDay: 'Sunday',
    fares: { S_CHAIR: 440, SNIGDHA: 845, AC_S: 1010, AC_B: 1515, SHOVON: 365 },
  },
  {
    number: '724',
    name: 'UDAYAN EXPRESS',
    nameBn: 'উদয়ন এক্সপ্রেস',
    fromStation: 'Sylhet',
    toStation: 'Chittagong',
    departureTime: '21:20',
    arrivalTime: '05:30',
    offDay: 'Sunday',
    fares: { S_CHAIR: 440, SNIGDHA: 845, AC_S: 1010, AC_B: 1515, SHOVON: 365 },
  },

  // ─── Dhaka <-> Khulna / Benapole ───
  {
    number: '726',
    name: 'SUNDARBAN EXPRESS',
    nameBn: 'সুন্দরবন এক্সপ্রেস',
    fromStation: 'Khulna',
    toStation: 'Dhaka',
    departureTime: '21:45',
    arrivalTime: '06:10',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 530, SNIGDHA: 1015, AC_S: 1220, AC_B: 1830, SHOVON: 440 },
  },
  {
    number: '725',
    name: 'SUNDARBAN EXPRESS',
    nameBn: 'সুন্দরবন এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Khulna',
    departureTime: '08:15',
    arrivalTime: '16:00',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 530, SNIGDHA: 1015, AC_S: 1220, AC_B: 1830, SHOVON: 440 },
  },
  {
    number: '764',
    name: 'CHITRA EXPRESS',
    nameBn: 'চিত্রা এক্সপ্রেস',
    fromStation: 'Khulna',
    toStation: 'Dhaka',
    departureTime: '09:00',
    arrivalTime: '17:55',
    offDay: 'Monday',
    fares: { S_CHAIR: 530, SNIGDHA: 1015, AC_S: 1220, AC_B: 1830, SHOVON: 440 },
  },
  {
    number: '763',
    name: 'CHITRA EXPRESS',
    nameBn: 'চিত্রা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Khulna',
    departureTime: '19:00',
    arrivalTime: '03:40',
    offDay: 'Monday',
    fares: { S_CHAIR: 530, SNIGDHA: 1015, AC_S: 1220, AC_B: 1830, SHOVON: 440 },
  },
  {
    number: '796',
    name: 'BENAPOLE EXPRESS',
    nameBn: 'বেনাপোল এক্সপ্রেস',
    fromStation: 'Benapole',
    toStation: 'Dhaka',
    departureTime: '13:00',
    arrivalTime: '20:45',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 535, SNIGDHA: 1025, AC_S: 1230, AC_B: 1845, SHOVON: 445 },
  },
  {
    number: '795',
    name: 'BENAPOLE EXPRESS',
    nameBn: 'বেনাপোল এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Benapole',
    departureTime: '23:15',
    arrivalTime: '07:20',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 535, SNIGDHA: 1025, AC_S: 1230, AC_B: 1845, SHOVON: 445 },
  },

  // ─── Khulna <-> Rajshahi ───
  {
    number: '762',
    name: 'SAGORDARI EXPRESS',
    nameBn: 'সাগরদাঁড়ী এক্সপ্রেস',
    fromStation: 'Khulna',
    toStation: 'Rajshahi',
    departureTime: '16:00',
    arrivalTime: '22:00',
    offDay: 'Monday',
    fares: { S_CHAIR: 380, SNIGDHA: 730, SHOVON: 315 },
  },
  {
    number: '761',
    name: 'SAGORDARI EXPRESS',
    nameBn: 'সাগরদাঁড়ী এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Khulna',
    departureTime: '06:00',
    arrivalTime: '12:00',
    offDay: 'Monday',
    fares: { S_CHAIR: 380, SNIGDHA: 730, SHOVON: 315 },
  },
  {
    number: '716',
    name: 'KAPOTAKKHA EXPRESS',
    nameBn: 'কপোতাক্ষ এক্সপ্রেস',
    fromStation: 'Khulna',
    toStation: 'Rajshahi',
    departureTime: '06:15',
    arrivalTime: '12:15',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 380, SNIGDHA: 730, SHOVON: 315 },
  },
  {
    number: '715',
    name: 'KAPOTAKKHA EXPRESS',
    nameBn: 'কপোতাক্ষ এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Khulna',
    departureTime: '14:30',
    arrivalTime: '20:30',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 380, SNIGDHA: 730, SHOVON: 315 },
  },

  // ─── Khulna <-> Chilahati ───
  {
    number: '727',
    name: 'RUPSHA EXPRESS',
    nameBn: 'রূপসা এক্সপ্রেস',
    fromStation: 'Khulna',
    toStation: 'Chilahati',
    departureTime: '07:15',
    arrivalTime: '17:00',
    offDay: 'Thursday',
    fares: { S_CHAIR: 540, SNIGDHA: 1030, SHOVON: 450 },
  },
  {
    number: '728',
    name: 'RUPSHA EXPRESS',
    nameBn: 'রূপসা এক্সপ্রেস',
    fromStation: 'Chilahati',
    toStation: 'Khulna',
    departureTime: '08:30',
    arrivalTime: '18:15',
    offDay: 'Thursday',
    fares: { S_CHAIR: 540, SNIGDHA: 1030, SHOVON: 450 },
  },
  {
    number: '747',
    name: 'SIMANTA EXPRESS',
    nameBn: 'সীমান্ত এক্সপ্রেস',
    fromStation: 'Khulna',
    toStation: 'Chilahati',
    departureTime: '21:15',
    arrivalTime: '06:40',
    offDay: 'None',
    fares: { S_CHAIR: 540, SNIGDHA: 1030, AC_B: 1850, SHOVON: 450 },
  },
  {
    number: '748',
    name: 'SIMANTA EXPRESS',
    nameBn: 'সীমান্ত এক্সপ্রেস',
    fromStation: 'Chilahati',
    toStation: 'Khulna',
    departureTime: '19:00',
    arrivalTime: '04:30',
    offDay: 'None',
    fares: { S_CHAIR: 540, SNIGDHA: 1030, AC_B: 1850, SHOVON: 450 },
  },

  // ─── Rajshahi <-> Chilahati ───
  {
    number: '731',
    name: 'BARENDRA EXPRESS',
    nameBn: 'বরেন্দ্র এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Chilahati',
    departureTime: '15:00',
    arrivalTime: '21:40',
    offDay: 'Sunday',
    fares: { S_CHAIR: 345, SNIGDHA: 660, SHOVON: 290 },
  },
  {
    number: '732',
    name: 'BARENDRA EXPRESS',
    nameBn: 'বরেন্দ্র এক্সপ্রেস',
    fromStation: 'Chilahati',
    toStation: 'Rajshahi',
    departureTime: '05:50',
    arrivalTime: '12:30',
    offDay: 'Sunday',
    fares: { S_CHAIR: 345, SNIGDHA: 660, SHOVON: 290 },
  },
  {
    number: '733',
    name: 'TITUMIR EXPRESS',
    nameBn: 'তিতুমীর এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Chilahati',
    departureTime: '06:20',
    arrivalTime: '13:00',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 345, SNIGDHA: 660, SHOVON: 290 },
  },
  {
    number: '734',
    name: 'TITUMIR EXPRESS',
    nameBn: 'তিতুমীর এক্সপ্রেস',
    fromStation: 'Chilahati',
    toStation: 'Rajshahi',
    departureTime: '14:20',
    arrivalTime: '21:00',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 345, SNIGDHA: 660, SHOVON: 290 },
  },

  // ─── Dhaka <-> Northern Region (Rangpur, Dinajpur, Panchagarh, Kurigram, Lalmonirhat, Chilahati) ───
  {
    number: '706',
    name: 'EKOTA EXPRESS',
    nameBn: 'একতা এক্সপ্রেস',
    fromStation: 'Panchagarh',
    toStation: 'Dhaka',
    departureTime: '21:10',
    arrivalTime: '07:40',
    offDay: 'None',
    fares: { S_CHAIR: 635, SNIGDHA: 1220, AC_S: 1465, AC_B: 2195, SHOVON: 530 },
  },
  {
    number: '705',
    name: 'EKOTA EXPRESS',
    nameBn: 'একতা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Panchagarh',
    departureTime: '10:15',
    arrivalTime: '20:30',
    offDay: 'None',
    fares: { S_CHAIR: 635, SNIGDHA: 1220, AC_S: 1465, AC_B: 2195, SHOVON: 530 },
  },

  {
    number: '794',
    name: 'PANCHAGARH EXPRESS',
    nameBn: 'পঞ্চগড় এক্সপ্রেস',
    fromStation: 'Panchagarh',
    toStation: 'Dhaka',
    departureTime: '13:00',
    arrivalTime: '22:35',
    offDay: 'None',
    fares: { S_CHAIR: 650, SNIGDHA: 1250, AC_S: 1500, AC_B: 2250, SHOVON: 540 },
  },
  {
    number: '793',
    name: 'PANCHAGARH EXPRESS',
    nameBn: 'পঞ্চগড় এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Panchagarh',
    departureTime: '23:30',
    arrivalTime: '09:00',
    offDay: 'None',
    fares: { S_CHAIR: 650, SNIGDHA: 1250, AC_S: 1500, AC_B: 2250, SHOVON: 540 },
  },
  {
    number: '772',
    name: 'RANGPUR EXPRESS',
    nameBn: 'রংপুর এক্সপ্রেস',
    fromStation: 'Rangpur',
    toStation: 'Dhaka',
    departureTime: '20:00',
    arrivalTime: '06:05',
    offDay: 'Sunday',
    fares: { S_CHAIR: 560, SNIGDHA: 1075, AC_S: 1290, AC_B: 1935, SHOVON: 465 },
  },
  {
    number: '771',
    name: 'RANGPUR EXPRESS',
    nameBn: 'রংপুর এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Rangpur',
    departureTime: '09:10',
    arrivalTime: '19:05',
    offDay: 'Monday',
    fares: { S_CHAIR: 560, SNIGDHA: 1075, AC_S: 1290, AC_B: 1935, SHOVON: 465 },
  },
  {
    number: '798',
    name: 'KURIGRAM EXPRESS',
    nameBn: 'কুড়িগ্রাম এক্সপ্রেস',
    fromStation: 'Kurigram',
    toStation: 'Dhaka',
    departureTime: '07:15',
    arrivalTime: '17:25',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 560, SNIGDHA: 1075, AC_S: 1290, SHOVON: 465 },
  },
  {
    number: '797',
    name: 'KURIGRAM EXPRESS',
    nameBn: 'কুড়িগ্রাম এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Kurigram',
    departureTime: '20:45',
    arrivalTime: '06:15',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 560, SNIGDHA: 1075, AC_S: 1290, SHOVON: 465 },
  },
  {
    number: '752',
    name: 'LALMONI EXPRESS',
    nameBn: 'লালমনি এক্সপ্রেস',
    fromStation: 'Lalmonirhat',
    toStation: 'Dhaka',
    departureTime: '09:50',
    arrivalTime: '20:45',
    offDay: 'Friday',
    fares: { S_CHAIR: 555, SNIGDHA: 1065, AC_S: 1275, AC_B: 1915, SHOVON: 460 },
  },
  {
    number: '751',
    name: 'LALMONI EXPRESS',
    nameBn: 'লালমনি এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Lalmonirhat',
    departureTime: '21:45',
    arrivalTime: '07:20',
    offDay: 'Friday',
    fares: { S_CHAIR: 555, SNIGDHA: 1065, AC_S: 1275, AC_B: 1915, SHOVON: 460 },
  },
  {
    number: '766',
    name: 'NILSAGAR EXPRESS',
    nameBn: 'নীলসাগর এক্সপ্রেস',
    fromStation: 'Chilahati',
    toStation: 'Dhaka',
    departureTime: '08:00',
    arrivalTime: '17:50',
    offDay: 'Monday',
    fares: { S_CHAIR: 575, SNIGDHA: 1100, AC_S: 1320, AC_B: 1980, SHOVON: 480 },
  },
  {
    number: '765',
    name: 'NILSAGAR EXPRESS',
    nameBn: 'নীলসাগর এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Chilahati',
    departureTime: '06:45',
    arrivalTime: '16:00',
    offDay: 'Monday',
    fares: { S_CHAIR: 575, SNIGDHA: 1100, AC_S: 1320, AC_B: 1980, SHOVON: 480 },
  },
  {
    number: '806',
    name: 'CHILAHATI EXPRESS',
    nameBn: 'চিলাহাটি এক্সপ্রেস',
    fromStation: 'Chilahati',
    toStation: 'Dhaka',
    departureTime: '22:00',
    arrivalTime: '07:15',
    offDay: 'Saturday',
    fares: { S_CHAIR: 575, SNIGDHA: 1100, AC_S: 1320, AC_B: 1980, SHOVON: 480 },
  },
  {
    number: '805',
    name: 'CHILAHATI EXPRESS',
    nameBn: 'চিলাহাটি এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Chilahati',
    departureTime: '17:00',
    arrivalTime: '02:30',
    offDay: 'Saturday',
    fares: { S_CHAIR: 575, SNIGDHA: 1100, AC_S: 1320, AC_B: 1980, SHOVON: 480 },
  },

  // ─── Dhaka <-> Mymensingh / Jamalpur / Dewanganj / Kishoreganj ───
  {
    number: '743',
    name: 'BRAHMAPUTRA EXPRESS',
    nameBn: 'ব্রহ্মপুত্র এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Dewanganj Bazar',
    departureTime: '18:15',
    arrivalTime: '23:45',
    offDay: 'None',
    fares: { S_CHAIR: 235, SNIGDHA: 450, AC_S: 540, SHOVON: 195 },
  },
  {
    number: '744',
    name: 'BRAHMAPUTRA EXPRESS',
    nameBn: 'ব্রহ্মপুত্র এক্সপ্রেস',
    fromStation: 'Dewanganj Bazar',
    toStation: 'Dhaka',
    departureTime: '06:40',
    arrivalTime: '12:15',
    offDay: 'None',
    fares: { S_CHAIR: 235, SNIGDHA: 450, AC_S: 540, SHOVON: 195 },
  },
  {
    number: '745',
    name: 'JAMUNA EXPRESS',
    nameBn: 'যমুনা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Tarakandi',
    departureTime: '16:45',
    arrivalTime: '22:15',
    offDay: 'None',
    fares: { S_CHAIR: 220, SNIGDHA: 420, SHOVON: 180 },
  },
  {
    number: '746',
    name: 'JAMUNA EXPRESS',
    nameBn: 'যমুনা এক্সপ্রেস',
    fromStation: 'Tarakandi',
    toStation: 'Dhaka',
    departureTime: '02:00',
    arrivalTime: '07:30',
    offDay: 'None',
    fares: { S_CHAIR: 220, SNIGDHA: 420, SHOVON: 180 },
  },
  {
    number: '789',
    name: 'MOHANGANJ EXPRESS',
    nameBn: 'মোহনগঞ্জ এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Mohanganj',
    departureTime: '13:15',
    arrivalTime: '19:40',
    offDay: 'Monday',
    fares: { S_CHAIR: 245, SNIGDHA: 470, SHOVON: 200 },
  },
  {
    number: '790',
    name: 'MOHANGANJ EXPRESS',
    nameBn: 'মোহনগঞ্জ এক্সপ্রেস',
    fromStation: 'Mohanganj',
    toStation: 'Dhaka',
    departureTime: '23:00',
    arrivalTime: '05:30',
    offDay: 'Monday',
    fares: { S_CHAIR: 245, SNIGDHA: 470, SHOVON: 200 },
  },
  {
    number: '777',
    name: 'HAOR EXPRESS',
    nameBn: 'হাওর এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Mohanganj',
    departureTime: '22:15',
    arrivalTime: '05:00',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 245, SNIGDHA: 470, AC_B: 850, SHOVON: 200 },
  },
  {
    number: '778',
    name: 'HAOR EXPRESS',
    nameBn: 'হাওর এক্সপ্রেস',
    fromStation: 'Mohanganj',
    toStation: 'Dhaka',
    departureTime: '07:45',
    arrivalTime: '14:20',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 245, SNIGDHA: 470, AC_B: 850, SHOVON: 200 },
  },
  {
    number: '737',
    name: 'EGAROSINDHUR PROVATI',
    nameBn: 'এগারসিন্ধুর প্রভাতী',
    fromStation: 'Dhaka',
    toStation: 'Kishoreganj',
    departureTime: '07:15',
    arrivalTime: '11:15',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 195, SNIGDHA: 375, SHOVON: 160 },
  },
  {
    number: '738',
    name: 'EGAROSINDHUR PROVATI',
    nameBn: 'এগারসিন্ধুর প্রভাতী',
    fromStation: 'Kishoreganj',
    toStation: 'Dhaka',
    departureTime: '06:30',
    arrivalTime: '10:45',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 195, SNIGDHA: 375, SHOVON: 160 },
  },
  {
    number: '749',
    name: 'EGAROSINDHUR GODHULI',
    nameBn: 'এগারসিন্ধুর গোধূলী',
    fromStation: 'Dhaka',
    toStation: 'Kishoreganj',
    departureTime: '18:30',
    arrivalTime: '22:30',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 195, SNIGDHA: 375, SHOVON: 160 },
  },
  {
    number: '750',
    name: 'EGAROSINDHUR GODHULI',
    nameBn: 'এগারসিন্ধুর গোধূলী',
    fromStation: 'Kishoreganj',
    toStation: 'Dhaka',
    departureTime: '12:30',
    arrivalTime: '16:50',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 195, SNIGDHA: 375, SHOVON: 160 },
  },
  {
    number: '781',
    name: 'KISHOREGANJ EXPRESS',
    nameBn: 'কিশোরগঞ্জ এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Kishoreganj',
    departureTime: '10:30',
    arrivalTime: '14:20',
    offDay: 'Friday',
    fares: { S_CHAIR: 195, SNIGDHA: 375, SHOVON: 160 },
  },
  {
    number: '782',
    name: 'KISHOREGANJ EXPRESS',
    nameBn: 'কিশোরগঞ্জ এক্সপ্রেস',
    fromStation: 'Kishoreganj',
    toStation: 'Dhaka',
    departureTime: '16:00',
    arrivalTime: '20:10',
    offDay: 'Friday',
    fares: { S_CHAIR: 195, SNIGDHA: 375, SHOVON: 160 },
  },

  // ─── Chittagong <-> Mymensingh ───
  {
    number: '785',
    name: 'BIJOY EXPRESS',
    nameBn: 'বিজয় এক্সপ্রেস',
    fromStation: 'Chittagong',
    toStation: 'Mymensingh',
    departureTime: '09:15',
    arrivalTime: '18:10',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 395, SNIGDHA: 755, SHOVON: 330 },
  },
  {
    number: '786',
    name: 'BIJOY EXPRESS',
    nameBn: 'বিজয় এক্সপ্রেস',
    fromStation: 'Mymensingh',
    toStation: 'Chittagong',
    departureTime: '20:30',
    arrivalTime: '05:00',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 395, SNIGDHA: 755, SHOVON: 330 },
  },

  // ─── Dhaka <-> Sirajganj ───
  {
    number: '775',
    name: 'SIRAJGANJ EXPRESS',
    nameBn: 'সিরাজগঞ্জ এক্সপ্রেস',
    fromStation: 'Sirajganj Bazar',
    toStation: 'Dhaka',
    departureTime: '06:00',
    arrivalTime: '10:30',
    offDay: 'Saturday',
    fares: { S_CHAIR: 260, SNIGDHA: 500, SHOVON: 220 },
  },
  {
    number: '776',
    name: 'SIRAJGANJ EXPRESS',
    nameBn: 'সিরাজগঞ্জ এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Sirajganj Bazar',
    departureTime: '17:00',
    arrivalTime: '21:30',
    offDay: 'Saturday',
    fares: { S_CHAIR: 260, SNIGDHA: 500, SHOVON: 220 },
  },

  // ─── Chittagong <-> Chandpur ───
  {
    number: '729',
    name: 'MEGHNA EXPRESS',
    nameBn: 'মেঘনা এক্সপ্রেস',
    fromStation: 'Chittagong',
    toStation: 'Chandpur',
    departureTime: '17:15',
    arrivalTime: '21:50',
    offDay: 'None',
    fares: { S_CHAIR: 230, SNIGDHA: 440, SHOVON: 190 },
  },
  {
    number: '730',
    name: 'MEGHNA EXPRESS',
    nameBn: 'মেঘনা এক্সপ্রেস',
    fromStation: 'Chandpur',
    toStation: 'Chittagong',
    departureTime: '05:00',
    arrivalTime: '09:40',
    offDay: 'None',
    fares: { S_CHAIR: 230, SNIGDHA: 440, SHOVON: 190 },
  },

  // ─── Dhaka <-> Panchagarh (Drutojan & Banglabandha) ───
  {
    number: '757',
    name: 'DRUTOJAN EXPRESS',
    nameBn: 'দ্রুতযান এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Panchagarh',
    departureTime: '20:00',
    arrivalTime: '06:10',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 650, SNIGDHA: 1245, AC_S: 1495, AC_B: 2240, SHOVON: 540 },
  },
  {
    number: '758',
    name: 'DRUTOJAN EXPRESS',
    nameBn: 'দ্রুতযান এক্সপ্রেস',
    fromStation: 'Panchagarh',
    toStation: 'Dhaka',
    departureTime: '07:15',
    arrivalTime: '17:30',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 650, SNIGDHA: 1245, AC_S: 1495, AC_B: 2240, SHOVON: 540 },
  },
  {
    number: '803',
    name: 'BANGLABANDHA EXPRESS',
    nameBn: 'বাংলাবান্ধা এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Panchagarh',
    departureTime: '21:15',
    arrivalTime: '05:10',
    offDay: 'Friday',
    fares: { S_CHAIR: 395, SNIGDHA: 760, SHOVON: 330 },
  },
  {
    number: '804',
    name: 'BANGLABANDHA EXPRESS',
    nameBn: 'বাংলাবান্ধা এক্সপ্রেস',
    fromStation: 'Panchagarh',
    toStation: 'Rajshahi',
    departureTime: '08:30',
    arrivalTime: '16:30',
    offDay: 'Saturday',
    fares: { S_CHAIR: 395, SNIGDHA: 760, SHOVON: 330 },
  },

  // ─── Dhaka <-> Dewanganj Bazar (Tista & Brahmaputra) ───
  {
    number: '707',
    name: 'TISTA EXPRESS',
    nameBn: 'তিস্তা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Dewanganj Bazar',
    departureTime: '07:30',
    arrivalTime: '12:50',
    offDay: 'Monday',
    fares: { S_CHAIR: 275, SNIGDHA: 525, AC_S: 630, SHOVON: 230 },
  },
  {
    number: '708',
    name: 'TISTA EXPRESS',
    nameBn: 'তিস্তা এক্সপ্রেস',
    fromStation: 'Dewanganj Bazar',
    toStation: 'Dhaka',
    departureTime: '15:00',
    arrivalTime: '20:30',
    offDay: 'Monday',
    fares: { S_CHAIR: 275, SNIGDHA: 525, AC_S: 630, SHOVON: 230 },
  },

  // ─── Dhaka <-> Tarakandi (Agnibeena & Jamuna) ───
  {
    number: '735',
    name: 'AGNIBEENA EXPRESS',
    nameBn: 'অগ্নিবীণা এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Tarakandi',
    departureTime: '11:00',
    arrivalTime: '16:50',
    offDay: 'None',
    fares: { S_CHAIR: 265, SNIGDHA: 510, AC_S: 610, SHOVON: 220 },
  },
  {
    number: '736',
    name: 'AGNIBEENA EXPRESS',
    nameBn: 'অগ্নিবীণা এক্সপ্রেস',
    fromStation: 'Tarakandi',
    toStation: 'Dhaka',
    departureTime: '17:50',
    arrivalTime: '23:30',
    offDay: 'None',
    fares: { S_CHAIR: 265, SNIGDHA: 510, AC_S: 610, SHOVON: 220 },
  },

  // ─── Dhaka <-> Buapur (Jamalpur Express) ───
  {
    number: '799',
    name: 'JAMALPUR EXPRESS',
    nameBn: 'জামালপুর এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Bhuapur',
    departureTime: '16:30',
    arrivalTime: '22:00',
    offDay: 'Sunday',
    fares: { S_CHAIR: 285, SNIGDHA: 545, AC_S: 650, SHOVON: 235 },
  },
  {
    number: '800',
    name: 'JAMALPUR EXPRESS',
    nameBn: 'জামালপুর এক্সপ্রেস',
    fromStation: 'Bhuapur',
    toStation: 'Dhaka',
    departureTime: '06:00',
    arrivalTime: '11:30',
    offDay: 'Sunday',
    fares: { S_CHAIR: 285, SNIGDHA: 545, AC_S: 650, SHOVON: 235 },
  },

  // ─── Gopalganj <-> Rajshahi (Tungipara Express) ───
  {
    number: '783',
    name: 'TUNGIPARA EXPRESS',
    nameBn: 'টুঙ্গিপাড়া এক্সপ্রেস',
    fromStation: 'Gopalganj',
    toStation: 'Rajshahi',
    departureTime: '06:00',
    arrivalTime: '13:00',
    offDay: 'Monday',
    fares: { S_CHAIR: 380, SNIGDHA: 730, SHOVON: 315 },
  },
  {
    number: '784',
    name: 'TUNGIPARA EXPRESS',
    nameBn: 'টুঙ্গিপাড়া এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Gopalganj',
    departureTime: '15:30',
    arrivalTime: '22:15',
    offDay: 'Monday',
    fares: { S_CHAIR: 380, SNIGDHA: 730, SHOVON: 315 },
  },

  // ─── Santahar <-> Burimari (Karatoa Express) ───
  {
    number: '713',
    name: 'KARATOA EXPRESS',
    nameBn: 'করতোয়া এক্সপ্রেস',
    fromStation: 'Santahar',
    toStation: 'Burimari',
    departureTime: '08:20',
    arrivalTime: '15:45',
    offDay: 'None',
    fares: { S_CHAIR: 280, SNIGDHA: 535, SHOVON: 230 },
  },
  {
    number: '714',
    name: 'KARATOA EXPRESS',
    nameBn: 'করতোয়া এক্সপ্রেস',
    fromStation: 'Burimari',
    toStation: 'Santahar',
    departureTime: '16:45',
    arrivalTime: '23:50',
    offDay: 'None',
    fares: { S_CHAIR: 280, SNIGDHA: 535, SHOVON: 230 },
  },

  // ─── Santahar <-> Dinajpur (Dolonchapa Express) ───
  {
    number: '767',
    name: 'DOLONCHAPA EXPRESS',
    nameBn: 'দোলনচাঁপা এক্সপ্রেস',
    fromStation: 'Santahar',
    toStation: 'Dinajpur',
    departureTime: '11:00',
    arrivalTime: '16:00',
    offDay: 'None',
    fares: { S_CHAIR: 220, SNIGDHA: 420, SHOVON: 180 },
  },
  {
    number: '768',
    name: 'DOLONCHAPA EXPRESS',
    nameBn: 'দোলনচাঁপা এক্সপ্রেস',
    fromStation: 'Dinajpur',
    toStation: 'Santahar',
    departureTime: '06:00',
    arrivalTime: '10:45',
    offDay: 'None',
    fares: { S_CHAIR: 220, SNIGDHA: 420, SHOVON: 180 },
  },

  // ─── Dhaka <-> Rajshahi (Madhumati Express via Padma Bridge) ───
  {
    number: '755',
    name: 'MADHUMATI EXPRESS',
    nameBn: 'মধুমতী এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Rajshahi',
    departureTime: '15:00',
    arrivalTime: '21:40',
    offDay: 'Thursday',
    fares: { S_CHAIR: 450, SNIGDHA: 860, AC_S: 1035, AC_B: 1550, SHOVON: 375 },
  },
  {
    number: '756',
    name: 'MADHUMATI EXPRESS',
    nameBn: 'মধুমতী এক্সপ্রেস',
    fromStation: 'Rajshahi',
    toStation: 'Dhaka',
    departureTime: '06:40',
    arrivalTime: '13:00',
    offDay: 'Thursday',
    fares: { S_CHAIR: 450, SNIGDHA: 860, AC_S: 1035, AC_B: 1550, SHOVON: 375 },
  },

  // ─── Dhaka <-> Noakhali (Upakul Express) ───
  {
    number: '712',
    name: 'UPAKUL EXPRESS',
    nameBn: 'উপকূল এক্সপ্রেস',
    fromStation: 'Dhaka',
    toStation: 'Noakhali',
    departureTime: '15:10',
    arrivalTime: '21:10',
    offDay: 'Tuesday',
    fares: { S_CHAIR: 280, SNIGDHA: 535, SHOVON: 235 },
  },
  {
    number: '711',
    name: 'UPAKUL EXPRESS',
    nameBn: 'উপকূল এক্সপ্রেস',
    fromStation: 'Noakhali',
    toStation: 'Dhaka',
    departureTime: '06:00',
    arrivalTime: '12:00',
    offDay: 'Wednesday',
    fares: { S_CHAIR: 280, SNIGDHA: 535, SHOVON: 235 },
  },
];

// Helper: Convert English Digits to Bengali Digits
const BN_DIGITS: Record<string, string> = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
};

export function toBanglaDigits(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  return String(input).replace(/[0-9]/g, match => BN_DIGITS[match] || match);
}

// Helper: Format DateTime for Bangladesh Railway Ticket
// e.g. "28-09-2026 13:10 (২৮-০৯-২০২৬ ১৩:১০)"
export function formatRailwayDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const formattedEnDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
  const enFull = `${formattedEnDate} ${timeStr || '00:00'}`;
  const bnFull = toBanglaDigits(enFull);
  return `${enFull} (${bnFull})`;
}

// Helper: Banglish / Common Spelling Aliases -> Official Station Name in RAILWAY_STATIONS
export const STATION_ALIASES: Record<string, string> = {
  'ibrahimbad': 'Ibrahimabad',
  'ibrahim abad': 'Ibrahimabad',
  'ebrahimabad': 'Ibrahimabad',
  'ebrahimbad': 'Ibrahimabad',
  'ইব্রাহিমাবাদ': 'Ibrahimabad',
  'ইব্রাহিমবাদ': 'Ibrahimabad',
  'bangabandhu setu east': 'Bangabandhu Setu East',
  'bangabandhu bridge east': 'Bangabandhu Setu East',
  'jamuna bridge east': 'Bangabandhu Setu East',
  'setu east': 'Bangabandhu Setu East',
  'bangabandhu setu west': 'Bangabandhu Setu West',
  'setu west': 'Bangabandhu Setu West',
  'soydabad': 'Bangabandhu Setu West',
  'chattogram': 'Chittagong',
  'ctg': 'Chittagong',
  'chittagong': 'Chittagong',
  'চট্টগ্রাম': 'Chittagong',
  'bogura': 'Bogra',
  'bogra': 'Bogra',
  'বগুড়া': 'Bogra',
  'comilla': 'Cumilla',
  'cumilla': 'Cumilla',
  'কুমিল্লা': 'Cumilla',
  'jessore': 'Jashore',
  'jashore': 'Jashore',
  'যশোর': 'Jashore',
  'iswardi': 'Ishwardi',
  'ishurdi': 'Ishwardi',
  'ঈশ্বরদী': 'Ishwardi',
  'ishwardi bypass': 'Ishwardi Bypass',
  'iswardi bypass': 'Ishwardi Bypass',
  'rajshahi': 'Rajshahi',
  'rajshai': 'Rajshahi',
  'রাজশাহী': 'Rajshahi',
  'komolapur': 'Dhaka',
  'kamalapur': 'Dhaka',
  'কমলাপুর': 'Dhaka',
  'biman bandar': 'Dhaka Biman Bandar',
  'dhaka airport': 'Dhaka Biman Bandar',
  'airport': 'Dhaka Biman Bandar',
  'chapai': 'Chapai Nawabganj',
  'nawabganj': 'Chapai Nawabganj',
  'chapainawabganj': 'Chapai Nawabganj',
  "cox's bazar": "Cox's Bazar",
  'coxs bazar': "Cox's Bazar",
  'coxsbazar': "Cox's Bazar",
  'cox bazar': "Cox's Bazar",
  'tangail': 'Tangail',
  'tangal': 'Tangail',
  'টাঙ্গাইল': 'Tangail',
  'joydebpur': 'Joydebpur',
  'jaydebpur': 'Joydebpur',
  'mirzapur': 'Mirzapur',
  'ullapara': 'Ullapara',
  'ulla para': 'Ullapara',
  'chatmohar': 'Chatmohar',
  'chatmohor': 'Chatmohar',
  'abdulpur': 'Abdulpur',
  'natore': 'Natore',
  'nator': 'Natore',
  'bheramara': 'Bheramara',
  'veramara': 'Bheramara',
  'santahar': 'Santahar',
  'parbatipur': 'Parbatipur',
  'parbotipur': 'Parbatipur',
  'dinajpur': 'Dinajpur',
  'rangpur': 'Rangpur',
  'rongpur': 'Rangpur',
  'khulna': 'Khulna',
  'sylhet': 'Sylhet',
  'sylet': 'Sylhet',
  'mymensingh': 'Mymensingh',
  'moymonshingho': 'Mymensingh',
  'jamalpur': 'Jamalpur',
  'jamalpur town': 'Jamalpur',
  'bhuapur': 'Bhuapur',
  'noakhali': 'Noakhali',
  'নোয়াখালী': 'Noakhali',
};

// Bounded Levenshtein edit distance for Banglish station typo recovery
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function normalizeStationName(raw: string): string {
  if (!raw) return '';
  const cleaned = raw.trim();
  const lower = cleaned.toLowerCase();

  if (STATION_ALIASES[lower]) return STATION_ALIASES[lower];

  const exactEn = RAILWAY_STATIONS.find(s => s.name.toLowerCase() === lower);
  if (exactEn) return exactEn.name;

  const exactBn = RAILWAY_STATIONS.find(s => s.nameBn === cleaned);
  if (exactBn) return exactBn.name;

  const exactCode = RAILWAY_STATIONS.find(s => s.code.toLowerCase() === lower);
  if (exactCode) return exactCode.name;

  // Bounded fuzzy match for minor spelling typos (e.g. ibrahimbad -> Ibrahimabad)
  if (/^[a-z\s'-]{5,}$/i.test(lower)) {
    let bestName = '';
    let bestDist = Infinity;
    for (const st of RAILWAY_STATIONS) {
      const target = st.name.toLowerCase();
      if (target[0] !== lower[0]) continue;
      const maxDist = lower.length >= 8 ? 2 : 1;
      if (Math.abs(target.length - lower.length) > maxDist) continue;
      const dist = editDistance(lower, target);
      if (dist <= maxDist && dist < bestDist) {
        bestDist = dist;
        bestName = st.name;
      }
    }
    if (bestName) return bestName;
  }

  return cleaned;
}

// Accurate ordered forward stop lists (from terminal A -> terminal B; reversed automatically for return train)
const DHAKA_RAJSHAHI_INTERCITY_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Joydebpur', 'Mirzapur', 'Tangail',
  'Ibrahimabad', 'Bangabandhu Setu East', 'Bangabandhu Setu West',
  'Jamtail', 'Ullapara', 'Chatmohar', 'Ishwardi Bypass', 'Abdulpur',
  'Natore', 'Rajshahi',
];

const BANALATA_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Tangail', 'Ibrahimabad',
  'Ishwardi Bypass', 'Rajshahi', 'Chapai Nawabganj',
];

const MADHUMATI_STOPS = [
  'Dhaka', 'Mawa', 'Padma', 'Shibchar', 'Bhanga', 'Bhanga Junction',
  'Faridpur', 'Rajbari', 'Pangsha', 'Kushtia Court', 'Kushtia',
  'Poradaha', 'Bheramara', 'Pakshi', 'Ishwardi', 'Abdulpur', 'Rajshahi',
];

const DHAKA_PANCHAGARH_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Joydebpur', 'Tangail', 'Ibrahimabad',
  'Bangabandhu Setu East', 'Bangabandhu Setu West', 'Jamtail', 'Ullapara',
  'Ishwardi Bypass', 'Natore', 'Ahsanganj', 'Santahar', 'Akkelpur',
  'Joypurhat', 'Panchbibi', 'Birampur', 'Fulbari', 'Parbatipur',
  'Dinajpur', 'Setabganj', 'Pirganj', 'Thakurgaon Road', 'Ruhia', 'Panchagarh',
];

const DHAKA_RANGPUR_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Joydebpur', 'Tangail', 'Ibrahimabad',
  'Bangabandhu Setu East', 'Bangabandhu Setu West', 'Jamtail', 'Ullapara',
  'Bogra', 'Sonatola', 'Mahimaganj', 'Bonarpara', 'Gaibandha',
  'Bamandanga', 'Kaunia', 'Rangpur', 'Kurigram',
];

const DHAKA_LALMONIRHAT_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Joydebpur', 'Tangail', 'Ibrahimabad',
  'Bangabandhu Setu East', 'Bangabandhu Setu West', 'Jamtail', 'Ullapara',
  'Bogra', 'Sonatola', 'Mahimaganj', 'Bonarpara', 'Gaibandha',
  'Kaunia', 'Lalmonirhat',
];

const DHAKA_CHILAHATI_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Joydebpur', 'Tangail', 'Ibrahimabad',
  'Bangabandhu Setu East', 'Bangabandhu Setu West', 'Jamtail', 'Ullapara',
  'Ishwardi Bypass', 'Natore', 'Ahsanganj', 'Santahar', 'Akkelpur',
  'Joypurhat', 'Parbatipur', 'Saidpur', 'Nilphamari', 'Domar', 'Chilahati',
];

const DHAKA_KHULNA_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Joydebpur', 'Mirzapur', 'Tangail',
  'Ibrahimabad', 'Bangabandhu Setu East', 'Bangabandhu Setu West',
  'Jamtail', 'Ullapara', 'Chatmohar', 'Ishwardi', 'Pakshi',
  'Bheramara', 'Poradaha', 'Alamdanga', 'Chuadanga', 'Darshana',
  'Kotchandpur', 'Mubarakganj', 'Jashore', 'Noapara', 'Daulatpur', 'Khulna',
];

const DHAKA_BENAPOLE_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Joydebpur', 'Tangail', 'Ibrahimabad',
  'Ishwardi', 'Bheramara', 'Poradaha', 'Chuadanga', 'Darshana',
  'Jashore', 'Jhikargachha', 'Benapole',
];

const DHAKA_CHATTOGRAM_NONSTOP_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Chittagong',
];

const DHAKA_CHATTOGRAM_REGULAR_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Narsingdi', 'Bhairab Bazar',
  'Brahmanbaria', 'Akhaura', 'Cumilla', 'Laksham', 'Nangalkot',
  'Hasanpur', 'Gunabati', 'Feni', 'Chittagong',
];

const DHAKA_COXS_BAZAR_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Chittagong', 'Chattogram Cantonment',
  'Dohazari', 'Lohagara', 'Chakaria', 'Dulahazra', 'Islamabad', 'Ramu', "Cox's Bazar",
];

const DHAKA_SYLHET_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Narsingdi', 'Bhairab Bazar',
  'Brahmanbaria', 'Akhaura', 'Mantala', 'Nayapara', 'Shayestaganj',
  'Srimangal', 'Bhanugach', 'Shamshernagar', 'Kulaura', 'Maijgaon',
  'Moglabazar', 'Sylhet',
];

const CHATTOGRAM_SYLHET_STOPS = [
  'Chittagong', 'Feni', 'Gunabati', 'Nangalkot', 'Laksham', 'Cumilla',
  'Akhaura', 'Shayestaganj', 'Srimangal', 'Shamshernagar', 'Kulaura',
  'Maijgaon', 'Sylhet',
];

const DHAKA_DEWANGANJ_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Tongi', 'Joydebpur', 'Gazipur',
  'Gafargaon', 'Mymensingh', 'Piyarpur', 'Jamalpur', 'Dewanganj Bazar',
];

const DHAKA_TARAKANDI_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Tongi', 'Joydebpur', 'Gazipur',
  'Gafargaon', 'Mymensingh', 'Jamalpur', 'Sarishabari', 'Tarakandi',
];

const DHAKA_BHUAPUR_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Tongi', 'Joydebpur', 'Gazipur',
  'Gafargaon', 'Mymensingh', 'Jamalpur', 'Sarishabari', 'Tarakandi',
  'Adv. Motiur Rahman', 'Bhuapur',
];

const DHAKA_MOHANGANJ_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Tongi', 'Joydebpur', 'Gafargaon',
  'Mymensingh', 'Gouripur', 'Netrokona', 'Barhatta', 'Mohanganj',
];

const DHAKA_KISHOREGANJ_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Narsingdi', 'Methikanda', 'Bhairab Bazar',
  'Kuliarchar', 'Bajitpur', 'Sararchar', 'Manikkhali', 'Kishoreganj',
];

const DHAKA_NOAKHALI_STOPS = [
  'Dhaka', 'Dhaka Biman Bandar', 'Narsingdi', 'Bhairab Bazar',
  'Brahmanbaria', 'Akhaura', 'Cumilla', 'Laksham', 'Sonaimuri',
  'Chowmuhani', 'Maijdee Court', 'Noakhali',
];

export const TRAIN_CORRIDOR_STOPS: Record<string, string[]> = {
  'SILKCITY EXPRESS': DHAKA_RAJSHAHI_INTERCITY_STOPS,
  'PADMA EXPRESS': DHAKA_RAJSHAHI_INTERCITY_STOPS,
  'DHUMKETU EXPRESS': DHAKA_RAJSHAHI_INTERCITY_STOPS,
  'BANALATA EXPRESS': BANALATA_STOPS,
  'BANA LATA EXPRESS': BANALATA_STOPS,
  'MADHUMATI EXPRESS': MADHUMATI_STOPS,
  'EKOTA EXPRESS': DHAKA_PANCHAGARH_STOPS,
  'DRUTOJAN EXPRESS': DHAKA_PANCHAGARH_STOPS,
  'DRUTAJAN EXPRESS': DHAKA_PANCHAGARH_STOPS,
  'PANCHAGARH EXPRESS': DHAKA_PANCHAGARH_STOPS,
  'RANGPUR EXPRESS': DHAKA_RANGPUR_STOPS,
  'KURIGRAM EXPRESS': DHAKA_RANGPUR_STOPS,
  'LALMONI EXPRESS': DHAKA_LALMONIRHAT_STOPS,
  'NILSAGAR EXPRESS': DHAKA_CHILAHATI_STOPS,
  'CHILAHATI EXPRESS': DHAKA_CHILAHATI_STOPS,
  'SIRAJGANJ EXPRESS': ['Dhaka', 'Dhaka Biman Bandar', 'Joydebpur', 'Tangail', 'Ibrahimabad', 'Bangabandhu Setu East', 'Bangabandhu Setu West', 'Jamtail', 'Sirajganj', 'Sirajganj Bazar'],
  'CHITRA EXPRESS': DHAKA_KHULNA_STOPS,
  'SUNDARBAN EXPRESS': DHAKA_KHULNA_STOPS,
  'BENAPOLE EXPRESS': DHAKA_BENAPOLE_STOPS,
  'SUBORNO EXPRESS': DHAKA_CHATTOGRAM_NONSTOP_STOPS,
  'SONAR BANGLA EXPRESS': DHAKA_CHATTOGRAM_NONSTOP_STOPS,
  'TURNA EXPRESS': DHAKA_CHATTOGRAM_REGULAR_STOPS,
  'MOHANAGAR PROVATI': DHAKA_CHATTOGRAM_REGULAR_STOPS,
  'MOHANAGAR GODHULI': DHAKA_CHATTOGRAM_REGULAR_STOPS,
  'MOHANAGAR EXPRESS': DHAKA_CHATTOGRAM_REGULAR_STOPS,
  'MAHANAGAR EXPRESS': DHAKA_CHATTOGRAM_REGULAR_STOPS,
  'CHATTALA EXPRESS': DHAKA_CHATTOGRAM_REGULAR_STOPS,
  "COX'S BAZAR EXPRESS": DHAKA_COXS_BAZAR_STOPS,
  'PARJATAK EXPRESS': DHAKA_COXS_BAZAR_STOPS,
  'PARABAT EXPRESS': DHAKA_SYLHET_STOPS,
  'UPABAN EXPRESS': DHAKA_SYLHET_STOPS,
  'KALNI EXPRESS': DHAKA_SYLHET_STOPS,
  'JAYANTIKA EXPRESS': DHAKA_SYLHET_STOPS,
  'PAHARIKA EXPRESS': CHATTOGRAM_SYLHET_STOPS,
  'UDAYAN EXPRESS': CHATTOGRAM_SYLHET_STOPS,
  'TISTA EXPRESS': DHAKA_DEWANGANJ_STOPS,
  'TEESTA EXPRESS': DHAKA_DEWANGANJ_STOPS,
  'BRAHMAPUTRA EXPRESS': DHAKA_DEWANGANJ_STOPS,
  'AGNIBEENA EXPRESS': DHAKA_TARAKANDI_STOPS,
  'AGNIBINA EXPRESS': DHAKA_TARAKANDI_STOPS,
  'JAMUNA EXPRESS': DHAKA_TARAKANDI_STOPS,
  'JAMALPUR EXPRESS': DHAKA_BHUAPUR_STOPS,
  'HAOR EXPRESS': DHAKA_MOHANGANJ_STOPS,
  'MOHANGANJ EXPRESS': DHAKA_MOHANGANJ_STOPS,
  'EGAROSINDHUR PROVATI': DHAKA_KISHOREGANJ_STOPS,
  'EGAROSINDHUR GODHULI': DHAKA_KISHOREGANJ_STOPS,
  'KISHOREGANJ EXPRESS': DHAKA_KISHOREGANJ_STOPS,
  'BIJOY EXPRESS': ['Chittagong', 'Feni', 'Cumilla', 'Akhaura', 'Bhairab Bazar', 'Kishoreganj', 'Gouripur', 'Mymensingh'],
  'MEGHNA EXPRESS': ['Chittagong', 'Feni', 'Laksham', 'Hajiganj', 'Chandpur Court', 'Chandpur'],
  'UPAKUL EXPRESS': DHAKA_NOAKHALI_STOPS,
  'SAGORDARI EXPRESS': ['Khulna', 'Daulatpur', 'Noapara', 'Jashore', 'Kotchandpur', 'Darshana', 'Chuadanga', 'Poradaha', 'Bheramara', 'Pakshi', 'Ishwardi', 'Abdulpur', 'Rajshahi'],
  'KAPOTAKKHA EXPRESS': ['Khulna', 'Daulatpur', 'Noapara', 'Jashore', 'Kotchandpur', 'Darshana', 'Chuadanga', 'Poradaha', 'Bheramara', 'Pakshi', 'Ishwardi', 'Abdulpur', 'Rajshahi'],
  'RUPSHA EXPRESS': ['Khulna', 'Noapara', 'Jashore', 'Chuadanga', 'Poradaha', 'Bheramara', 'Ishwardi', 'Natore', 'Santahar', 'Joypurhat', 'Parbatipur', 'Saidpur', 'Nilphamari', 'Domar', 'Chilahati'],
  'SIMANTA EXPRESS': ['Khulna', 'Noapara', 'Jashore', 'Chuadanga', 'Poradaha', 'Bheramara', 'Ishwardi', 'Natore', 'Santahar', 'Joypurhat', 'Parbatipur', 'Saidpur', 'Nilphamari', 'Domar', 'Chilahati'],
  'BARENDRA EXPRESS': ['Rajshahi', 'Abdulpur', 'Natore', 'Ahsanganj', 'Santahar', 'Joypurhat', 'Birampur', 'Parbatipur', 'Saidpur', 'Nilphamari', 'Domar', 'Chilahati'],
  'TITUMIR EXPRESS': ['Rajshahi', 'Abdulpur', 'Natore', 'Ahsanganj', 'Santahar', 'Joypurhat', 'Birampur', 'Parbatipur', 'Saidpur', 'Nilphamari', 'Domar', 'Chilahati'],
  'BANGLABANDHA EXPRESS': ['Rajshahi', 'Abdulpur', 'Natore', 'Santahar', 'Joypurhat', 'Birampur', 'Parbatipur', 'Dinajpur', 'Setabganj', 'Pirganj', 'Thakurgaon Road', 'Panchagarh'],
  'TUNGIPARA EXPRESS': ['Gopalganj', 'Kashiani Junction', 'Bhanga', 'Rajbari', 'Kushtia', 'Poradaha', 'Bheramara', 'Ishwardi', 'Rajshahi'],
  'KARATOA EXPRESS': ['Santahar', 'Bogra', 'Sonatola', 'Mahimaganj', 'Bonarpara', 'Gaibandha', 'Kaunia', 'Lalmonirhat', 'Patgram', 'Burimari'],
  'DOLONCHAPA EXPRESS': ['Santahar', 'Bogra', 'Sonatola', 'Bonarpara', 'Gaibandha', 'Kaunia', 'Rangpur', 'Parbatipur', 'Dinajpur'],
};

function normalizeTrainKey(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function getBaseStopSequenceForTrain(trainName: string): string[] | null {
  const target = normalizeTrainKey(trainName);
  if (!target) return null;
  for (const [corridorTrain, stops] of Object.entries(TRAIN_CORRIDOR_STOPS)) {
    const k = normalizeTrainKey(corridorTrain);
    if (target === k || target.includes(k) || k.includes(target)) {
      return stops;
    }
  }
  return null;
}

/**
 * Returns the ordered stop list strictly matching the train's travel direction (fromStation -> toStation).
 */
export function getTrainOrderedStops(train: RailwayTrain): string[] {
  const base = getBaseStopSequenceForTrain(train.name);
  if (!base || base.length === 0) {
    return [train.fromStation, train.toStation];
  }
  const fromLower = normalizeStationName(train.fromStation).toLowerCase();
  const toLower = normalizeStationName(train.toStation).toLowerCase();
  const fromIdx = base.findIndex(s => s.toLowerCase() === fromLower);
  const toIdx = base.findIndex(s => s.toLowerCase() === toLower);

  // If train travels in reverse order relative to base list, flip it
  const ordered = fromIdx !== -1 && toIdx !== -1 && fromIdx > toIdx
    ? [...base].reverse()
    : [...base];

  // Slice to [fromIdx..toIdx] when both endpoints appear in corridor (e.g. Dhaka <-> Rajshahi Banalata variant)
  const oFromIdx = ordered.findIndex(s => s.toLowerCase() === fromLower);
  const oToIdx = ordered.findIndex(s => s.toLowerCase() === toLower);
  if (oFromIdx !== -1 && oToIdx !== -1 && oFromIdx <= oToIdx) {
    return ordered.slice(oFromIdx, oToIdx + 1);
  }
  return ordered;
}

export function doesTrainServeStation(trainName: string, stationName: string): boolean {
  if (!trainName || !stationName) return false;
  const canonicalSt = normalizeStationName(stationName).toLowerCase();
  const normalizedTrainKey = normalizeTrainKey(trainName);

  const matchingVariants = RAILWAY_TRAINS.filter(t => {
    const tk = normalizeTrainKey(t.name);
    return tk.includes(normalizedTrainKey) || normalizedTrainKey.includes(tk);
  });
  if (
    matchingVariants.some(
      t =>
        t.fromStation.toLowerCase() === canonicalSt ||
        t.toStation.toLowerCase() === canonicalSt
    )
  ) {
    return true;
  }

  const base = getBaseStopSequenceForTrain(trainName);
  if (base && base.some(s => s.toLowerCase() === canonicalSt)) {
    return true;
  }
  return false;
}

/**
 * Validates that a specific train variant (e.g., 769 Dhaka -> Rajshahi) serves BOTH
 * fromStation and toStation in that exact directional order.
 */
export function doesTrainServeRouteInDirection(
  train: RailwayTrain,
  fromStation: string,
  toStation: string
): boolean {
  if (!fromStation || !toStation) return false;
  const fromNorm = normalizeStationName(fromStation).toLowerCase();
  const toNorm = normalizeStationName(toStation).toLowerCase();
  if (!fromNorm || !toNorm || fromNorm === toNorm) return false;

  const stops = getTrainOrderedStops(train);
  const fromIdx = stops.findIndex(s => s.toLowerCase() === fromNorm);
  const toIdx = stops.findIndex(s => s.toLowerCase() === toNorm);
  return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
}

function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = (hhmm || '00:00').split(':').map(n => parseInt(n, 10) || 0);
  return h * 60 + m;
}

function formatMinutesToHHmm(totalMins: number): string {
  const mins = ((Math.round(totalMins) % 1440) + 1440) % 1440;
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(mins % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export interface SegmentScheduleEstimate {
  boardingTime: string;
  alightingTime: string;
  durationMinutes: number;
  durationLabel: string;
  segmentFare: number;
  isDirectTerminal: boolean;
}

export function estimateSegmentSchedule(
  train: RailwayTrain,
  fromStation: string,
  toStation: string,
  className = 'S_CHAIR'
): SegmentScheduleEstimate {
  const stops = getTrainOrderedStops(train);
  const fromNorm = normalizeStationName(fromStation).toLowerCase();
  const toNorm = normalizeStationName(toStation).toLowerCase();
  const fromIdx = Math.max(0, stops.findIndex(s => s.toLowerCase() === fromNorm));
  const toIdxRaw = stops.findIndex(s => s.toLowerCase() === toNorm);
  const toIdx = toIdxRaw > fromIdx ? toIdxRaw : stops.length - 1;
  const totalSegments = Math.max(1, stops.length - 1);

  const depMins = parseTimeToMinutes(train.departureTime);
  let arrMins = parseTimeToMinutes(train.arrivalTime);
  if (arrMins <= depMins) arrMins += 1440;
  const fullTripMins = Math.max(60, arrMins - depMins);

  const startRatio = fromIdx / totalSegments;
  const endRatio = toIdx / totalSegments;
  const segSpanRatio = Math.max(0.18, endRatio - startRatio);

  const boardingTotalMins = depMins + Math.round(fullTripMins * startRatio);
  const alightingTotalMins = depMins + Math.round(fullTripMins * endRatio);
  const durMins = Math.max(25, alightingTotalMins - boardingTotalMins);

  const hrs = Math.floor(durMins / 60);
  const mins = durMins % 60;
  const durationLabel = `${hrs}h ${String(mins).padStart(2, '0')}m`;

  const baseFare =
    train.fares[className] ??
    RAILWAY_CLASSES.find(c => c.code === className)?.defaultFare ??
    450;

  const isDirectTerminal =
    fromIdx === 0 && toIdx === totalSegments;

  // Compute realistic segment fare rounded to nearest 5 BDT when travelling intermediate stops
  const rawFare = isDirectTerminal ? baseFare : Math.max(Math.round(baseFare * 0.28), Math.round(baseFare * segSpanRatio));
  const segmentFare = isDirectTerminal ? baseFare : Math.max(50, Math.round(rawFare / 5) * 5);

  return {
    boardingTime: isDirectTerminal ? train.departureTime : formatMinutesToHHmm(boardingTotalMins),
    alightingTime: isDirectTerminal ? train.arrivalTime : formatMinutesToHHmm(alightingTotalMins),
    durationMinutes: durMins,
    durationLabel,
    segmentFare,
    isDirectTerminal,
  };
}

const WEEKDAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAY_NAMES_BN: Record<string, string> = {
  Sunday: 'রবিবার',
  Monday: 'সোমবার',
  Tuesday: 'মঙ্গলবার',
  Wednesday: 'বুধবার',
  Thursday: 'বৃহস্পতিবার',
  Friday: 'শুক্রবার',
  Saturday: 'শনিবার',
};

export function isTrainOffDayOnDate(
  offDay: string | undefined,
  journeyDate: string | undefined
): { isOffDay: boolean; weekdayEn: string; weekdayBn: string } {
  if (!journeyDate) {
    return { isOffDay: false, weekdayEn: '', weekdayBn: '' };
  }
  // Anchor to Asia/Dhaka midday so timezone shift never moves the weekday
  const parsed = new Date(`${journeyDate.trim()}T12:00:00+06:00`);
  if (isNaN(parsed.getTime())) {
    return { isOffDay: false, weekdayEn: '', weekdayBn: '' };
  }
  const weekdayEn = WEEKDAY_NAMES_EN[parsed.getUTCDay()] || '';
  const weekdayBn = WEEKDAY_NAMES_BN[weekdayEn] || weekdayEn;
  const normalizedOff = (offDay || '').trim().toLowerCase();
  const isOffDay =
    Boolean(normalizedOff) &&
    normalizedOff !== 'none' &&
    normalizedOff === weekdayEn.toLowerCase();
  return { isOffDay, weekdayEn, weekdayBn };
}

export interface DirectionalTrainSuggestion {
  train: RailwayTrain;
  schedule: SegmentScheduleEstimate;
  isOffDay: boolean;
  offDayWeekdayBn: string;
  source: 'verified' | 'live';
}

export function findDirectionalTrains(
  fromStation: string,
  toStation: string,
  journeyDate?: string,
  className = 'S_CHAIR'
): DirectionalTrainSuggestion[] {
  const fromNorm = normalizeStationName(fromStation);
  const toNorm = normalizeStationName(toStation);
  if (!fromNorm || !toNorm || fromNorm.toLowerCase() === toNorm.toLowerCase()) {
    return [];
  }

  // Deduplicate by train number + name in case duplicate schedule blocks exist
  const seen = new Set<string>();
  const matched: DirectionalTrainSuggestion[] = [];

  for (const train of RAILWAY_TRAINS) {
    if (!doesTrainServeRouteInDirection(train, fromNorm, toNorm)) continue;
    const key = `${train.number}-${normalizeTrainKey(train.name)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const schedule = estimateSegmentSchedule(train, fromNorm, toNorm, className);
    const offStatus = isTrainOffDayOnDate(train.offDay, journeyDate);
    matched.push({
      train,
      schedule,
      isOffDay: offStatus.isOffDay,
      offDayWeekdayBn: offStatus.weekdayBn,
      source: 'verified',
    });
  }

  // Sort: non-off-day + direct terminal first, then by boarding departure time
  return matched.sort((a, b) => {
    if (a.isOffDay !== b.isOffDay) return a.isOffDay ? 1 : -1;
    if (a.schedule.isDirectTerminal !== b.schedule.isDirectTerminal) {
      return a.schedule.isDirectTerminal ? -1 : 1;
    }
    return parseTimeToMinutes(a.schedule.boardingTime) - parseTimeToMinutes(b.schedule.boardingTime);
  });
}

export function getOppositeDirectionTrain(
  trainName: string,
  currentNumber: string,
  newFrom: string,
  newTo: string
): RailwayTrain | null {
  const fromNorm = normalizeStationName(newFrom).toLowerCase();
  const toNorm = normalizeStationName(newTo).toLowerCase();
  const targetKey = normalizeTrainKey(trainName);

  // 1. Same train family serving the swapped direction
  const sameFamily = RAILWAY_TRAINS.find(t => {
    const tk = normalizeTrainKey(t.name);
    const nameMatch = tk === targetKey || tk.includes(targetKey) || targetKey.includes(tk);
    return nameMatch && t.number !== currentNumber && doesTrainServeRouteInDirection(t, newFrom, newTo);
  });
  if (sameFamily) return sameFamily;

  // 2. Any directional match with matching train family
  const familyFallback = RAILWAY_TRAINS.find(t => {
    const tk = normalizeTrainKey(t.name);
    return (tk === targetKey || tk.includes(targetKey)) &&
      t.fromStation.toLowerCase() === fromNorm &&
      t.toStation.toLowerCase() === toNorm;
  });
  if (familyFallback) return familyFallback;

  // 3. Best train serving the swapped route
  const routeMatches = findDirectionalTrains(newFrom, newTo);
  return routeMatches[0]?.train || null;
}

export interface RouteValidationResult {
  valid: boolean;
  reasonBn?: string;
  reasonEn?: string;
  actualRoutes: string[];
  validTrains: RailwayTrain[];
}

export function validateTrainRouteSelection(
  trainName: string,
  trainNumber: string,
  fromStation: string,
  toStation: string
): RouteValidationResult {
  const fromNorm = normalizeStationName(fromStation);
  const toNorm = normalizeStationName(toStation);
  const validTrains = findDirectionalTrains(fromNorm, toNorm).map(s => s.train);

  if (!trainName || !fromNorm || !toNorm || fromNorm.toLowerCase() === toNorm.toLowerCase()) {
    return { valid: true, actualRoutes: [], validTrains };
  }

  const normalizedKey = normalizeTrainKey(trainName);
  const matchingVariants = RAILWAY_TRAINS.filter(t => {
    const tk = normalizeTrainKey(t.name);
    return (trainNumber && t.number === trainNumber) || tk === normalizedKey || tk.includes(normalizedKey) || normalizedKey.includes(tk);
  });

  // Custom/unknown train names are allowed without false-alarm blocking
  if (matchingVariants.length === 0) {
    return { valid: true, actualRoutes: [], validTrains };
  }

  // Exact directional match on selected train variant or family
  const directionalVariant = matchingVariants.find(v => doesTrainServeRouteInDirection(v, fromNorm, toNorm));
  if (directionalVariant) {
    return { valid: true, actualRoutes: [], validTrains };
  }

  const actualRoutes = Array.from(
    new Set(matchingVariants.map(v => `${v.fromStation} ➔ ${v.toStation} [${v.number}]`))
  );
  const servesFrom = matchingVariants.some(v => doesTrainServeStation(v.name, fromNorm));
  const servesTo = matchingVariants.some(v => doesTrainServeStation(v.name, toNorm));

  if (!servesFrom || !servesTo) {
    const missing = !servesFrom ? fromNorm : toNorm;
    const missingBn = getStationBanglaName(missing);
    return {
      valid: false,
      actualRoutes,
      validTrains,
      reasonBn: `"${trainName}" ট্রেনটি কখনোই "${missingBn} (${missing})" স্টেশনে যায় না! এই ট্রেনের আসল রুট: ${actualRoutes.join(' · ')}`,
      reasonEn: `${trainName} never operates via ${missing}. Official route(s): ${actualRoutes.join(' · ')}`,
    };
  }

  return {
    valid: false,
    actualRoutes,
    validTrains,
    reasonBn: `"${trainName} [${trainNumber}]" বিপরীত দিকের ট্রেন (${matchingVariants[0].fromStation} → ${matchingVariants[0].toStation})। ${fromNorm} → ${toNorm} রুটের সঠিক দিকের ট্রেন বেছে নিন।`,
    reasonEn: `${trainName} [${trainNumber}] runs in the opposite direction. Choose a valid train for ${fromNorm} → ${toNorm}.`,
  };
}

// Helper: Map Station English to Bengali
export function getStationBanglaName(stationName: string): string {
  if (!stationName) return '';
  const resolved = normalizeStationName(stationName);
  const match = RAILWAY_STATIONS.find(
    s => s.name.toLowerCase() === resolved.trim().toLowerCase() || s.name.toLowerCase() === stationName.trim().toLowerCase()
  );
  return match ? match.nameBn : stationName;
}

// Helper: Map Coach English to Bengali
// e.g. THA-92 -> ঠ-৯২, KA-15 -> ক-১৫
const COACH_BN_MAP: Record<string, string> = {
  KA: 'ক', KHA: 'খ', GA: 'গ', GHA: 'ঘ', UMA: 'ঙ',
  CHA: 'চ', CHHA: 'ছ', JA: 'জ', JHA: 'ঝ', IYO: 'ঞ',
  TA: 'ট', THA: 'ঠ', DA: 'ড', DHA: 'ঢ', NA: 'ণ',
  TO: 'ত', THO: 'থ', DO: 'দ', DHO: 'ধ', DNO: 'ন',
  PA: 'প', PHA: 'ফ', FA: 'ফ', BA: 'ব', BHA: 'ভ',
  MA: 'ম', YA: 'য', RA: 'র', LA: 'ল', SHA: 'শ',
  SA: 'স', HA: 'হ',
  // Single letter fallbacks
  T: 'ট', TH: 'ঠ', D: 'ড', DH: 'ঢ', N: 'ণ', P: 'প', PH: 'ফ', F: 'ফ',
  B: 'ব', BH: 'ভ', M: 'ম', Y: 'য', R: 'র', L: 'ল', S: 'শ', H: 'হ', K: 'ক', G: 'গ', J: 'জ',
};

export function getPureBanglaCoachSeat(coachSeat: string, customBn?: string): string {
  if (customBn && customBn.trim()) {
    const match = customBn.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    if (/[\u0980-\u09FF]/.test(customBn) && !/^[A-Za-z]/.test(customBn.trim())) {
      return customBn.trim();
    }
  }

  if (!coachSeat) return '';
  const parts = coachSeat.split(',').map(s => {
    const item = s.trim();
    const segs = item.split('-');
    if (segs.length === 2) {
      const prefix = segs[0].toUpperCase().trim();
      const num = segs[1].trim();
      const bnPrefix = COACH_BN_MAP[prefix] || prefix;
      const bnNum = toBanglaDigits(num);
      return `${bnPrefix}-${bnNum}`;
    }
    return toBanglaDigits(item);
  });
  return parts.join(', ');
}

export function formatCoachSeat(coachSeat: string, customBn?: string): string {
  if (!coachSeat) return '';
  if (customBn && customBn.trim()) {
    return `${coachSeat} (${customBn.trim()})`;
  }
  const parts = coachSeat.split('-');
  if (parts.length === 2) {
    const prefix = parts[0].toUpperCase().trim();
    const num = parts[1].trim();
    const bnPrefix = COACH_BN_MAP[prefix] || prefix;
    const bnNum = toBanglaDigits(num);
    return `${coachSeat} (${bnPrefix}-${bnNum})`;
  }
  return `${coachSeat} (${toBanglaDigits(coachSeat)})`;
}

// ─── Feature Helpers: VAT Breakdown, Segment Stoppages, Smart Seats & Masking ───

export const AC_VAT_CLASSES = new Set(['SNIGDHA', 'AC_S', 'AC_B', 'AC_CHAIR', 'F_BERTH', 'F_SEAT']);

export interface FareBreakdown {
  fare: number;
  vat: number;
  serviceCharge: number;
  totalSeats: number;
}

export function calculateTicketFareBreakdown(
  unitGrossFare: number,
  className: string,
  numAdults: number,
  numSeniors: number,
  numChildren: number
): FareBreakdown {
  const adults = Math.max(0, Math.floor(numAdults || 0));
  const seniors = Math.max(0, Math.floor(numSeniors || 0));
  const children = Math.max(0, Math.floor(numChildren || 0));
  const totalSeats = Math.max(1, adults + seniors + children);
  const effectiveMultiplier =
    adults + seniors + children === 0 ? 1 : adults + seniors + children * 0.5;

  const grossTotal = Math.max(0, Math.round(unitGrossFare * effectiveMultiplier));
  const isVatClass = AC_VAT_CLASSES.has((className || '').toUpperCase());

  if (isVatClass && grossTotal > 0) {
    const baseFare = Math.round(grossTotal / 1.15);
    const vat = Math.max(0, grossTotal - baseFare);
    return {
      fare: baseFare,
      vat,
      serviceCharge: 20 * totalSeats,
      totalSeats,
    };
  }

  return {
    fare: grossTotal,
    vat: 0,
    serviceCharge: 20 * totalSeats,
    totalSeats,
  };
}

export interface SegmentStoppageDetails {
  stops: { name: string; nameBn: string }[];
  boardingTime: string;
  alightingTime: string;
  durationLabel: string;
  isNextDayArrival: boolean;
}

export function getSegmentStoppageDetails(
  train: RailwayTrain | undefined,
  fromStation: string,
  toStation: string
): SegmentStoppageDetails | null {
  if (!train || !fromStation || !toStation) return null;
  const stops = getTrainOrderedStops(train);
  const fromNorm = normalizeStationName(fromStation).toLowerCase();
  const toNorm = normalizeStationName(toStation).toLowerCase();
  const fromIdx = stops.findIndex(s => s.toLowerCase() === fromNorm);
  const toIdx = stops.findIndex(s => s.toLowerCase() === toNorm);
  if (fromIdx === -1 || toIdx === -1 || toIdx <= fromIdx) return null;

  const slice = stops.slice(fromIdx, toIdx + 1).map(name => ({
    name,
    nameBn: getStationBanglaName(name),
  }));
  const seg = estimateSegmentSchedule(train, fromStation, toStation, 'S_CHAIR');
  const depM = parseTimeToMinutes(seg.boardingTime);
  const arrM = parseTimeToMinutes(seg.alightingTime);

  return {
    stops: slice,
    boardingTime: seg.boardingTime,
    alightingTime: seg.alightingTime,
    durationLabel: seg.durationLabel,
    isNextDayArrival: arrM <= depM || seg.durationMinutes >= 720,
  };
}

const CLASS_COACH_POOL: Record<string, string[]> = {
  SNIGDHA: ['KA', 'KHA', 'GA'],
  AC_CHAIR: ['KA', 'KHA', 'GA'],
  AC_S: ['GHA', 'UMA', 'KA'],
  AC_B: ['GHA', 'UMA', 'CHA'],
  F_BERTH: ['GHA', 'UMA'],
  F_SEAT: ['KA', 'KHA'],
  S_CHAIR: ['CHA', 'JHA', 'TA', 'THA', 'DA', 'NA'],
  SHOVON: ['THA', 'DA', 'NA', 'PA'],
  SHULOV: ['PA', 'BA', 'MA'],
};

export function generateSmartCoachSeats(
  className: string,
  numSeats: number,
  seedHint?: string
): { coachSeat: string; coachSeatBn: string } {
  const count = Math.max(1, Math.min(12, Math.floor(numSeats || 1)));
  const pool = CLASS_COACH_POOL[(className || 'S_CHAIR').toUpperCase()] || CLASS_COACH_POOL.S_CHAIR;

  // Pick next coach in rotation if seedHint matches same pool, otherwise pick cleanly
  const currentPrefix = (seedHint || '').split('-')[0]?.trim().toUpperCase();
  const currentIdx = pool.indexOf(currentPrefix);
  const coach =
    currentIdx >= 0
      ? pool[(currentIdx + 1) % pool.length]
      : pool[Math.floor(Math.random() * pool.length)];

  const maxSeatNum = className === 'AC_B' || className === 'F_BERTH' ? 32 : 70;
  const start = Math.floor(Math.random() * Math.max(10, maxSeatNum - count)) + 4;
  const seats: string[] = [];
  for (let i = 0; i < count; i++) {
    seats.push(`${coach}-${start + i}`);
  }
  const coachSeat = seats.join(', ');
  return {
    coachSeat,
    coachSeatBn: getPureBanglaCoachSeat(coachSeat),
  };
}

export function syncCoachSeatCount(
  existingCoachSeat: string,
  className: string,
  targetCount: number
): { coachSeat: string; coachSeatBn: string } {
  const count = Math.max(1, Math.min(12, Math.floor(targetCount || 1)));
  const items = (existingCoachSeat || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (items.length === 0) {
    return generateSmartCoachSeats(className, count);
  }
  if (items.length >= count) {
    const sliced = items.slice(0, count).join(', ');
    return { coachSeat: sliced, coachSeatBn: getPureBanglaCoachSeat(sliced) };
  }

  // Extend from the last seat token consecutively (e.g., TA-34 -> TA-34, TA-35, TA-36)
  const last = items[items.length - 1];
  const m = last.match(/^([A-Za-z]+)-(\d+)$/);
  if (!m) {
    return generateSmartCoachSeats(className, count);
  }
  const prefix = m[1].toUpperCase();
  let nextNum = parseInt(m[2], 10);
  const extended = [...items];
  while (extended.length < count) {
    nextNum += 1;
    extended.push(`${prefix}-${nextNum}`);
  }
  const coachSeat = extended.join(', ');
  return { coachSeat, coachSeatBn: getPureBanglaCoachSeat(coachSeat) };
}

export function maskOfficialNumber(raw: string, keepStart = 3, keepEnd = 3): string {
  const cleaned = (raw || '').trim();
  if (!cleaned || cleaned.includes('*') || cleaned.length <= keepStart + keepEnd) {
    return cleaned;
  }
  const starCount = Math.max(3, cleaned.length - keepStart - keepEnd);
  return `${cleaned.slice(0, keepStart)}${'*'.repeat(starCount)}${cleaned.slice(-keepEnd)}`;
}

