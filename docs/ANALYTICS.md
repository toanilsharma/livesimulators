# LiveSimulators GA4 Telemetry & Event Reference

**Measurement ID**: `G-WX8V8HH57V`  
**Property**: LiveSimulators Production Platform  
**Integration**: Google Tag (`gtag.js`) with Enhanced Event Payloads

This document catalogs every Google Analytics 4 (GA4) custom event, parameter structure, trigger location, and example payload across the platform.

---

## 1. Events & Parameters Catalog

| Event Name | Parameters | Parameter Type | Description / Trigger Scenario | Example Payload | Recommended GA4 Custom Dimension / Metric | Suggested Conversion |
|---|---|---|---|---|---|:---:|
| `page_view` | `page_title`<br>`page_location`<br>`page_path` | string<br>string<br>string | Automatically fired on History API route changes across all 31 indexable pages (Home, 6 Departments, 18 Simulators, 6 Institutional/Legal pages). | `{ page_title: "RLC Circuit Resonance - Interactive Engineering Simulator \| LiveSimulators", page_location: "https://livesimulators.com/simulator/rlc_resonance", page_path: "/simulator/rlc_resonance" }` | Predefined GA4 dimensions (`Page title`, `Page location`, `Page path`) | No |
| `simulator_open` | `department`<br>`simulator_id` | string<br>string | Triggered whenever an interactive simulation workbench is loaded or switched into via navigation, direct deep-link, search, or peer selector. | `{ department: "electrical", simulator_id: "rlc_resonance" }` | Custom Dimensions:<br>• `department` (Event-scoped)<br>• `simulator_id` (Event-scoped) | **Yes** (Key Engagement) |
| `simulator_run` | `duration_s` | integer | Triggered when a continuous simulation run session concludes (paused, stopped, or user navigates away) with the active execution duration in seconds. | `{ duration_s: 42 }` | Custom Metric:<br>• `duration_s` (Unit: Seconds) | **Yes** (Deep Engagement) |
| `parameter_change` | `param` | string | Triggered when an engineer adjusts any slider, numeric input, or activates an engineering preset in the simulation controls (debounced 400ms). | `{ param: "resistance" }` | Custom Dimension:<br>• `param` (Event-scoped) | No |
| `newsletter_signup` | `source` | string | Triggered upon successful submission of the Engineering Dispatch newsletter / simulation update form. | `{ source: "footer" }` | Custom Dimension:<br>• `source` (Event-scoped) | **Yes** (Lead Conversion) |
| `share` | `network` | string | Triggered when a user clicks to share a simulation workbench (e.g. copying shareable link to clipboard, native web share, LinkedIn, Twitter/X). | `{ network: "clipboard" }` | Custom Dimension:<br>• `network` (Event-scoped) | **Yes** (Advocacy / Viral) |
| `lab_launch` | `lab_id`<br>`source` | string<br>string | Triggered when a user launches one of the standalone industrial cloud laboratories (Power Electronics, Power Systems, SafeOps UPS, ElectroLive). | `{ lab_id: "power-electronics", source: "home_card" }` | Custom Dimensions:<br>• `lab_id` (Event-scoped)<br>• `source` (Event-scoped) | **Yes** (Outbound Conversion) |
| `consent` | `analytics_storage`<br>`ad_storage`<br>`ad_user_data`<br>`ad_personalization` | string | Triggered on user interaction with the Cookie & Telemetry consent banner (`'granted'` or `'denied'`). | `{ analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }` | Built-in Google Consent Mode v2 signals | No |

---

## 2. Event Parameter Specification

### `simulator_open`
- **`department`**: The discipline code of the simulator (`electrical`, `control`, `mechanical`, `chemical`, `civil`, `physics`).
- **`simulator_id`**: The canonical slug ID of the opened simulator (e.g., `rlc_resonance`, `three_phase`, `four_bar_linkage`, `pid_controller`, `beam_bending`).

### `simulator_run`
- **`duration_s`**: Total accumulated active execution time in seconds during the simulation run session. Rounds to integer. Zero or negative values are suppressed.

### `parameter_change`
- **`param`**: The unique identifier of the parameter modified (e.g., `resistance`, `inductance`, `capacitance`, `source_freq`, `damping_ratio`, `load_resistance`).

### `newsletter_signup`
- **`source`**: The component or page section where the subscription occurred (`footer`, `modal`, `home`).

### `share`
- **`network`**: The target sharing medium:
  - `clipboard` (Link copied to clipboard)
  - `web_share` (Browser Web Share API)
  - `linkedin` (LinkedIn sharing intent)
  - `twitter` (X / Twitter sharing intent)

### `lab_launch`
- **`lab_id`**:
  - `power-electronics` (Power Electronics Lab)
  - `power-systems` (Power Systems Lab)
  - `ups-safeops` (SafeOps UPS Lab)
  - `electrical-safety` (ElectroLive Electrical Safety)
- **`source`**: Surface originating the click (`home_card`, `navbar_dropdown`, `footer`).

---

## 3. How to Register in GA4 Admin UI

To report on these custom dimensions and metrics in standard GA4 exploration reports:
1. Navigate to **GA4 Admin** -> **Custom definitions** -> **Custom dimensions**.
2. Click **Create custom dimension** and add:
   - `department` (Event scope, event parameter: `department`)
   - `simulator_id` (Event scope, event parameter: `simulator_id`)
   - `param` (Event scope, event parameter: `param`)
   - `source` (Event scope, event parameter: `source`)
   - `network` (Event scope, event parameter: `network`)
   - `lab_id` (Event scope, event parameter: `lab_id`)
3. Navigate to **Custom metrics** -> **Create custom metric**:
   - `duration_s` (Event scope, event parameter: `duration_s`, Unit: `Seconds`)
4. Navigate to **Admin** -> **Events** -> Toggle **Mark as conversion** for:
   - `simulator_open`
   - `simulator_run`
   - `newsletter_signup`
   - `share`
   - `lab_launch`
