# Stars, Stones & Salt Tarot

A tarot desk by **TechInTheKitchen**. Draw from a shuffled 78-card deck, explore card meanings and notes, and keep your place between visits.

## Run locally

1. Install Node.js if it is not already available.
2. Double-click **tools\Open Site.cmd**.
3. Use **http://127.0.0.1:8780/** in your browser. Keep the launcher window open while using the app; close it to stop the server.

The launcher works from the app folder wherever it is located. Startup errors remain visible. If port 8780 is occupied, close the existing host before starting another copy. Use the same browser and address to retain your saved deck.

The app is static HTML, CSS, and JavaScript, with no build step or external services required. It can also run on a static web host. Opening `index.html` directly does not work because the app fetches JSON configuration and card data.

## Using the desk

- **Draw a card** reveals the next card. The previous card joins the discard pile. Cards never repeat until you shuffle.
- On desktop, card information appears beside the artwork. Clicking the card also draws by default; Settings can disable that action.
- On mobile, tapping the drawn card opens its information. Enable **Swap draw button and rules interaction** in Settings to tap the card to draw and use **Card notes** for information instead.
- Tap or click the discard fan to view discarded cards and deck counts. Select a card in the list to open its meanings, reflection, and rules in its saved upright or inverted orientation; use **Back to discard pile** to return. Card information also includes a link to this view.
- **Allow inverted cards** in Settings gives each draw a 50% chance of inversion and displays its matching notes. Changing this checkbox immediately reshuffles all 78 cards and clears the current card and discard pile. The warning appears beside the setting.
- **Settings** provides themes, interaction preferences, and a shuffle action that resets the current card and discards. The header button switches between light and dark mode.

Deck order, current card, discards, card orientations, and preferences are saved in localStorage. Clearing browser data resets them. When storage is unavailable, the status reports that progress lasts only for the current session. Saved decks do not sync between browsers or devices.

## Customize the site

Edit [`assets/site-config.json`](assets/site-config.json), save, and refresh:

```json
{
  "title": "Stars, Stones & Salt",
  "subtitle": "Find yourself in the cards.",
  "eyebrow": "A MOMENT AT THE TABLE",
  "cardBack": {
    "symbol": "✦",
    "title": "Stars, Stones & Salt",
    "subtitle": "78 possibilities",
    "image": ""
  },
  "headerIcon": {
    "symbol": "✦",
    "image": ""
  }
}
```

- `title` updates the header and browser tab; `subtitle` updates the large introductory heading; `eyebrow` updates the small text above it.
- `cardBack` controls the card shown before the first draw and after shuffling. Change its text, or set `image` to artwork such as `assets/cards/my-card-back.webp`. Use `\n` inside the title string for line breaks.
- `headerIcon` controls both the top-left icon and the browser favicon. Change `symbol`, or set `image` to a path such as `assets/header-icon.webp`.

Image paths are relative to the app folder. Add the image file first. WebP, PNG, JPG, and SVG are supported; images fit without stretching or cropping. An empty image path uses the configured text or symbol. Images that fail to load fall back to that text. Leave both header icon fields empty to hide the icon.

The footer credit is in `index.html`. Desktop shows it below the desk; mobile shows it inside the panel beneath the deck status. Styling and spacing use the current theme.

## Edit card information

Edit [`assets/cards.json`](assets/cards.json) and refresh. Each card has `id`, `name`, `group`, `image`, `keywords` (an array), `meaning`, `reflection`, and `rules`.

Keep all 78 IDs unique and stable so saved decks remain compatible. Artwork uses WebP files in `assets/cards/`; set each card's `image` to its matching file. Use valid JSON with double quotes and no trailing commas. Text is displayed as plain text.

Meanings and reflection prompts are editable starting points. Put custom game rules in `rules`; an empty value displays “No additional rules for this card.” Cards draw upright by default. Each card also has an `inverted` object with its own `keywords`, `meaning`, `reflection`, and `rules`. These are editable starter interpretations, not fixed game rules. Blank inverted rules display “No additional inverted rules for this card.” Inverted cards rotate 180 degrees and retain their orientation in the discard pile and after reload. Existing saved decks without orientation data load as upright.

## Project files and verification

| Path | Purpose |
| --- | --- |
| `index.html` | Desk, controls, dialogs, and credit text |
| `assets/app.js` | UI, configuration loading, and browser persistence |
| `assets/deck.js` | Shuffle, draw, and saved-deck validation |
| `assets/style.css` | Layout and responsive styling |
| `assets/themes/` | Theme palettes |
| `assets/site-config.json` | Site text, card back, and header icon/favicon |
| `assets/cards.json` | Card information and artwork paths |
| `assets/cards/` | Card artwork |
| `tools/Open Site.cmd` | Windows launcher |
| `tools/local-server.cjs` | Local-only static server |
| `tools/verify.cjs` | Asset and deck checks |

Run from the app folder:

```sh
node tools/verify.cjs
```

This checks all 78 card assets, unique draws, deck exhaustion, saved-state integrity, shuffle reset, inverted orientations, legacy saves, and inverted note fields.

## Credits and license

App by **TechInTheKitchen**. The local host and original palette were adapted from the Obsidian Reader starter project; its MIT notice is preserved in [`tools/starter-LICENSE`](tools/starter-LICENSE).

Tarot assets: **Luciella Elisabeth Scarlett (LuciellaES)** — [Rider-Waite Smith Tarot Cards (CC0)](https://luciellaes.itch.io/rider-waite-smith-tarot-cards-cc0). The pack contains original deck scans sourced from Wikipedia, cleaned up and resized by LuciellaES. This app uses WebP versions of the card images.

Software is licensed under the [MIT License](LICENSE). Artwork retains its source terms and is not relicensed under MIT. See [CREDITS.md](CREDITS.md) for the artwork attribution and source licensing notes.
