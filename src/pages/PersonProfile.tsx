import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, User, CreditCard, Heart, Phone, Briefcase, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Profile {
  personId: string;
  fullName: string;
  gender: string;
  dob: string;
  relationship: string;
  relationshipDisplay: string;
  aadhaarNumber: string;
  panNumber: string;
  voterIdNumber: string;
  drivingLicenseNumber: string;
  passportNumber: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  fatherName: string;
  motherName: string;
  occupation: string;
  employer: string;
  vehicleNumbers: string;
}

interface RelationshipOption {
  id: string;
  name: string;
}

const FIELD_GROUPS = [
  { 
    title: 'Basic Info', 
    icon: User,
    fields: ['fullName', 'gender', 'dob', 'relationship'] 
  },
  { 
    title: 'Identity', 
    icon: CreditCard,
    fields: ['aadhaarNumber', 'panNumber', 'voterIdNumber', 'drivingLicenseNumber', 'passportNumber'] 
  },
  { 
    title: 'Health', 
    icon: Heart,
    fields: ['bloodGroup'] 
  },
  { 
    title: 'Contact', 
    icon: Phone,
    fields: ['phone', 'email', 'address', 'city', 'state', 'pinCode'] 
  },
  { 
    title: 'Family', 
    icon: User,
    fields: ['fatherName', 'motherName'] 
  },
  { 
    title: 'Work', 
    icon: Briefcase,
    fields: ['occupation', 'employer'] 
  },
  { 
    title: 'Vehicle', 
    icon: Car,
    fields: ['vehicleNumbers'] 
  },
];

const FIELD_LABELS: Record<string, string> = {
  fullName: 'Full Name',
  gender: 'Gender',
  dob: 'Date of Birth',
  relationship: 'Relationship',
  aadhaarNumber: 'Aadhaar Number',
  panNumber: 'PAN Number',
  voterIdNumber: 'Voter ID',
  drivingLicenseNumber: 'Driving License',
  passportNumber: 'Passport Number',
  bloodGroup: 'Blood Group',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  city: 'City',
  state: 'State',
  pinCode: 'PIN Code',
  fatherName: "Father's Name",
  motherName: "Mother's Name",
  occupation: 'Occupation',
  employer: 'Employer',
  vehicleNumbers: 'Vehicle Numbers',
};

export default function PersonProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [relationships, setRelationships] = useState<RelationshipOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProfile(id);
      loadRelationships();
    }
  }, [id]);

  const loadProfile = (personId: string) => {
    if (!window.Android?.getProfile) {
      setIsLoading(false);
      return;
    }
    try {
      const json = window.Android.getProfile(personId);
      const data = JSON.parse(json);
      setProfile(data);
      setEditedProfile(data);
    } catch (e) {
      console.error('Error loading profile:', e);
    }
    setIsLoading(false);
  };

  const loadRelationships = () => {
    if (!window.Android?.getRelationships) return;
    try {
      const json = window.Android.getRelationships();
      setRelationships(JSON.parse(json));
    } catch (e) {
      console.error('Error loading relationships:', e);
    }
  };

  const handleSave = () => {
    if (!editedProfile || !window.Android?.updateProfile) return;
    
    const success = window.Android.updateProfile(editedProfile.personId, JSON.stringify(editedProfile));
    if (success) {
      setProfile(editedProfile);
      setIsEditing(false);
      toast.success('Profile updated');
    } else {
      toast.error('Failed to save');
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (!editedProfile) return;
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  const handleSetAsPrimary = () => {
    if (!profile || !window.Android?.setPrimaryUser) return;
    window.Android.setPrimaryUser(profile.personId);
    toast.success('Set as primary user (You)');
    loadProfile(profile.personId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Profile not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const displayProfile = isEditing ? editedProfile! : profile;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Profile</h1>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => { setIsEditing(false); setEditedProfile(profile); }}>
                <X className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSave}>
                <Save className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="p-4 flex flex-col items-center gap-3 border-b">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{displayProfile.fullName || 'Unknown'}</h2>
        <div className="flex gap-2">
          <Badge variant="outline">{displayProfile.relationshipDisplay || 'Unknown'}</Badge>
          {displayProfile.relationship !== 'SELF' && (
            <Button variant="outline" size="sm" onClick={handleSetAsPrimary}>
              Set as Me
            </Button>
          )}
        </div>
      </div>

      {/* Profile Fields */}
      <div className="p-4 space-y-6">
        {FIELD_GROUPS.map((group) => {
          const Icon = group.icon;
          const hasData = group.fields.some(f => displayProfile[f as keyof Profile]);
          
          if (!isEditing && !hasData) return null;
          
          return (
            <Card key={group.title} className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-4 w-4 text-primary" />
                <h3 className="font-medium">{group.title}</h3>
              </div>
              <div className="grid gap-4">
                {group.fields.map((field) => {
                  const value = displayProfile[field as keyof Profile] || '';
                  if (!isEditing && !value) return null;
                  
                  return (
                    <div key={field}>
                      <Label className="text-xs text-muted-foreground">{FIELD_LABELS[field]}</Label>
                      {isEditing ? (
                        field === 'relationship' ? (
                          <Select
                            value={editedProfile?.relationship || ''}
                            onValueChange={(v) => handleFieldChange('relationship', v)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {relationships.map((r) => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field === 'gender' ? (
                          <Select
                            value={editedProfile?.gender || ''}
                            onValueChange={(v) => handleFieldChange('gender', v)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={editedProfile?.[field as keyof Profile] || ''}
                            onChange={(e) => handleFieldChange(field, e.target.value)}
                            className="mt-1"
                          />
                        )
                      ) : (
                        <p className="text-sm font-medium mt-1">{value}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
