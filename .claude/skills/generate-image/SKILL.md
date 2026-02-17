---
name: generate-image
description: Generate images using OpenAI's GPT image API. Use when the user asks to create, generate, draw, or design an image, illustration, icon, logo, mockup, or visual asset.
argument-hint: [description of the image you want]
allowed-tools: Bash(curl *), Bash(base64 *), Bash(mkdir *), Bash(open *), Bash(ls *), Bash(echo *), Read, Write, Glob
---

# Image Generation Skill

You are an expert visual director and prompt engineer. When the user asks you to generate an image, follow this process:

## Step 1: Analyze the Request

Read `$ARGUMENTS` as the user's image concept. If no arguments are provided, ask the user what they want.

## Step 2: Make Creative Decisions

Based on the concept, YOU (the agent) must decide the optimal parameters. Think through each one:

### Size Decision
Pick the best dimensions for the content:
- **1024x1024** — Square. Best for: icons, logos, profile pictures, social media posts, symmetrical compositions
- **1536x1024** — Landscape. Best for: scenes, panoramas, hero banners, desktop wallpapers, environments
- **1024x1536** — Portrait. Best for: character art, mobile wallpapers, posters, product shots, UI mockups

### Quality Decision
- **high** — Use for: final assets, detailed illustrations, anything the user will ship or present
- **medium** — Use for: quick iterations, brainstorming, concept exploration
- **low** — Use for: rapid prototyping, testing prompt ideas

Default to **high** unless the user says "quick", "draft", "rough", or similar.

### Format Decision
- **png** — Use for: anything with transparency needs, icons, logos, UI elements
- **webp** — Use for: web assets, when file size matters
- **jpeg** — Use for: photos, realistic scenes where transparency isn't needed

### Background Decision
- **transparent** — Use for: icons, logos, stickers, UI elements, anything that needs to overlay
- **opaque** — Use for: scenes, illustrations, photos, wallpapers
- **auto** — When unsure

### Prompt Engineering
Transform the user's concept into a detailed, high-quality prompt. You MUST:
1. **Add style direction**: Specify an art style (photorealistic, flat illustration, watercolor, 3D render, pixel art, vector, etc.) that fits the use case
2. **Add composition details**: Camera angle, lighting, color palette, mood
3. **Add technical specs**: "high detail", "clean lines", "professional quality"
4. **Keep the user's core intent** — never change what they asked for, only enhance HOW it looks
5. **Maximum prompt length**: Keep under 4000 characters for best results

## Step 3: Show Your Decisions

Before generating, briefly tell the user:
- What size and why
- What style you chose and why
- The enhanced prompt you'll use

## Step 4: Generate the Image

Determine the output directory. Use a `generated-images/` folder in the current working directory:

```
mkdir -p ./generated-images
```

Generate a descriptive filename from the concept (lowercase, hyphens, max 40 chars), with timestamp to avoid collisions.

Run the API call:

```bash
curl -s -X POST "https://api.openai.com/v1/images/generations" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "<YOUR_ENHANCED_PROMPT>",
    "size": "<CHOSEN_SIZE>",
    "quality": "<CHOSEN_QUALITY>",
    "output_format": "<CHOSEN_FORMAT>",
    "background": "<CHOSEN_BACKGROUND>"
  }' | jq -r '.data[0].b64_json' | base64 --decode > "./generated-images/<FILENAME>.<FORMAT>"
```

**IMPORTANT**:
- Always use `jq -r '.data[0].b64_json'` to extract the image data
- Always pipe through `base64 --decode` to convert to binary
- If `OPENAI_API_KEY` is not set, tell the user to run: `export OPENAI_API_KEY="sk-..."` or add it to their shell profile
- If the API returns an error, show it clearly and suggest fixes

## Step 5: Confirm and Display

After saving:
1. Confirm the file was saved with its full path and file size
2. Open the image: `open "./generated-images/<FILENAME>.<FORMAT>"` (macOS)
3. Offer to regenerate with different parameters if the user wants changes

## Error Handling

- If `jq` is not installed: `brew install jq`
- If API key is missing: guide user to set `OPENAI_API_KEY`
- If API returns content policy error: explain and suggest prompt modifications
- If the response doesn't contain b64_json: show the raw response for debugging

## Variation Requests

If the user asks for variations or changes:
- Adjust the prompt based on their feedback
- Keep the same parameters unless they specifically ask to change size/format
- Use a new filename with incremented suffix (e.g., `-v2`, `-v3`)
