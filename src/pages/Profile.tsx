import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Camera, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const Profile = () => {
  const { user, session } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [profile, setProfile] = useState({
    fullName: user?.user_metadata?.full_name || "",
    firm: user?.user_metadata?.firm || "",
    address: user?.user_metadata?.address || "",
    phone: user?.user_metadata?.phone || "",
    website: user?.user_metadata?.website || "",
    avatarUrl: user?.user_metadata?.avatar_url || "",
    firmLogoUrl: user?.user_metadata?.firm_logo_url || "",
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Avatar file size must be less than 2MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedAvatar(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatar || !user) return;

    try {
      setUploadingAvatar(true);
      
      // Generate a unique file name
      const fileExt = selectedAvatar.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedAvatar, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user metadata with the new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl
        }
      });

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => ({
        ...prev,
        avatarUrl: publicUrl
      }));
      setSelectedAvatar(null);
      
      toast.success("Avatar uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Error uploading avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Logo file size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedLogo(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedLogo || !user) return;

    try {
      setUploadingLogo(true);
      
      // Generate a unique file name
      const fileExt = selectedLogo.name.split('.').pop();
      const fileName = `${user.id}/firm-logo-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('firm-logos')
        .upload(fileName, selectedLogo, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('firm-logos')
        .getPublicUrl(fileName);

      // Update user metadata with the new logo URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          firm_logo_url: publicUrl
        }
      });

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => ({
        ...prev,
        firmLogoUrl: publicUrl
      }));
      setSelectedLogo(null);
      
      toast.success("Firm logo uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Error uploading firm logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.fullName,
          firm: profile.firm,
          address: profile.address,
          phone: profile.phone,
          website: profile.website,
          avatar_url: profile.avatarUrl,
          firm_logo_url: profile.firmLogoUrl,
        },
      });
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Account Information</CardTitle>
            <CardDescription>
              Your profile information and media
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary">
                  <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
                  <AvatarFallback className="text-4xl">
                    {profile.fullName ? getInitials(profile.fullName) : user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer bg-black/50 rounded-full p-2">
                    <Camera className="h-6 w-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {selectedAvatar && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Avatar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedAvatar(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-xl font-semibold">{profile.fullName || "No name set"}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {profile.firm && <p className="text-sm font-medium mt-1">{profile.firm}</p>}
              </div>
            </div>

            {profile.firmLogoUrl && (
              <div className="mt-6 border-t pt-6">
                <h4 className="text-sm font-medium mb-4">Firm Logo</h4>
                <div className="flex items-center justify-center">
                  <img 
                    src={profile.firmLogoUrl} 
                    alt="Firm Logo" 
                    className="max-h-32 object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-2">
          <form onSubmit={handleProfileUpdate}>
            <CardHeader>
              <CardTitle className="text-xl">Edit Profile</CardTitle>
              <CardDescription>
                Update your profile details and media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="firm">Law Firm Name</Label>
                  <Input
                    id="firm"
                    name="firm"
                    value={profile.firm}
                    onChange={handleChange}
                    placeholder="Enter your law firm name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    placeholder="Enter your business address"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Firm Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="cursor-pointer"
                    />
                    <Button
                      type="button"
                      onClick={handleLogoUpload}
                      disabled={!selectedLogo || uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload Logo
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
