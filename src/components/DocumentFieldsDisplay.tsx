import React from 'react';
import { 
  User, Calendar, MapPin, Phone, Hash, CreditCard, 
  Car, Heart, Building, FileText, Users, Droplet,
  Shield, Globe, Home, Briefcase
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface FieldDisplayProps {
  label: string;
  value: string | number | boolean | null | undefined;
  icon?: React.ReactNode;
  masked?: boolean;
  important?: boolean;
}

interface DocumentFieldsProps {
  documentType: string;
  fields: Record<string, any>;
  compact?: boolean;
}

// ============================================================================
// FIELD DISPLAY COMPONENT
// ============================================================================

const FieldDisplay: React.FC<FieldDisplayProps> = ({ 
  label, 
  value, 
  icon, 
  masked = false,
  important = false 
}) => {
  if (value === null || value === undefined || value === '') return null;
  
  const displayValue = masked && typeof value === 'string' && value.length > 4
    ? `${'•'.repeat(value.length - 4)}${value.slice(-4)}`
    : String(value);

  return (
    <div className={`py-2 ${important ? 'bg-blue-50 dark:bg-blue-900/20 -mx-3 px-3 rounded-lg' : ''}`}>
      <div className="flex items-start gap-2">
        {icon && (
          <div className="text-gray-400 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-sm dark:text-white ${important ? 'font-semibold' : ''} break-words`}>
            {displayValue}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// AADHAAR FIELDS
// ============================================================================

const AadhaarFields: React.FC<{ fields: Record<string, any>; compact?: boolean }> = ({ fields, compact }) => {
  if (compact) {
    return (
      <div className="space-y-1">
        <FieldDisplay 
          label="Aadhaar Number" 
          value={fields.aadhaarNumber} 
          icon={<CreditCard className="w-4 h-4" />}
          masked
          important
        />
        <FieldDisplay label="Name" value={fields.name} icon={<User className="w-4 h-4" />} />
        <FieldDisplay label="DOB" value={fields.dateOfBirth} icon={<Calendar className="w-4 h-4" />} />
      </div>
    );
  }

  return (
    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-700">
      <FieldDisplay 
        label="Aadhaar Number" 
        value={fields.aadhaarNumber} 
        icon={<CreditCard className="w-4 h-4" />}
        masked
        important
      />
      {fields.vid && (
        <FieldDisplay label="Virtual ID (VID)" value={fields.vid} masked />
      )}
      <FieldDisplay label="Name" value={fields.name} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Name (Hindi)" value={fields.nameInHindi} />
      <FieldDisplay label="Date of Birth" value={fields.dateOfBirth} icon={<Calendar className="w-4 h-4" />} />
      <FieldDisplay label="Gender" value={fields.gender} />
      <FieldDisplay label="Father's Name" value={fields.fatherName} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Husband's Name" value={fields.husbandName} />
      <FieldDisplay label="Address" value={fields.address} icon={<MapPin className="w-4 h-4" />} />
      <FieldDisplay label="District" value={fields.district} />
      <FieldDisplay label="State" value={fields.state} />
      <FieldDisplay label="Pincode" value={fields.pincode} />
      <FieldDisplay label="Issue Date" value={fields.issueDate} />
    </div>
  );
};

// ============================================================================
// PAN FIELDS
// ============================================================================

const PANFields: React.FC<{ fields: Record<string, any>; compact?: boolean }> = ({ fields, compact }) => {
  if (compact) {
    return (
      <div className="space-y-1">
        <FieldDisplay 
          label="PAN Number" 
          value={fields.panNumber} 
          icon={<CreditCard className="w-4 h-4" />}
          important
        />
        <FieldDisplay label="Name" value={fields.name} icon={<User className="w-4 h-4" />} />
      </div>
    );
  }

  return (
    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-700">
      <FieldDisplay 
        label="PAN Number" 
        value={fields.panNumber} 
        icon={<CreditCard className="w-4 h-4" />}
        important
      />
      <FieldDisplay label="Name" value={fields.name} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Father's Name" value={fields.fatherName} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Date of Birth" value={fields.dateOfBirth} icon={<Calendar className="w-4 h-4" />} />
    </div>
  );
};

// ============================================================================
// VOTER ID FIELDS
// ============================================================================

const VoterIDFields: React.FC<{ fields: Record<string, any>; compact?: boolean }> = ({ fields, compact }) => {
  if (compact) {
    return (
      <div className="space-y-1">
        <FieldDisplay 
          label="EPIC Number" 
          value={fields.epicNumber} 
          icon={<Hash className="w-4 h-4" />}
          important
        />
        <FieldDisplay label="Name" value={fields.name} icon={<User className="w-4 h-4" />} />
      </div>
    );
  }

  return (
    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-700">
      <FieldDisplay 
        label="EPIC Number" 
        value={fields.epicNumber} 
        icon={<Hash className="w-4 h-4" />}
        important
      />
      <FieldDisplay label="Name" value={fields.name} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Name (Regional)" value={fields.nameInRegional} />
      <FieldDisplay 
        label={`${fields.relationshipType || 'Father'}'s Name`} 
        value={fields.fatherOrHusbandName} 
        icon={<User className="w-4 h-4" />} 
      />
      <FieldDisplay label="Gender" value={fields.gender} />
      <FieldDisplay label="Date of Birth" value={fields.dateOfBirth} icon={<Calendar className="w-4 h-4" />} />
      <FieldDisplay label="Age" value={fields.age} />
      <FieldDisplay label="Address" value={fields.address} icon={<MapPin className="w-4 h-4" />} />
      <FieldDisplay label="Assembly Constituency" value={fields.assemblyConstituency} icon={<Building className="w-4 h-4" />} />
      <FieldDisplay label="Parliamentary Constituency" value={fields.parliamentaryConstituency} />
      <FieldDisplay label="Polling Station" value={fields.pollingStation} />
      <FieldDisplay label="Part Number" value={fields.partNumber} />
      <FieldDisplay label="Serial Number" value={fields.serialNumber} />
      <FieldDisplay label="State" value={fields.state} />
      <FieldDisplay label="Issue Date" value={fields.issueDate} />
    </div>
  );
};

// ============================================================================
// DRIVING LICENSE FIELDS
// ============================================================================

const DrivingLicenseFields: React.FC<{ fields: Record<string, any>; compact?: boolean }> = ({ fields, compact }) => {
  if (compact) {
    return (
      <div className="space-y-1">
        <FieldDisplay 
          label="License Number" 
          value={fields.licenseNumber} 
          icon={<Car className="w-4 h-4" />}
          important
        />
        <FieldDisplay label="Name" value={fields.name} icon={<User className="w-4 h-4" />} />
        <FieldDisplay label="Valid Until" value={fields.validUntilNonTransport} icon={<Calendar className="w-4 h-4" />} />
      </div>
    );
  }

  return (
    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-700">
      <FieldDisplay 
        label="License Number" 
        value={fields.licenseNumber} 
        icon={<Car className="w-4 h-4" />}
        important
      />
      <FieldDisplay label="Name" value={fields.name} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Father/Husband Name" value={fields.fatherOrHusbandName} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Date of Birth" value={fields.dateOfBirth} icon={<Calendar className="w-4 h-4" />} />
      <FieldDisplay label="Blood Group" value={fields.bloodGroup} icon={<Droplet className="w-4 h-4" />} />
      <FieldDisplay label="Address" value={fields.address} icon={<MapPin className="w-4 h-4" />} />
      <FieldDisplay label="Pincode" value={fields.pincode} />
      <FieldDisplay label="Issue Date" value={fields.issueDate} />
      <FieldDisplay label="Valid From" value={fields.validFrom} />
      <FieldDisplay 
        label="Valid Until (Non-Transport)" 
        value={fields.validUntilNonTransport} 
        icon={<Calendar className="w-4 h-4" />}
        important
      />
      <FieldDisplay label="Valid Until (Transport)" value={fields.validUntilTransport} />
      {fields.vehicleClasses?.length > 0 && (
        <FieldDisplay 
          label="Vehicle Classes" 
          value={fields.vehicleClasses.join(', ')} 
          icon={<Car className="w-4 h-4" />} 
        />
      )}
      <FieldDisplay label="Issuing Authority" value={fields.issuingAuthority} />
      <FieldDisplay label="State" value={fields.state} />
      <FieldDisplay label="Organ Donor" value={fields.organDonor ? 'Yes' : 'No'} icon={<Heart className="w-4 h-4" />} />
      <FieldDisplay label="Emergency Contact" value={fields.emergencyContact} icon={<Phone className="w-4 h-4" />} />
    </div>
  );
};

// ============================================================================
// PASSPORT FIELDS
// ============================================================================

const PassportFields: React.FC<{ fields: Record<string, any>; compact?: boolean }> = ({ fields, compact }) => {
  if (compact) {
    return (
      <div className="space-y-1">
        <FieldDisplay 
          label="Passport Number" 
          value={fields.passportNumber} 
          icon={<Globe className="w-4 h-4" />}
          important
        />
        <FieldDisplay label="Name" value={`${fields.givenNames} ${fields.surname}`.trim()} icon={<User className="w-4 h-4" />} />
        <FieldDisplay label="Expires" value={fields.dateOfExpiry} icon={<Calendar className="w-4 h-4" />} />
      </div>
    );
  }

  return (
    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-700">
      <FieldDisplay 
        label="Passport Number" 
        value={fields.passportNumber} 
        icon={<Globe className="w-4 h-4" />}
        important
      />
      <FieldDisplay label="Type" value={fields.passportType === 'P' ? 'Personal' : fields.passportType} />
      <FieldDisplay label="Surname" value={fields.surname} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Given Names" value={fields.givenNames} />
      <FieldDisplay label="Nationality" value={fields.nationality} />
      <FieldDisplay label="Date of Birth" value={fields.dateOfBirth} icon={<Calendar className="w-4 h-4" />} />
      <FieldDisplay label="Place of Birth" value={fields.placeOfBirth} icon={<MapPin className="w-4 h-4" />} />
      <FieldDisplay label="Gender" value={fields.gender} />
      <FieldDisplay label="Date of Issue" value={fields.dateOfIssue} />
      <FieldDisplay 
        label="Date of Expiry" 
        value={fields.dateOfExpiry} 
        icon={<Calendar className="w-4 h-4" />}
        important
      />
      <FieldDisplay label="Place of Issue" value={fields.placeOfIssue} />
      <FieldDisplay label="Father's Name" value={fields.fatherName} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Mother's Name" value={fields.motherName} />
      <FieldDisplay label="Spouse's Name" value={fields.spouseName} />
      <FieldDisplay label="Address" value={fields.address} icon={<MapPin className="w-4 h-4" />} />
      <FieldDisplay label="Old Passport Number" value={fields.oldPassportNumber} />
      <FieldDisplay label="File Number" value={fields.fileNumber} />
    </div>
  );
};

// ============================================================================
// BIRTH CERTIFICATE FIELDS
// ============================================================================

const BirthCertificateFields: React.FC<{ fields: Record<string, any>; compact?: boolean }> = ({ fields, compact }) => {
  if (compact) {
    return (
      <div className="space-y-1">
        <FieldDisplay 
          label="Registration Number" 
          value={fields.registrationNumber} 
          icon={<Hash className="w-4 h-4" />}
          important
        />
        <FieldDisplay label="Child's Name" value={fields.childName} icon={<User className="w-4 h-4" />} />
        <FieldDisplay label="Date of Birth" value={fields.dateOfBirth} icon={<Calendar className="w-4 h-4" />} />
      </div>
    );
  }

  return (
    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-700">
      <FieldDisplay 
        label="Registration Number" 
        value={fields.registrationNumber} 
        icon={<Hash className="w-4 h-4" />}
        important
      />
      <FieldDisplay label="Child's Name" value={fields.childName} icon={<User className="w-4 h-4" />} />
      <FieldDisplay 
        label="Date of Birth" 
        value={fields.dateOfBirth} 
        icon={<Calendar className="w-4 h-4" />}
        important
      />
      <FieldDisplay label="Time of Birth" value={fields.timeOfBirth} />
      <FieldDisplay label="Place of Birth" value={fields.placeOfBirth} icon={<MapPin className="w-4 h-4" />} />
      <FieldDisplay label="Gender" value={fields.gender} />
      <FieldDisplay label="Hospital Name" value={fields.hospitalName} icon={<Building className="w-4 h-4" />} />
      <FieldDisplay label="Father's Name" value={fields.fatherName} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Father's Nationality" value={fields.fatherNationality} />
      <FieldDisplay label="Father's Aadhaar" value={fields.fatherAadhar} masked />
      <FieldDisplay label="Mother's Name" value={fields.motherName} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Mother's Nationality" value={fields.motherNationality} />
      <FieldDisplay label="Mother's Aadhaar" value={fields.motherAadhar} masked />
      <FieldDisplay label="Permanent Address" value={fields.permanentAddress} icon={<Home className="w-4 h-4" />} />
      <FieldDisplay label="Registration Date" value={fields.dateOfRegistration} />
      <FieldDisplay label="Registration District" value={fields.registrationDistrict} />
      <FieldDisplay label="Registration State" value={fields.registrationState} />
      <FieldDisplay label="Informant Name" value={fields.informantName} />
      <FieldDisplay label="Remarks" value={fields.remarks} />
    </div>
  );
};

// ============================================================================
// VEHICLE RC FIELDS
// ============================================================================

const VehicleRCFields: React.FC<{ fields: Record<string, any>; compact?: boolean }> = ({ fields, compact }) => {
  if (compact) {
    return (
      <div className="space-y-1">
        <FieldDisplay 
          label="Registration Number" 
          value={fields.registrationNumber} 
          icon={<Car className="w-4 h-4" />}
          important
        />
        <FieldDisplay label="Owner" value={fields.ownerName} icon={<User className="w-4 h-4" />} />
        <FieldDisplay label="Vehicle" value={fields.makerModel} />
      </div>
    );
  }

  return (
    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-700">
      <FieldDisplay 
        label="Registration Number" 
        value={fields.registrationNumber} 
        icon={<Car className="w-4 h-4" />}
        important
      />
      <FieldDisplay label="Chassis Number" value={fields.chassisNumber} masked />
      <FieldDisplay label="Engine Number" value={fields.engineNumber} masked />
      <FieldDisplay label="Owner Name" value={fields.ownerName} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Father/Husband Name" value={fields.fatherOrHusbandName} />
      <FieldDisplay label="Address" value={fields.address} icon={<MapPin className="w-4 h-4" />} />
      <FieldDisplay label="Vehicle Class" value={fields.vehicleClass} />
      <FieldDisplay label="Vehicle Category" value={fields.vehicleCategory} />
      <FieldDisplay label="Maker/Model" value={fields.makerModel} icon={<Car className="w-4 h-4" />} />
      <FieldDisplay label="Fuel Type" value={fields.fuelType} />
      <FieldDisplay label="Color" value={fields.color} />
      <FieldDisplay label="Manufacturing Year" value={fields.manufacturingYear} />
      <FieldDisplay label="Registration Date" value={fields.registrationDate} icon={<Calendar className="w-4 h-4" />} />
      <FieldDisplay 
        label="Fitness Valid Until" 
        value={fields.fitnessValidUntil} 
        icon={<Shield className="w-4 h-4" />}
        important
      />
      <FieldDisplay label="Tax Valid Until" value={fields.taxValidUntil} />
      <FieldDisplay label="Insurance Valid Until" value={fields.insuranceValidUntil} />
      <FieldDisplay label="PUC Valid Until" value={fields.pucValidUntil} />
      <FieldDisplay label="Seating Capacity" value={fields.seatingCapacity} />
      <FieldDisplay label="Unladen Weight (kg)" value={fields.unladenWeight} />
      <FieldDisplay label="Gross Weight (kg)" value={fields.grossWeight} />
      <FieldDisplay label="RTO Code" value={fields.rtoCode} />
      <FieldDisplay label="Hypothecation" value={fields.hypothecationBank} icon={<Building className="w-4 h-4" />} />
    </div>
  );
};

// ============================================================================
// RATION CARD FIELDS
// ============================================================================

const RationCardFields: React.FC<{ fields: Record<string, any>; compact?: boolean }> = ({ fields, compact }) => {
  if (compact) {
    return (
      <div className="space-y-1">
        <FieldDisplay 
          label="Card Number" 
          value={fields.cardNumber} 
          icon={<CreditCard className="w-4 h-4" />}
          important
        />
        <FieldDisplay label="Head of Family" value={fields.headOfFamily} icon={<User className="w-4 h-4" />} />
        <FieldDisplay label="Card Type" value={fields.cardType} />
      </div>
    );
  }

  return (
    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-700">
      <FieldDisplay 
        label="Card Number" 
        value={fields.cardNumber} 
        icon={<CreditCard className="w-4 h-4" />}
        important
      />
      <FieldDisplay 
        label="Card Type" 
        value={fields.cardType} 
        icon={<FileText className="w-4 h-4" />}
        important
      />
      <FieldDisplay label="Head of Family" value={fields.headOfFamily} icon={<User className="w-4 h-4" />} />
      <FieldDisplay label="Father/Husband Name" value={fields.fatherOrHusbandName} />
      <FieldDisplay label="Address" value={fields.address} icon={<MapPin className="w-4 h-4" />} />
      <FieldDisplay label="District" value={fields.district} />
      <FieldDisplay label="State" value={fields.state} />
      <FieldDisplay label="FPS Number" value={fields.fpShopNumber} icon={<Building className="w-4 h-4" />} />
      <FieldDisplay label="FPS Name" value={fields.fpShopName} />
      <FieldDisplay label="Total Members" value={fields.totalMembers} icon={<Users className="w-4 h-4" />} />
      <FieldDisplay label="Issue Date" value={fields.issueDate} icon={<Calendar className="w-4 h-4" />} />
      <FieldDisplay label="Valid Until" value={fields.validUntil} />
      
      {fields.members?.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Family Members</p>
          <div className="space-y-2">
            {fields.members.map((member: any, idx: number) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                <p className="text-sm font-medium dark:text-white">{member.name}</p>
                <p className="text-xs text-gray-500">
                  {member.relationship} • {member.gender} • Age {member.age}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// GENERIC FIELDS
// ============================================================================

const GenericFields: React.FC<{ fields: Record<string, any>; compact?: boolean }> = ({ fields, compact }) => {
  const entries = Object.entries(fields).filter(([key, value]) => {
    if (!value || value === '') return false;
    if (['additionalFields'].includes(key)) return false;
    return true;
  });

  if (compact) {
    return (
      <div className="space-y-1">
        {entries.slice(0, 3).map(([key, value]) => (
          <FieldDisplay 
            key={key}
            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
            value={String(value)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-700">
      {entries.map(([key, value]) => (
        <FieldDisplay 
          key={key}
          label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
          value={String(value)}
        />
      ))}
      
      {fields.additionalFields && Object.keys(fields.additionalFields).length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Additional Information</p>
          {Object.entries(fields.additionalFields).map(([key, value]) => (
            <FieldDisplay 
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
              value={String(value)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DocumentFieldsDisplay: React.FC<DocumentFieldsProps> = ({ 
  documentType, 
  fields, 
  compact = false 
}) => {
  switch (documentType.toUpperCase()) {
    case 'AADHAAR':
      return <AadhaarFields fields={fields} compact={compact} />;
    case 'PAN':
      return <PANFields fields={fields} compact={compact} />;
    case 'VOTER_ID':
      return <VoterIDFields fields={fields} compact={compact} />;
    case 'DRIVING_LICENSE':
      return <DrivingLicenseFields fields={fields} compact={compact} />;
    case 'PASSPORT':
      return <PassportFields fields={fields} compact={compact} />;
    case 'BIRTH_CERTIFICATE':
      return <BirthCertificateFields fields={fields} compact={compact} />;
    case 'VEHICLE_RC':
      return <VehicleRCFields fields={fields} compact={compact} />;
    case 'RATION_CARD':
      return <RationCardFields fields={fields} compact={compact} />;
    default:
      return <GenericFields fields={fields} compact={compact} />;
  }
};

// ============================================================================
// DOCUMENT TYPE ICONS & COLORS
// ============================================================================

export const getDocumentTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'AADHAAR': '🪪',
    'PAN': '💳',
    'VOTER_ID': '🗳️',
    'DRIVING_LICENSE': '🚗',
    'PASSPORT': '🛂',
    'BIRTH_CERTIFICATE': '👶',
    'DEATH_CERTIFICATE': '🕯️',
    'MARRIAGE_CERTIFICATE': '💒',
    'VEHICLE_RC': '🏍️',
    'RATION_CARD': '🍚',
    'BANK_STATEMENT': '🏦',
    'INSURANCE_POLICY': '🛡️',
    'EDUCATION_CERTIFICATE': '🎓',
    'EMPLOYMENT_LETTER': '💼',
    'SALARY_SLIP': '💰',
    'TAX_RETURN': '📊',
    'PROPERTY_DOCUMENT': '🏠',
    'ELECTRICITY_BILL': '⚡',
    'WATER_BILL': '💧',
    'GAS_BILL': '🔥',
    'PHONE_BILL': '📱',
    'MEDICAL_REPORT': '🏥',
    'OTHER': '📄',
    'UNKNOWN': '📄'
  };
  return icons[type.toUpperCase()] || '📄';
};

export const getDocumentTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'AADHAAR': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
    'PAN': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    'VOTER_ID': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    'DRIVING_LICENSE': 'bg-green-100 dark:bg-green-900/30 text-green-600',
    'PASSPORT': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
    'BIRTH_CERTIFICATE': 'bg-pink-100 dark:bg-pink-900/30 text-pink-600',
    'VEHICLE_RC': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600',
    'RATION_CARD': 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
  };
  return colors[type.toUpperCase()] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-600';
};

export default DocumentFieldsDisplay;
