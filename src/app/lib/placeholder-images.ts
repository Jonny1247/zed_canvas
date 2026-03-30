
import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageUrls?: string[];
  imageHint: string;
  price: number;
  year: string;
  medium: string;
  dimensions: string;
  // Extended artwork fields
  artistId?: string;
  category?: string;
  isNegotiable?: boolean;
  availability?: "Available" | "Sold" | "Reserved";
  materials?: string;
  story?: string;
  tags?: string[];
  location?: string;
  views?: number;
  isVerified?: boolean;
  verificationStatus?: "unverified" | "pending" | "approved" | "rejected";
  status?: string;
};

export type ArtistMetadata = {
  name: string;
  profileImage: string;
  imageHint: string;
  bio: string;
  location: string;
  socials: {
    instagram: string;
    twitter: string;
    website: string;
  };
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
export const Artist: ArtistMetadata = data.artist;
