import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import TwoLeavesLogo from './TwoLeavesLogo';
import LanguageToggle from './LanguageToggle';
import { translations, Language } from '../utils/translations';
import { whatsappService } from '../services/whatsappAPI';
import { membershipService } from '../services/membershipService';
import { MembershipApplication } from '../lib/supabase';

interface MembershipFormProps {
  phoneNumber: string;
}

interface FormData {
  name: string;
  whatsapp: string;
  alternatePhone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  revenueDistrict: string;
  assemblyConstituency: string;
  education: string;
  specialization: string;
  occupation: string;
  address: string;
  isAlreadyMember: string;
  wantToVolunteer: string;
  wantToJoinAndVolunteer: string;
  motivation: string;
  agreeTerms: boolean;
}

const revenueDistricts = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
  'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
  'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
  'Viluppuram', 'Virudhunagar', 'Puducherry', 'Karaikal'
];

const assemblyConstituencies: Record<string, string[]> = {
  Ariyalur: ['Ariyalur', 'Jayankondam'],
  Chengalpattu: ['Shozhinganallur', 'Pallavaram', 'Tambaram', 'Chengalpattu', 'Thiruporur', 'Cheyyur', 'Madurantakam'],
  Chennai: [
    'Dr.Radhakrishnan Nagar','Perambur','Kolathur','Villivakkam','Thiru-Vi-Ka-Nagar','Egmore','Royapuram','Harbour',
    'Chepauk- Thiruvallikeni','Thousand Lights','Anna Nagar','Virugambakkam','Saidapet','Thiyagarayanagar','Mylapore','Velachery'
  ],
  Coimbatore: ['Mettuppalayam','Sulur','Kavundampalayam','Coimbatore (North)','Thondamuthur','Coimbatore (South)','Singanallur','Kinathukadavu','Pollachi','Valparai'],
  Cuddalore: ['Tittakudi','Vriddhachalam','Neyveli','Panruti','Cuddalore','Kurinjipadi','Bhuvanagiri','Chidambaram','Kattumannarkoil'],
  Dharmapuri: ['Palacodu','Pennagaram','Dharmapuri','Pappireddippatti','Harur'],
  Dindigul: ['Palani','Oddanchatram','Athoor','Nilakkottai','Natham','Dindigul','Vedasandur'],
  Erode: ['Erode (East)','Erode (West)','Modakkurichi','Perundurai','Bhavani','Anthiyur','Gobichettipalayam','Bhavanisagar'],
  Kallakurichi: ['Ulundurpettai','Rishivandiyam','Sankarapuram','Kallakurichi'],
  Kanchipuram: ['Alandur','Sriperumbudur','Uthiramerur','Kancheepuram'],
  Kanyakumari: ['Kanniyakumari','Nagercoil','Colachel','Padmanabhapuram','Vilavancode','Killiyoor'],
  Karur: ['Aravakurichi','Karur','Krishnarayapuram','Kulithalai'],
  Krishnagiri: ['Uthangarai','Bargur','Krishnagiri','Veppanahalli','Hosur','Thalli'],
  Madurai: ['Melur','Madurai East','Sholavandan','Madurai North','Madurai South','Madurai Central','Madurai West','Thiruparankundram','Thirumangalam','Usilampatti'],
  Mayiladuthurai: ['Sirkazhi','Mayiladuthurai','Poompuhar'],
  Nagapattinam: ['Nagapattinam','Kilvelur','Vedaranyam'],
  Namakkal: ['Rasipuram','Senthamangalam','Namakkal','Paramathi-Velur','Tiruchengodu','Kumarapalayam'],
  Nilgiris: ['Udhagamandalam','Gudalur','Coonoor'],
  Perambalur: ['Perambalur','Kunnam'],
  Pudukkottai: ['Gandharvakottai','Viralimalai','Pudukkottai','Thirumayam','Alangudi','Aranthangi'],
  Ramanathapuram: ['Paramakudi','Tiruvadanai','Ramanathapuram','Mudhukulathur'],
  Ranipet: ['Arakkonam','Sholingur','Ranipet','Arcot'],
  Salem: ['Gangavalli','Attur','Yercaud','Omalur','Mettur','Edappadi','Sankari','Salem (West)','Salem (North)','Salem (South)','Veerapandi'],
  Sivaganga: ['Karaikudi','Tiruppattur','Sivaganga','Manamadurai'],
  Tenkasi: ['Sankarankovil','Vasudevanallur','Kadayanallur','Tenkasi','Alangulam'],
  Thanjavur: ['Thiruvidaimarudur','Kumbakonam','Papanasam','Thiruvaiyaru','Thanjavur','Orathanadu','Pattukkottai','Peravurani'],
  Theni: ['Andipatti','Periyakulam','Bodinayakanur','Cumbum'],
  Thoothukudi: ['Vilathikulam','Thoothukkudi','Tiruchendur','Srivaikuntam','Ottapidaram','Kovilpatti'],
  Tiruchirappalli: ['Manapparai','Srirangam','Tiruchirappalli (West)','Tiruchirappalli (East)','Thiruverumbur','Lalgudi','Manachanallur','Musiri','Thuraiyur'],
  Tirunelveli: ['Tirunelveli','Ambasamudram','Palayamkottai','Nanguneri','Radhapuram'],
  Tirupathur: ['Vaniyambadi','Ambur','Jolarpet','Tiruppattur'],
  Tiruppur: ['Dharapuram','Kangayam','Avanashi','Tiruppur (North)','Tiruppur (South)','Palladam','Udumalaipettai','Madathukulam'],
  Tiruvallur: ['Gummidipoondi','Ponneri','Tiruttani','Thiruvallur','Poonamallee','Avadi','Maduravoyal','Ambattur','Madavaram','Tiruvottiyur'],
  Tiruvannamalai: ['Chengam','Tiruvannamalai','Kilpennathur','Kalasapakkam','Polur','Arani','Cheyyar','Vandavasi'],
  Tiruvarur: ['Thiruthuraipoondi','Mannargudi','Thiruvarur','Nannilam'],
  Vellore: ['Katpadi','Vellore','Anaikattu','Kilvaithinankuppam','Gudiyattam'],
  Viluppuram: ['Gingee','Mailam','Tindivanam','Vanur','Viluppuram','Vikravandi','Tirukkoyilur'],
  Virudhunagar: ['Rajapalayam','Srivilliputhur','Sattur','Sivakasi','Virudhunagar','Aruppukkottai','Tiruchuli'],
  Puducherry: ['Puducherry'],
  Karaikal: ['Karaikal']
};

// Tamil labels for districts (display only)
const districtTa: Record<string, string> = {
  Ariyalur: 'அரியலூர்',
  Chengalpattu: 'செங்கல்பட்டு',
  Chennai: 'சென்னை',
  Coimbatore: 'கோயம்புத்தூர்',
  Cuddalore: 'கடலூர்',
  Dharmapuri: 'தர்மபுரி',
  Dindigul: 'திண்டுக்கல்',
  Erode: 'ஈரோடு',
  Kallakurichi: 'கள்ளக்குறிச்சி',
  Kanchipuram: 'காஞ்சிபுரம்',
  Kanyakumari: 'கன்னியாகுமரி',
  Karur: 'கரூர்',
  Krishnagiri: 'கிருஷ்ணகிரி',
  Madurai: 'மதுரை',
  Mayiladuthurai: 'மயிலாடுதுறை',
  Nagapattinam: 'நாகப்பட்டினம்',
  Namakkal: 'நாமக்கல்',
  Nilgiris: 'நீலகிரி',
  Perambalur: 'பெரம்பலூர்',
  Pudukkottai: 'புதுக்கோட்டை',
  Ramanathapuram: 'ராமநாதபுரம்',
  Ranipet: 'ராணிப்பேட்டை',
  Salem: 'சேலம்',
  Sivaganga: 'சிவகங்கை',
  Tenkasi: 'தென்காசி',
  Thanjavur: 'தஞ்சாவூர்',
  Theni: 'தேனி',
  Thoothukudi: 'தூத்துக்குடி',
  Tiruchirappalli: 'திருச்சி',
  Tirunelveli: 'திருநெல்வேலி',
  Tirupathur: 'திருப்பத்தூர்',
  Tiruppur: 'திருப்பூர்',
  Tiruvallur: 'திருவள்ளூர்',
  Tiruvannamalai: 'திருவண்ணாமலை',
  Tiruvarur: 'திருவாரூர்',
  Vellore: 'வேலூர்',
  Viluppuram: 'விழுப்புரம்',
  Virudhunagar: 'விருதுநகர்',
  Puducherry: 'புதுச்சேரி',
  Karaikal: 'காரைக்கால்',
};

// Tamil labels for constituencies by district (display only)
const constituencyTa: Record<string, Record<string, string>> = {
  Ariyalur: {
    Ariyalur: 'அரியலூர்',
    Jayankondam: 'ஜெயங்கொண்டம்',
  },
  Chengalpattu: {
    Shozhinganallur: 'சோழிங்கநல்லூர்',
    Pallavaram: 'பல்லாவரம்',
    Tambaram: 'தாம்பரம்',
    Chengalpattu: 'செங்கல்பட்டு',
    Thiruporur: 'திருப்போரூர்',
    Cheyyur: 'செய்யூர்',
    Madurantakam: 'மதுராந்தகம்',
  },
  Chennai: {
    'Dr.Radhakrishnan Nagar': 'டாக்டர் ராதாகிருஷ்ணன் நகர்',
    Perambur: 'பெரம்பூர்',
    Kolathur: 'கொளத்தூர்',
    Villivakkam: 'வில்லிவாக்கம்',
    'Thiru-Vi-Ka-Nagar': 'திரு-வி-க நகர்',
    Egmore: 'எழும்பூர்',
    Royapuram: 'ராயபுரம்',
    Harbour: 'துறைமுகம்',
    'Chepauk- Thiruvallikeni': 'சேப்பாக்கம்-திருவல்லிக்கேணி',
    'Thousand Lights': 'ஆயிரம் விளக்கு',
    'Anna Nagar': 'அண்ணா நகர்',
    Virugambakkam: 'விருகம்பாக்கம்',
    Saidapet: 'சைதாப்பேட்டை',
    Thiyagarayanagar: 'தியாகராய நகர்',
    Mylapore: 'மயிலாப்பூர்',
    Velachery: 'வேளச்சேரி',
  },
  Coimbatore: {
    Mettuppalayam: 'மேட்டுப்பாளையம்',
    Sulur: 'சூலூர்',
    Kavundampalayam: 'கவுண்டம்பாளையம்',
    'Coimbatore (North)': 'கோவை வடக்கு',
    Thondamuthur: 'தொண்டாமுத்தூர்',
    'Coimbatore (South)': 'கோவை தெற்கு',
    Singanallur: 'சிங்கநல்லூர்',
    Kinathukadavu: 'கினாத்துக்கடவு',
    Pollachi: 'பொள்ளாச்சி',
    Valparai: 'வால்பாறை',
  },
  Cuddalore: {
    Tittakudi: 'திட்டக்குடி',
    Vriddhachalam: 'விருத்தாச்சலம்',
    Neyveli: 'நெய்வேலி',
    Panruti: 'பண்ருட்டி',
    Cuddalore: 'கடலூர்',
    Kurinjipadi: 'குறைஞ்சிப்பாடி',
    Bhuvanagiri: 'புவனகிரி',
    Chidambaram: 'சிதம்பரம்',
    Kattumannarkoil: 'காட்டுமன்னார்கோயில்',
  },
  Dharmapuri: {
    Palacodu: 'பாலக்கோடு',
    Pennagaram: 'பென்னாகரம்',
    Dharmapuri: 'தர்மபுரி',
    Pappireddippatti: 'பாப்பிரெட்டிப்பட்டி',
    Harur: 'அரூர்',
  },
  Dindigul: {
    Palani: 'பழனி',
    Oddanchatram: 'ஒட்டன்சத்திரம்',
    Athoor: 'ஆத்தூர்',
    Nilakkottai: 'நிலக்கோட்டை',
    Natham: 'நத்தம்',
    Dindigul: 'திண்டுக்கல்',
    Vedasandur: 'வேடசந்தூர்',
  },
  Erode: {
    'Erode (East)': 'ஈரோடு கிழக்கு',
    'Erode (West)': 'ஈரோடு மேற்கு',
    Modakkurichi: 'மொடக்குறிச்சி',
    Perundurai: 'பெருந்துறை',
    Bhavani: 'பவானி',
    Anthiyur: 'அந்தியூர்',
    Gobichettipalayam: 'கோபிச்செட்டிப்பாளையம்',
    Bhavanisagar: 'பவானிசாகர்',
  },
  Kallakurichi: {
    Ulundurpettai: 'உளுந்தூர்பேட்டை',
    Rishivandiyam: 'ரிஷிவந்தியம்',
    Sankarapuram: 'சங்கராபுரம்',
    Kallakurichi: 'கள்ளக்குறிச்சி',
  },
  Kanchipuram: {
    Alandur: 'ஆலந்தூர்',
    Sriperumbudur: 'ஸ்ரீபெரும்புதூர்',
    Uthiramerur: 'உத்திரமேரூர்',
    Kancheepuram: 'காஞ்சிபுரம்',
  },
  Kanyakumari: {
    Kanniyakumari: 'கன்னியாகுமரி',
    Nagercoil: 'நாகர்கோவில்',
    Colachel: 'குளச்சல்',
    Padmanabhapuram: 'பத்மநாபபுரம்',
    Vilavancode: 'விளவங்கோடு',
    Killiyoor: 'கிள்ளியூர்',
  },
  Karur: {
    Aravakurichi: 'அரவக்குறிச்சி',
    Karur: 'கரூர்',
    Krishnarayapuram: 'கிருஷ்ணராயபுரம்',
    Kulithalai: 'குளித்தலை',
  },
  Krishnagiri: {
    Uthangarai: 'ஊத்தங்கரை',
    Bargur: 'பர்கூர்',
    Krishnagiri: 'கிருஷ்ணகிரி',
    Veppanahalli: 'வேப்பனஹள்ளி',
    Hosur: 'ஓசூர்',
    Thalli: 'தளி',
  },
  Madurai: {
    Melur: 'மேலூர்',
    'Madurai East': 'மதுரை கிழக்கு',
    Sholavandan: 'சோழவந்தான்',
    'Madurai North': 'மதுரை வடக்கு',
    'Madurai South': 'மதுரை தெற்கு',
    'Madurai Central': 'மதுரை மத்தியம்',
    'Madurai West': 'மதுரை மேற்கு',
    Thiruparankundram: 'திருப்பரங்குன்றம்',
    Thirumangalam: 'திருமங்கலம்',
    Usilampatti: 'உசிலம்பட்டி',
  },
  Mayiladuthurai: {
    Sirkazhi: 'சீர்காழி',
    Mayiladuthurai: 'மயிலாடுதுறை',
    Poompuhar: 'பூம்புகார்',
  },
  Nagapattinam: {
    Nagapattinam: 'நாகப்பட்டினம்',
    Kilvelur: 'கீழ்வேளூர்',
    Vedaranyam: 'வேதாரண்யம்',
  },
  Namakkal: {
    Rasipuram: 'ராசிபுரம்',
    Senthamangalam: 'சேந்தமங்கலம்',
    Namakkal: 'நாமக்கல்',
    'Paramathi-Velur': 'பரமத்தி-வேலூர்',
    Tiruchengodu: 'திருச்செங்கோடு',
    Kumarapalayam: 'குமாரபாளையம்',
  },
  Nilgiris: {
    Udhagamandalam: 'உதகமண்டலம்',
    Gudalur: 'கூடலூர்',
    Coonoor: 'குன்னூர்',
  },
  Perambalur: {
    Perambalur: 'பெரம்பலூர்',
    Kunnam: 'குன்னம்',
  },
  Pudukkottai: {
    Gandharvakottai: 'கந்தர்வக்கோட்டை',
    Viralimalai: 'விராலிமலை',
    Pudukkottai: 'புதுக்கோட்டை',
    Thirumayam: 'திருமயம்',
    Alangudi: 'ஆலங்குடி',
    Aranthangi: 'அறந்தாங்கி',
  },
  Ramanathapuram: {
    Paramakudi: 'பரமக்குடி',
    Tiruvadanai: 'திருவாடனை',
    Ramanathapuram: 'ராமநாதபுரம்',
    Mudhukulathur: 'முதுகுளத்தூர்',
  },
  Ranipet: {
    Arakkonam: 'அரக்கோணம்',
    Sholingur: 'சோளிங்கர்',
    Ranipet: 'ராணிப்பேட்டை',
    Arcot: 'ஆற்காடு',
  },
  Salem: {
    Gangavalli: 'கெங்கவல்லி',
    Attur: 'ஆத்தூர்',
    Yercaud: 'ஏற்காடு',
    Omalur: 'ஓமலூர்',
    Mettur: 'மேட்டூர்',
    Edappadi: 'எடப்பாடி',
    Sankari: 'சங்கரி',
    'Salem (West)': 'சேலம் மேற்கு',
    'Salem (North)': 'சேலம் வடக்கு',
    'Salem (South)': 'சேலம் தெற்கு',
    Veerapandi: 'வீரபாண்டி',
  },
  Sivaganga: {
    Karaikudi: 'காரைக்குடி',
    Tiruppattur: 'திருப்பத்தூர்',
    Sivaganga: 'சிவகங்கை',
    Manamadurai: 'மானாமதுரை',
  },
  Tenkasi: {
    Sankarankovil: 'சங்கரன்கோவில்',
    Vasudevanallur: 'வாசுதேவநல்லூர்',
    Kadayanallur: 'கடையநல்லூர்',
    Tenkasi: 'தென்காசி',
    Alangulam: 'ஆலங்குளம்',
  },
  Thanjavur: {
    Thiruvidaimarudur: 'திருவிடைமருதூர்',
    Kumbakonam: 'கும்பகோணம்',
    Papanasam: 'பாபநாசம்',
    Thiruvaiyaru: 'திருவையாறு',
    Thanjavur: 'தஞ்சாவூர்',
    Orathanadu: 'ஒரத்தநாடு',
    Pattukkottai: 'பட்டுக்கோட்டை',
    Peravurani: 'பேராவூரணி',
  },
  Theni: {
    Andipatti: 'ஆண்டிபட்டி',
    Periyakulam: 'பெரியகுளம்',
    Bodinayakanur: 'போடிநாயக்கனூர்',
    Cumbum: 'கம்பம்',
  },
  Thoothukudi: {
    Vilathikulam: 'விளாத்திக்குளம்',
    Thoothukkudi: 'தூத்துக்குடி',
    Tiruchendur: 'திருச்செந்தூர்',
    Srivaikuntam: 'ஸ்ரீவைகுண்டம்',
    Ottapidaram: 'ஓட்டப்பிடாரம்',
    Kovilpatti: 'கோவில்பட்டி',
  },
  Tiruchirappalli: {
    Manapparai: 'மணப்பாறை',
    Srirangam: 'ஸ்ரீரங்கம்',
    'Tiruchirappalli (West)': 'திருச்சி மேற்கு',
    'Tiruchirappalli (East)': 'திருச்சி கிழக்கு',
    Thiruverumbur: 'திருவரம்பூர்',
    Lalgudi: 'லால்குடி',
    Manachanallur: 'மண்ணச்சநல்லூர்',
    Musiri: 'முசிறி',
    Thuraiyur: 'துறையூர்',
  },
  Tirunelveli: {
    Tirunelveli: 'திருநெல்வேலி',
    Ambasamudram: 'அம்பாசமுத்திரம்',
    Palayamkottai: 'பாளையங்கோட்டை',
    Nanguneri: 'நாங்குநேரி',
    Radhapuram: 'ராதாபுரம்',
  },
  Tirupathur: {
    Vaniyambadi: 'வாணியம்பாடி',
    Ambur: 'ஆம்பூர்',
    Jolarpet: 'ஜோலார்பேட்டை',
    Tiruppattur: 'திருப்பத்தூர்',
  },
  Tiruppur: {
    Dharapuram: 'தாராபுரம்',
    Kangayam: 'காங்கேயம்',
    Avanashi: 'அவிநாசி',
    'Tiruppur (North)': 'திருப்பூர் வடக்கு',
    'Tiruppur (South)': 'திருப்பூர் தெற்கு',
    Palladam: 'பல்லடம்',
    Udumalaipettai: 'உடுமலைப்பேட்டை',
    Madathukulam: 'மடத்துக்குளம்',
  },
  Tiruvallur: {
    Gummidipoondi: 'கும்மிடிபூண்டி',
    Ponneri: 'பொன்னேரி',
    Tiruttani: 'திருத்தணி',
    Thiruvallur: 'திருவள்ளூர்',
    Poonamallee: 'பூந்தமல்லி',
    Avadi: 'ஆவடி',
    Maduravoyal: 'மதுரவாயல்',
    Ambattur: 'அம்பத்தூர்',
    Madavaram: 'மாதவரம்',
    Tiruvottiyur: 'திருவொற்றியூர்',
  },
  Tiruvannamalai: {
    Chengam: 'செங்கம்',
    Tiruvannamalai: 'திருவண்ணாமலை',
    Kilpennathur: 'கீழ்பெண்ணாத்தூர்',
    Kalasapakkam: 'கலசபாக்கம்',
    Polur: 'போளூர்',
    Arani: 'ஆரணி',
    Cheyyar: 'செய்யாறு',
    Vandavasi: 'வந்தவாசி',
  },
  Tiruvarur: {
    Thiruthuraipoondi: 'திருத்துறைப்பூண்டி',
    Mannargudi: 'மன்னார்குடி',
    Thiruvarur: 'திருவாரூர்',
    Nannilam: 'நன்னிலம்',
  },
  Vellore: {
    Katpadi: 'காட்பாடி',
    Vellore: 'வேலூர்',
    Anaikattu: 'ஆனைகட்டு',
    Kilvaithinankuppam: 'கிழவைத்தினங்குப்பம்',
    Gudiyattam: 'குடியாட்டம்',
  },
  Viluppuram: {
    Gingee: 'செஞ்சி',
    Mailam: 'மயிலம்',
    Tindivanam: 'திண்டிவனம்',
    Vanur: 'வானூர்',
    Viluppuram: 'விழுப்புரம்',
    Vikravandi: 'விக்கிரவாண்டி',
    Tirukkoyilur: 'திருக்கோயிலூர்',
  },
  Virudhunagar: {
    Rajapalayam: 'ராஜபாளையம்',
    Srivilliputhur: 'ஸ்ரீவில்லிபுத்தூர்',
    Sattur: 'சாத்தூர்',
    Sivakasi: 'சிவகாசி',
    Virudhunagar: 'விருதுநகர்',
    Aruppukkottai: 'அருப்புக்கோட்டை',
    Tiruchuli: 'திருச்சு',
  },
  Puducherry: {
    Puducherry: 'புதுச்சேரி',
  },
  Karaikal: {
    Karaikal: 'காரைக்கால்',
  },
};

export default function MembershipForm({ phoneNumber }: MembershipFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    whatsapp: '',
    alternatePhone: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    revenueDistrict: '',
    assemblyConstituency: '',
    education: '',
    specialization: '',
    occupation: '',
    address: '',
    isAlreadyMember: '',
    wantToVolunteer: '',
    wantToJoinAndVolunteer: '',
    motivation: '',
    agreeTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('app_language');
      if (saved === 'ta' || saved === 'en') return saved as Language;
      const envDefault = (import.meta as ImportMeta).env?.VITE_DEFAULT_LANGUAGE as string | undefined;
      const fallback = envDefault === 'ta' || envDefault === 'en' ? (envDefault as Language) : 'ta';
      return fallback;
    } catch {
      return 'ta';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('app_language', language);
    } catch {
      /* ignore */
    }
  }, [language]);

  // Honor saved choice or env default; no forced migration
  // Toggle to enable/disable WhatsApp welcome message after submission
  const ENABLE_WHATSAPP_WELCOME = false;

  const t = translations[language];

  // Max allowed DOB to ensure age >= 18
  const maxDOBDate = new Date();
  maxDOBDate.setFullYear(maxDOBDate.getFullYear() - 18);
  const maxDOB = maxDOBDate.toISOString().split('T')[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Sanitize numeric-only fields
      const nextValue = name === 'alternatePhone'
        ? value.replace(/\D/g, '').slice(0, 10)
        : value;

      setFormData(prev => ({
        ...prev,
        [name]: nextValue,
        // Reset dependent fields
        ...(name === 'revenueDistrict' ? { assemblyConstituency: '' } : {})
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // clear previous errors shown via alert only
    
    try {
      // Age validation: must be at least 18 years
      if (formData.dateOfBirth) {
        const dob = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 18) {
          const msg = language === 'en' ? 'You must be at least 18 years old to apply.' : 'விண்ணப்பிக்க உங்கள் வயது குறைந்தது 18 ஆக இருக்க வேண்டும்.';
          alert(msg);
          setIsSubmitting(false);
          return;
        }
      }
      // Check if phone number already exists
      const existingCheck = await membershipService.getApplicationByPhone(phoneNumber);
      if (existingCheck.success && existingCheck.application) {
        const errorMessage = language === 'en' 
          ? 'You have already registered with this phone number.'
          : 'இந்த தொலைபேசி எண்ணுடன் நீங்கள் ஏற்கனவே பதிவு செய்துள்ளீர்கள்.';
        alert(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // Prepare application data
      // Normalize phone to match OTP records (always with 91 prefix)
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      const applicationData: Omit<MembershipApplication, 'id' | 'submitted_at' | 'updated_at'> = {
        phone_number: formattedPhone,
        alternate_phone_number: formData.alternatePhone ? formData.alternatePhone.replace(/\D/g, '') : undefined,
        name: formData.name,
        email: formData.email || undefined,
        gender: formData.gender as 'Male' | 'Female' | 'Other',
        date_of_birth: formData.dateOfBirth,
        revenue_district: formData.revenueDistrict,
        assembly_constituency: formData.assemblyConstituency,
        education: formData.education as MembershipApplication['education'],
        specialization: formData.specialization || undefined,
        occupation: formData.occupation,
        address: formData.address || undefined,
        is_already_member: formData.isAlreadyMember === 'Yes',
        want_to_volunteer: formData.wantToVolunteer === 'Yes',
        want_to_join_and_volunteer: formData.wantToJoinAndVolunteer === 'Yes',
        motivation: formData.motivation
      };

      // Submit to database
      const result = await membershipService.submitApplication(applicationData);
      
      if (result.success) {
        console.log('Application submitted successfully:', result.applicationId);
        // WhatsApp welcome message paused; enable by setting ENABLE_WHATSAPP_WELCOME = true
        if (ENABLE_WHATSAPP_WELCOME) {
          const videoUrl = 'https://backend-filegator.pn8thx.easypanel.host/?r=/download&path=L0NhbXBhaWduIFZpZGVvIC0gMDEgKDEpLm1wNA%3D%3D';
          void whatsappService.sendWelcomeTemplateWithVideo(phoneNumber, videoUrl, {
            templateName: 'welcome_message',
            languageCode: 'en'
          });
        }

        // Fire-and-forget: send submission payload to n8n webhook with Basic Auth
        try {
          const webhookUrl = 'https://backend-n8n.pn8thx.easypanel.host/webhook/whatsappapi';
          const basicAuth = btoa('nirmal@lifedemy.in:Aiadmk@2025123');
          const payload = { ...applicationData, application_id: result.applicationId };
          void fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${basicAuth}`
            },
            body: JSON.stringify(payload),
            // Keep credentials out; CORS handled by server
          }).catch(err => console.warn('Webhook post failed:', err));
        } catch (err) {
          console.warn('Webhook preparation failed:', err);
        }
        setIsSubmitted(true);
      } else {
        console.error('Application submission failed:', result.error);
        const errorMessage = language === 'en'
          ? `Application submission failed: ${result.error}`
          : `விண்ணப்பம் சமர்பிக்க முடியவில்லை: ${result.error}`;
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = language === 'en'
        ? 'An error occurred while submitting your application. Please try again.'
        : 'உங்கள் விண்ணப்பத்தை சமர்பிக்கும் போது பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        {/* Language toggle hidden on success screen */}
        
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          {/* Logo above the tick */}
          <img
            src="/LOGO amdmk.webp"
            alt="Logo"
            className="w-45 h-auto mx-auto mb-4"
            loading="lazy"
            decoding="async"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.applicationSubmitted}</h2>
          <div className="space-y-2 text-gray-800">
            {/* Tamil first */}
            <p className="text-base font-semibold inline-block bg-amber-100 text-amber-900 px-4 py-2 rounded-md shadow-sm">
              குடும்ப அரசியலுக்கு எதிரான போராட்டத்தில் இணைந்ததற்கு நன்றி.
            </p>
            <p className="text-base font-bold">நமது உழைப்பால் நாளைய எதிர்காலத்தை சிறப்பாக மாற்றுவோம். எங்களின் குழுவினர் உங்களை தொடர்பு கொள்வார்கள்</p>
            <div className="pt-2" />
            {/* English next */}
            <p className="text-base font-semibold inline-block bg-amber-100 text-amber-900 px-4 py-2 rounded-md shadow-sm">
              Thank you for joining the fight against dynastic politics.
            </p>
            <p className="text-base font-bold">Together, let's build a better tomorrow. Our team will get in touch with you soon!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TwoLeavesLogo className="h-20 w-20 text-green-600" />
          </div>
          <LanguageToggle language={language} onLanguageChange={setLanguage} />
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            {/* Leaders Banner */}
            <div className="mb-6">
              <img 
                src="/Leaders banner.webp" 
                alt="AIADMK Leaders" 
                className="h-48 w-auto mx-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            
            {/* AIADMK Logo */}
            <div className="mb-4">
              <img 
                src="/LOGO amdmk.webp" 
                alt="AIADMK Logo" 
                className="h-50 w-auto mx-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            
            {/* Badge removed */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Join the <span className="text-green-600">Movement</span>
            </h1>
            <div className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl mx-auto space-y-3">
              {t.joinDescription.split('\n\n').map((para, idx) => (
                <p key={idx} className="whitespace-pre-line">{para}</p>
              ))}
            </div>
            <div className="bg-green-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg">
              {t.joinMovementToday}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {/* Phone Number (Read-only, already verified) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.mobileNumber} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    className="w-full px-4 py-3 border border-green-500 bg-green-50 rounded-lg cursor-not-allowed"
                    readOnly
                  />
                  <div className="absolute right-3 top-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-1">{t.phoneVerified}</p>
              </div>

              {/* Alternate Phone Number (collect separately) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.alternatePhone} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={t.enterAlternatePhone}
                  pattern="^[0-9]{10}$"
                  maxLength={10}
                  inputMode="numeric"
                  title="Enter exactly 10 digits"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{t.tenDigits}</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={t.enterName}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={t.enterEmail}
                />
              </div>

              {/* Gender and Date of Birth */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.gender} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">{t.selectGender}</option>
                    <option value="Male">{t.male}</option>
                    <option value="Female">{t.female}</option>
                    <option value="Other">{t.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.dateOfBirth} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    max={maxDOB}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.revenueDistrict} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="revenueDistrict"
                    value={formData.revenueDistrict}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">{t.selectDistrict}</option>
                    {revenueDistricts.map(district => {
                      const label = language === 'ta' ? (districtTa[district] || district) : district;
                      return (
                        <option key={district} value={district}>{label}</option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.assemblyConstituency} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assemblyConstituency"
                    value={formData.assemblyConstituency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    disabled={!formData.revenueDistrict}
                  >
                    <option value="">{t.selectConstituency}</option>
                    {formData.revenueDistrict && assemblyConstituencies[formData.revenueDistrict]?.map(constituency => {
                      const label = language === 'ta' ? (constituencyTa[formData.revenueDistrict]?.[constituency] || constituency) : constituency;
                      return (
                        <option key={constituency} value={constituency}>{label}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Education */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.education} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">{t.selectEducation}</option>
                    <option value="Arts & Science">{t.educationArtsScience}</option>
                    <option value="Engineering">{t.educationEngineering}</option>
                    <option value="Law">{t.educationLaw}</option>
                    <option value="Medicine">{t.educationMedicine}</option>
                    <option value="Management">{t.educationManagement}</option>
                  </select>
                </div>
                {/* Removed specialization field per new requirement */}
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.occupation} <span className="text-red-500">*</span>
                </label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">{t.selectOccupation}</option>
                  <option value="Student">{t.student}</option>
                  <option value="Private">{t.privateEmployed}</option>
                  <option value="Government">{t.governmentEmployed}</option>
                  <option value="Self Employed">{t.selfEmployed}</option>
                  <option value="Business">{t.business}</option>
                  <option value="Home Maker">{t.homeMaker}</option>
                </select>
              </div>

              {/* Membership Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.alreadyMember} <span className="text-red-500">*</span>
                </label>
                <select
                  name="isAlreadyMember"
                  value={formData.isAlreadyMember}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">{t.selectOption}</option>
                  <option value="Yes">{t.yes}</option>
                  <option value="No">{t.no}</option>
                </select>
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.whyJoin} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder={t.motivationPlaceholder}
                  required
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-600 leading-relaxed">
                  {t.agreeTerms}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {isSubmitting ? t.submittingApplication : t.submitApplication}
              </button>

              {/* Footer Note removed */}
            </form>
          </div>

          {/* Footer removed: using global footer from App.tsx */}
        </div>
      </div>
    </div>
  );
}