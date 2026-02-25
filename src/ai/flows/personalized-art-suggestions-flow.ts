'use server';
/**
 * @fileOverview Provides personalized art and artist recommendations based on user data.
 *
 * - personalizeArtSuggestions - A function that generates personalized art and artist recommendations.
 * - PersonalizedArtSuggestionsInput - The input type for the personalizeArtSuggestions function.
 * - PersonalizedArtSuggestionsOutput - The return type for the personalizeArtSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedArtSuggestionsInputSchema = z.object({
  browsingHistory: z
    .array(z.string())
    .describe('A list of titles or descriptions of art pieces or artists the user has previously viewed.'),
  preferences: z
    .array(z.string())
    .describe('A list of user preferences, such as preferred styles, colors, themes, or mediums.'),
  aestheticInteractions: z
    .string()
    .describe('A textual description of the user\'s general aesthetic feedback or interactions (e.g., "I liked bold colors and abstract patterns," or "I disliked portraits.").'),
});
export type PersonalizedArtSuggestionsInput = z.infer<typeof PersonalizedArtSuggestionsInputSchema>;

const PersonalizedArtSuggestionsOutputSchema = z.object({
  recommendedArtworks: z
    .array(
      z.object({
        title: z.string().describe('The title of the recommended artwork.'),
        artist: z.string().describe('The name of the artist who created the artwork.'),
        description: z.string().describe('A brief description of the artwork.'),
        imageUrl: z.string().optional().describe('An optional URL to an image of the artwork.'),
      })
    )
    .describe('A list of recommended artworks.'),
  recommendedArtists: z
    .array(
      z.object({
        name: z.string().describe('The name of the recommended artist.'),
        style: z.string().describe('The artistic style associated with the artist.'),
        bioSummary: z.string().optional().describe('A brief summary of the artist\'s biography.'),
        profileImageUrl: z.string().optional().describe('An optional URL to the artist\'s profile image.'),
      })
    )
    .describe('A list of recommended artists.'),
  overallRecommendationSummary: z
    .string()
    .describe('A summary explaining why these recommendations were made, emphasizing the artistic and African-inspired environment.'),
});
export type PersonalizedArtSuggestionsOutput = z.infer<typeof PersonalizedArtSuggestionsOutputSchema>;

export async function personalizeArtSuggestions(input: PersonalizedArtSuggestionsInput): Promise<PersonalizedArtSuggestionsOutput> {
  return personalizedArtSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedArtSuggestionsPrompt',
  input: { schema: PersonalizedArtSuggestionsInputSchema },
  output: { schema: PersonalizedArtSuggestionsOutputSchema },
  prompt: `You are an expert art curator specializing in Zambian art. Your goal is to provide personalized art and artist recommendations to a user based on their browsing history, preferences, and aesthetic interactions.

Focus on fostering an 'artistic and African inspired' environment with your suggestions. Ensure the recommendations align with the rich cultural heritage and vibrant artistic expressions found in Zambia.

User Information:
- Browsing History: {{{browsingHistory}}}
- Preferences: {{{preferences}}}
- Aesthetic Interactions: {{{aestheticInteractions}}}

Carefully analyze this information to generate a list of 3-5 recommended artworks and 2-3 recommended artists. For each artwork, provide a title, artist, and a brief description. For each artist, provide their name, style, and a brief bio summary. Finally, provide an overall summary of your recommendations, explaining the rationale and how they fit the 'artistic and African inspired' theme.

Avoid recommending anything that is explicitly mentioned in the browsing history unless it's to suggest similar works or artists. Be creative and thoughtful in your suggestions.`,
});

const personalizedArtSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedArtSuggestionsFlow',
    inputSchema: PersonalizedArtSuggestionsInputSchema,
    outputSchema: PersonalizedArtSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
