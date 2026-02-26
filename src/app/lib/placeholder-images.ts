
import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type ArtistMetadata = {
  name: string;
  profileImage: string;
  imageHint: string;
  bio: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
export const Artist: ArtistMetadata = data.artist;
