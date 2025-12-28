# neuronexus
A browser-based web application for neurodivergent families to manage shared operational data, household states, and care contexts. Designed to replace subjective emotional check-ins with observable, quantifiable information usable in daily life, education, healthcare, and emergency situations.

# NeuroNexus Hub

NeuroNexus is a browser-based web application developed within the **PRISMAS – Núcleo de Estudo e Pesquisa Interdisciplinar em Autismo**.

The project is designed to support neurodivergent families through **shared, objective, real-world data**, prioritizing clarity, predictability, and coordination over subjective emotional check-ins.

## Purpose

NeuroNexus was created to address a common gap in existing mental health and care applications:  
most tools focus on individual self-reporting, while neurodivergent families often need **shared operational information** that can be understood across home, school, healthcare, and emergency contexts.

The core idea is simple:
- less interpretation  
- more observable data  
- a common operational language for everyone involved  

## Current MVP (Phase 0)

The current version is intentionally minimal and runs entirely in the browser.

Implemented features:
- **House State (B)**: a shared household status indicator (GREEN / YELLOW / RED)
- State persistence using browser storage (LocalStorage)
- Fully static, client-side architecture
- No backend, authentication, or database at this stage

This approach allows fast validation of concepts without infrastructure overhead.

## What This Is Not (Yet)

- Not a clinical tool
- Not a diagnostic system
- Not a full care management platform
- Not a replacement for professional judgment

Those questions belong to later phases, if and when the project evolves.

## Roadmap (High-Level)

Planned future extensions include:
- Event and time-window logging (A)
- Context tagging (family, school, care, emergency)
- Emergency read-only access views
- Optional backend integration (e.g. Supabase)
- Role-based access for families, educators, and professionals

All future development will follow the same principles: modularity, transparency, and respect for neurodivergent autonomy.

## Technology

- HTML, CSS, JavaScript (client-side)
- Designed to run on **GitHub Pages**
- No build step required in the current phase

## License

This project is released under the **MIT License**.

## Acknowledgements

NeuroNexus is a project by **PRISMAS – Núcleo de Estudo e Pesquisa Interdisciplinar em Autismo**,  
developed with a strong commitment to interdisciplinary research, ethical design, and real-world usability.
