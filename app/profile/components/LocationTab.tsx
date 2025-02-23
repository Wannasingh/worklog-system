"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import { toast } from "sonner";
import { Profile } from "@/hooks/useProfileData";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

interface LocationTabProps {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
  isLoaded: boolean;
  searchBox: google.maps.places.Autocomplete | null;
  setSearchBox: (searchBox: google.maps.places.Autocomplete | null) => void;
}

export function LocationTab({
  profile,
  setProfile,
  handleSubmit,
  loading,
  isLoaded,
  searchBox,
  setSearchBox,
}: LocationTabProps) {
  const defaultLocation = {
    lat: 13.7563,
    lng: 100.5018,
  };

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setProfile({
      ...profile,
      work_latitude: lat,
      work_longitude: lng,
      ...(address && { work_location: address }),
    });
  };

  const getCurrentLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        }
      );

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      handleLocationSelect(lat, lng);
      toast.success("ระบุพิกัดปัจจุบันเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error getting current location:", error);
      toast.error("ไม่สามารถระบุตำแหน่งได้ กรุณาเปิดการใช้งาน GPS");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={profile.company_name || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  company_name: e.target.value,
                })
              }
              placeholder="Enter your company name"
            />
          </div>

          <div className="space-y-2">
            <Label>Current Coordinates</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Latitude
                </Label>
                <Input
                  value={profile.work_latitude?.toFixed(6) || ""}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Longitude
                </Label>
                <Input
                  value={profile.work_longitude?.toFixed(6) || ""}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="work_radius">Check-in Radius (meters)</Label>
            <Input
              id="work_radius"
              type="number"
              min="1"
              max="1000"
              value={profile.work_radius || "100"}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  work_radius: parseInt(e.target.value) || 100,
                })
              }
              placeholder="100"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="work_location">Work Location</Label>
              <div className="relative">
                <Autocomplete
                  onLoad={(autocomplete) => setSearchBox(autocomplete)}
                  onPlaceChanged={() => {
                    if (searchBox) {
                      const place = searchBox.getPlace();
                      if (place.geometry?.location) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        handleLocationSelect(
                          lat,
                          lng,
                          place.formatted_address || undefined
                        );
                      }
                    }
                  }}
                >
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      defaultValue={profile.work_location || ""}
                      placeholder="Search for a location..."
                      className="pl-8"
                    />
                  </div>
                </Autocomplete>
              </div>
            </div>

            <div className="h-[400px] w-full rounded-lg overflow-hidden">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={{
                    lat: profile.work_latitude || defaultLocation.lat,
                    lng: profile.work_longitude || defaultLocation.lng,
                  }}
                  zoom={15}
                  onClick={(e) => {
                    if (e.latLng) {
                      handleLocationSelect(e.latLng.lat(), e.latLng.lng());
                    }
                  }}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {profile.work_latitude && profile.work_longitude && (
                    <Marker
                      position={{
                        lat: profile.work_latitude,
                        lng: profile.work_longitude,
                      }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  Loading Map...
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={getCurrentLocation}
            >
              <Search className="w-4 h-4 mr-2" />
              Use Current Location
            </Button>
          </div>
        </Card>
      </div>
    </form>
  );
}
