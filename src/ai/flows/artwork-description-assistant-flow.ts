'use server';
/**
 * @fileOverview This file provides an AI assistant flow to help artists generate compelling descriptions
 * and descriptive tags for their artwork based on provided attributes.
 *
 * - artworkDescriptionAssistant - The main function to call the AI assistant.
 * - ArtworkDescriptionAssistantInput - The input type for the assistant.
 * - ArtworkDescriptionAssistantOutput - The output type from the assistant.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArtworkDescriptionAssistantInputSchema = z.object({
  title: z.string().optional().describe('The title of the artwork.'),
  medium: z.string().describe('The artistic medium used (e.g., "oil on canvas", "wood carving", "digital painting").'),
  dimensions: z.string().optional().describe('The physical dimensions of the artwork (e.g., "24x36 inches", "10x10x15 cm").'),
  inspiration: z.string().describe('The source of inspiration or theme behind the artwork, focusing on Zambian and African elements.'),
  style: z.string().optional().describe('The artistic style (e.g., "abstract", "realism", "contemporary African").'),
  colors: z.string().optional().describe('Key colors or color palette used in the artwork (e.g., "vibrant reds, earthy browns, deep blues").'),
  artistNotes: z.string().optional().describe('Any additional notes or story the artist wants to convey about the piece.'),
});
export type ArtworkDescriptionAssistantInput = z.infer<typeof ArtworkDescriptionAssistantInputSchema>;

const ArtworkDescriptionAssistantOutputSchema = z.object({
  description: z.string().describe('A compelling and detailed description of the artwork, highlighting its artistic and African-inspired nature.'),
  tags: z.array(z.string()).describe('A list of descriptive tags for the artwork, suitable for categorization and search.'),
});
export type ArtworkDescriptionAssistantOutput = z.infer<typeof ArtworkDescriptionAssistantOutputSchema>;

export async function artworkDescriptionAssistant(input: ArtworkDescriptionAssistantInput): Promise<ArtworkDescriptionAssistantOutput> {
  return artworkDescriptionAssistantFlow(input);
}

const artworkDescriptionAssistantPrompt = ai.definePrompt({
  name: 'artworkDescriptionAssistantPrompt',
  input: {schema: ArtworkDescriptionAssistantInputSchema},
  output: {schema: ArtworkDescriptionAssistantOutputSchema},
  prompt: `You are an expert art critic and marketing assistant specializing in Zambian and African art. Your goal is to create a compelling, artistic, and vibrant description for an artwork, along with relevant descriptive tags.

Use the following artwork attributes to generate a detailed description and a list of tags. The description should evoke the warmth, natural tones, and vibrancy inspired by Zambian landscapes and artistry, capturing the essence of the piece.

Artwork Attributes:
{{#if title}}Title: {{{title}}}
{{/if}}Medium: {{{medium}}}
{{#if dimensions}}Dimensions: {{{dimensions}}}
{{/if}}Inspiration: {{{inspiration}}}
{{#if style}}Style: {{{style}}}
{{/if}}{{#if colors}}Colors: {{{colors}}}
{{/if}}{{#if artistNotes}}Artist's Notes: {{{artistNotes}}}
{{/if}}

Focus on creating a vivid narrative that highlights the artwork's unique qualities, its connection to Zambian/African culture (if applicable), and its aesthetic appeal to potential buyers. The description should be engaging and informative. The tags should be concise and relevant for discovery.`,
});

const artworkDescriptionAssistantFlow = ai.defineFlow(
  {
    name: 'artworkDescriptionAssistantFlow',
    inputSchema: ArtworkDescriptionAssistantInputSchema,
    outputSchema: ArtworkDescriptionAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await artworkDescriptionAssistantPrompt(input);
    return output!;
  }
);
