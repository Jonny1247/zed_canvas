
import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  price: number;
  year: string;
  medium: string;
  dimensions: string;
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
