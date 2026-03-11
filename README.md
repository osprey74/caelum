# Liber Caeli

**Liber Caeli** — Latin for "Book of the Heavens" — is a desktop application that generates Western astrology natal charts and provides AI-powered interpretations.

[日本語版 README はこちら](README.ja.md)

## What is Western Astrology?

Western astrology is a traditional European system based on the idea that the positions of celestial bodies (Sun, Moon, planets, etc.) at the time of birth influence an individual's personality and tendencies.

A **natal chart (birth chart)** is a "map" of the sky at the moment of birth, consisting of:

- **Planets** (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Chiron, Lilith, Part of Fortune)
- **Signs** (the 12 zodiac signs from Aries to Pisces)
- **Houses** (12 areas of life: self, finances, communication, home, etc.)
- **Aspects** (angular relationships between planets indicating harmonious or tense configurations)

This app calculates charts based on modern Western astrology (tropical zodiac). House systems available: Placidus, Whole Sign, and Equal House.

## Features

### Chart Generation
- Generate natal charts from birth data (name, date/time of birth, birthplace)
- D3.js SVG chart wheel display (sign ring, house lines, planet symbols, aspect lines)
- Planet placement table (sign / degree / house / retrograde indicator)
- 13 celestial bodies (10 planets + Chiron, Lilith, Part of Fortune)
- House system selection (Placidus / Whole Sign / Equal House)
- City selection with regional grouping (Japan nationwide + major international cities) and city name search
- Custom latitude/longitude input for any location

### Profile Management
- Save and recall birth data as profiles
- Add and delete profiles

### Transit, Synastry & Monthly Calendar
- Transit chart (bi-wheel): overlay planetary positions for any date on your natal chart
- Synastry chart (bi-wheel): overlay two natal charts for compatibility analysis
- Monthly transit calendar: view a month's celestial events (new/full moon, sign ingresses, retrograde/direct stations, natal aspects)

### Glossary
- Click on planets, signs, houses, or aspects on the chart to view explanations in a popup
- Planet table signs and houses are also clickable

### AI Interpretation & Export
- Claude AI streaming interpretation (natal, transit, synastry, monthly focus)
- Prompt generation mode available without API key
- SVG / PNG / PDF export (PDF includes AI interpretation text)

### Multilingual Support
- Japanese / English UI switching (configurable in Settings)
- AI interpretation language follows the selected UI language
- City search results also displayed in the selected language

## Usage

### 1. Entering Birth Data and Generating a Chart

Enter the following in the left sidebar form:

- **Name**: displayed on the chart
- **Date of birth**: year/month/day (e.g., January 15, 1990)
- **Time of birth**: 24-hour format (e.g., 14:30). Accurate time is essential for house and ascendant calculation
- **Place of birth**: select a city from the dropdown, or switch to "Search by city name" mode to search for any location and auto-detect coordinates

Click "Create Chart" to display the natal chart and planet table in the center panel.

### 2. Registering Profiles (Important)

Saving birth data as a **profile** lets you regenerate charts with a single click.

- After entering birth data, click "Save" at the top of the left sidebar
- Saved profiles are selectable from the dropdown
- Delete unwanted profiles with the "Delete" button

> **Profile registration is required for Transit and Synastry.** To view transits (daily horoscope), you must first register your birth data as a profile. For synastry (compatibility), the second person's data must also be saved as a profile.

### 3. Transit (Daily Horoscope)

Transit shows how current planetary positions affect your natal chart.

1. Select a profile and create a natal chart
2. Select the "Transit" tab in the right sidebar
3. Choose a date (defaults to today) and click "Calculate"
4. The chart becomes a bi-wheel with transit planets (amber) on the outer ring
5. Click "Generate Interpretation" for AI analysis

### 4. Synastry (Compatibility)

Synastry overlays two natal charts to analyze relationship tendencies.

1. Select the first person's profile and create a natal chart
2. Select the "Synastry" tab in the right sidebar
3. Choose the second person from the profile dropdown
4. Click "Calculate Synastry"
5. The bi-wheel displays both charts
6. Click "Generate Interpretation" for AI analysis

> **The second person's profile must be registered beforehand.** Save birth data for family, friends, or partners you want to compare.

### 5. Monthly Transit Calendar

The monthly calendar displays celestial events for an entire month.

1. Select a profile and create a natal chart
2. Select the "Monthly Calendar" tab in the right sidebar
3. Choose the target month and click "Calculate"
4. Days with events are highlighted in the calendar grid
5. Click a date to see event details (new/full moon, sign ingresses, retrograde/direct stations, natal aspects)
6. Click "Generate Monthly Focus" for an AI monthly forecast

### 6. Export

Export charts and interpretation text to files. Choose from 3 buttons below the chart:

- **SVG**: save chart as vector image (ideal for printing)
- **PNG**: save chart as raster image (ideal for social media)
- **PDF**: save chart + AI interpretation as an A4 report

### 7. Changing the House System

Change the house system from the "Settings" button in the top-right corner.

- **Placidus** — modern Western astrology standard (default)
- **Whole Sign** — classical / Hellenistic astrology
- **Equal House** — British astrological tradition

Changes take effect on the next chart generation. See "About House Systems" below for details.

### 8. Using AI Interpretation (with Anthropic API Key)

Register an Anthropic API key to enable real-time streaming interpretations via Claude AI.

#### How to Register an API Key

1. Create an account at [Anthropic Console](https://console.anthropic.com/)
2. Generate a new key on the API Keys page
3. Click "Settings" in the top-right corner of the app
4. Paste the API key and click "Save"

The API key is stored in a local settings file and is only sent to the Anthropic API.

#### Estimated API Costs

AI interpretation uses the Anthropic Claude API (claude-sonnet-4-6). Chart calculations and PDF generation are free (local processing).

| Interpretation Type | Input Tokens | Output Tokens | Est. Cost per Request |
|---|---|---|---|
| Natal | ~1,500 | ~1,500–2,500 | ~$0.03–0.05 |
| Transit / Synastry | ~2,500–3,000 | ~1,500–2,500 | ~$0.04–0.06 |
| Monthly Focus | ~2,000–3,000 | ~1,500–2,500 | ~$0.04–0.05 |

> Transit, synastry, and monthly focus send additional event data alongside natal data, increasing input tokens. However, since input pricing is lower, the total cost difference is small. See [Anthropic Pricing](https://www.anthropic.com/pricing) for details.

### 9. Prompt Generation Mode (without API Key)

Chart generation and prompt generation work without an API key.

1. Enter birth data and create a chart
2. Click "Generate Prompt" in the right sidebar
3. The generated prompt (system instructions + chart data) is displayed
4. Click "Copy" to copy to clipboard
5. Paste into your preferred AI service (ChatGPT, Gemini, Claude Web, etc.) for interpretation

## Download & Installation

Download the latest installer from the [Releases](https://github.com/osprey74/caelum/releases) page.

This app is not code-signed, so you may see OS security warnings. Follow the steps below.

### Windows

Running the installer (`.exe`) will show "Windows protected your PC" (Microsoft Defender SmartScreen).

1. Click "More info"
2. Click "Run anyway"

### macOS

After dragging the app from the `.dmg` to Applications, the first launch will show "caelum can't be opened because the developer cannot be verified."

1. Open **System Settings** → **Privacy & Security**
2. At the bottom, you'll see "caelum was blocked because it is not from an identified developer"
3. Click "Open Anyway"
4. Enter your password to allow

Alternatively, run the following command in Terminal before launching:

```bash
xattr -cr /Applications/caelum.app
```

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Tauri v2 |
| Frontend | React 18, TypeScript, Tailwind CSS, D3.js |
| Backend | Python 3.10+, FastAPI, uvicorn |
| Ephemeris | kerykeion (Swiss Ephemeris) |
| AI Interpretation | Anthropic Claude API (optional) |

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- Rust (for Tauri v2)

### Installation

```bash
# Frontend dependencies
npm install

# Sidecar dependencies
cd sidecar
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Development Server

```bash
# Sidecar (separate terminal)
cd sidecar && source .venv/bin/activate
uvicorn main:app --port 8765 --reload

# Tauri + Frontend
npm run tauri dev
```

## Astrological Settings

- Zodiac: Tropical
- House System: user-selectable (default: Placidus / options: Whole Sign, Equal House)
- Bodies: 10 planets + Chiron, Lilith, Part of Fortune + ASC/MC
- Aspects: major 5 + semi-square, quincunx
- Interpretation: modern Western (personality & tendencies)

## About House Systems

A house system is a method of dividing the celestial sphere into 12 "areas of life" (houses). Even with the same birth data, the house cusp positions change depending on the system, which may place planets in different houses.

This app supports the following 3 house systems:

### Placidus

Systematized by the 17th-century Italian astrologer Placidus de Titis. It divides houses by trisecting the time it takes for a celestial body to move from the horizon to the meridian. It is the most widely used system in modern Western astrology, from magazine horoscopes to serious psychological astrology.

> This is the app's default setting.

### Whole Sign

One of the oldest house systems, used in the Hellenistic era. The entire sign containing the Ascendant (ASC) becomes the 1st house, and subsequent signs correspond to each house. Each house is exactly 30 degrees, making it simple and consistent. It has seen rapid adoption alongside the revival of classical and Hellenistic astrology.

> **Note:** When using Whole Sign, the MC (Midheaven) may not align with a house cusp. The MC is displayed as an independent sensitive point on the chart.

### Equal House

Starting from the Ascendant as the 1st house cusp, the ecliptic is divided into 12 equal 30-degree segments. Like Whole Sign, it is simple to calculate and works reliably at high latitudes. Rooted in the British astrological tradition, it is sometimes used as an alternative when Placidus produces extremely wide houses.

> **Note:** When using Equal House, the MC is also displayed independently of house cusps.

## License

[MIT License](LICENSE)

**Note**: This app depends on [kerykeion](https://github.com/g-battaglia/kerykeion), which is licensed under AGPL v3. Distribution of binaries containing kerykeion must comply with AGPL v3 terms.

## Icons

<a href="https://www.flaticon.com/free-icons/orbit" title="orbit icons">Orbit icons created by Eucalyp - Flaticon</a>

## Support

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/osprey74)
