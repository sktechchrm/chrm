import { FACTORY_NAME_EN, FACTORY_ADDRESS_EN } from '../../../config/factory';
import React, { useState } from 'react';
import { EmployeeFormData, AgeData, DocumentProps } from '../../../types/employee.types';

const calculateAge = (dob: string): AgeData => {
  if (!dob) return { years: 0, months: 0, days: 0 };
  const birthDate = new Date(dob);
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();
  
  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return { years, months, days };
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateLong = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
};

const MedicalFitnessCertificate: React.FC<DocumentProps> = ({ formData }) => {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const age = calculateAge(formData.dateOfBirth);
  const today = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const displayName = language === 'bn' 
    ? (formData.fullNameBengali || formData.fullName)
    : formData.fullName;
  
  const displayGender = language === 'bn'
    ? (formData.gender === 'Male' ? 'পুরুষ' : formData.gender === 'Female' ? 'মহিলা' : formData.gender)
    : formData.gender;
  
  // Construct permanent address properly
  const fullAddress = formData.permanentAddress || 
    [
      formData.permanentVillage,
      formData.permanentPostOffice,
      formData.permanentThana,
      formData.permanentDistrict
    ].filter(Boolean).join(', ');
  
  const content = {
    en: {
      title: 'CERTIFICATE OF MEDICAL FITNESS',
      subtitle: '[Bangladesh Labour Rules Form No. 15]',
      candidateName: 'Name of the candidate',
      dobAge: 'Date of Birth & Age',
      gender: 'Gender',
      address: 'Address',
      height: 'Height',
      weight: 'Weight',
      idMarks: 'Identification Marks on body',
      certification: 'This is to certify that I have conducted clinical examination of',
      mrMs: formData.gender === 'Male' ? 'Mr.' : 'Ms.',
      desirous: 'who is desirous of employment/admission to professional course.',
      examination: 'On clinical examination it has been found that he/she is medically fit and capable for the designated work.',
      bloodPressure: 'Blood Pressure',
      eyeExamination: 'Eye Examination Results',
      hearing: 'Hearing Defect',
      physicallyCap: 'Physically Capable',
      capable: 'Capable',
      notCapable: 'Not Capable',
      practitioner: 'Name of the Practitioner',
      signature: 'Signature',
      registration: 'Registration Number',
      stamp: 'Stamp / Seal',
      date: 'Date',
      place: 'Place',
      photo: 'Photograph',
      thumbImpression: 'Left Thumb Impression',
      note: '***Certificate should be on the letter head of Doctor',
      years: 'Years',
      normal: 'Normal',
      abnormal: 'Abnormal',
      cm: 'cm',
      kg: 'kg'
    },
    bn: {
      title: 'চিকিৎসা সক্ষমতার সনদপত্র',
      subtitle: '[বাংলাদেশ শ্রম বিধিমালা ফরম নং-১৫]',
      candidateName: 'প্রার্থীর নাম',
      dobAge: 'জন্ম তারিখ ও বয়স',
      gender: 'লিঙ্গ',
      address: 'ঠিকানা',
      height: 'উচ্চতা',
      weight: 'ওজন',
      idMarks: 'শরীরের সনাক্তকরণ চিহ্ন',
      certification: 'আমি এই মর্মে প্রত্যয়ন করিতেছি যে আমি ক্লিনিক্যাল পরীক্ষা করিয়াছি',
      mrMs: formData.gender === 'Male' ? 'জনাব' : 'জনাবা',
      desirous: 'যিনি চাকুরী/পেশাগত কোর্সে ভর্তি হইতে ইচ্ছুক।',
      examination: 'ক্লিনিক্যাল পরীক্ষায় দেখা গিয়াছে যে তিনি চিকিৎসাগতভাবে সুস্থ এবং নির্ধারিত কাজের জন্য সক্ষম।',
      bloodPressure: 'রক্তচাপ',
      eyeExamination: 'চোখের পরীক্ষা ফলাফল',
      hearing: 'শ্রবণ ত্রুটি',
      physicallyCap: 'শারীরিকভাবে সক্ষমতা',
      capable: 'সক্ষম',
      notCapable: 'অক্ষম',
      practitioner: 'চিকিৎসকের নাম',
      signature: 'স্বাক্ষর',
      registration: 'নিবন্ধন নম্বর',
      stamp: 'সিল/স্ট্যাম্প',
      date: 'তারিখ',
      place: 'স্থান',
      photo: 'ছবি',
      thumbImpression: 'বাম হাতের বৃদ্ধাঙ্গুলির ছাপ',
      note: '***সনদপত্র অবশ্যই চিকিৎসকের লেটার হেডে হতে হবে',
      years: 'বৎসর',
      normal: 'স্বাভাবিক',
      abnormal: 'অস্বাভাবিক',
      cm: 'সে.মি.',
      kg: 'কে.জি.'
    }
  };
  
  const t = content[language];
  
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: language === 'bn' ? 'SolaimanLipi, Arial, sans-serif' : 'Arial, sans-serif' }}>
      {/* Language Toggle */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => setLanguage('en')}
          className={`px-4 py-2 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('bn')}
          className={`px-4 py-2 rounded ${language === 'bn' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          বাংলা
        </button>
      </div>

      <div className="border-4 border-black p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="w-20 h-16 bg-gray-200 flex items-center justify-center border border-black">
              <div className="text-center">
                <div className="font-bold text-lg">MG</div>
                <div className="text-xs">GROUP</div>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold">{formData.companyName || FACTORY_NAME_EN}</h1>
              <p className="text-xs">{formData.companyAddress || FACTORY_ADDRESS_EN}</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold underline mb-2">{t.title}</h2>
          <p className="text-xs text-gray-700">{t.subtitle}</p>
        </div>

        <div className="space-y-4">
          {/* Photo Space - Added */}
          <div className="flex justify-end mb-4">
            <div className="text-center">
              <div className="border-2 border-black w-32 h-40 bg-gray-50 flex items-center justify-center">
                <span className="text-gray-400 text-sm">{t.photo}</span>
              </div>
            </div>
          </div>

          {/* Candidate Name */}
          <div className="flex items-start gap-2">
            <span className="font-semibold whitespace-nowrap min-w-[200px]">{t.candidateName}:</span>
            <div className="border-b-2 border-black flex-1 px-2 min-h-[32px] flex items-center">
              {displayName}
            </div>
          </div>

          {/* Date of Birth & Age */}
          <div className="flex items-start gap-2">
            <span className="font-semibold whitespace-nowrap min-w-[200px]">{t.dobAge}:</span>
            <div className="border-b-2 border-black flex-1 px-2 min-h-[32px] flex items-center">
              {formatDateLong(formData.dateOfBirth)} ({age.years} {t.years})
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start gap-2">
            <span className="font-semibold whitespace-nowrap min-w-[200px]">{t.gender}:</span>
            <div className="border-b-2 border-black flex-1 px-2 min-h-[32px] flex items-center">
              {displayGender}
            </div>
          </div>

          {/* Height and Weight - Added */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{t.height}:</span>
              <div className="border-b-2 border-black flex-1 px-2 min-h-[32px] flex items-center">
                {formData.height ? `${formData.height} ${t.cm}` : <span className="text-gray-400 text-sm">{t.cm}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{t.weight}:</span>
              <div className="border-b-2 border-black flex-1 px-2 min-h-[32px] flex items-center">
                {formData.weight ? `${formData.weight} ${t.kg}` : <span className="text-gray-400 text-sm">{t.kg}</span>}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <span className="font-semibold whitespace-nowrap min-w-[200px]">{t.address}:</span>
            <div className="border-b-2 border-black flex-1 px-2 min-h-[32px] flex items-center">
              {fullAddress}
            </div>
          </div>

          {/* Identification Marks */}
          <div>
            <span className="font-semibold">{t.idMarks}:</span>
            <div className="ml-6 mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span>1)</span>
                <div className="border-b-2 border-black flex-1 px-2 min-h-[32px]">
                  {formData.identificationMark}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>2)</span>
                <div className="border-b-2 border-black flex-1 px-2 min-h-[32px]"></div>
              </div>
            </div>
          </div>

          {/* Certification Statement */}
          <div className="border-2 border-gray-400 p-6 bg-blue-50 my-6">
            <p className="mb-4 text-justify leading-relaxed">
              {t.certification} {t.mrMs} <span className="font-bold underline">{displayName}</span> {t.desirous}
            </p>
            <p className="text-justify leading-relaxed font-semibold">
              {t.examination}
            </p>
          </div>

          {/* Medical Details */}
          <div className="border-2 border-gray-300 p-4 bg-gray-50 space-y-4">
            {/* Blood Pressure */}
            <div className="flex items-center gap-2">
              <span className="font-semibold min-w-[150px]">{t.bloodPressure}:</span>
              <div className="border-2 border-black px-4 py-2 flex-1 bg-white"></div>
            </div>

            {/* Eye Examination */}
            <div>
              <div className="font-semibold mb-2">{t.eyeExamination}:</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-semibold">VAR:</span>
                    <div className="border-2 border-black px-4 py-2 flex-1 bg-white"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-semibold">VAL:</span>
                    <div className="border-2 border-black px-4 py-2 flex-1 bg-white"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{t.normal}:</span>
                    <div className="border-2 border-black px-4 py-2 flex-1 bg-white"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{t.abnormal}:</span>
                    <div className="border-2 border-black px-4 py-2 flex-1 bg-white"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hearing */}
            <div className="flex items-center gap-2">
              <span className="font-semibold min-w-[150px]">{t.hearing}:</span>
              <div className="border-2 border-black px-4 py-2 flex-1 bg-white"></div>
            </div>

            {/* Physical Capability */}
            <div className="flex items-center gap-4 p-3 bg-white border-2 border-gray-400">
              <span className="font-semibold">{t.physicallyCap}:</span>
              <div className="flex gap-6 ml-4">
                <label className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black"></div>
                  <span>{t.capable}</span>
                </label>
                <label className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black"></div>
                  <span>{t.notCapable}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Left Thumb Impression - Added (Mandatory for Form-15) */}
          <div className="border-2 border-gray-400 p-4 bg-yellow-50 mt-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <span className="font-semibold text-red-600" role="alert">{t.thumbImpression}:</span>
                <p className="text-xs text-gray-600 mt-1">
                  {language === 'en' 
                    ? '(As per Bangladesh Labour Rules 2015, left thumb impression is mandatory)'
                    : '(বাংলাদেশ শ্রম বিধিমালা ২০১৫ অনুযায়ী বাম বৃদ্ধাঙ্গুলির ছাপ বাধ্যতামূলক)'}
                </p>
              </div>
              <div className="border-2 border-black w-24 h-28 bg-white flex items-center justify-center">
                <span className="text-gray-400 text-xs text-center px-2">{t.thumbImpression}</span>
              </div>
            </div>
          </div>

          {/* Doctor Details */}
          <div className="border-t-2 border-gray-400 pt-6 mt-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold min-w-[200px]">{t.practitioner}:</span>
              <div className="border-b-2 border-black flex-1 px-2 min-h-[32px]"></div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold min-w-[200px]">{t.signature}:</span>
              <div className="border-b-2 border-black flex-1 px-2 min-h-[32px]"></div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold min-w-[200px]">{t.registration}:</span>
              <div className="border-b-2 border-black flex-1 px-2 min-h-[32px]"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t.date}:</span>
                <div className="border-b-2 border-black flex-1 px-2 min-h-[32px] flex items-center">
                  {today}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t.place}:</span>
                <div className="border-b-2 border-black flex-1 px-2 min-h-[32px]"></div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold min-w-[200px]">{t.stamp}:</span>
              <div className="border-2 border-black w-32 h-32 bg-gray-50"></div>
            </div>
          </div>

          {/* Note */}
          <div className="text-center mt-6">
            <p className="text-sm italic text-gray-700">{t.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalFitnessCertificate;