import { Star, MapPin, DollarSign, Clock, Phone, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Place {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  userRatingsTotal?: number;
  types?: string[];
  priceLevel?: number;
  businessStatus?: string;
  placeId: string;
  openNow?: boolean;
  icon?: string;
  photos?: Array<{
    reference: string;
    width: number;
    height: number;
  }>;
}

interface PlaceCardProps {
  place: Place;
  onViewOnMap?: (lat: number, lng: number) => void;
}

export default function PlaceCard({ place, onViewOnMap }: PlaceCardProps) {
  const getPhotoUrl = (photoRef: string) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`;
  };

  const getPriceLevelText = (level?: number) => {
    if (!level) return null;
    return "$".repeat(level);
  };

  const getPlaceType = (types?: string[]) => {
    if (!types || types.length === 0) return "Place";
    const primaryTypes = types.filter(t => 
      !["point_of_interest", "establishment"].includes(t)
    );
    if (primaryTypes.length === 0) return "Place";
    return primaryTypes[0].replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-place-${place.placeId}`}>
      <div className="flex flex-col h-full">
        {/* Place Photo */}
        {place.photos && place.photos.length > 0 ? (
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <img
              src={getPhotoUrl(place.photos[0].reference)}
              alt={place.name}
              className="w-full h-full object-cover"
              data-testid={`img-place-${place.placeId}`}
            />
            {place.openNow !== undefined && (
              <div className="absolute top-3 right-3">
                <Badge 
                  variant={place.openNow ? "default" : "secondary"}
                  className={place.openNow ? "bg-green-600 dark:bg-green-700" : ""}
                  data-testid={`badge-status-${place.placeId}`}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {place.openNow ? "Open Now" : "Closed"}
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-48 w-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Place Details */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-base line-clamp-2" data-testid={`text-name-${place.placeId}`}>
                {place.name}
              </h3>
              {place.priceLevel && (
                <Badge variant="outline" className="shrink-0" data-testid={`badge-price-${place.placeId}`}>
                  <DollarSign className="w-3 h-3" />
                  {getPriceLevelText(place.priceLevel)}
                </Badge>
              )}
            </div>
            
            {/* Type Badge */}
            <Badge variant="secondary" className="text-xs" data-testid={`badge-type-${place.placeId}`}>
              {getPlaceType(place.types)}
            </Badge>
          </div>

          {/* Rating */}
          {place.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-sm" data-testid={`text-rating-${place.placeId}`}>
                  {place.rating.toFixed(1)}
                </span>
              </div>
              {place.userRatingsTotal && (
                <span className="text-xs text-muted-foreground" data-testid={`text-reviews-${place.placeId}`}>
                  ({place.userRatingsTotal.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2" data-testid={`text-address-${place.placeId}`}>
              {place.address}
            </span>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onViewOnMap?.(place.location.lat, place.location.lng)}
              data-testid={`button-view-map-${place.placeId}`}
            >
              <MapPin className="w-3 h-3 mr-2" />
              View on Map
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const url = `https://www.google.com/maps/place/?q=place_id:${place.placeId}`;
                window.open(url, "_blank");
              }}
              data-testid={`button-google-${place.placeId}`}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
